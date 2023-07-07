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

  public render({ values, y, price, spread }: IBarData) {
    const ctx = this.ctx();
    const options = this.configService.getConfig('foo');
    if (values.length) {
      const {
        fillRectWidth,
        shortValues,
        backgroundColor,
        shortPrice,
        textColor = DEFAULT_BAR_TEXT_COLOR,
      } = this.calculate({ price, values });

      ctx.fillStyle = backgroundColor || DEFAULT_BAR_BG_COLOR;
      ctx.fillRect(0, y, options.width, options.height);

      let fillColor;
      if (values.length === 1) {
        const type = values[0]?.type;
        if (spread) {
          fillColor =
            type == 'ask'
              ? options.fillAskSpreadColor
              : options.fillBidSpreadColor;
        } else {
          fillColor =
            type == 'ask' ? options.fillAskColor : options.fillBidColor;
        }
      } else {
        fillColor = options.fillCombinedColor;
      }

      ctx.fillStyle = fillColor;
      ctx.fillRect(0, y, fillRectWidth, options.height);

      ctx.font = `${options.height - 2}px Helvetica`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;

      const valuesByType = shortValues
        .sort((a, b) => a.type.localeCompare(b.type))
        .reduce((acc, item) => {
          acc[item.type] = `${item.value}${item.abbrev}`;
          return acc;
        }, {} as Record<string, string>);
      const textY = y + options.height / 2 + 1;
      ctx.fillText(Object.values(valuesByType).join(' | '), 4, textY);

      const { width: textWidth } = ctx.measureText(
        `${shortPrice.value}${shortPrice.abbrev}`
      );

      ctx.fillText(
        `${shortPrice.value}${shortPrice.abbrev}`,
        options.width - textWidth - 4,
        textY
      );
    }
  }

  private calculate({ values, price }: Omit<IBarData, 'y'>) {
    const {
      width,
      max,
      thresholds,
      fillAskColor,
      fillBidColor,
      textColor,
      backgroundColor,
    } = this.configService.getConfig('foo');
    const sum = values.reduce((acc, item) => acc + item.value, 0);

    const fillRectWidth = Math.min(width * (sum / max), width);

    const currentThreshold = this.calculateThreshold(thresholds, sum) || {
      fillAskColor,
      fillBidColor,
      textColor,
      backgroundColor,
    };

    const shortPrice = shortNumber(price);

    return {
      fillRectWidth,
      ...currentThreshold,
      shortValues: values.map(({ type, value }) => ({
        ...shortNumber(value),
        type,
      })),
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
