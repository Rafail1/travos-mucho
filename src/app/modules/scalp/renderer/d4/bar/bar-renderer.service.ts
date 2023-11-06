import { Injectable } from '@angular/core';
import { BaseType, Selection, transition } from 'd3';
import { IBar } from 'src/app/modules/backend/backend.service';
import { GridService } from '../grid/grid.service';
const emptyRow = {};
@Injectable()
export class BarRendererService {
  init(data: IBar[]) {
    throw new Error('Method not implemented.');
  }
  private svg: Selection<SVGSVGElement, IBar, HTMLElement, undefined>;
  private data = new Map<string, IBar>();
  constructor(private gridService: GridService) {}
  setSvg(svg: Selection<SVGSVGElement, IBar, HTMLElement, undefined>) {
    this.svg = svg;

    this.gridService.getHeight().subscribe((height) => {
      this.svg.style('height', height);
    });
    this.svg.style('width', '100%');
  }

  clean() {
    this.data.clear();
  }
  getKeys() {
    return this.gridService.getGrid().keys();
  }
  render(data: { [key: number]: IBar }) {
    for (const [key, item] of Object.entries(data)) {
      this.data.set(key, item);
    }

    this.svg
      .selectAll<BaseType, string>('g')
      .data(Object.keys(data), (d) => {
        const dt = this.data.get(d)!;
        return `${dt.depth.join()}${dt.type}`;
      })
      .join(
        (enter) => {
          const g = enter.append('g');
          g.append('rect')
            .attr('class', 'background')
            .attr('height', this.gridService.getBarHeight())
            .attr('width', '100%')
            .attr('y', (key: string) => {
              const d = this.data.get(key)!;
              return this.gridService.getY(d.depth[0]);
            })
            .attr('fill', (key: string) => {
              const d = this.data.get(key)!;
              return d.backgroundColor;
            });

          g.append('rect')
            .attr('class', 'fill')
            .attr('height', this.gridService.getBarHeight())
            .attr('width', '100%')
            .attr('y', (key: string) => {
              const d = this.data.get(key)!;
              return this.gridService.getY(d.depth[0])!;
            })
            .attr('width', (key: string) => {
              const d = this.data.get(key)!;
              return d.fillRectWidth;
            })
            .attr('fill', (key: string) => {
              const d = this.data.get(key)!;
              return d.fillColor;
            });

          g.append('text')
            .attr('class', 'price')
            .attr('height', this.gridService.getBarHeight())
            .attr('font-size', this.gridService.getBarHeight() - 2)
            .attr('dominant-baseline', 'hanging')
            .attr('x', 300)
            .attr('text-anchor', 'end')
            .attr('y', (key: string) => {
              const d = this.data.get(key)!;
              return this.gridService.getY(d.depth[0])! + 2;
            })
            .attr('fill', (key: string) => {
              const d = this.data.get(key)!;
              return d.textColor;
            })
            .text((key: string) => {
              const d = this.data.get(key)!;
              return d.priceText;
            });
          g.append('text')
            .attr('class', 'volume')
            .attr('dominant-baseline', 'hanging')
            .attr('text-anchor', 'start')
            .attr('height', this.gridService.getBarHeight())
            .attr('font-size', this.gridService.getBarHeight() - 2)
            .attr('y', (key: string) => {
              const d = this.data.get(key)!;
              return this.gridService.getY(d.depth[0])! + 2;
            })
            .attr('fill', (key: string) => {
              const d = this.data.get(key)!;
              return d.textColor;
            })
            .text((key: string) => {
              const d = this.data.get(key)!;
              return d.volumeText;
            });
          return g;
        },
        (update) => {
          update
            .selectAll<BaseType, string>('.background')
            .attr('fill', (key: string) => {
              const d = this.data.get(key)!;
              return d.backgroundColor;
            });
          update
            .selectAll<BaseType, string>('.fill')
            .transition()
            .attr('width', (key: string) => {
              const d = this.data.get(key)!;
              return d.fillRectWidth;
            })
            .attr('fill', (key: string) => {
              const d = this.data.get(key)!;
              return d.fillColor;
            });
          update.selectAll<BaseType, string>('.price').text((key: string) => {
            const d = this.data.get(key)!;
            return d.priceText;
          });

          update.selectAll<BaseType, string>('.volume').text((key: string) => {
            const d = this.data.get(key)!;
            return d.volumeText;
          });
          return update;
        },
        (exit) => {}
      );
  }

  emptyRow(key: string): IBar {
    return {
      E: '',
      depth: [key, '0'],
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
