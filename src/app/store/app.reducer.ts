import { Action, createReducer, on } from '@ngrx/store';
import { setSymbol, getAggTrades, getDepth } from './app.actions';
export interface State {
  symbol: string;
  depth?: any;
  aggTrades?: any;
  time?: Date;
}

export const initialState: State = {
  symbol: 'BTCUSDT',
};

const appReducer = createReducer(
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
  }))
);

export function reducer(state: State | undefined, action: Action): State {
  return appReducer(state, action);
}
