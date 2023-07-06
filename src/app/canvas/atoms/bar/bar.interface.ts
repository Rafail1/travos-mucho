import { CallbackFunctionVariadicAnyReturn } from 'src/app/common/interfaces/callbacks.interfaces';

export interface IThreshold {
  value: number;
  fillColor?: string;
  textColor?: string;
  backgroundColor?: string;
}

export interface IBarData {
  y: number;
  price: number;
  value: number;
}