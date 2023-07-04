import { Bar } from '../../atoms/bar/bar';
import { IBar } from '../../atoms/bar/bar.interface';
import { IOrderBookItem } from './glass.interface';

export const BAR_HEIGHT = 16;
export const BAR_MARGIN = 1;

export class Glass {
  public render(ctx: CanvasRenderingContext2D, data: Array<IOrderBookItem>) {
    data.forEach((barOptions, idx) => {
      const bar = new Bar();
      const y = idx * BAR_HEIGHT + BAR_MARGIN;

      bar.render(ctx, {
        x: 0,
        y,
        width: 500,
        height: 16,
        max: 1_000_000,
        value: Number(barOptions.value),
        price: Number(barOptions.price),
        thresholds: [
          {
            value: 200_000,
            fillColor: '#ff0000',
            textColor: '#ffffff',
            backgroundColor: '#00FF00',
          },
          {
            value: 400_000,
            fillColor: '#00ff00',
            textColor: '#0000ff',
            backgroundColor: '#00dd00',
          },
          {
            value: 800_000,
            fillColor: '#0000ff',
            textColor: '#00ffff',
            backgroundColor: '#0000dd',
          },
        ],
      });
    });
  }
}
