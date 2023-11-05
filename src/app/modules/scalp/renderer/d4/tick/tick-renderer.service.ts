import { Injectable } from '@angular/core';
import { Selection, merge, transition } from 'd3';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { GridService } from '../grid/grid.service';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
const MAX_LENGTH = 50;
const RADIUS = 10;
@Injectable()
export class TickRendererService {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private circlesIndexes: Array<
    Selection<SVGGElement, unknown, null, undefined>
  > = [];
  private askColor: string;
  private bidColor: string;
  private latestElementIdx = 0;
  private data: any = [];
  constructor(
    private gridService: GridService,
    private configService: ConfigService
  ) {
    this.askColor = configService.getConfig(STYLE_THEME_KEY).fillAskColor;
    this.bidColor = configService.getConfig(STYLE_THEME_KEY).fillBidColor;
  }

  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;

    this.initCircles();
  }

  initCircles() {
    this.data = [];
  }
  renderCircles() {
    const groups: any = this.svg.selectAll('g').data(this.data, (d: any) => d);
    const g = groups.join((enter: any) => {
      enter.append('g');
    });
    groups.exit().remove();
    const circles = g.selectAll('circle').data(
      (d: any) => d.slice(0, 1),
      (d: any) => {
        return d;
      }
    );
    const texts: any = g.selectAll('text').data(
      (d: any) => {
        return d.slice(0, 1);
      },
      (d: any) => {
        return d;
      }
    );

    circles.join(
      (enter: any) => {
        enter.append('circle').attr('r', RADIUS);
      },
      (update: any) => {
        update
          .attr('cx', (d: number) => {
            return this.data[d][1];
          })
          .attr('cy', (d: number) => {
            return this.data[d][2];
          })
          .attr('fill', (d: number) => {
            return this.data[d][3];
          });
      },
      (exit: any) => {
        exit.remove();
      }
    );
    texts.join(
      (enter: any) => {
        enter.append('text');
      },
      (update: any) => {
        update.text((d: number) => {
          if (!this.data[d]) {
            debugger;
          }
          return this.data[d][4];
        });
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

    this.data[this.latestElementIdx] = [
      this.latestElementIdx,
      y,
      this.latestElementIdx * RADIUS,
      data.m ? this.askColor : this.bidColor,
      data.q,
    ];

    if (this.latestElementIdx === MAX_LENGTH - 1) {
      this.latestElementIdx = 0;
    } else {
      this.latestElementIdx++;
    }

    this.renderCircles();
  }
}
