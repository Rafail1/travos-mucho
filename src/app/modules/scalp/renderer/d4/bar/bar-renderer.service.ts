import { Injectable } from '@angular/core';
import { BaseType, Selection, transition } from 'd3';
import { IBar } from 'src/app/modules/backend/backend.service';
import { GridService } from '../grid/grid.service';
@Injectable()
export class BarRendererService {
  private svg: Selection<SVGSVGElement, IBar, HTMLElement, undefined>;
  private data = new Map<number, IBar>();
  constructor(private gridService: GridService) {}
  setSvg(svg: Selection<SVGSVGElement, IBar, HTMLElement, undefined>) {
    this.svg = svg;

    this.gridService.getHeight().subscribe((height) => {
      this.svg.style('height', height);
    });
    this.svg.style('width', '100%');
    this.gridService.visibleAreaChanged$.subscribe(() => {
      this.render([]);
    })
  }

  clean() {
    this.svg.selectAll('*').remove();
    this.data.clear();
  }

  getData(key: number) {
    return this.data.get(key) || this.emptyRow(key);
  }

  render(data: { [key: number]: IBar }) {
    for (const [key, item] of Object.entries(data)) {
      this.data.set(Number(key), item);
    }

    this.svg
      .selectAll<BaseType, number>('g')
      .data(this.gridService.getGrid(), (d) => {
        const dt = this.getData(d);
        return dt.depth[0];
      })
      .join(
        (enter) => {
          const g = enter.append('g');
          g.append('rect')
            .attr('class', 'background')
            .attr('height', this.gridService.getBarHeight())
            .attr('width', '100%')
            .attr('y', (key: number) => {
              const d = this.getData(key);
              return this.gridService.getY(d.depth[0]);
            })
            .attr('fill', (key: number) => {
              const d = this.getData(key);
              return d.backgroundColor;
            });

          g.append('rect')
            .attr('class', 'fill')
            .attr('height', this.gridService.getBarHeight())
            .attr('width', '100%')
            .attr('y', (key: number) => {
              const d = this.getData(key);
              return this.gridService.getY(d.depth[0])!;
            })
            .attr('width', (key: number) => {
              const d = this.getData(key);
              return d.fillRectWidth;
            })
            .attr('fill', (key: number) => {
              const d = this.getData(key);
              return d.fillColor;
            });

          g.append('text')
            .attr('class', 'price')
            .attr('height', this.gridService.getBarHeight())
            .attr('font-size', this.gridService.getBarHeight() - 2)
            .attr('dominant-baseline', 'hanging')
            .attr('x', 300)
            .attr('text-anchor', 'end')
            .attr('y', (key: number) => {
              const d = this.getData(key);
              return this.gridService.getY(d.depth[0])! + 2;
            })
            .attr('fill', (key: number) => {
              const d = this.getData(key);
              return d.textColor;
            })
            .text((key: number) => {
              const d = this.getData(key);
              return d.priceText;
            });
          g.append('text')
            .attr('class', 'volume')
            .attr('dominant-baseline', 'hanging')
            .attr('text-anchor', 'start')
            .attr('height', this.gridService.getBarHeight())
            .attr('font-size', this.gridService.getBarHeight() - 2)
            .attr('y', (key: number) => {
              const d = this.getData(key);
              return this.gridService.getY(d.depth[0])! + 2;
            })
            .attr('fill', (key: number) => {
              const d = this.getData(key);
              return d.textColor;
            })
            .text((key: number) => {
              const d = this.getData(key);
              return d.volumeText;
            });
          return g;
        },
        (update) => {
          update
            .selectAll<BaseType, number>('.background')
            .attr('fill', (key: number) => {
              const d = this.getData(key);
              return d.backgroundColor;
            });
          update
            .selectAll<BaseType, number>('.fill')
            .transition()
            .attr('width', (key: number) => {
              const d = this.getData(key);
              return d.fillRectWidth;
            })
            .attr('fill', (key: number) => {
              const d = this.getData(key);
              return d.fillColor;
            });
          update.selectAll<BaseType, number>('.price').text((key: number) => {
            const d = this.getData(key);
            return d.priceText;
          });

          update.selectAll<BaseType, number>('.volume').text((key: number) => {
            const d = this.getData(key);
            return d.volumeText;
          });
          return update;
        }
      );
  }

  emptyRow(key: number): IBar {
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
