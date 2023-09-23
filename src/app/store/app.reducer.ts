import { Action, createReducer, on } from '@ngrx/store';
import {
  setSymbol,
  getAggTrades,
  getDepth,
  getSymbolsSuccess,
} from './app.actions';
export interface RootState {
  app: AppState;
}
export interface AppState {
  symbol?: string;
  symbols?: Array<string>;
  depth?: any;
  aggTrades?: any;
  time?: Date;
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
  }))
);
