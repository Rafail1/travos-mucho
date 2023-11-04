import { Injectable } from '@angular/core';
import { Selection } from 'd3';
import { IBar } from 'src/app/modules/backend/backend.service';
import { GridService } from '../grid/grid.service';

@Injectable()
export class BarRendererService {
  private svg: Selection<SVGSVGElement, unknown, null, undefined>;
  private rects = new Map<
    string,
    { element: Selection<SVGGElement, unknown, null, undefined>; data: IBar }
  >();
  constructor(private gridService: GridService) {}
  setSvg(svg: Selection<SVGSVGElement, unknown, null, undefined>) {
    this.svg = svg;
    this.gridService.getHeight().subscribe((height) => {
      this.svg.style('height', height);
    });
    this.svg.style('width', '100%');
  }
  updateTextColor(key: string, textColor: string) {
    if (!this.rects.has(key)) {
      throw new Error('rect not found');
    }
    const { element, data } = this.rects.get(key)!;
    element.select('text').attr('fill', textColor);
    data.textColor = textColor;
  }
  updatePriceText(key: string, priceText: string) {
    if (!this.rects.has(key)) {
      throw new Error('rect not found');
    }
    const { element, data } = this.rects.get(key)!;
    data.priceText = priceText;
    element.select('.price').text(priceText);
  }
  updateFillRectWidth(key: string, fillRectWidth: string, fillColor: string) {
    if (!this.rects.has(key)) {
      throw new Error('rect not found');
    }
    const { element, data } = this.rects.get(key)!;
    data.fillRectWidth = fillRectWidth;

    element
      .select('.fill')
      .attr('width', fillRectWidth)
      .style('fill', fillColor);
  }
  updateBackgroundColor(key: string, backgroundColor: string) {
    if (!this.rects.has(key)) {
      throw new Error('rect not found');
    }
    const { element, data } = this.rects.get(key)!;
    data.backgroundColor = backgroundColor;

    element.select('.background').style('fill', backgroundColor);
  }

  updateVolumeText(key: string, volumeText: string) {
    if (!this.rects.has(key)) {
      throw new Error('rect not found');
    }
    const { element, data } = this.rects.get(key)!;
    data.volumeText = volumeText;

    element.select('.volume').text(volumeText);
  }

  clean() {
    this.svg.selectAll('*').remove();
    this.rects.clear();
  }

  add(key: string, data: IBar) {
    const y = this.gridService.getY(data.depth[0]);
    if (!y) {
      return;
    }
    const element = this.svg.insert('g');
    const rect = element.append('rect').attr('class', 'background');
    const fillRect = element.append('rect').attr('class', 'fill');
    rect
      .attr('height', this.gridService.getBarHeight())
      .attr('width', '100%')
      .attr('y', y);
    fillRect
      .attr('height', this.gridService.getBarHeight())
      .attr('width', 0)
      .attr('y', y);
    element
      .append('text')
      .attr('class', 'volume')
      .attr('y', y + 2)
      .attr('x', rect.node()?.getBoundingClientRect().width || 300)
      .attr('dominant-baseline', 'hanging')
      .attr('height', this.gridService.getBarHeight())
      .attr('font-size', this.gridService.getBarHeight() - 2)
      .attr('text-anchor', 'end');
    element
      .append('text')
      .attr('class', 'price')
      .attr('y', y + 2)
      .attr('height', this.gridService.getBarHeight())
      .attr('font-size', this.gridService.getBarHeight() - 2)
      .attr('dominant-baseline', 'hanging')
      .attr('text-anchor', 'start');
    this.rects.set(key, { element, data });
    this.updateVolumeText(key, data.volumeText);
    this.updateBackgroundColor(key, data.backgroundColor);
    this.updateFillRectWidth(key, data.fillRectWidth, data.fillColor);
    this.updatePriceText(key, data.priceText);
    this.updateTextColor(key, data.textColor);
  }

  render(data: IBar) {
    const key = data.depth[0];
    if (!this.rects.has(key)) {
      this.add(key, data);
      return;
    }

    const prevBar = this.rects.get(key)?.data as IBar;
    const { backgroundColor, fillRectWidth, priceText, textColor, volumeText } =
      prevBar;

    if (backgroundColor !== data.backgroundColor) {
      this.updateBackgroundColor(key, data.backgroundColor);
    }

    if (fillRectWidth !== data.fillRectWidth) {
      this.updateFillRectWidth(key, data.fillRectWidth, data.fillColor);
    }

    if (priceText !== data.priceText) {
      this.updatePriceText(key, data.priceText);
    }

    if (textColor !== data.textColor) {
      this.updateTextColor(key, data.textColor);
    }

    if (volumeText !== data.volumeText) {
      this.updateVolumeText(key, data.volumeText);
    }
  }
}
