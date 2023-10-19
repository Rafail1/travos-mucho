import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  Observable,
  Subject,
  combineLatest,
  map,
  switchMap,
  takeUntil,
  tap
} from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { IDepth } from 'src/app/modules/backend/backend.service';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectDepth,
  selectSnapshot,
  selectTime,
} from 'src/app/store/app.selectors';
import { GlassService } from './glass.service';

@Component({
  selector: 'app-glass',
  template: '',
  styleUrls: ['./glass.component.scss'],
})
export class GlassComponent implements OnInit, OnDestroy { // will be service
  private time$: Observable<Date>;
  private destroy$ = new Subject<void>();
  private depth$: Observable<IDepth[]>;
  data$: Observable<[Record<string, string>, Record<string, string>]>;
  snapshot$: Observable<{
    asks: Record<string, [string, string]>;
    bids: Record<string, [string, string]>;
  }>;
  constructor(
    private glassService: GlassService,
    private store: Store<RootState>
  ) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
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
            tap((time) => {
              for (; index < depth.length; index++) {
                if (new Date(depth[index].E).getTime() <= time.getTime()) {
                  this.updateSnapshot(depth[index], asks, bids);
                } else {
                  break;
                }
              }

              requestAnimationFrame(() => {
                this.glassService.render(asks, bids);
              });
            })
          );
        })
      )
      .subscribe();
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
