import { Injectable, OnDestroy } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  Subject,
  combineLatest,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { BarService } from '../../atoms/bar/bar.service';
import { putBarY } from 'src/app/store/app.actions';
import { Store, select } from '@ngrx/store';
import { RootState } from 'src/app/store/app.reducer';
import { CanvasRendererService } from '../../../renderer/canvas/canvas-renderer.service';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { IDepth } from 'src/app/modules/backend/backend.service';
import {
  selectDepth,
  selectSnapshot,
  selectTime,
} from 'src/app/store/app.selectors';
interface BarData {
  type: 'ask' | 'bid';
  value: string;
  price: string;
  spread?: boolean;
  y: number;
  x: number;
  width: number;
  barHeight: number;
}
@Injectable()
export class GlassService implements OnDestroy {
  private config: any;
  private squiz$ = new BehaviorSubject<number>(1);

  private time$: Observable<Date>;
  private destroy$ = new Subject<void>();
  private depth$: Observable<IDepth[]>;
  data$: Observable<[Record<string, string>, Record<string, string>]>;
  snapshot$: Observable<{
    asks: Record<string, [string, string]>;
    bids: Record<string, [string, string]>;
  }>;

  constructor(
    private configService: ConfigService,
    private canvasRenderer: CanvasRendererService,
    private store: Store<RootState>
  ) {
    const { glass } = this.configService.getConfig('default');
    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
    this.config = { glass, barHeight };
    this.init();
  }

  public render(
    asks: Record<string, [string, string]>,
    bids: Record<string, [string, string]>
  ) {
    const { glass, barHeight } = this.config;
    const sortedAsks = Object.values(asks).sort((a, b) => {
      if (Number(a[0]) === Number(b[0])) {
        return 0;
      }
      return Number(a[0]) < Number(b[0]) ? 1 : -1;
    });
    const sortedBids = Object.values(bids).sort((a, b) => {
      if (a[0] === b[0]) {
        return 0;
      }
      return a[0] < b[0] ? 1 : -1;
    });

    if (this.squiz$.value > 1) {
      this.squiz(sortedAsks);
      this.squiz(sortedBids);
    }

    this.canvasRenderer.renderBars({
      asks: sortedAsks,
      bids: sortedBids,
      barHeight,
      glassWidth: glass.width,
      glassX: glass.x,
      glassY: glass.y,
    });
  }

  public squiz(data: Array<Array<string>>) {
    if (this.squiz$.value <= 1) {
      return;
    }

    for (let i = 0; i < data.length; i++) {
      if (!data[i]) {
        console.log(i);
      }
      const trown = data.splice(i, this.squiz$.value);
      if (!trown.length) {
        break;
      }
      if (!data[i]) {
        data[i] = trown[0];
      }
      for (let j = 0; j < trown.length; j++) {
        const sum = Number(data[i][1]) + Number(trown[j][1]);
        data[i] = [data[i][0], sum.toString()];
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  init(): void {
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
          (acc: Record<string, [string, string]>, item: [string, string]) => {
            acc[item[0]] = item;
            return acc;
          },
          {}
        );
        const bids = snapshot.bids.reduce(
          (acc: Record<string, [string, string]>, item: [string, string]) => {
            acc[item[0]] = item;
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
            map((time) => {
              return { time, index, depth, asks, bids };
            })
          );
        })
      )
      .subscribe(({ time, index, depth, asks, bids }) => {
        for (; index < depth.length; index++) {
          if (new Date(depth[index].E).getTime() <= time.getTime()) {
            this.updateSnapshot(depth[index], asks, bids);
          } else {
            break;
          }
        }

        requestAnimationFrame(() => {
          this.render(asks, bids);
        });
      });
  }

  updateSnapshot(
    data: any,
    asks: Record<string, [string, string]>,
    bids: Record<string, [string, string]>
  ) {
    data.a.forEach((item: [string, string]) => {
      if (asks[item[0]]) {
        asks[item[0]] = item;
      }
    });

    data.b.forEach((item: [string, string]) => {
      if (bids[item[0]]) {
        bids[item[0]] = item;
      }
    });
  }
}
