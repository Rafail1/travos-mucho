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
    element.select('rect').attr('textColor', textColor);
    data.textColor = textColor;
  }
  updatePriceText(key: string, priceText: string) {
    if (!this.rects.has(key)) {
      throw new Error('rect not found');
    }
    const { element, data } = this.rects.get(key)!;
    data.priceText = priceText;
    element.select('rect').attr('priceText', priceText);
  }
  updateFillRectWidth(key: string, fillRectWidth: string) {
    if (!this.rects.has(key)) {
      throw new Error('rect not found');
    }
    const { element, data } = this.rects.get(key)!;
    data.fillRectWidth = fillRectWidth;

    element.select('rect').attr('fillRectWidth', fillRectWidth);
  }
  updateBackgroundColor(key: string, backgroundColor: string) {
    if (!this.rects.has(key)) {
      throw new Error('rect not found');
    }
    const { element, data } = this.rects.get(key)!;
    data.backgroundColor = backgroundColor;

    element.select('rect').style('fill-color', backgroundColor);
  }
  updateVolumeText(key: string, volumeText: string) {
    if (!this.rects.has(key)) {
      throw new Error('rect not found');
    }
    const { element, data } = this.rects.get(key)!;
    data.volumeText = volumeText;

    element.select('rect').attr('volume', volumeText);
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
    const rect = element.append('rect');
    this.rects.set(key, { element, data });
    this.updateVolumeText(key, data.volumeText);
    this.updateBackgroundColor(key, data.backgroundColor);
    this.updateFillRectWidth(key, data.fillRectWidth);
    this.updatePriceText(key, data.priceText);
    this.updateTextColor(key, data.textColor);
    rect
      .attr('height', this.gridService.getBarHeight())
      .attr('width', '100%')
      .attr('y', y);
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
      this.updateFillRectWidth(key, data.fillRectWidth);
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
