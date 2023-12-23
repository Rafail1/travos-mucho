import { createSelector } from '@ngrx/store';
import { RootState } from './app.reducer';

const app = (state: RootState) => state.app;

export const selectSymbol = createSelector(app, (state) => state.symbol);
export const selectTickSize = createSelector(app, (state) => state.tickSize);
export const selectPricePrecision = createSelector(
  app,
  (state) => state.pricePrecision
);
export const selectTime = createSelector(app, (state) => state.time);
export const selectTimeFrom = createSelector(app, (state) => state.timeFrom);
export const selectTimeTo = createSelector(app, (state) => state.timeTo);
export const selectAggTrades = createSelector(app, (state) => state.aggTrades);
export const selectDepth = createSelector(app, (state) => state.depth);
export const selectAllSymbols = createSelector(app, (state) => state.symbols);
export const selectCandlestickData = createSelector(
  app,
  (state) => state.candlestickData
);
export const selectPlaying = createSelector(app, (state) => state.playing);
export const selectLoadingChart = createSelector(
  app,
  (state) => state.loadingChart
);
export const selectLoadingDepth = createSelector(
  app,
  (state) => state.loadingDepth
);
export const selectLoadingAggTrades = createSelector(
  app,
  (state) => state.loadingAggTrades
);
export const selectSnapshot = createSelector(app, (state) => state.snapshot);
export const selectClusters = createSelector(app, (state) => state.clusterMap);
export const selectBarYs = createSelector(app, (state) => state.barYs);
export const selectScroll = createSelector(app, (state) => state.scroll);
export const selectBounds = createSelector(app, (state) => state.bounds);
export const selectRecalculateAndRedraw = createSelector(app, (state) => state.recalculateAndRedraw);
