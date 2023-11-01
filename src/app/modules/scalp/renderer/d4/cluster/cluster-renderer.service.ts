import { Injectable } from '@angular/core';
import { IClusterData } from '../d4-renderer.service';
import { Selection } from 'd3';
import { ICluster } from 'src/app/modules/backend/backend.service';
import { GridService } from '../grid/grid.service';
const MAX_LENGTH = 20;
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
  private groupIndexes = new Map<
    Date,
    Selection<SVGGElement, unknown, null, undefined>
  >();
  private groups: Array<Date> = [];
  constructor(private gridService: GridService) {}
  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
  }

  clean() {
    this.svg.selectAll('*').remove();
    this.clusters.clear();
    this.groupIndexes.clear();
    this.groups.splice(0);
  }

  render(data: ICluster) {
    let element;
    let group;
    let elementData;
    if (!this.clusters.has(data.min5_slot)) {
      elementData = {
        askVolume: data.m ? Number(data.volume) : 0,
        bidVolume: data.m ? 0 : Number(data.volume),
      };
      group = this.svg.insert('g');
      this.groupIndexes.set(data.min5_slot, group);
      element = group.insert('rect');

      this.groups.push(data.min5_slot);
      const outdates = this.groups.splice(MAX_LENGTH);
      for (const outdated of outdates) {
        this.groupIndexes.get(outdated)?.remove();
        this.groupIndexes.delete(outdated);
      }

      this.clusters.set(
        data.min5_slot,
        new Map([[data.p, { data: elementData, element }]])
      );
    } else if (!this.clusters.get(data.min5_slot)?.has(data.p)) {
      elementData = {
        askVolume: data.m ? Number(data.volume) : 0,
        bidVolume: data.m ? 0 : Number(data.volume),
      };
      group = this.groupIndexes.get(data.min5_slot);
      if (!group) {
        throw Error('group not found');
      }

      element = group.insert('rect');

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
      // .attr('y', this.gridService.getY(data.p))
      .attr('askVolume', elementData.askVolume)
      .attr('bidVolume', elementData.bidVolume);
  }
}
