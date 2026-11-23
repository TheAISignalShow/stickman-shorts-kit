/** One <Composition> per entry in registry.ts, plus "Sheet" (the contact sheet the check tool renders). */
import React from 'react';
import {Composition} from 'remotion';
import {SHORTS} from './registry';
import {Sheet, sheetSize, SheetProps} from './Sheet';

export const RemotionRoot: React.FC = () => (
  <>
    {Object.entries(SHORTS).map(([id, s]) => (
      <Composition key={id} id={id} component={s.component} durationInFrames={s.frames} fps={30} width={s.width ?? 1080} height={s.height ?? 1920} />
    ))}
    <Composition id="Sheet" component={Sheet} durationInFrames={1} fps={30} width={1080} height={1920}
      defaultProps={{target: 'MyShort', every: 2.5} as SheetProps}
      calculateMetadata={({props}) => sheetSize(props as SheetProps)} />
  </>
);
