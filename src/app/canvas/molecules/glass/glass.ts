import { Injectable } from '@angular/core';
import { Bar } from '../../atoms/bar/bar';
import { IOrderBookItem } from './glass.interface';

export const BAR_HEIGHT = 16;
export const BAR_MARGIN = 1;

@Injectable({ providedIn: 'root' })
export class GlassService {
  constructor(private bar: Bar) {}
  public render(data: Array<IOrderBookItem>) {
    data.forEach((barOptions, idx) => {
      const y = idx * BAR_HEIGHT + BAR_MARGIN;

      this.bar.render({
        y,
        value: Number(barOptions.value),
        price: Number(barOptions.price),
      });
    });
  }
}
