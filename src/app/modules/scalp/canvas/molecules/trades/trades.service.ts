import { Component, Injectable, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import {
  Observable,
  Subject,
  map,
  mapTo,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectAggTrades,
  selectBarYs,
  selectTime,
} from 'src/app/store/app.selectors';
import { CanvasRendererService } from '../../../renderer/canvas/canvas-renderer.service';

@Injectable()
export class TradesService implements OnDestroy {
  private time$: Observable<Date>;
  private destroy$ = new Subject<void>();
  private aggTrades$: Observable<IAggTrade[]>;
  data$: Observable<[Record<string, string>, Record<string, string>]>;
  snapshot$: Observable<{
    asks: Record<string, [string, string]>;
    bids: Record<string, [string, string]>;
  }>;

  constructor(
    private store: Store<RootState>,
    private canvasRenderer: CanvasRendererService
  ) {
  }

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

    this.draw();
  }

  draw() {
    this.aggTrades$
      .pipe(
        switchMap((data) => {
          let index = 0;
          return this.time$.pipe(
            map((time: Date) => {
              for (; index < data.length; index++) {
                if (new Date(data[index].E).getTime() > time.getTime()) {
                  break;
                }
              }
              return { data, index };
            }),
            withLatestFrom(this.store.pipe(select(selectBarYs)))
          );
        })
      )
      .subscribe(([{ data, index }, barYs]) => {
        this.canvasRenderer.renderTicks(data.slice(0, index), barYs);
      });
  }
}
