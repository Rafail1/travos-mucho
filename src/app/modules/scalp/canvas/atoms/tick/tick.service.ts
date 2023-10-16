import { Inject, Injectable } from '@angular/core';
import { ConfigService } from 'src/app/config/config';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { TRADES_CANVAS_CTX } from '../../molecules/trades/trades.component';

@Injectable({ providedIn: 'root' })
export class TickService {
  constructor(
    @Inject(TRADES_CANVAS_CTX) private ctx: () => CanvasRenderingContext2D,
    private configService: ConfigService
  ) {}

  public render(tick: IAggTrade, index: number) {
    const ctx = this.ctx();
    const {
      tick: { y },
    } = this.configService.getConfig('default');
    const start = index * 14;
    ctx.fillStyle = 'blue';
    ctx.strokeStyle = 'red';
    var fillRect = false;
    ctx.rect(start, y, 10, 10);
    ctx.fill();
    ctx.stroke();
    console.log(tick);
  }
}
