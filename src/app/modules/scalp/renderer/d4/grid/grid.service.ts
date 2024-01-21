import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject, combineLatest, map } from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { CalculationService } from 'src/app/modules/loader/calculation.service';
import { FIVE_MINUTES } from 'src/app/modules/player/player.component';
import { IBounds, RootState } from 'src/app/store/app.reducer';
import {
  selectBounds,
  selectPricePrecision,
  selectScroll,
  selectTickSize,
  selectTime,
} from 'src/app/store/app.selectors';
import { selectSquiz } from 'src/app/store/config/config.selectors';
import { SettingsService } from '../../../settings/settings.service';
const containerHeight = 600;
@Injectable()
export class GridService {
  public visibleAreaChanged$ = new Subject<void>();
  private height$ = new Subject<number>();
  private originalTickSize: number;
  private tickSize: number;
  private pricePrecision: number;
  private min: number = 0;
  private max: number = 0;
  private visibleGrid: Array<number> = [];
  private time = new Date();
  private squiz$: Observable<number>;
  private bounds$: Observable<IBounds>;
  private squiz: number;
  constructor(
    private store: Store<RootState>,
    private settingsService: SettingsService,
    private calculationService: CalculationService
  ) {
    this.bounds$ = this.store.pipe(select(selectBounds), filterNullish());
    this.squiz$ = this.store.pipe(select(selectSquiz), filterNullish());
    this.setBounds();

    this.store.pipe(select(selectTime), filterNullish()).subscribe((time) => {
      this.time = time;
    });
    this.store
      .pipe(select(selectTickSize), filterNullish())
      .subscribe((tickSize) => {
        this.tickSize = Number(tickSize);
        this.originalTickSize = this.tickSize;
      });

    this.store
      .pipe(select(selectPricePrecision), filterNullish())
      .subscribe((pricePrecision) => {
        this.pricePrecision = pricePrecision;
      });
  }

  setBounds() {
    combineLatest([this.bounds$, this.squiz$]).subscribe(([data, squiz]) => {
      this.max = this.calculationService.getSquizedPrice(data.max);
      this.min = this.calculationService.getSquizedPrice(data.min);
      this.squiz = squiz;
      this.tickSize = this.originalTickSize * squiz;
      const { barHeight } = this.settingsService.getStyle();
      this.height$.next(
        Math.ceil(((this.max - this.min) / this.tickSize) * barHeight)
      );
      this.setVisibleArea();
    });
  }

  getY(price: number) {
    const { barHeight } = this.settingsService.getStyle();
    const idx =
      Number((this.max - Number(price)).toFixed(this.pricePrecision)) /
      this.tickSize;
    return Math.ceil(idx) * barHeight;
  }

  getGrid() {
    return this.visibleGrid;
  }

  getBarHeight() {
    const { barHeight } = this.settingsService.getStyle();
    return barHeight;
  }

  getHeight() {
    return this.height$.asObservable();
  }

  getMin5SlotX(min5_slot: number) {
    const x =
      Math.floor((this.time.getTime() - min5_slot) / FIVE_MINUTES) *
      this.settingsService.getStyle().clusterWidth;
    return 240 - x;
  }

  private setVisibleArea() {
    const { barHeight } = this.settingsService.getStyle();

    const showCnt = Math.ceil(containerHeight / barHeight) * 2;
    this.store
      .pipe(
        select(selectScroll),
        map((scroll) => {
          const offsetTop = Math.floor(scroll / barHeight);
          const top = Math.floor(Math.max(offsetTop - showCnt / 3, 0));
          const max = Number(
            (
              this.max -
              Number((this.tickSize * top).toFixed(this.pricePrecision))
            ).toFixed(this.pricePrecision)
          );

          const res = Array.from({ length: showCnt }).map((_, idx) => {
            const tmp = Number(
              (
                max - Number((idx * this.tickSize).toFixed(this.pricePrecision))
              ).toFixed(this.pricePrecision)
            );
            return tmp;
          });
          return res;
        })
      )
      .subscribe((visibleGrid) => {
        this.visibleGrid = visibleGrid;
        this.visibleAreaChanged$.next();
      });
  }
}
