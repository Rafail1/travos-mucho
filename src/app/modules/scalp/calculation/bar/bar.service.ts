import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { shortNumber } from 'src/app/common/utils/short-number.util';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { IBarData, IBarPosition } from './bar.interface';
const formatter = new Intl.NumberFormat(undefined);
@Injectable({ providedIn: 'root' })
export class BarService {
  private thresholdSubject = new Subject();
  constructor(private configService: ConfigService) {}

  public calculateOptions({ value, type, price }: IBarData) {
    const {
      fillRectWidth,
      shortValue,
      backgroundColor,
      shortPrice,
      textColor,
      abbrev,
      fillAskColor,
      fillBidColor,
    } = this.calculate({ price, value });
    const volumeText = `${shortValue}${abbrev}`;

    const priceText = `${shortPrice.value}${shortPrice.abbrev}`;

    return {
      fillRectWidth,
      backgroundColor: backgroundColor[type],
      fillColor: type == 'ask' ? fillAskColor : fillBidColor,
      textColor,
      volumeText,
      priceText,
    };
  }

  private calculate({ value, price }: Omit<IBarData, 'y' | 'type'>) {
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
