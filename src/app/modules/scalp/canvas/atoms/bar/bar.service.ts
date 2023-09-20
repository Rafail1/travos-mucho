import { Inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CANVAS_CTX } from 'src/app/app.component';
import { shortNumber } from 'src/app/common/utils/short-number.util';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { IBarData, IBarPosition } from './bar.interface';

@Injectable({ providedIn: 'root' })
export class BarService {
  private thresholdSubject = new Subject();
  constructor(
    @Inject(CANVAS_CTX) private ctx: () => CanvasRenderingContext2D,
    private configService: ConfigService
  ) {}

  public render(
    { values, price, spread }: IBarData,
    { x, y, width, height }: IBarPosition
  ) {
    if (!values.length) {
      return;
    }

    const ctx = this.ctx();
    const {
      fillRectWidth,
      backgroundColor,
      textColor,
      fillColor,
      volumeText,
      priceText,
      textY,
    } = this.calculateOptions({ values, price, spread, y, height });

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(x, y, width, height);

    ctx.fillStyle = fillColor;
    ctx.fillRect(x, y, fillRectWidth, height);

    ctx.font = `${height - 2}px Arial`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;

    ctx.fillText(volumeText, x + 4, textY);

    const { width: textWidth } = ctx.measureText(priceText);

    ctx.fillText(priceText, width - textWidth - 4, textY);
  }

  private calculateOptions({
    values,
    price,
    spread,
    y,
    height,
  }: IBarData & Pick<IBarPosition, 'y' | 'height'>) {
    const {
      fillAskSpreadColor,
      fillBidSpreadColor,
      fillAskColor,
      fillBidColor,
      fillCombinedColor,
    } = this.configService.getConfig(STYLE_THEME_KEY);

    const {
      fillRectWidth,
      shortValues,
      backgroundColor,
      shortPrice,
      textColor,
    } = this.calculate({ price, values });

    let fillColor;
    if (values.length === 1) {
      const type = values[0]?.type;
      if (spread) {
        fillColor = type == 'ask' ? fillAskSpreadColor : fillBidSpreadColor;
      } else {
        fillColor = type == 'ask' ? fillAskColor : fillBidColor;
      }
    } else {
      fillColor = fillCombinedColor;
    }

    const valuesByType = shortValues
      .sort((a: any, b: any) => a.type.localeCompare(b.type))
      .reduce((acc: any, item: any) => {
        acc[item.type] = `${new Intl.NumberFormat().format(item.value)}${
          item.abbrev
        }`;
        return acc;
      }, {} as Record<string, string>);
    const volumeText = Object.values(valuesByType).join(' / ');

    const priceText = `${new Intl.NumberFormat().format(shortPrice.value)}${
      shortPrice.abbrev
    }`;

    const textY = y + height / 2 + 1;

    return {
      fillRectWidth,
      backgroundColor,
      textColor,
      fillColor,
      volumeText,
      priceText,
      textY,
    };
  }

  private calculate({ values, price }: Omit<IBarData, 'y'>) {
    const {
      glass: { width },
      bars: { volumeFormat, priceFormat },
      thresholds,
    } = this.configService.getConfig('foo');
    const { fillAskColor, fillBidColor, textColor, backgroundColor } =
      this.configService.getConfig(STYLE_THEME_KEY);

    const sum = values.reduce((acc, item) => acc + item.value, 0);
    const fillRectWidth = Math.min(width * (sum / volumeFormat.max), width);

    const currentThreshold = this.calculateThreshold(
      thresholds,
      price,
      sum
    ) || {
      fillAskColor,
      fillBidColor,
      textColor,
      backgroundColor,
    };

    let shortPrice;
    if (priceFormat.shorten) {
      shortPrice = shortNumber(price, priceFormat.decPlaces);
    } else {
      shortPrice = { value: price, abbrev: '' };
    }

    return {
      fillRectWidth,
      ...currentThreshold,
      shortValues: values.map(({ type, value }) => {
        if (volumeFormat.shorten) {
          return {
            ...shortNumber(value, volumeFormat.decPlaces),
            type,
          };
        } else {
          return { value, abbrev: '', type };
        }
      }),
      shortPrice,
    };
  }

  private calculateThreshold(
    thresholds: Record<string, number> = {},
    price: number,
    value: number = 0
  ) {
    let currentThresholdTheme;
    if (thresholds['huge'] <= value) {
      currentThresholdTheme = 'huge';
    } else if (thresholds['big'] <= value) {
      currentThresholdTheme = 'big';
    }

    if (currentThresholdTheme) {
      this.thresholdSubject.next({
        theme: currentThresholdTheme,
        value,
        price,
      });
    }

    return currentThresholdTheme
      ? this.configService.getConfig(STYLE_THEME_KEY).thresholds[
          currentThresholdTheme
        ]
      : null;
  }
}
