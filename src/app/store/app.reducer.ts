import { Action, createReducer, on } from '@ngrx/store';
import {
  setSymbol,
  getAggTrades,
  getDepth,
  getSymbolsSuccess,
  getCandlestickDataSuccess,
  cleanCandlestickData,
  setTime,
  setTimeFrom,
  setTimeTo,
  forward,
  play,
  rewind,
  pause,
  getAggTradesSuccess,
  getDepthSuccess,
} from './app.actions';
import { FIVE_MINUTES } from '../modules/player/player.component';

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
  depth?: any;
  aggTrades?: any;
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
  on(getAggTrades, (state, { symbol, time }) => ({
    ...state,
    symbol,
    loadingAggTrades: true,
    time,
  })),
  on(getAggTradesSuccess, (state, { trades }) => ({
    ...state,
    trades,
    loadingAggTrades: false,
  })),
  on(getDepthSuccess, (state, { depth }) => ({
    ...state,
    depth,
    loadingDepth: false,
  })),
  on(getDepth, (state, { symbol, time }) => ({
    ...state,
    symbol,
    loadingDepth: true,
    time,
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
  on(setTime, (state, { time }) => ({
    ...state,
    time,
  })),
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
  on(forward, (state, { step }) => {
    if (!state.timeTo || !state.time) {
      return state;
    }
    let time = state.time.getTime() + step;
    if (state.timeTo.getTime() < time) {
      time = state.timeTo.getTime();
    }

    return {
      ...state,
      time: new Date(time),
    };
  }),
  on(rewind, (state, { step }) => {
    if (!state.timeFrom || !state.time) {
      return state;
    }

    let time = state.time.getTime() - step;
    if (state.timeFrom.getTime() > time) {
      time = state.timeFrom.getTime();
    }

    return {
      ...state,
      time: new Date(time),
    };
  }),
  on(play, (state) => ({
    ...state,
    playing: true,
  })),
  on(pause, (state) => ({
    ...state,
    playing: false,
  }))
);
