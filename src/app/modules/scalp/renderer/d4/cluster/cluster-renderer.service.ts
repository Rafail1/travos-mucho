import { Injectable } from '@angular/core';
import { IClusterData } from '../d4-renderer.service';
import { Selection } from 'd3';
import { ICluster } from 'src/app/modules/backend/backend.service';
import { GridService } from '../grid/grid.service';
import { distinctUntilChanged, interval, map } from 'rxjs';
import { RootState } from 'src/app/store/app.reducer';
import { Store, select } from '@ngrx/store';
import { selectTime } from 'src/app/store/app.selectors';
import { DateService } from 'src/app/common/utils/date.service';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
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
  constructor(
    private gridService: GridService,
    private store: Store<RootState>,
    private dateService: DateService
  ) {
    store
      .pipe(
        select(selectTime),
        filterNullish(),
        map((time) => this.dateService.getMin5Slot(time)),
        distinctUntilChanged((prev, crt) => prev === crt)
      )
      .subscribe(() => {
        for (const [time, group] of this.groupIndexes.entries()) {
          const x = gridService.getMin5SlotX(new Date(time));
          group.attr('x', x);
        }
      });
  }

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
    return;
    let element;
    let group;
    let elementData;
    const y = this.gridService.getY(data.p);
    if (!y) {
      return;
    }
    if (!this.clusters.has(data.min5_slot)) {
      elementData = {
        askVolume: data.m ? Number(data.volume) : 0,
        bidVolume: data.m ? 0 : Number(data.volume),
      };
      group = this.svg.insert('g');
      const x = this.gridService.getMin5SlotX(data.min5_slot);
      group.attr('x', x);
      this.groupIndexes.set(data.min5_slot, group);

      element = group.insert('rect').attr('y', y);
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

      element = group.insert('rect').attr('y', y);

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
