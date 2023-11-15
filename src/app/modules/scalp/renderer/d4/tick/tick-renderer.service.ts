import { Injectable } from '@angular/core';
import { BaseType, Selection } from 'd3';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { GridService } from '../grid/grid.service';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
const MAX_LENGTH = 20;
const RADIUS = 16;
@Injectable()
export class TickRendererService {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private circlesIndexes: Array<
    Selection<SVGGElement, unknown, null, undefined>
  > = [];
  private askColor: string;
  private bidColor: string;
  private data: Array<[number, number, string, number, number]> = [];
  private width: number;
  constructor(
    private gridService: GridService,
    private configService: ConfigService
  ) {
    this.askColor = configService.getConfig(STYLE_THEME_KEY).fillAskColor;
    this.bidColor = configService.getConfig(STYLE_THEME_KEY).fillBidColor;
  }

  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
    this.gridService.getHeight().subscribe((height) => {
      this.svg.style('height', height);
    });
    this.svg.style('width', '100%');
    this.width = this.svg.node()?.getBoundingClientRect().width || 300;
    this.initCircles();
  }

  initCircles() {
    this.data = [];
  }
  renderCircles() {
    return
    this.svg
      .selectAll<BaseType, string>('g')
      .data(this.data, (d) => {
        if (!d) {
          debugger;
        }
        return d[4];
      })
      .join(
        (enter) => {
          const g = enter.append('g');
          g.append('circle')
            .attr('r', RADIUS)
            .attr('cx', (d) => {
              return this.width - (this.data.length - d[4]) * RADIUS;
            })
            .attr('cy', (d) => {
              return d[1];
            })
            .attr('fill', (d) => {
              return d[2];
            });
          g.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', RADIUS)
            .attr('fill', 'white')
            .attr('x', (d) => {
              return this.width - (this.data.length - d[4]) * RADIUS;
            })
            .attr('y', (d) => {
              return d[1] + RADIUS / 2 - 2;
            })
            .text((d) => {
              return d[3];
            });
          return g;
        },
        (update) => {
          update
            .selectAll<BaseType, Array<any>>('circle')
            .attr('r', RADIUS)
            .transition()
            .attr('cx', (d) => {
              return this.width - (this.data.length - d[4]) * RADIUS;
            })
            .attr('cy', (d) => {
              return d[1];
            })
            .attr('fill', (d) => {
              return d[2];
            });
          update
            .selectAll<BaseType, Array<any>>('text')
            .transition()
            .attr('x', (d) => {
              return this.width - (this.data.length - d[4]) * RADIUS;
            })
            .attr('y', (d) => {
              return d[1] + RADIUS / 2 - 2;
            })
            .text((d) => {
              return d[3];
            });
          return update;
        }
      );
  }

  clean() {
    this.svg.selectAll('*').remove();
    this.circlesIndexes.splice(0);
    this.initCircles();
  }

  render(data: IAggTrade) {
    if (!this.svg) {
      return;
    }
    const y = this.gridService.getY(data.p);
    if (!y) {
      return;
    }
    this.data.push([
      data.a,
      y,
      data.m ? this.bidColor : this.askColor,
      Number(data.q),
      this.data.length,
    ]);

    if (this.data.length > MAX_LENGTH) {
      this.data.splice(0, this.data.length - MAX_LENGTH);
      this.data.forEach((item, idx) => {
        item[4] = idx;
      });
    }
    this.renderCircles();
  }
}
