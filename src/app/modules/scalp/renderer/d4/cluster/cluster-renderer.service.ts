import { Injectable } from '@angular/core';
import { BaseType, Selection } from 'd3';
import { shortNumber } from 'src/app/common/utils/short-number.util';
import { ICluster } from 'src/app/modules/backend/backend.service';
import { SettingsService } from '../../../settings/settings.service';
import { IClusterData } from '../d4-renderer.service';
import { GridService } from '../grid/grid.service';
const MAX_LENGTH = 20;
@Injectable()
export class ClusterRendererService {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private clusters = new Map<number, Map<number, IClusterData>>();
  private currentCluster = new Date().getTime();
  constructor(
    private gridService: GridService,
    private settingsService: SettingsService
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
    this.gridService.visibleAreaChanged$.subscribe(() => {
      this.render();
    });
  }

  clean() {
    this.svg.selectAll('*').remove();
    this.clusters.clear();
  }

  updateCluster(data: ICluster) {
    this.currentCluster = data.min5_slot.getTime();
    if (!this.clusters.get(this.currentCluster)) {
      return this.addClusters(new Map([[data.min5_slot, [data]]]));
    } else if (!this.clusters.get(this.currentCluster)?.has(Number(data.p))) {
      const elementData = {
        slot: data.min5_slot,
        price: Number(data.p),
        volume: Number(data.volume),
        askVolume: data.m ? Number(data.volume) : 0,
        bidVolume: data.m ? 0 : Number(data.volume),
      };

      this.clusters.get(this.currentCluster)?.set(Number(data.p), elementData);
    } else {
      const elementData = this.clusters
        .get(this.currentCluster)!
        .get(Number(data.p))!;

      if (data.m) {
        elementData.bidVolume = elementData.bidVolume + Number(data.volume);
      } else {
        elementData.askVolume = elementData.askVolume + Number(data.volume);
      }

      elementData.volume += data.volume;
    }

    this.render();
  }

  addClusters(clusters: Map<Date, ICluster[]>) {
    for (let [key, cluster] of clusters.entries()) {
      if (!this.clusters.has(key.getTime())) {
        const value = new Map(
          cluster.map((item) => {
            return [
              Number(item.p),
              {
                slot: key,
                price: Number(item.p),
                volume: Number(item.volume),
                askVolume: item.m ? 0 : Number(item.volume),
                bidVolume: item.m ? Number(item.volume) : 0,
              },
            ];
          })
        );
        this.clusters.set(key.getTime(), value);
        this.currentCluster = key.getTime();
        this.render();
      }
    }
  }

  render() {
    this.svg
      .selectAll<BaseType, IClusterData>('g')
      .data(
        () => {
          const data = [];
          const grid = this.gridService.getGrid();
          for (const [, clusters] of this.clusters.entries()) {
            for (const [price, cluster] of clusters.entries()) {
              if (grid.includes(price)) {
                data.push(cluster);
              }
            }
          }
          return data;
        },
        (dt) => {
          // const dt = this.getData(d);
          return `${dt.price}${dt.volume}${this.gridService.getMin5SlotX(
            dt.slot
          )}`;
        }
      )
      .join(
        (enter) => {
          const g = enter.append('g');
          g.append('rect')
            .attr('width', '20%')
            .attr('height', this.gridService.getBarHeight())
            .attr('y', (dt) => {
              // const dt = this.getData(d);
              return this.gridService.getY(dt.price);
            })
            .attr('x', (dt) => {
              // const dt = this.getData(d);
              return this.gridService.getMin5SlotX(dt.slot);
            })
            .attr('fill', (dt) => {
              // const dt = this.getData(d);

              const max = Math.max(dt.bidVolume, dt.askVolume);
              const onePeace = max / 255;

              const red = Math.floor(dt.bidVolume / onePeace)
                .toString(16)
                .padStart(2, '0')
                .toUpperCase();
              const green = Math.floor(dt.askVolume / onePeace)
                .toString(16)
                .padStart(2, '0')
                .toUpperCase();

              return `#${red}${green}00`;
            });

          g.append('text')
            .attr('dominant-baseline', 'hanging')
            .attr('width', '20%')
            .attr('height', this.gridService.getBarHeight())
            .attr('y', (dt) => {
              // const dt = this.getData(d);
              return this.gridService.getY(dt.price) + 2;
            })
            .attr('x', (dt) => {
              // const dt = this.getData(d);
              return this.gridService.getMin5SlotX(dt.slot);
            })
            .text((dt) => {
              const clusterVolumePrecision =
                this.settingsService.getSettings().cluster.volumeFormat
                  .decPlaces;
              return shortNumber(dt.volume, clusterVolumePrecision);
            });

          return g;
        },
        (update) => {
          update
            .selectAll<BaseType, IClusterData>('rect')
            .attr('fill', (dt) => {
              // const dt = this.getData(d);
              const max = Math.max(dt.bidVolume, dt.askVolume);
              const onePeace = max / 255;

              const red = Math.floor(dt.bidVolume / onePeace)
                .toString(16)
                .padStart(2, '0')
                .toUpperCase();
              const green = Math.floor(dt.askVolume / onePeace)
                .toString(16)
                .padStart(2, '0')
                .toUpperCase();
              return `#${red}${green}00`;
            });

          update.selectAll<BaseType, IClusterData>('text').text((dt) => {
            const clusterVolumePrecision =
              this.settingsService.getSettings().cluster.volumeFormat.decPlaces;
            console.log(dt.price, dt.volume);
            return shortNumber(dt.volume, clusterVolumePrecision);
          });

          return update;
        }
      );
  }
  getData(d: number): IClusterData {
    return (
      this.clusters.get(this.currentCluster)?.get(d) || this.emptyCluster(d)
    );
  }

  emptyCluster(d: number): IClusterData {
    return {
      askVolume: 0,
      bidVolume: 0,
      price: d,
      slot: new Date(this.currentCluster),
      volume: 0,
    };
  }
}
