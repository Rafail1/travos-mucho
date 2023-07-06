import { Injectable } from '@angular/core';
import { Bar } from '../../atoms/bar/bar';
import { IOrderBookItem } from './glass.interface';

export const BAR_HEIGHT = 16;
export const BAR_MARGIN = 1;

@Injectable()
export class Glass {
  constructor(private ctx: CanvasRenderingContext2D) {}
  public render(data: Array<IOrderBookItem>) {
    data.forEach((barOptions, idx) => {
      const bar = new Bar(this.ctx);
      const y = idx * BAR_HEIGHT + BAR_MARGIN;

      bar.render({
        y,
        value: Number(barOptions.value),
        price: Number(barOptions.price),
      });
    });
  }
}
