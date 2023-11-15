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
import { ConfigService } from 'src/app/config/config';
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
    //     map((time) => this.dateService.nextFilterTime(time, FIVE_MINUTES)),
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
    this.gridService.getHeight().subscribe((height) => {
      this.svg.style('height', height);
    });
    this.svg.style('width', '100%');
  }

  clean() {
    this.svg.selectAll('*').remove();
    this.clusters.clear();
  }

  updateCluster(data: ICluster) {
    if (!this.clusters.get(data.min5_slot)?.has(data.p)) {
      const elementData = {
        slot: data.min5_slot,
        price: Number(data.p),
        volume: Number(data.volume),
        askVolume: data.m ? Number(data.volume) : 0,
        bidVolume: data.m ? 0 : Number(data.volume),
      };

      this.clusters.get(data.min5_slot)?.set(data.p, elementData);
    } else {
      const elementData = this.clusters.get(data.min5_slot)!.get(data.p)!;

      if (data.m) {
        elementData.bidVolume = elementData.bidVolume + Number(data.volume);
      } else {
        elementData.askVolume = elementData.askVolume + Number(data.volume);
      }
    }

    this.render();
  }

  addClusters(clusters: Map<Date, ICluster[]>) {
    for (let [key, cluster] of clusters.entries()) {
      if (!this.clusters.has(key)) {
        this.clusters.set(
          key,
          new Map(
            cluster.map((item) => {
              return [
                item.p,
                {
                  slot: key,
                  price: Number(item.p),
                  volume: Number(item.volume),
                  askVolume: item.m ? 0 : Number(item.volume),
                  bidVolume: item.m ? Number(item.volume) : 0,
                },
              ];
            })
          )
        );
      }
    }

    this.render();
  }

  render() {
    return;
    if (!this.clusters.size) {
      return;
    }
    for (const dataObj of this.clusters.values()) {
      this.svg
        .selectAll<BaseType, IClusterData>('g')
        .data(dataObj.values(), (d) => `${d.price}${d.volume}`)
        .join(
          (enter) => {
            const g = enter.append('g');
            g.append('rect')
              .attr('width', '20%')
              .attr('height', this.gridService.getBarHeight())
              .attr('y', (d) => {
                return this.gridService.getY(d.price);
              })
              .attr('x', (d) => {
                return this.gridService.getMin5SlotX(d.slot);
              })
              .attr('fill', (d) => {
                const max = Math.max(d.bidVolume, d.askVolume);
                const onePeace = max / 255;

                const red = Math.floor(d.bidVolume / onePeace)
                  .toString(16)
                  .padStart(2, '0')
                  .toUpperCase();
                const green = Math.floor(d.askVolume / onePeace)
                  .toString(16)
                  .padStart(2, '0')
                  .toUpperCase();

                return `#${red}${green}00`;
              });

            g.append('text')
              .attr('dominant-baseline', 'hanging')
              .attr('width', '20%')
              .attr('height', this.gridService.getBarHeight())
              .attr('y', (d) => {
                return this.gridService.getY(d.price) + 2;
              })
              .attr('x', (d) => {
                return this.gridService.getMin5SlotX(d.slot);
              })
              .text((d) => {
                return d.volume;
              });

            return g;
          },
          (update) => {
            update
              .selectAll<BaseType, IClusterData>('rect')
              .attr('fill', (d) => {
                const max = Math.max(d.bidVolume, d.askVolume);
                const onePeace = max / 255;

                const red = Math.floor(d.bidVolume / onePeace)
                  .toString(16)
                  .padStart(2, '0')
                  .toUpperCase();
                const green = Math.floor(d.askVolume / onePeace)
                  .toString(16)
                  .padStart(2, '0')
                  .toUpperCase();
                return `#${red}${green}00`;
              });

            update.selectAll<BaseType, IClusterData>('text').text((d) => {
              return d.volume;
            });

            return update;
          },
          (exit) => {}
        );
    }
  }
}
