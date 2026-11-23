"""Sound for the Stickman Shorts kit (The AI Signal, 24 Nov 2026). Everything is synthesised here (numpy), so we
own it: no samples, no music models, no licences to check.

usage:
  python make_sfx.py sfx <out_dir>                      # the 15 short effects the kit's <Cues> uses
  python make_sfx.py bed <out.wav> <seconds> <json>     # a music bed with sections, e.g.
      '[["calm",0],["build",8.9],["build2",13.5],["tense",18.5],["lift",24.2],["warm",27.3],["final",33.7]]'
Sections: calm, build, build2 (more energy), tense (drone + heartbeat, no melody), lift (major swell),
warm (slow resolving plucks), final (last chord, rings out). Times in seconds; the bed fades over the last 1.5 s.
"""
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(7)
hz = lambda m: 440.0 * 2 ** ((m - 69) / 12)


def t_(sec): return np.arange(int(SR * sec)) / SR


def env(sec, a=0.004, d=0.12):
    t = t_(sec); return np.minimum(t / a, 1) * np.exp(-t / d)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype='band', fs=SR, output='sos'), x)


def lp(x, f, order=2):
    return sosfilt(butter(order, f, btype='low', fs=SR, output='sos'), x)


def hp(x, f, order=2):
    return sosfilt(butter(order, f, btype='high', fs=SR, output='sos'), x)


def write(path, x, stereo=False):
    x = np.asarray(x, dtype=np.float64)
    if not stereo: x = np.stack([x, x], axis=1)
    peak = np.max(np.abs(x)) or 1
    x = x / max(peak, 1.0) if peak > 1 else x
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(x, -1, 1) * 32767).astype('<i2').tobytes())


def sfx(out):
    import os
    os.makedirs(out, exist_ok=True)
    n = lambda sec: rng.standard_normal(int(SR * sec))
    S = {}
    S['tick'] = np.sin(2 * np.pi * 1800 * t_(0.05)) * env(0.05, 0.001, 0.01) * 0.6 + bp(n(0.05), 2000, 6000) * env(0.05, 0.001, 0.006) * 0.5
    f = np.linspace(320, 980, int(SR * 0.09)); S['pop'] = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(0.09, 0.002, 0.03) * 0.8
    ty = np.zeros(int(SR * 0.24))
    for k, at in enumerate([0.0, 0.07, 0.15]):
        c = bp(n(0.03), 1500 + 400 * k, 5000) * env(0.03, 0.0008, 0.006); i = int(at * SR); ty[i:i + len(c)] += c * (0.7 - 0.1 * k)
    S['type'] = ty
    w = n(0.55); sweep = np.linspace(0, 1, len(w)); S['whoosh'] = lp(bp(w, 300, 4000), 2500) * np.sin(np.pi * sweep) ** 2 * 0.9
    S['thud'] = (np.sin(2 * np.pi * 62 * t_(0.35)) * env(0.35, 0.002, 0.11) + lp(n(0.35), 400) * env(0.35, 0.001, 0.03) * 1.6) * 0.9
    S['stamp'] = (np.sin(2 * np.pi * 85 * t_(0.3)) * env(0.3, 0.001, 0.08) + bp(n(0.3), 500, 3500) * env(0.3, 0.0005, 0.025) * 1.2) * 0.9
    S['paper'] = bp(n(0.28), 1200, 7000) * (env(0.28, 0.02, 0.08)) * 0.5
    S['step'] = lp(n(0.12), 500) * env(0.12, 0.001, 0.03) * 1.3 + np.sin(2 * np.pi * 95 * t_(0.12)) * env(0.12, 0.001, 0.04) * 0.4
    fc = np.linspace(640, 520, int(SR * 0.28)); S['chair'] = np.sin(2 * np.pi * np.cumsum(fc) / SR) * env(0.28, 0.03, 0.1) * 0.25 + lp(n(0.28), 300) * env(0.28, 0.001, 0.04)
    tb = t_(1.6); S['bell'] = sum(a * np.sin(2 * np.pi * 880 * r * tb) * np.exp(-tb / d) for a, r, d in [(0.6, 1, 0.7), (0.3, 2.76, 0.35), (0.2, 5.4, 0.2), (0.15, 8.9, 0.1)]) * np.minimum(tb / 0.002, 1) * 0.7
    td = t_(0.6); S['ding'] = (np.sin(2 * np.pi * 1318.5 * td) * 0.6 + np.sin(2 * np.pi * 2637 * td) * 0.2) * env(0.6, 0.002, 0.18) * 0.7
    tz = t_(0.22); S['buzz'] = lp(np.sign(np.sin(2 * np.pi * 110 * tz)), 900) * env(0.22, 0.005, 0.12) * 0.35
    fr_ = np.linspace(300, 960, int(SR * 0.6)); S['rise'] = np.sin(2 * np.pi * np.cumsum(fr_) / SR) * np.sin(np.pi * np.linspace(0, 1, len(fr_))) * 0.35
    S['swish'] = hp(bp(n(0.22), 800, 6000), 900) * np.sin(np.pi * np.linspace(0, 1, int(SR * 0.22))) ** 2 * 0.5
    S['clock'] = bp(n(0.07), 1800, 4500) * env(0.07, 0.0005, 0.008) * 0.9 + np.sin(2 * np.pi * 1200 * t_(0.07)) * env(0.07, 0.0005, 0.01) * 0.3
    for k, x in S.items():
        write(f'{out}/{k}.wav', np.concatenate([x, np.zeros(int(SR * 0.05))]))
    print(f'{len(S)} effects -> {out}')


