import { createSelector } from '@ngrx/store';
import { RootState } from '../app.reducer';
const configState = (state: RootState) => state.config;

export const selectSquiz = createSelector(configState, (state) => state.squiz);
export const selectConfig = createSelector(configState, (state) => ({
  squiz: state.squiz,
  bars: state.bars,
  bigVolume: state.bigVolume,
  hugeVolume: state.hugeVolume,
  cluster: state.cluster,
  maxBarVolume: state.maxBarVolume,
  tick: state.tick,
}));
