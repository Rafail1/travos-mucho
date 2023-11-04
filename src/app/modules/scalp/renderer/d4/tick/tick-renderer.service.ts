import { Injectable } from '@angular/core';
import { Selection } from 'd3';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { GridService } from '../grid/grid.service';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
const MAX_LENGTH = 100;
const RADIUS = 10;
@Injectable()
export class TickRendererService {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private circlesIndexes: Array<
    Selection<SVGGElement, unknown, null, undefined>
  > = [];
  private askColor: string;
  private bidColor: string;

  constructor(
    private gridService: GridService,
    private configService: ConfigService
  ) {
    this.askColor = configService.getConfig(STYLE_THEME_KEY).fillAskColor;
    this.bidColor = configService.getConfig(STYLE_THEME_KEY).fillBidColor;
  }

  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
    for (let i = 0; i < MAX_LENGTH; i++) {
      const group = this.svg.insert('g');
      this.circlesIndexes.push(group);
      group.insert('circle').attr('cx', RADIUS).attr('cy', RADIUS);
      group.insert('text');
    }
  }

  clean() {
    this.svg.selectAll('*').remove();
    this.circlesIndexes.splice(0);
  }

  render(data: IAggTrade) {
    if (!this.svg) {
      return;
    }
    const y = this.gridService.getY(data.p);
    if (!y) {
      return;
    }
    const group = this.circlesIndexes.pop();
    if (!group) {
      throw Error('circle not found');
    }

    this.circlesIndexes.forEach((item, idx) => {
      group.select('circle').attr('x', (idx + 1) * RADIUS);
    });

    group
      .select('circle')
      .attr('y', y)
      .attr('x', RADIUS)
      .attr('fill', data.m ? this.askColor : this.bidColor);
    group.select('text').text(data.q);
    this.circlesIndexes.unshift(group);
  }
}