def bed(out, sec, sections):
    N = int(SR * sec); L = np.zeros(N); R = np.zeros(N)
    secs = [(name, float(at)) for name, at in sections] + [('end', sec)]

    def add(x, at, g=1.0, pan=0.0):
        i = int(at * SR); m = min(len(x), N - i)
        if m <= 0 or i < 0: return
        L[i:i + m] += x[:m] * g * (1 - max(0, pan)); R[i:i + m] += x[:m] * g * (1 + min(0, pan))

    def pad(notes, dur, g):
        t = t_(dur); shape = np.minimum(t / 0.8, 1) * np.minimum(1, np.maximum(0, (dur - t) / 0.8))
        x = sum(np.sin(2 * np.pi * hz(m) * t) + 0.2 * np.sin(2 * np.pi * 2 * hz(m) * t + 0.4) for m in notes)
        return lp(x, 2200) * shape * g

    def pluck(m, dur=0.9, g=1.0):
        t = t_(dur); return (np.sin(2 * np.pi * hz(m) * t) + 0.35 * np.sin(2 * np.pi * 2 * hz(m) * t) + 0.1 * np.sin(2 * np.pi * 3 * hz(m) * t)) * env(dur, 0.004, 0.28) * g

    PROG = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
    BPM = 100; beat = 60 / BPM
    for (name, a), (_, b) in zip(secs[:-1], secs[1:]):
        dur = b - a
        if name in ('calm', 'build', 'build2', 'warm'):
            nb = int(dur / beat + 0.5)
            for k in range(nb):
                at = a + k * beat; ch = PROG[(int(at / (4 * beat))) % 4]
                if k % 4 == 0: add(pad(ch, 4 * beat + 0.8, 0.05), at, pan=0)
                note = ch[[0, 2, 1, 2][k % 4]] + 12
                add(pluck(note, 0.9, 0.11 if name != 'warm' else 0.09), at, pan=0.25 if k % 2 else -0.25)
                if name in ('build', 'build2'):
                    add(hp(rng.standard_normal(int(SR * 0.05)), 6000) * env(0.05, 0.001, 0.015) * 0.06, at + beat / 2)
                if name == 'build2' and k % 2 == 0:
                    add(np.sin(2 * np.pi * hz(ch[0] - 24) * t_(0.5)) * env(0.5, 0.01, 0.2) * 0.22, at)
        elif name == 'tense':
            t = t_(dur); drone = (np.sin(2 * np.pi * hz(33) * t) + 0.5 * np.sin(2 * np.pi * hz(45) * t)) * np.minimum(t / 1.5, 1) * 0.12
            add(drone, a)
            add(pad([69, 70], dur, 0.018 * 1.0), a, pan=0.3)
            k = 0
            while a + k * 0.8 < b:
                hb = np.sin(2 * np.pi * 55 * t_(0.25)) * env(0.25, 0.002, 0.07) * 0.35
                add(hb, a + k * 0.8); add(hb * 0.6, a + k * 0.8 + 0.22); k += 1
        elif name == 'lift':
            add(pad([60, 64, 67, 72], dur + 1.5, 0.07), a)
            add(np.sin(2 * np.pi * hz(36) * t_(dur + 1)) * env(dur + 1, 0.05, 1.2) * 0.2, a)
            for i, m in enumerate([72, 76, 79, 84]): add(pluck(m, 1.2, 0.1), a + 0.1 + i * 0.12, pan=0.2 * (-1) ** i)
        elif name == 'final':
            add(pad([48, 55, 60, 64, 67], dur + 0.2, 0.07), a)
            for i, m in enumerate([60, 64, 67, 72]): add(pluck(m, 2.5, 0.09), a + i * 0.05)
    t = np.arange(N) / SR; fade = np.minimum(1, t / 0.3) * np.minimum(1, (sec - t) / 1.5)
    write(out, np.stack([L * fade, R * fade], axis=1) * 0.9, stereo=True)
    print(f'bed {sec:.2f}s -> {out}')


if __name__ == '__main__':
    if sys.argv[1] == 'sfx': sfx(sys.argv[2])
    else: bed(sys.argv[2], float(sys.argv[3]), json.loads(sys.argv[4]))
