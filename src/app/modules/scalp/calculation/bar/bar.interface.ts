import { CallbackFunctionVariadicAnyReturn } from 'src/app/common/interfaces/callbacks.interfaces';

export interface IThreshold {
  value: number;
  fillColor?: string;
  textColor?: string;
  backgroundColor?: string;
}

export interface IBarPosition {
  y: number;
  x: number;
  width: number;
  height: number;
}

export interface IBarData {
  price: number;
  type: IBarType;
  value: number;
  spread?: boolean;
}

export type IBarType = 'ask' | 'bid';
