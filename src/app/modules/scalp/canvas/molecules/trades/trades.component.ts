import {
  Component,
  ElementRef,
  Inject,
  InjectionToken,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  Observable,
  Subject,
  combineLatest,
  distinctUntilChanged,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { IAggTrade, IDepth } from 'src/app/modules/backend/backend.service';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectAggTrades,
  selectDepth,
  selectSnapshot,
  selectTime,
} from 'src/app/store/app.selectors';
import { TradesService } from './trades.service';
import { CANVAS_CTX } from '../glass/glass.component';

@Component({
  selector: 'app-trades',
  template: '',
})
export class TradesComponent implements OnInit, OnDestroy {
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private time$: Observable<Date>;
  private destroy$ = new Subject<void>();
  private aggTrades$: Observable<IAggTrade[]>;
  data$: Observable<[Record<string, string>, Record<string, string>]>;
  snapshot$: Observable<{
    asks: Record<string, [string, string]>;
    bids: Record<string, [string, string]>;
  }>;
  constructor(
    private tradesService: TradesService,
    @Inject(CANVAS_CTX) private ctx: () => CanvasRenderingContext2D,
    private store: Store<RootState>,
    private configService: ConfigService
  ) {
    const {
      tick: { width, x, y },
    } = this.configService.getConfig('default');
    this.width = width;
    this.x = x;
    this.y = y;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.aggTrades$ = this.store.pipe(
      select(selectAggTrades),
      filterNullish(),
      takeUntil(this.destroy$)
    );

    this.time$ = this.store.pipe(
      select(selectTime),
      filterNullish(),
      takeUntil(this.destroy$)
    );

    this.draw();
  }

  draw() {
    this.aggTrades$
      .pipe(
        switchMap((data) => {
          let index = 0;
          return this.time$.pipe(
            tap((time) => {
              for (; index < data.length; index++) {
                if (new Date(data[index].E).getTime() > time.getTime()) {
                  break;
                }
              }
              this.renderTicks(data.slice(0, 10));
            })
          );
        })
      )
      .subscribe();
  }

  renderTicks(data: IAggTrade[]) {
    requestAnimationFrame(() => {
      this.ctx().clearRect(this.x, this.y, this.width, this.height);
      this.tradesService.render(data);
    });
  }
}
