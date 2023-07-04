import { CallbackFunctionVariadicAnyReturn } from 'src/app/common/interfaces/callbacks.interfaces';

export interface IThreshold {
  value: number;
  fillColor?: string;
  textColor?: string;
  backgroundColor?: string;
  cb?: CallbackFunctionVariadicAnyReturn;
}

export interface IBarData {
  y: number;
  x: number;
  price: number;
  value: number;
}

export interface IBar extends IBarData {
  max: number;
  width: number;
  height: number;
  thresholds?: Array<IThreshold>;
  fillColor?: string;
  textColor?: string;
  backgroundColor?: string;
}
