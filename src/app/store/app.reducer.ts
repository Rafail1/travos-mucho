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
} from './app.actions';
import { FIVE_MINUTES } from '../modules/player/player.component';
export interface RootState {
  app: AppState;
}
export interface AppState {
  symbol?: string;
  symbols?: Array<string>;
  depth?: any;
  aggTrades?: any;
  time?: Date;
  timeFrom?: Date;
  timeTo?: Date;
  candlestickData?: Array<[number, number, number, number, number, number]>;
}

export const initialState: AppState = {};

export const appReducer = createReducer(
  initialState,
  on(setSymbol, (state, { symbol }) => ({
    ...state,
    symbol,
  })),
  on(getAggTrades, (state, { symbol, time }) => ({
    ...state,
    symbol,
    time,
  })),
  on(getDepth, (state, { symbol, time }) => ({
    ...state,
    symbol,
    time,
  })),
  on(getSymbolsSuccess, (state, { symbols }) => ({
    ...state,
    symbols,
  })),
  on(getCandlestickDataSuccess, (state, { data }) => {
    const date = new Date(data[0][0]);
    return {
      ...state,
      candlestickData: data,
      time: date,
      timeFrom: date,
      timeTo: new Date(date.getTime() + FIVE_MINUTES),
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
  }))
);
