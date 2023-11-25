import { createAction, props } from '@ngrx/store';

export const setSquiz = createAction(
  '[Config] setSquiz',
  props<{
    squiz: number;
  }>()
);
