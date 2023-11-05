import { Injectable } from '@angular/core';
import { Selection, merge } from 'd3';
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
    const groups: any = this.svg
      .selectAll('g')
      .data(this.data, function (d: any) {
        return d[0];
      });
    const g = groups.join(function (enter: any) {
      enter.append('g');
    });
    groups.exit().remove();
    const circles: any = g
      .selectAll('circle')
      .data((d: any) => [d.slice(1, 4)]);
    const texts: any = g.selectAll('text').data((d: any) => [d[4]]);

    circles.join(
      (enter: any) => {
        enter.append('circle');
      },
      (update: any) => {
        update
          .attr('r', RADIUS)
          .attr('cx', function (d: any) {
            console.log(d);
            return d[0];
          })
          .attr('cy', (d: any) => {
            console.log(d);
            return d[1];
          })
          .attr('fill', function (d: any) {
            return d[2];
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
        update.text((d: any) => d);
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

    this.data[this.latestElementIdx][0] = this.latestElementIdx;
    this.data[this.latestElementIdx][1] = y;
    this.data[this.latestElementIdx][2] = this.latestElementIdx * RADIUS;
    this.data[this.latestElementIdx][3] = data.m
      ? this.askColor
      : this.bidColor;
    this.data[this.latestElementIdx][4] = data.q;

    if (this.latestElementIdx === MAX_LENGTH - 1) {
      this.latestElementIdx = 0;
    } else {
      this.latestElementIdx++;
    }

    this.renderCircles();
  }
}
