import { CallbackFunctionVariadicAnyReturn } from 'src/app/common/interfaces/callbacks.interfaces';

export interface IThreshold {
  value: number;
  fillColor?: string;
  textColor?: string;
  backgroundColor?: string;
  cb?: CallbackFunctionVariadicAnyReturn;
}

export interface IBar {
  max: number;
  value: number;
  width: number;
  height: number;
  x: number;
  y: number;
  thresholds?: Array<IThreshold>;
  fillColor?: string;
  textColor?: string;
  backgroundColor?: string;
}
