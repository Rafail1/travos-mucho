import {
  DEFAULT_BAR_BG_COLOR,
  DEFAULT_BAR_FILL_COLOR,
  DEFAULT_BAR_TEXT_COLOR,
} from 'src/app/config/constants';
import { IBar, IThreshold } from './bar.interface';
import { shortNumber } from '../../../common/utils/short-number.util';

export class Bar {
  public render(ctx: CanvasRenderingContext2D, options: IBar) {
    const {
      fillRectWidth,
      value,
      abbrev,
      backgroundColor,
      fillColor = DEFAULT_BAR_FILL_COLOR,
      textColor = DEFAULT_BAR_TEXT_COLOR,
    } = this.calculate(options);

    ctx.fillStyle = backgroundColor || DEFAULT_BAR_BG_COLOR;
    ctx.fillRect(options.x, options.y, options.width, options.height);

    ctx.fillStyle = fillColor;
    ctx.fillRect(options.x, options.y, fillRectWidth, options.height);

    if (value) {
      ctx.font = `${options.height - 2}px Georgia`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColor;

      ctx.fillText(
        `${value}${abbrev}`,
        options.x + 4,
        options.y + options.height / 2
      );
    }
  }

  private calculate({
    width,
    value,
    max,
    thresholds,
    fillColor,
    textColor,
    backgroundColor,
  }: IBar) {
    const fillRectWidth = Math.min(width * (value / max), width);

    const currentThreshold = this.calculateThreshold(thresholds, value) || {
      fillColor,
      textColor,
      backgroundColor,
    };

    return { fillRectWidth, ...currentThreshold, ...shortNumber(value) };
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

    if (currentThreshold?.cb) {
      currentThreshold.cb.apply(currentThreshold);
    }

    return currentThreshold;
  }
}
