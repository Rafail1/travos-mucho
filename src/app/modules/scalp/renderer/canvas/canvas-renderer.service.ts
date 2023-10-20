import { Inject, Injectable } from '@angular/core';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import {
  GLASS_CANVAS_CTX,
  TRADES_CANVAS_CTX,
} from './canvas-renderer.component';
import { BarService } from '../../canvas/atoms/bar/bar.service';

@Injectable()
export class CanvasRendererService {
  idx: number;
  constructor(
    @Inject(GLASS_CANVAS_CTX) private glassCtx: () => CanvasRenderingContext2D,
    @Inject(TRADES_CANVAS_CTX)
    private tradesCtx: () => CanvasRenderingContext2D,
    private barService: BarService
  ) {}

  renderTicks(ticks: IAggTrade[], barYs: Record<string, number>) {
    const ctx = this.tradesCtx();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < ticks.length; i++) {
      const start = i * 14;
      this.renderTick({ start, y: barYs[ticks[i].p] });
    }
  }

  renderTick({ start, y }: any) {
    const ctx = this.tradesCtx();
    ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'red';
    ctx.rect(start, y, 10, 10);
    ctx.fill();
    ctx.stroke();
  }

  renderBars({
    asks,
    bids,
    barHeight,
    glassY,
    glassX,
    glassWidth,
  }: {
    asks: [string, string][];
    bids: [string, string][];
    barHeight: number;
    glassY: number;
    glassX: number;
    glassWidth: number;
  }) {
    this.idx = 0;
    const ctx = this.glassCtx();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    this.renderGlass({
      items: asks,
      barHeight,
      glassY,
      glassX,
      glassWidth,
      type: 'ask',
    });

    this.renderGlass({
      items: bids,
      barHeight,
      glassY,
      glassX,
      glassWidth,
      type: 'bid',
    });
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

  private renderGlass({
    items,
    glassY,
    barHeight,
    glassX,
    glassWidth,
    type,
  }: any) {
    for (const [price, value] of items) {
      if (!Number(value)) {
        continue;
      }

      this.idx++;
      const y = glassY + this.idx * barHeight;
      const {
        backgroundColor,
        fillColor,
        fillRectWidth,
        priceText,
        textColor,
        textY,
        volumeText,
      } = this.barService.calculateOptions({
        type,
        price: Number(price),
        value: Number(value),
        spread: false,
        y,
        height: barHeight,
      });

      this.renderBar({
        type: 'ask',
        value,
        price,
        spread: false,
        y,
        x: glassX,
        width: glassWidth,
        height: barHeight,
        backgroundColor,
        fillColor,
        fillRectWidth,
        priceText,
        textColor,
        textY,
        volumeText,
      });
    }
  }
}
