/**
 * Every Short in this project. Add one line per new Short; Root.tsx and the check tool read this list.
 * frames = seconds × 30. Vertical Shorts are 1080 × 1920 (the default).
 */
import React from 'react';
import {TwoStudents, TS_FRAMES} from './stickkit/shorts/TwoStudents';
import {RigDemo, RIG_DEMO_FRAMES} from './stickkit/demos/RigDemo';
import {MyShort, MY_FRAMES} from './shorts/MyShort';

export type Entry = {component: React.FC<any>; frames: number; width?: number; height?: number};
export const SHORTS: Record<string, Entry> = {
  TwoStudents: {component: TwoStudents, frames: TS_FRAMES},
  MyShort: {component: MyShort, frames: MY_FRAMES},
  RigDemo: {component: RigDemo, frames: RIG_DEMO_FRAMES, width: 1920, height: 1080},
};
