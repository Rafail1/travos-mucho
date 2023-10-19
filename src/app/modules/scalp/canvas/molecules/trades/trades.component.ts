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
let ctx: CanvasRenderingContext2D;
export const TRADES_CANVAS_CTX = new InjectionToken<
  () => CanvasRenderingContext2D
>('TRADES_CANVAS_CTX', {
  providedIn: 'root',
  factory: () => () => ctx,
});
@Component({
  selector: 'app-trades',
  template: '',
  styleUrls: ['./trades.component.scss'],
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
    private elRef: ElementRef,
    private tradesService: TradesService,
    private store: Store<RootState>,
    private configService: ConfigService,
    private renderer: Renderer2,
    @Inject(CANVAS_CTX) private glassCtx: () => CanvasRenderingContext2D
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
    const canvas = this.renderer.createElement('canvas');
    canvas.setAttribute('width', this.width);
    canvas.setAttribute('height', this.glassCtx().canvas.height);
    this.elRef.nativeElement.appendChild(canvas);
    ctx = canvas.getContext('2d');

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
              this.renderTicks(data.slice(0, index));
            })
          );
        })
      )
      .subscribe();
  }

  renderTicks(data: IAggTrade[]) {
    requestAnimationFrame(() => {
      ctx.clearRect(this.x, this.y, this.width, this.glassCtx().canvas.height);
      this.tradesService.render(data);
    });
  }
}
