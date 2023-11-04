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
    Selection<SVGCircleElement, unknown, null, undefined>
  > = [];

  constructor(private gridService: GridService, private configService: ConfigService) {}

  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
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
    this.circlesIndexes.push(this.svg.insert('circle').attr('y', y));

    const outdated = this.circlesIndexes.splice(MAX_LENGTH);
    for (const item of outdated) {
      item.remove();
    }
  }
}
