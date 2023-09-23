import { createSelector } from '@ngrx/store';
import { RootState } from './app.reducer';

const app = (state: RootState) => state.app;

export const selectSymbol = createSelector(app, (state) => state.symbol);
export const selectTime = createSelector(app, (state) => state.time);
export const selectAggTrades = createSelector(app, (state) => state.aggTrades);
export const selectDepth = createSelector(app, (state) => state.depth);
export const selectAllSymbols = createSelector(app, (state) => state.symbols);
