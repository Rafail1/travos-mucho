import { Inject, Injectable } from '@angular/core';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { Store } from '@ngrx/store';
import { RootState } from 'src/app/store/app.reducer';
import { putBarY } from 'src/app/store/app.actions';
import { BarService } from '../../calculation/bar/bar.service';

@Injectable()
export class D4RendererService {
  idx: number;
  constructor(
    private barService: BarService,
    private store: Store<RootState>
  ) {}

  renderTicks(ticks: IAggTrade[], barYs: Record<string, number>) {
    const ctx = this.tradesCtx();
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (let i = 0; i < ticks.length; i++) {
      const start = i * 14;
      this.renderTick({ x: start, y: barYs[ticks[i].p] });
    }
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
  }

  private renderTick({ x, y }: any) {}

  private renderBar({
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
      this.store.dispatch(putBarY({ price, y }));

      if (!Number(value)) {
        this.renderEmptyBar({
          type,
          price,
          textY,
          spread: false,
          y,
          x: glassX,
          width: glassWidth,
          height: barHeight,
          textColor,
          priceText,
        });
        continue;
      }

      this.renderBar({
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

  private renderEmptyBar({
    textColor,
    priceText,
    textY,
    y,
    x,
    width,
    height,
  }: any) {
  }
}
