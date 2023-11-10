import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { ISnapshotFormatted } from 'src/app/modules/backend/backend.service';
import { FIVE_MINUTES } from 'src/app/modules/player/player.component';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectPricePrecision,
  selectSymbol,
  selectTickSize,
} from 'src/app/store/app.selectors';

@Injectable()
export class GridService {
  private grid = new Set<number>();
  private gridIndexes = new Map<number, number>();
  private symbol$: Observable<string>;
  private height$ = new Subject<number>();
  private tickSize: number;
  private pricePrecision: number;
  private min: number;
  private max: number;
  constructor(
    private store: Store<RootState>,
    private configService: ConfigService
  ) {
    this.symbol$ = this.store.pipe(select(selectSymbol), filterNullish());
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
    this.init();
  }

  setBounds(data: { min: number; max: number }) {
    this.max = data.max;
    this.min = data.min;
  }

  init() {
    this.symbol$.subscribe(() => {
      this.grid.clear();
      this.gridIndexes.clear();
    });
  }

  getY(price: string | number) {
    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
    const idx =
      Number((this.max - Number(price)).toPrecision(this.pricePrecision)) /
      this.tickSize;
    return Math.ceil(idx) * barHeight;
  }

  getGrid() {
    return this.gridIndexes;
  }

  getBarHeight() {
    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
    return barHeight;
  }

  getHeight() {
    return this.height$.asObservable();
  }

  getMin5SlotX(min5_slot: Date) {
    return (
      Math.floor((Date.now() - min5_slot.getTime()) / FIVE_MINUTES) *
      this.configService.getConfig(STYLE_THEME_KEY).clusterWidth
    );
  }

  update(data: ISnapshotFormatted) {
    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
    if (this.grid.size === 0) {
      this.height$.next(((this.max - this.min) / this.tickSize) * barHeight);
    }

    let index = 0;
    for (let priceN = this.max; priceN >= this.min; priceN -= this.tickSize) {
      priceN = Number(priceN.toFixed(this.pricePrecision));
      if (this.grid.has(priceN)) {
        continue;
      }
      this.grid.add(priceN);
      const y = index * barHeight;
      this.gridIndexes.set(priceN, y);
      index++;
    }
  }
}
