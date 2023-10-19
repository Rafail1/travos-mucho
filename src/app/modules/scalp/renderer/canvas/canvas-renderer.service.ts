import { Inject, Injectable } from '@angular/core';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { GLASS_CANVAS_CTX } from '../../canvas/molecules/glass/glass.component';
import { TRADES_CANVAS_CTX } from './canvas-renderer.component';

@Injectable({ providedIn: 'root' })
export class CanvasRendererService {
  renderTicks(ticks: IAggTrade[], barYs: Record<string, number>) {
    for (let i = 0; i < ticks.length; i++) {
      const start = i * 14;
      this.renderTick({ start, y: barYs[ticks[i].p] });
    }
  }
  constructor(
    @Inject(GLASS_CANVAS_CTX) private glassCtx: () => CanvasRenderingContext2D,
    @Inject(TRADES_CANVAS_CTX) private tradesCtx: () => CanvasRenderingContext2D
  ) {}

  renderTick({ start, y }: any) {
    const ctx = this.tradesCtx();
    ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'red';
    ctx.rect(start, y, 10, 10);
    ctx.fill();
    ctx.stroke();
  }

  renderBar({
    height,
    x,
    y,
    width,
    fillRectWidth,
    textColor,
    fillColor,
    volumeText,
    priceText,
    textY,
    backgroundColor,
  }: any): void {
    const ctx = this.glassCtx();
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
}
