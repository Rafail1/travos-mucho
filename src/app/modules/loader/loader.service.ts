import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { RootState } from 'src/app/store/app.reducer';
import { selectSymbol, selectTime } from 'src/app/store/app.selectors';
import { BackendService } from '../backend/backend.service';
export const timeInterval = 1000 * 10;
@Injectable()
export class LoaderService {
  private depthCache: Map<string, any>;
  private aggTradesCache: Map<string, any>;
  private symbol$: Observable<string | undefined>;
  private time$: Observable<Date | undefined>;
  constructor(
    private backendService: BackendService,
    private store: Store<RootState>
  ) {
    this.symbol$ = this.store.pipe(select(selectSymbol));
    this.time$ = this.store.pipe(select(selectTime));
  }

  loadAggTrades({ symbol, time }: { symbol: string; time: Date }) {
    const timeFiltered = this.filterTime(time);
    const key = `${symbol}_${timeFiltered}`;
    if (this.aggTradesCache.has(key)) {
      return of(this.aggTradesCache.get(key));
    }
    return this.backendService
      .getAggTrades(symbol, new Date(timeFiltered))
      .pipe(
        tap((data) => {
          this.aggTradesCache.set(key, data);
        })
      );
  }

  loadDepth({ symbol, time }: { symbol: string; time: Date }) {
    const timeFiltered = this.filterTime(time);

    const key = `${symbol}_${timeFiltered}`;
    if (this.depthCache.has(key)) {
      return of(this.depthCache.get(key));
    }
    return this.backendService.getDepth(symbol, new Date(timeFiltered)).pipe(
      tap((data) => {
        this.depthCache.set(key, data);
      })
    );
  }

  private filterTime(time: Date) {
    return Math.floor(time.getTime() - (time.getTime() % timeInterval));
  }
}
