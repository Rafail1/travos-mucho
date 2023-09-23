import { createAction, props } from '@ngrx/store';

export const setSymbol = createAction(
  '[App Component] setSymbol',
  props<{ symbol: string }>()
);
export const setTime = createAction(
  '[App Component] setTime',
  props<{ time: Date }>()
);
export const getAggTrades = createAction(
  '[App Component] getAggTrades',
  props<{ symbol: string; time: Date }>()
);
export const getDepth = createAction(
  '[App Component] getDepth',
  props<{ symbol: string; time: Date }>()
);
export const getAggTradesSuccess = createAction(
  '[App Component] getAggTradesSuccess',
  props<{ trades: any }>()
);
export const getDepthSuccess = createAction(
  '[App Component] getDepthSuccess',
  props<{ depth: any }>()
);

export const init = createAction('[App Component] init');
export const getSymbolsSuccess = createAction(
  '[App Component] getSymbolsSuccess',
  props<{ symbols: Array<string> }>()
);
export const getCandlestickDataSuccess = createAction(
  '[App Component] getCandlestickDataSuccess',
  props<{ data: any }>()
);
