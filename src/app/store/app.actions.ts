import { createAction, props } from '@ngrx/store';

export const setSymbol = createAction(
  '[App Component] setSymbol',
  props<{ symbol: string }>()
);
export const getAggTrades = createAction(
  '[App Component] getAggTrades',
  props<{ symbol: string, time: Date }>()
);
export const getDepth = createAction(
  '[App Component] getDepth',
  props<{ symbol: string, time: Date }>()
);
