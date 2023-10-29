import { Injectable } from '@angular/core';
import { Selection } from 'd3';
import { IAggTrade } from 'src/app/modules/backend/backend.service';

@Injectable()
export class TickRendererService {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private circles = new Map<
    string,
    Selection<SVGCircleElement, unknown, null, undefined>
  >();

  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
  }

  render(data: IAggTrade) {
    if (!this.svg) {
      return;
    }
    const element = this.svg.insert('circle');
  }
}
