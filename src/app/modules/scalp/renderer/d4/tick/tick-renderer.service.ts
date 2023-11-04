import { Injectable } from '@angular/core';
import { Selection } from 'd3';
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
    for (let i = 0; i < MAX_LENGTH; i++) {
      this.data.push({ y: 0, x: i * RADIUS, color: 'red' });
    }
  }
  renderCircles() {
    this.svg
      .selectAll('g')
      .data(this.data)
      .enter()
      .append('g')
      .selectAll('circle')
      .data<any>((d: any) => {
        return [d];
      })
      .enter()
      .append('circle')
      .attr('r', RADIUS)
      .attr('cx', function (d: any) {
        return d.x;
      })
      .attr('cy', (d: any) => {
        return d.y;
      })
      .attr('fill', function (d: any) {
        return d.color;
      });
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

    this.data[this.latestElementIdx].y = y;
    this.data[this.latestElementIdx].color = data.m
      ? this.askColor
      : this.bidColor;
    // const group = this.circlesIndexes[this.latestElementIdx];
    // if (!group) {
    //   throw Error('circle group not found');
    // }

    // this.circlesIndexes.forEach((item, idx) => {
    //   item.attr('transform', `translate(${(idx + 1) * RADIUS})`);
    // });

    // group.select('circle').attr('fill', data.m ? this.askColor : this.bidColor);
    // group.attr('transform', `translate(${RADIUS}, ${y})`);
    // group.select('text').text(data.q);
    if (this.latestElementIdx === MAX_LENGTH - 1) {
      this.latestElementIdx = 0;
    } else {
      this.latestElementIdx++;
    }
    this.renderCircles();
  }
}
