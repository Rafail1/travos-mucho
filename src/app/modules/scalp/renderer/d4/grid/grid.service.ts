import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { ISnapshot } from 'src/app/modules/backend/backend.service';
import { RootState } from 'src/app/store/app.reducer';
import { selectSnapshot, selectSymbol } from 'src/app/store/app.selectors';

@Injectable()
export class GridService {
  private grid = new Set<number>();
  private gridIndexes = new Map<number, number>();
  private snapshot$: Observable<ISnapshot>;
  private symbol$: Observable<string>;
  constructor(
    private store: Store<RootState>,
    private configService: ConfigService
  ) {
    this.snapshot$ = this.store.pipe(select(selectSnapshot), filterNullish());
    this.symbol$ = this.store.pipe(select(selectSymbol), filterNullish());
    this.init();
  }

  init() {
    this.symbol$.subscribe(() => {
      this.grid.clear();
      this.gridIndexes.clear();
    });

    this.snapshot$.subscribe((data) => {
      const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
      data.asks.forEach(([price]) => {
        const priceN = Number(price);
        if (!this.grid.has(priceN)) {
          this.grid.add(priceN);
        }
      });
      data.bids.forEach(([price]) => {
        const priceN = Number(price);

        if (!this.grid.has(priceN)) {
          this.grid.add(priceN);
        }
      });
      [...this.grid].sort().forEach((price, index) => {
        const y = index * barHeight;
        this.gridIndexes.set(price, y);
      });
    });
  }

  getY(price: string) {
    return this.gridIndexes.get(Number(price));
  }
}
