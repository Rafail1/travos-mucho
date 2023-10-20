import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { shortNumber } from 'src/app/common/utils/short-number.util';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { CanvasRendererService } from '../../../renderer/canvas/canvas-renderer.service';
import { IBarData, IBarPosition } from './bar.interface';
const formatter = new Intl.NumberFormat();
@Injectable({ providedIn: 'root' })
export class BarService {
  private thresholdSubject = new Subject();
  constructor(private configService: ConfigService) {}

  public calculateOptions({
    value,
    type,
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
    } = this.configService.getConfig(STYLE_THEME_KEY);

    const {
      fillRectWidth,
      shortValue,
      backgroundColor,
      shortPrice,
      textColor,
      abbrev,
    } = this.calculate({ price, value, type });

    let fillColor;
    if (spread) {
      fillColor = type === 'ask' ? fillAskSpreadColor : fillBidSpreadColor;
    } else {
      fillColor = type === 'ask' ? fillAskColor : fillBidColor;
    }
    const volumeText = `${formatter.format(shortValue)}${abbrev}`;

    const priceText = `${formatter.format(shortPrice.value)}${
      shortPrice.abbrev
    }`;

    const textY = y + height / 2 + 1;

    return {
      fillRectWidth,
      backgroundColor: backgroundColor[type],
      textColor,
      fillColor,
      volumeText,
      priceText,
      textY,
    };
  }

  private calculate({ value, type, price }: Omit<IBarData, 'y'>) {
    const {
      glass: { width },
      bars: { volumeFormat, priceFormat },
      thresholds,
    } = this.configService.getConfig('default');
    const { fillAskColor, fillBidColor, textColor, backgroundColor } =
      this.configService.getConfig(STYLE_THEME_KEY);

    const fillRectWidth = Math.min(width * (value / volumeFormat.max), width);

    const currentThreshold = this.calculateThreshold(
      thresholds,
      price,
      value
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
    const { value: shortValue, abbrev } = volumeFormat.shorten
      ? shortNumber(value, volumeFormat.decPlaces)
      : { value, abbrev: '' };

    return {
      fillRectWidth,
      ...currentThreshold,
      shortValue,
      abbrev,
      type,
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
