import { createSelector } from '@ngrx/store';
import { RootState } from '../app.reducer';
const configState = (state: RootState) => state.config;

export const selectSquiz = createSelector(configState, (state) => state.squiz);
