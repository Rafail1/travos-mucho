import { Injectable } from '@angular/core';
import { Selection, transition } from 'd3';
import { IBar } from 'src/app/modules/backend/backend.service';
import { GridService } from '../grid/grid.service';
const emptyRow = {};
@Injectable()
export class BarRendererService {
  groups: any;
  g: any;
  backgroundRects: any;
  fillRects: any;
  pricTexts: any;
  volumeTexts: any;
  init(data: IBar[]) {
    throw new Error('Method not implemented.');
  }
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private data = new Map<number, IBar>();
  constructor(private gridService: GridService) {}
  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;

    this.gridService.getHeight().subscribe((height) => {
      this.svg.style('height', height);
    });
    this.svg.style('width', '100%');
  }

  clean() {
    this.data.clear();
  }

  render(data: { [key: number]: IBar }) {
    if (!this.data.size) {
      for (const key of this.gridService.getGrid().keys()) {
        this.data.set(key, data[key] || this.emptyRow(key));
      }
    } else {
      for (const [key, item] of Object.entries(data)) {
        const keyN = Number(key);
        if (!this.gridService.getGrid().has(keyN)) {
          continue;
        }

        this.data.set(keyN, item);
      }
    }

    this.groups = this.svg
      .selectAll('g')
      .data(this.gridService.getGrid().keys());

    this.g = this.groups.join(function (enter: any) {
      enter.append('g');
    });

    this.backgroundRects = this.g
      .selectAll('rect.background')
      .data(this.gridService.getGrid().keys(), (d: any) => d);

    this.fillRects = this.g
      .selectAll('rect.fill')
      .data(this.gridService.getGrid().keys(), (d: any) => d);

    this.pricTexts = this.g
      .selectAll('text.price')
      .data(this.gridService.getGrid().keys(), (d: any) => d);

    this.volumeTexts = this.g
      .selectAll('text.volume')
      .data(this.gridService.getGrid().keys(), (d: any) => d);

    this.backgroundRects.join(
      (enter: any) => {
        enter
          .append('rect')
          .attr('class', 'background')
          .attr('height', this.gridService.getBarHeight())
          .attr('width', '100%')
          .attr('y', (key: number) => {
            const d = this.data.get(key)!;
            return this.gridService.getY(d.depth[0]);
          })
          .attr('fill', (key: number) => {
            const d = this.data.get(key)!;
            return d.backgroundColor;
          });
      },
      (update: any) => {
        update.attr('fill', (key: number) => {
          const d = this.data.get(key)!;
          return d.backgroundColor;
        });
      }
    );

    this.fillRects.join(
      (enter: any) => {
        enter
          .append('rect')
          .attr('class', 'fill')
          .attr('height', this.gridService.getBarHeight())
          .attr('width', '100%')
          .attr('y', (key: number) => {
            const d = this.data.get(key)!;
            return this.gridService.getY(d.depth[0]);
          })
          .attr('width', (key: number) => {
            const d = this.data.get(key)!;
            return d.fillRectWidth;
          })
          .attr('fill', (key: number) => {
            const d = this.data.get(key)!;
            return d.fillColor;
          });
      },
      (update: any) => {
        update
          .transition()
          .attr('width', (key: number) => {
            const d = this.data.get(key)!;
            return d.fillRectWidth;
          })
          .attr('fill', (key: number) => {
            const d = this.data.get(key)!;
            return d.fillColor;
          });
      },
      (exit: any) => {
        exit.attr('width', 0);
      }
    );

    this.pricTexts.join(
      (enter: any) => {
        enter
          .append('text')
          .attr('class', 'price')
          .attr('height', this.gridService.getBarHeight())
          .attr('font-size', this.gridService.getBarHeight() - 2)
          .attr('dominant-baseline', 'hanging')
          .attr('x', 300)
          .attr('dominant-baseline', 'hanging')
          .attr('text-anchor', 'end')
          .attr('y', (key: number) => {
            const d = this.data.get(key)!;
            return this.gridService.getY(d.depth[0])! + 2;
          })
          .attr('fill', (key: number) => {
            const d = this.data.get(key)!;
            return d.textColor;
          })
          .text((key: number) => {
            const d = this.data.get(key)!;
            return d.priceText;
          });
      },
      (update: any) => {
        update
          // .attr('fill', (key: number) => {
          //   const d = this.data.get(key)!;
          //   return d.textColor;
          // })
          .text((key: number) => {
            const d = this.data.get(key)!;
            return d.priceText;
          });
      },
      (exit: any) => {
        exit.remove();
      }
    );

    this.volumeTexts.join(
      (enter: any) => {
        enter
          .append('text')
          .attr('class', 'volume')
          .attr('dominant-baseline', 'hanging')
          .attr('text-anchor', 'start')
          .attr('height', this.gridService.getBarHeight())
          .attr('font-size', this.gridService.getBarHeight() - 2)
          .attr('y', (key: number) => {
            const d = this.data.get(key)!;
            return this.gridService.getY(d.depth[0])! + 2;
          })
          .attr('fill', (key: number) => {
            const d = this.data.get(key)!;
            return d.textColor;
          })
          .text((key: number) => {
            const d = this.data.get(key)!;
            return d.volumeText;
          });
      },
      (update: any) => {
        update
          // .attr('fill', (key: number) => {
          //   const d = this.data.get(key)!;
          //   return d.textColor;
          // })
          .text((key: number) => {
            const d = this.data.get(key)!;
            return d.volumeText;
          });
      },
      (exit: any) => {
        exit.remove();
      }
    );
  }

  emptyRow(key: number): IBar {
    return {
      depth: [String(key), '0'],
      backgroundColor: 'gray',
      fillColor: 'gray',
      fillRectWidth: '0',
      priceText: '',
      textColor: '',
      type: 'ask',
      volumeText: '',
    };
  }
}
