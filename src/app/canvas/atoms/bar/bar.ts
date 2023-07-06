import {
  DEFAULT_BAR_BG_COLOR,
  DEFAULT_BAR_FILL_COLOR,
  DEFAULT_BAR_TEXT_COLOR,
} from 'src/app/config/constants';
import { shortNumber } from '../../../common/utils/short-number.util';
import { IBarData, IThreshold } from './bar.interface';
import { Injectable } from '@angular/core';

@Injectable()
export class Bar {
  
  constructor(private ctx: CanvasRenderingContext2D) {}
  public render(options: IBarData) {
    const ctx = this.ctx;
    if (options.value) {
      const {
        fillRectWidth,
        value,
        abbrev,
        backgroundColor,
        shortPrice,
        fillColor = DEFAULT_BAR_FILL_COLOR,
        textColor = DEFAULT_BAR_TEXT_COLOR,
      } = this.calculate(options);

      ctx.fillStyle = backgroundColor || DEFAULT_BAR_BG_COLOR;
      ctx.fillRect(0, options.y, options.width, options.height);

      ctx.fillStyle = fillColor;
      ctx.fillRect(0, options.y, fillRectWidth, options.height);

      ctx.font = `${options.height - 2}px Georgia`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;

      ctx.fillText(
        `${value}${abbrev}`,
        4,
        options.y + options.height / 2
      );

      const { width } = ctx.measureText(
        `${shortPrice.value}${shortPrice.abbrev}`
      );

      ctx.fillText(
        `${shortPrice.value}${shortPrice.abbrev}`,
        options.width - width - 4,
        options.y + options.height / 2
      );
    }
  }

  private calculate({
    value,
    price,
  }: IBarData) {
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
      ...shortNumber(value),
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
