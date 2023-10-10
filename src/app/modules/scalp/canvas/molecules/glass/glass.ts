import { Injectable } from '@angular/core';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { BarService } from '../../atoms/bar/bar.service';
interface BarData {
  type: 'ask' | 'bid';
  value: string;
  price: string;
  spread?: boolean;
  y: number;
  x: number;
  width: number;
  barHeight: number;
}
@Injectable({ providedIn: 'root' })
export class GlassService {
  private config: any;
  constructor(private bar: BarService, private configService: ConfigService) {
    const { glass } = this.configService.getConfig('default');
    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
    this.config = { glass, barHeight };
  }

  public render(asks: Record<string, string>, bids: Record<string, string>) {
    const { glass, barHeight } = this.config;
    let idx = 0;
    for (const [price, value] of Object.entries(asks)) {
      idx++;
      const y = glass.y + idx * barHeight;
      this.renderBar({
        type: 'ask',
        value,
        price,
        spread: false,
        y,
        x: glass.x,
        width: glass.width,
        barHeight,
      });
    }

    for (const [price, value] of Object.entries(bids)) {
      idx++;
      const y = glass.y + idx * barHeight;
      this.renderBar({
        type: 'ask',
        value,
        price,
        spread: false,
        y,
        x: glass.x,
        width: glass.width,
        barHeight,
      });
    }
  }

  public squiz() {}
  private renderBar({
    type,
    value,
    price,
    spread,
    y,
    x,
    width,
    barHeight,
  }: BarData) {
    this.bar.render(
      {
        values: [
          {
            type,
            value: Number(value),
          },
        ],
        price: Number(price),
        spread,
      },
      {
        y,
        x,
        width,
        height: barHeight,
      }
    );
  }
}
