import { Inject, Injectable } from '@angular/core';
import { ConfigService } from 'src/app/config/config';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { TRADES_CANVAS_CTX } from '../../molecules/trades/trades.component';
import { Store, select } from '@ngrx/store';
import { RootState } from 'src/app/store/app.reducer';
import { selectBarYs } from 'src/app/store/app.selectors';
import { map, take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TickService {
  constructor(
    @Inject(TRADES_CANVAS_CTX) private ctx: () => CanvasRenderingContext2D,
    private configService: ConfigService,
    private store: Store<RootState>
  ) {}

  public render(tick: IAggTrade, index: number) {
    const ctx = this.ctx();
    this.store
      .pipe(
        select(selectBarYs),
        map((data) => data[tick.p]),
        take(1)
      )
      .subscribe((y) => {
        const start = index * 14;
        ctx.fillStyle = 'blue';
        ctx.strokeStyle = 'red';
        ctx.rect(start, y, 10, 10);
        ctx.fill();
        ctx.stroke();
        console.log(tick);
      });
  }
}
