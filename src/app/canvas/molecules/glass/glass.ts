import { Injectable } from '@angular/core';
import { Bar } from '../../atoms/bar/bar';
import { IOrderBookItem } from './glass.interface';
import { ConfigService } from 'src/app/config/config';

@Injectable({ providedIn: 'root' })
export class GlassService {
  constructor(private bar: Bar, private configService: ConfigService) {}
  public render(data: Array<IOrderBookItem>) {
    data.forEach((barOptions, idx) => {
      const { height } = this.configService.getConfig('foo');
      const y = idx * height;

      this.bar.render({
        y,
        value: Number(barOptions.value),
        price: Number(barOptions.price),
      });
    });
  }
}
