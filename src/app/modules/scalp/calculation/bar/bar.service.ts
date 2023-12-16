import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { shortNumber } from 'src/app/common/utils/short-number.util';
import { IBarData, IBarPosition } from './bar.interface';
import { SettingsService } from '../../settings/settings.service';
const formatter = new Intl.NumberFormat(undefined);
@Injectable({ providedIn: 'root' })
export class BarService {
  constructor(private settingsService: SettingsService) {}

  public calculateOptions({ value, type, price }: IBarData) {
    const {
      fillRectWidth,
      volumeText,
      backgroundColor,
      priceText,
      textColor,
      fillAskColor,
      fillBidColor,
    } = this.calculate({ price, value });

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
      maxBarVolume,
      bars: { volumeFormat, priceFormat },
      bigVolume,
      hugeVolume,
    } = this.settingsService.getSettings();
    const {
      glass: { width },
      fillAskColor,
      fillBidColor,
      textColor,
      backgroundColor,
    } = this.settingsService.getStyle();

    const fillRectWidth = Math.min(width * (value / maxBarVolume), width);

    const currentThreshold = this.calculateThreshold(
      bigVolume,
      hugeVolume,
      price,
      value
    ) || {
      fillAskColor,
      fillBidColor,
      textColor,
      backgroundColor,
    };

    let priceText;
    if (priceFormat.shorten) {
      priceText = shortNumber(price, priceFormat.decPlaces);
    } else {
      priceText = price;
    }

    const volumeText = volumeFormat.shorten
      ? shortNumber(value, volumeFormat.decPlaces)
      : value;

    return {
      fillRectWidth,
      ...currentThreshold,
      volumeText,
      priceText,
    };
  }

  private calculateThreshold(
    bigVolume: number,
    hugeVolume: number,
    price: number,
    value: number = 0
  ) {
    let currentThresholdTheme;
    if (hugeVolume <= value) {
      currentThresholdTheme = 'huge';
    } else if (bigVolume <= value) {
      currentThresholdTheme = 'big';
    }

    // if (currentThresholdTheme) {
    //   this.thresholdSubject.next({
    //     theme: currentThresholdTheme,
    //     value,
    //     price,
    //   });
    // }

    return currentThresholdTheme
      ? this.settingsService.getStyle().thresholds[currentThresholdTheme]
      : null;
  }
}
