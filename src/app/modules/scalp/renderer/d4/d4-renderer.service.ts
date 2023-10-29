import { Injectable } from '@angular/core';
import {
  IAggTrade,
  IBar,
  ICluster,
} from 'src/app/modules/backend/backend.service';
import { BarRendererService } from './bar/bar-renderer.service';
export interface IClusterData {
  askVolume: number;
  bidVolume: number;
}
@Injectable()
export class D4RendererService {

}
