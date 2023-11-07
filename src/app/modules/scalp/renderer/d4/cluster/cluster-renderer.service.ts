import { Injectable } from '@angular/core';
import { IClusterData } from '../d4-renderer.service';
import { BaseType, Selection } from 'd3';
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
  private clusters = new Map<Date, Map<string, IClusterData>>();
  constructor(
    private gridService: GridService,
    private store: Store<RootState>,
    private dateService: DateService
  ) {
    // store
    //   .pipe(
    //     select(selectTime),
    //     filterNullish(),
    //     map((time) => this.dateService.getMin5Slot(time)),
    //     distinctUntilChanged((prev, crt) => prev === crt)
    //   )
    //   .subscribe(() => {
    //     for (const [time, group] of this.groupIndexes.entries()) {
    //       const x = gridService.getMin5SlotX(new Date(time));
    //       group.attr('x', x);
    //     }
    //   });
  }

  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
  }

  clean() {
    this.svg.selectAll('*').remove();
    this.clusters.clear();
  }

  addClusters(clusters: ICluster[]) {
    for (let data of clusters) {
      if (!this.clusters.has(data.min5_slot)) {
        this.clusters.set(
          data.min5_slot,
          new Map([
            [
              data.p,
              {
                price: Number(data.p),
                volume: Number(data.volume),
                askVolume: data.m ? 0 : Number(data.volume),
                bidVolume: data.m ? Number(data.volume) : 0,
              },
            ],
          ])
        );
      } else {
        const elementData = this.clusters.get(data.min5_slot)!.get(data.p)!;

        if (data.m) {
          elementData.bidVolume = elementData.bidVolume + Number(data.volume);
        } else {
          elementData.askVolume = elementData.askVolume + Number(data.volume);
        }
      }
    }
  }

  render(data: ICluster) {
    const y = this.gridService.getY(data.p);
    if (!y) {
      return;
    }
    this.addClusters([data]);

    this.svg
      .selectAll('g')
      .data(this.clusters.keys())
      .join((enter) => {
        const g = enter.append('g');
        const dataObj = this.clusters.get(enter.datum());
        if (!dataObj) {
          console.error('no data object');
          return g;
        }
        g.selectAll<BaseType, IClusterData>('g')
          .data(dataObj.values(), (d) => `${d.price}${d.volume}`)
          .join(
            (enter) => {
              const g = enter.append('g');
              g.append('rect').attr('fill', (d) => {
                const percent = d.askVolume / d.bidVolume;
                const red = (255 - 255 * percent).toString(16).toUpperCase();
                const green = (255 * percent).toString(16).toUpperCase();
                return `#${red}${green}00`;
              });

              g.append('text').text((d) => {
                return d.volume;
              });

              return g;
            },
            (update) => {
              update
                .selectAll<BaseType, IClusterData>('rect')
                .attr('fill', (d) => {
                  const percent = d.askVolume / d.bidVolume;
                  const red = (255 - 255 * percent).toString(16).toUpperCase();
                  const green = (255 * percent).toString(16).toUpperCase();
                  return `#${red}${green}00`;
                });

              update.selectAll<BaseType, IClusterData>('text').text((d) => {
                return d.volume;
              });

              return update;
            }
          );
        return g;
      });
  }
}
