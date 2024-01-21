import { createReducer, on } from '@ngrx/store';
import { IExchangeInfo } from '../common/market-data/market-data.service';
import {
  IAggTrade,
  IBar,
  ICluster,
  ISnapshotFormatted,
} from '../modules/backend/backend.service';
import {
  cleanBarYs,
  cleanCandlestickData,
  getAggTrades,
  getAggTradesSuccess,
  getCandlestickDataSuccess,
  getCluster,
  getClusterSuccess,
  getDepth,
  getDepthSuccess,
  getSymbolsSuccess,
  pause,
  play,
  recalculateAndRedraw,
  setBounds,
  setScroll,
  setSymbol,
  setTime,
  setTimeFrom,
  setTimeTo,
} from './app.actions';
import { ConfigState } from './config/config.reducer';

export interface IBounds {
  min: number;
  max: number;
}

export interface RootState {
  app: AppState;
  config: ConfigState;
}
export interface AppState {
  recalculateAndRedraw: number;
  pricePrecision?: number;
  symbol?: string;
  tickSize?: string;
  loadingChart: boolean;
  loadingDepth: boolean;
  loadingAggTrades: boolean;
  symbols?: Array<IExchangeInfo>;
  time?: Date;
  timeFrom?: Date;
  timeTo?: Date;
  playing: boolean;
  depth?: Array<IBar>;
  aggTrades?: Array<IAggTrade>;
  snapshot?: ISnapshotFormatted;
  clusterMap: Map<number, ICluster[]>;
  candlestickData?: Array<[number, number, number, number, number, number]>;
  barYs: Record<string, number>;
  scroll: number;
  bounds?: IBounds;
}

export const initialState: AppState = {
  playing: false,
  loadingChart: false,
  loadingDepth: false,
  loadingAggTrades: false,
  clusterMap: new Map(),
  barYs: {},
  scroll: 0,
  recalculateAndRedraw: 0,
};

export const appReducer = createReducer(
  initialState,
  on(setSymbol, (state, { symbol }) => {
    const exchangeInfo = state.symbols?.find((item) => item.symbol === symbol);
    return {
      ...state,
      playing: false,
      loadingChart: true,
      symbol,
      tickSize: exchangeInfo?.tickSize,
      pricePrecision: exchangeInfo?.pricePrecision,
    };
  }),
  on(getAggTrades, (state, { symbol }) => ({
    ...state,
    loadingAggTrades: true,
  })),
  on(getAggTradesSuccess, (state, { trades }) => {
    return {
      ...state,
      aggTrades: trades,
      loadingAggTrades: false,
    };
  }),
  on(getDepthSuccess, (state, { depth }) => {
    return {
      ...state,
      depth: depth?.depth,
      snapshot: depth?.snapshot,
      loadingDepth: false,
    };
  }),
  on(getCluster, (state) => ({
    ...state,
    loadingCluster: true,
  })),
  on(getClusterSuccess, (state, { time, cluster }) => {
    if (!cluster.length) {
      return state;
    }
    return {
      ...state,
      clusterMap: new Map(state.clusterMap?.set(time.getTime(), cluster)),
      loadingCluster: false,
    };
  }),
  on(getDepth, (state, { symbol }) => ({
    ...state,
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
  })),
  on(cleanBarYs, (state) => ({
    ...state,
    barYs: {},
  })),
  on(setScroll, (state, { scroll }) => {
    return {
      ...state,
      scroll: scroll,
    };
  }),
  on(setBounds, (state, { min, max }) => {
    return {
      ...state,
      bounds: { min, max },
    };
  }),
  on(recalculateAndRedraw, (state) => {
    return {
      ...state,
      recalculateAndRedraw: state.recalculateAndRedraw + 1,
    };
  })
);
