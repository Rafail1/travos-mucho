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
  private ticks = new Map<string, IAggTrade>();
  private clusters = new Map<string, Map<string, IClusterData>>();
  constructor(private barRendererService: BarRendererService) {}

  renderTick(data: IAggTrade) {
    // if (!this.ticks.has(data.p)) {
    //   this.ticks.set(data.p, data);
    // }
  }

  renderCluster(data: ICluster) {
    if (!this.clusters.has(data.min5_slot)) {
      this.clusters.set(
        data.min5_slot,
        new Map([
          [
            data.p,
            {
              askVolume: data.m ? Number(data.volume) : 0,
              bidVolume: data.m ? 0 : Number(data.volume),
            },
          ],
        ])
      );
    } else if (!this.clusters.get(data.min5_slot)?.has(data.p)) {
      this.clusters.get(data.min5_slot)?.set(data.p, {
        askVolume: data.m ? Number(data.volume) : 0,
        bidVolume: data.m ? 0 : Number(data.volume),
      });
    } else {
      const currentVolume = this.clusters
        .get(data.min5_slot)
        ?.get(data.p) as IClusterData;

      if (data.m) {
        currentVolume.askVolume = currentVolume.askVolume + Number(data.volume);
      } else {
        currentVolume.bidVolume = currentVolume.bidVolume + Number(data.volume);
      }
    }
  }
}
