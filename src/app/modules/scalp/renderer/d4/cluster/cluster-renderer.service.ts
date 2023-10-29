import { Injectable } from '@angular/core';
import { IClusterData } from '../d4-renderer.service';
import { Selection } from 'd3';
import { ICluster } from 'src/app/modules/backend/backend.service';

@Injectable()
export class ClusterRendererService {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private clusters = new Map<
    Date,
    Map<
      string,
      {
        element: Selection<SVGRectElement, unknown, null, undefined>;
        data: IClusterData;
      }
    >
  >();

  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
  }

  render(data: ICluster) {
    let element;
    let elementData;
    if (!this.clusters.has(data.min5_slot)) {
      elementData = {
        askVolume: data.m ? Number(data.volume) : 0,
        bidVolume: data.m ? 0 : Number(data.volume),
      };
      element = this.svg.insert('rect');
      this.clusters.set(
        data.min5_slot,
        new Map([[data.p, { data: elementData, element }]])
      );
    } else if (!this.clusters.get(data.min5_slot)?.has(data.p)) {
      elementData = {
        askVolume: data.m ? Number(data.volume) : 0,
        bidVolume: data.m ? 0 : Number(data.volume),
      };
      element = this.svg.insert('rect');

      this.clusters
        .get(data.min5_slot)
        ?.set(data.p, { element, data: elementData });
    } else {
      const { data: currentVolume, element: existsElement } = this.clusters
        .get(data.min5_slot)!
        .get(data.p)!;

      element = existsElement;

      if (data.m) {
        currentVolume.askVolume = currentVolume.askVolume + Number(data.volume);
      } else {
        currentVolume.bidVolume = currentVolume.bidVolume + Number(data.volume);
      }
      elementData = currentVolume;
    }
    element
      .attr('askVolume', elementData.askVolume)
      .attr('bidVolume', elementData.bidVolume);
  }
}
