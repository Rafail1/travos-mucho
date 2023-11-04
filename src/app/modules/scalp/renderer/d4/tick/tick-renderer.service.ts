import { Injectable } from '@angular/core';
import { Selection } from 'd3';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { GridService } from '../grid/grid.service';
import { ConfigService } from 'src/app/config/config';
const MAX_LENGTH = 100;
@Injectable()
export class TickRendererService {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private circlesIndexes: Array<
    Selection<SVGGElement, unknown, null, undefined>
  > = [];

  constructor(
    private gridService: GridService,
    private configService: ConfigService
  ) {}

  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
    for (let i = 0; i < MAX_LENGTH; i++) {
      const group = this.svg.insert('g');
      this.circlesIndexes.push(group);
      group.insert('circle');
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
    group.select('circle').attr('y', y);
    this.circlesIndexes.unshift(group);
  }
}
