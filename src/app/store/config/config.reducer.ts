import { createReducer, on } from '@ngrx/store';
import { setSquiz } from './config.actions';

export interface ConfigState {
  squiz: number;
}

export const initialState: ConfigState = {
  squiz: 1,
};

export const configReducer = createReducer(
  initialState,
  on(setSquiz, (state, { squiz }) => {
    return {
      ...state,
      squiz,
    };
  })
);
