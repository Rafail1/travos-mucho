import { Injectable, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, map, switchMap, takeUntil } from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import {
  IBar,
  IDepth,
  ISnapshot,
  ISnapshotFormatted,
} from 'src/app/modules/backend/backend.service';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectDepth,
  selectSnapshot,
  selectTime,
} from 'src/app/store/app.selectors';
import { BarService } from '../bar/bar.service';
import { GridService } from '../../renderer/d4/grid/grid.service';
import { IBarType } from '../bar/bar.interface';

@Injectable()
export class GlassService implements OnDestroy {
  public data$ = new Subject<{ [key: number]: IBar }>();
  private time$: Observable<Date>;
  private destroy$ = new Subject<void>();
  private depth$: Observable<IBar[]>;
  private snapshot$: Observable<ISnapshotFormatted>;

  constructor(
    private store: Store<RootState>,
    private barService: BarService,
    private gridService: GridService
  ) {}

  init() {
    this.depth$ = this.store.pipe(
      select(selectDepth),
      filterNullish(),
      takeUntil(this.destroy$)
    );

    this.snapshot$ = this.store.pipe(
      select(selectSnapshot),
      filterNullish(),
      takeUntil(this.destroy$)
    );

    this.time$ = this.store.pipe(
      select(selectTime),
      filterNullish(),
      takeUntil(this.destroy$)
    );
    this.initSnapshotFlow();
    this.initDataFlow();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initSnapshotFlow() {
    this.snapshot$.subscribe((depth) => {
      this.gridService.update(depth);
      this.data$.next(depth.data);
    });
  }

  initDataFlow() {
    this.depth$
      .pipe(
        switchMap((depth) => {
          let index = 0;
          return this.time$.pipe(
            map((time) => {
              return { time, index, depth };
            })
          );
        })
      )
      .subscribe(({ time, index, depth }) => {
        const data = [];
        for (; index < depth.length; index++) {
          if (new Date(depth[index].E).getTime() <= time.getTime()) {
            data.push(depth[index]);
          } else {
            break;
          }
        }
        this.data$.next(
          data.reduce((acc, item) => {
            acc[Number(item.depth[0])] = item;
            return acc;
          }, {} as any)
        );
      });
  }
}
