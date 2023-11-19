import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Subject, map } from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { FIVE_MINUTES } from 'src/app/modules/player/player.component';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectPricePrecision,
  selectScroll,
  selectTickSize,
  selectTime,
} from 'src/app/store/app.selectors';
const containerHeight = 600;
@Injectable()
export class GridService {
  public visibleAreaChanged$ = new Subject<void>();
  private height$ = new Subject<number>();
  private tickSize: number;
  private pricePrecision: number;
  private min: number = 0;
  private max: number = 0;
  private visibleGrid: Array<number> = [];
  private time = new Date();
  constructor(
    private store: Store<RootState>,
    private configService: ConfigService
  ) {
    this.store.pipe(select(selectTime), filterNullish()).subscribe((time) => {
      this.time = time;
    });

    this.store
      .pipe(select(selectTickSize), filterNullish())
      .subscribe((tickSize) => {
        this.tickSize = Number(tickSize);
      });

    this.store
      .pipe(select(selectPricePrecision), filterNullish())
      .subscribe((pricePrecision) => {
        this.pricePrecision = pricePrecision;
      });
  }

  setBounds(data: { min: number; max: number }) {
    this.max = data.max;
    this.min = data.min;

    // for (let priceN = this.max; priceN >= this.min; priceN -= this.tickSize) {
    //   priceN = Number(priceN.toFixed(this.pricePrecision));
    //   if (this.grid.has(priceN)) {
    //     continue;
    //   }
    //   this.grid.add(priceN);
    // }

    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
    this.height$.next(((this.max - this.min) / this.tickSize) * barHeight);
    this.setVisibleArea();
  }

  getY(price: string | number) {
    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
    const idx =
      Number((this.max - Number(price)).toFixed(this.pricePrecision)) /
      this.tickSize;
    return Math.ceil(idx) * barHeight;
  }

  getGrid() {
    return this.visibleGrid;
  }

  getBarHeight() {
    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
    return barHeight;
  }

  getHeight() {
    return this.height$.asObservable();
  }

  getMin5SlotX(min5_slot: Date) {
    const x =
      Math.floor((this.time.getTime() - min5_slot.getTime()) / FIVE_MINUTES) *
      this.configService.getConfig(STYLE_THEME_KEY).clusterWidth;
    return 240 - x;
  }

  private setVisibleArea() {
    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);

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
