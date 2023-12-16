import { createAction, props } from '@ngrx/store';
import { ConfigState } from './config.reducer';

export const setSquiz = createAction(
  '[Config] setSquiz',
  props<{
    squiz: number;
  }>()
);

export const setConfig = createAction(
  '[Config] setConfig',
  props<{
    config: ConfigState | null;
  }>()
);

export const fillSettings = createAction(
  '[Config] fillSettings',
  props<{ symbol: string }>()
);
