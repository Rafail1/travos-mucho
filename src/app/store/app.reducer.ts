import { createReducer, on } from '@ngrx/store';
import {
  cleanCandlestickData,
  getAggTrades,
  getAggTradesSuccess,
  getCandlestickDataSuccess,
  getDepth,
  getDepthSuccess,
  getSymbolsSuccess,
  pause,
  play,
  setSymbol,
  setTime,
  setTimeFrom,
  setTimeTo,
} from './app.actions';
import {
  IAggTrade,
  IDepth,
  ISnapshot,
} from '../modules/backend/backend.service';

export interface RootState {
  app: AppState;
}
export interface AppState {
  symbol?: string;
  loadingChart: boolean;
  loadingDepth: boolean;
  loadingAggTrades: boolean;
  symbols?: Array<string>;
  time?: Date;
  timeFrom?: Date;
  timeTo?: Date;
  playing: boolean;
  depth?: Array<IDepth>;
  aggTrades?: Array<IAggTrade>;
  snapshot?: ISnapshot;
  candlestickData?: Array<[number, number, number, number, number, number]>;
}

export const initialState: AppState = {
  playing: false,
  loadingChart: false,
  loadingDepth: false,
  loadingAggTrades: false,
};

export const appReducer = createReducer(
  initialState,
  on(setSymbol, (state, { symbol }) => ({
    ...state,
    playing: false,
    loadingChart: true,
    symbol,
  })),
  on(getAggTrades, (state, { symbol }) => ({
    ...state,
    symbol,
    loadingAggTrades: true,
  })),
  on(getAggTradesSuccess, (state, { trades }) => ({
    ...state,
    aggTrades: trades,
    loadingAggTrades: false,
  })),
  on(getDepthSuccess, (state, { depth }) => ({
    ...state,
    depth: depth.depth,
    snapshot: depth.snapshot,
    loadingDepth: false,
  })),
  on(getDepth, (state, { symbol }) => ({
    ...state,
    symbol,
    loadingDepth: true,
  })),
  on(getSymbolsSuccess, (state, { symbols }) => ({
    ...state,
    symbols,
  })),
  on(getCandlestickDataSuccess, (state, { data }) => {
    const from = new Date(data[0][0]);
    const to = new Date(data[data.length - 1][0]);
    return {
      ...state,
      candlestickData: data,
      loadingChart: false,
      time: from,
      timeFrom: from,
      timeTo: to,
    };
  }),
  on(cleanCandlestickData, (state) => ({
    ...state,
    candlestickData: undefined,
  })),
  on(setTime, (state, { time }) => {
    if (!state.timeTo || !state.time || !state.timeFrom) {
      return state;
    }
    if (state.timeTo.getTime() < time.getTime()) {
      time = state.timeTo;
    }

    if (state.timeFrom.getTime() > time.getTime()) {
      time = state.timeFrom;
    }

    return {
      ...state,
      time,
    };
  }),
  on(setTimeFrom, (state, { time }) => {
    return {
      ...state,
      timeFrom: time,
    };
  }),
  on(setTimeTo, (state, { time }) => ({
    ...state,
    timeTo: time,
  })),
  on(play, (state) => ({
    ...state,
    playing: true,
  })),
  on(pause, (state) => ({
    ...state,
    playing: false,
  }))
);
