import {
  DEFAULT_BAR_BG_COLOR,
  DEFAULT_BAR_FILL_COLOR,
  DEFAULT_BAR_TEXT_COLOR,
} from 'src/app/config/constants';
import { shortNumber } from '../../../common/utils/short-number.util';
import { IBarData, IThreshold } from './bar.interface';
import { Injectable, Inject } from '@angular/core';
import { CANVAS_CTX } from 'src/app/app.component';
import { ConfigService } from 'src/app/config/config';

@Injectable({ providedIn: 'root' })
export class Bar {
  constructor(
    @Inject(CANVAS_CTX) private ctx: () => CanvasRenderingContext2D,
    private configService: ConfigService
  ) {}

  public render({ value, y, price }: IBarData) {
    const ctx = this.ctx();
    const options = this.configService.getConfig('foo');
    if (value) {
      const {
        fillRectWidth,
        shortValue,
        backgroundColor,
        shortPrice,
        fillColor = DEFAULT_BAR_FILL_COLOR,
        textColor = DEFAULT_BAR_TEXT_COLOR,
      } = this.calculate({ price, value });

      ctx.fillStyle = backgroundColor || DEFAULT_BAR_BG_COLOR;
      ctx.fillRect(0, y, options.width, options.height);

      ctx.fillStyle = fillColor;
      ctx.fillRect(0, y, fillRectWidth, options.height);

      ctx.font = `${options.height - 2}px Georgia`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = textColor;

      ctx.fillText(
        `${shortValue.value}${shortValue.abbrev}`,
        4,
        y
      );

      const { width } = ctx.measureText(
        `${shortPrice.value}${shortPrice.abbrev}`
      );

      ctx.fillText(
        `${shortPrice.value}${shortPrice.abbrev}`,
        options.width - width - 4,
        y
      );
    }
  }

  private calculate({ value, price }: Omit<IBarData, 'y'>) {
    const { width, max, thresholds, fillColor, textColor, backgroundColor } =
      this.configService.getConfig('foo');

    const fillRectWidth = Math.min(width * (value / max), width);

    const currentThreshold = this.calculateThreshold(thresholds, value) || {
      fillColor,
      textColor,
      backgroundColor,
    };

    const shortPrice = shortNumber(price);

    return {
      fillRectWidth,
      ...currentThreshold,
      shortValue: shortNumber(value),
      shortPrice,
    };
  }

  private calculateThreshold(thresholds: IThreshold[] = [], value: number = 0) {
    thresholds.sort((thresholdA, thresholdB) =>
      thresholdA.value < thresholdB.value ? -1 : 1
    );

    let currentThreshold;

    for (const threshold of thresholds) {
      if (threshold.value > value) {
        break;
      }

      currentThreshold = threshold;
    }
    // emit event (founded threshold)

    return currentThreshold;
  }
}
