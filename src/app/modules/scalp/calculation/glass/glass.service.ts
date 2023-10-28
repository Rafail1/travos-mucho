import { Injectable, OnDestroy } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, map, switchMap, takeUntil } from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { IDepth } from 'src/app/modules/backend/backend.service';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectDepth,
  selectSnapshot,
  selectTime,
} from 'src/app/store/app.selectors';
import { D4RendererService } from '../../renderer/d4/d4-renderer.service';
import { BarService } from '../bar/bar.service';

@Injectable()
export class GlassService implements OnDestroy {
  private time$: Observable<Date>;
  private destroy$ = new Subject<void>();
  private depth$: Observable<IDepth[]>;

  constructor(
    private D4renderer: D4RendererService,
    private store: Store<RootState>,
    private barService: BarService
  ) {}

  init() {
    this.depth$ = this.store.pipe(
      select(selectDepth),
      filterNullish(),
      takeUntil(this.destroy$)
    );

    this.store
      .pipe(select(selectSnapshot), filterNullish(), takeUntil(this.destroy$))
      .subscribe((depth) => {
        for (const item of depth.asks) {
          this.D4renderer.renderBar({
            depth: item,
            ...this.barService.calculateOptions({
              type: 'ask',
              price: Number(item[0]),
              value: Number(item[1]),
            }),
          });
        }
        for (const item of depth.bids) {
          this.D4renderer.renderBar({
            depth: item,
            ...this.barService.calculateOptions({
              type: 'bid',
              price: Number(item[0]),
              value: Number(item[1]),
            }),
          });
        }
      });

    this.time$ = this.store.pipe(
      select(selectTime),
      filterNullish(),
      takeUntil(this.destroy$)
    );
    this.draw();
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  draw() {
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
        for (; index < depth.length; index++) {
          if (new Date(depth[index].E).getTime() <= time.getTime()) {
            for (const item of depth[index].a) {
              this.D4renderer.renderBar({
                depth: item,
                ...this.barService.calculateOptions({
                  type: 'ask',
                  price: Number(item[0]),
                  value: Number(item[1]),
                }),
              });
            }
            for (const item of depth[index].b) {
              this.D4renderer.renderBar({
                depth: item,
                ...this.barService.calculateOptions({
                  type: 'bid',
                  price: Number(item[0]),
                  value: Number(item[1]),
                }),
              });
            }
          } else {
            break;
          }
        }
      });
  }
}
