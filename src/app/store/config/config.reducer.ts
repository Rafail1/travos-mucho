import { createReducer, on } from '@ngrx/store';
import { setConfig, setSquiz } from './config.actions';
interface FormatNumber {
  decPlaces: number;
  shorten: boolean;
}
export interface ConfigState {
  squiz: number;
  maxBarVolume: number;
  bigVolume: number;
  hugeVolume: number;
  bars: {
    volumeFormat: FormatNumber;
    priceFormat: FormatNumber;
  };
  tick: {
    volumeFormat: FormatNumber;
  };
  cluster: {
    volumeFormat: FormatNumber;
  };
}

export const initialState: ConfigState = {
  squiz: 1,
  maxBarVolume: 1000000,
  bigVolume: 200000,
  hugeVolume: 800000,
  bars: {
    volumeFormat: {
      decPlaces: 2,
      shorten: true,
    },
    priceFormat: {
      decPlaces: 2,
      shorten: true,
    },
  },
  tick: {
    volumeFormat: {
      decPlaces: 2,
      shorten: true,
    },
  },
  cluster: {
    volumeFormat: {
      decPlaces: 2,
      shorten: true,
    },
  },
};

export const configReducer = createReducer(
  initialState,
  on(setSquiz, (state, { squiz }) => {
    return {
      ...state,
      squiz,
    };
  }),
  on(setConfig, (state, { config }) => {
    return {
      ...state,
      ...config,
    };
  })
);
