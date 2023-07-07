import { Injectable } from '@angular/core';
import { Bar } from '../../atoms/bar/bar';
import { IOrderBookItem } from './glass.interface';
import { ConfigService } from 'src/app/config/config';

@Injectable({ providedIn: 'root' })
export class GlassService {
  private useSpread = Math.random() >= 0.5;

  constructor(private bar: Bar, private configService: ConfigService) {}
  public render(data: Array<IOrderBookItem>) {
    let type: 'ask' | 'bid' = 'ask';
    data.forEach((barOptions, idx) => {
      const { height } = this.configService.getConfig('foo');
      const y = idx * height;
      const values = [
        {
          type,
          value: Number(barOptions.value),
        },
      ];

      const spread =
        this.useSpread && [data.length / 2, data.length / 2 + 1].includes(idx);

      if (idx === data.length / 2) {
        type = 'bid';
        if (!this.useSpread) {
          values.push({
            type,
            value: Number(barOptions.value) / 2,
          });
        }
      }

      this.bar.render({
        y,
        values,
        price: Number(barOptions.price),
        spread,
      });
    });
  }
}
