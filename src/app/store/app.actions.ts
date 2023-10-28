import { createAction, props } from '@ngrx/store';
import {
  IAggTrade,
  ICluster,
  IDepth,
  ISnapshot,
} from '../modules/backend/backend.service';

export const setSymbol = createAction(
  '[App Component] setSymbol',
  props<{ symbol: string }>()
);
export const setTime = createAction(
  '[App Component] setTime',
  props<{ time: Date }>()
);
export const setTimeFrom = createAction(
  '[App Component] setTimeFrom',
  props<{ time: Date }>()
);
export const setTimeTo = createAction(
  '[App Component] setTimeTo',
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
export const getCluster = createAction(
  '[App Component] getCluster',
  props<{ symbol: string; time: Date }>()
);

export const getAggTradesSuccess = createAction(
  '[App Component] getAggTradesSuccess',
  props<{ trades: Array<IAggTrade> }>()
);
export const getDepthSuccess = createAction(
  '[App Component] getDepthSuccess',
  props<{
    depth: { depth: Array<IDepth>; snapshot: ISnapshot };
    time: Date;
    symbol: string;
  }>()
);
export const getClusterSuccess = createAction(
  '[App Component] getClusterSuccess',
  props<{
    cluster: ICluster[];
    symbol: string;
  }>()
);

export const init = createAction('[App Component] init');
export const getSymbolsSuccess = createAction(
  '[App Component] getSymbolsSuccess',
  props<{ symbols: Array<string> }>()
);
export const getCandlestickDataSuccess = createAction(
  '[App Component] getCandlestickDataSuccess',
  props<{ data: Array<[number, number, number, number, number, number]> }>()
);
export const cleanCandlestickData = createAction(
  '[App Component] cleanCandlestickData'
);

export const rewind = createAction(
  '[App Component] rewind',
  props<{ step: number }>()
);
export const play = createAction('[App Component] play');
export const pause = createAction('[App Component] pause');
export const forward = createAction(
  '[App Component] forward',
  props<{ step: number }>()
);

export const setSnapshot = createAction(
  '[App Component] setSnapshot',
  props<{
    lastUpdateId: string;
    asks: Record<string, string>;
    bids: Record<string, string>;
  }>()
);

export const putBarY = createAction(
  '[App Component] putBarY',
  props<{ price: string; y: number }>()
);

export const cleanBarYs = createAction('[App Component] cleanBarYs');
