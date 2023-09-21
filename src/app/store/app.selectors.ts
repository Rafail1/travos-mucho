import { createSelector } from '@ngrx/store';
import { State } from './app.reducer';

const app = (state: State) => state;

export const selectSymbol = createSelector(app, (state) => state.symbol);
export const selectTime = createSelector(app, (state) => state.time);
export const selectAggTrades = createSelector(app, (state) => state.aggTrades);
export const selectDepth = createSelector(app, (state) => state.depth);
