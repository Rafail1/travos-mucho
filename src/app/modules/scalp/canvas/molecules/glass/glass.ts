import { Injectable } from '@angular/core';
import { BarService } from '../../atoms/bar/bar.service';
import { IOrderBookItem } from './glass.interface';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';

@Injectable({ providedIn: 'root' })
export class GlassService {
  private useSpread = Math.random() >= 0.5;
  private config: any;
  constructor(private bar: BarService, private configService: ConfigService) {
    const { glass } = this.configService.getConfig('default');
    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
    this.config = { glass, barHeight };
  }

  public render(data: Array<IOrderBookItem>) {
    let type: 'ask' | 'bid' = 'ask';
    const { glass, barHeight } = this.config;
    data.forEach((barOptions, idx) => {
      const y = glass.y + idx * barHeight;

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

      this.bar.render(
        {
          values,
          price: Number(barOptions.price),
          spread,
        },
        {
          y,
          x: glass.x,
          width: glass.width,
          height: barHeight,
        }
      );
    });
  }

  public squiz() {}
}
