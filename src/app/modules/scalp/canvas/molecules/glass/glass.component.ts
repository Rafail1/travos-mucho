import {
  Component,
  ElementRef,
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
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { IDepth } from 'src/app/modules/backend/backend.service';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectDepth,
  selectSnapshot,
  selectTime,
} from 'src/app/store/app.selectors';
import { GlassService } from './glass.service';

let ctx: CanvasRenderingContext2D;
export const CANVAS_CTX = new InjectionToken<() => CanvasRenderingContext2D>(
  'CANVAS_CTX',
  {
    providedIn: 'root',
    factory: () => () => ctx,
  }
);

@Component({
  selector: 'app-glass',
  template: '',
  styleUrls: ['./glass.component.scss'],
})
export class GlassComponent implements OnInit, OnDestroy {
  private width;
  private height;
  private time$: Observable<Date>;
  private destroy$ = new Subject<void>();
  private depth$: Observable<IDepth[]>;
  data$: Observable<[Record<string, string>, Record<string, string>]>;
  snapshot$: Observable<{
    asks: Record<string, string>;
    bids: Record<string, string>;
  }>;
  constructor(
    private elRef: ElementRef,
    private glassService: GlassService,
    private renderer: Renderer2,
    private store: Store<RootState>,
    private configService: ConfigService
  ) {
    const { barHeight, width } = this.configService.getConfig(STYLE_THEME_KEY);
    this.height = 800 * barHeight;
    this.width = width;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    const canvas = this.renderer.createElement('canvas');
    canvas.setAttribute('width', this.width);
    canvas.setAttribute('height', this.height);
    this.elRef.nativeElement.appendChild(canvas);
    ctx = canvas.getContext('2d');
    this.depth$ = this.store.pipe(
      select(selectDepth),
      filterNullish(),
      takeUntil(this.destroy$)
    );

    this.snapshot$ = this.store.pipe(
      select(selectSnapshot),
      filterNullish(),
      map((snapshot) => {
        const asks = snapshot.asks.reduce(
          (acc: Record<string, string>, item: Array<string>) => {
            acc[item[0]] = item[1];
            return acc;
          },
          {}
        );
        const bids = snapshot.bids.reduce(
          (acc: Record<string, string>, item: Array<string>) => {
            acc[item[0]] = item[1];
            return acc;
          },
          {}
        );
        return { asks, bids };
      }),
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
    combineLatest([this.depth$, this.snapshot$])
      .pipe(
        switchMap(([depth, { asks, bids }]) => {
          let index = 0;
          return this.time$.pipe(
            tap((time) => {
              for (; index < depth.length; index++) {
                if (new Date(depth[index].E).getTime() < time.getTime()) {
                  this.updateSnapshot(depth[index], asks, bids);
                } else {
                  break;
                }
              }

              requestAnimationFrame(() => {
                ctx.clearRect(0, 0, this.width, this.height);
                this.glassService.render(asks, bids);
              });
            })
          );
        })
      )
      .subscribe();
  }

  updateSnapshot(data: any, asks: any, bids: any) {
    data.a.forEach((item: any) => {
      asks[item[0]] = item[1];
    });

    data.b.forEach((item: any) => {
      bids[item[0]] = item[1];
    });
  }
}
