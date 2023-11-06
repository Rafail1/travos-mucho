import { Injectable, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, map, switchMap, takeUntil } from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { RootState } from 'src/app/store/app.reducer';
import { selectAggTrades, selectTime } from 'src/app/store/app.selectors';

@Injectable()
export class TradesService implements OnDestroy {
  public data$ = new Subject<IAggTrade>();

  private time$: Observable<Date>;
  private destroy$ = new Subject<void>();
  private aggTrades$: Observable<IAggTrade[]>;

  constructor(private store: Store<RootState>) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public init(): void {
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

    this.initDataFlow();
  }

  initDataFlow() {
    let index = 0;
    let latestIdx = 0;

    this.aggTrades$
      .pipe(
        switchMap((data) => {
          index = 0;
          return this.time$.pipe(
            map((time: Date) => {
              for (; index < data.length; index++) {
                if (new Date(data[index].E).getTime() > time.getTime()) {
                  break;
                }
              }
              return { data, index };
            })
          );
        })
      )
      .subscribe(({ data, index }) => {
        const _data = data.slice(latestIdx, index);
        latestIdx = index;
        for (let item of _data) {
          this.data$.next(item);
        }
      });
  }
}
