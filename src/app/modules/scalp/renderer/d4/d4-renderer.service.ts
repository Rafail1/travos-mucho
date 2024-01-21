import { Injectable } from '@angular/core';
export interface IClusterData {
  slot: number;
  volume: number;
  price: number;
  askVolume: number;
  bidVolume: number;
}
@Injectable()
export class D4RendererService {}
