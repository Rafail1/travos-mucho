import { Injectable } from '@angular/core';
import { of, tap } from 'rxjs';
import {
  BackendService,
  IAggTrade,
  IDepth,
  ISnapshot,
} from '../backend/backend.service';
@Injectable()
export class LoaderService {
  private depthCache = new Map<
    string,
    { depth: Array<IDepth>; snapshot: ISnapshot }
  >();
  private aggTradesCache = new Map<string, Array<IAggTrade>>();
  constructor(private backendService: BackendService) {}

  loadAggTrades({ symbol, time }: { symbol: string; time: Date }) {
    const key = `${symbol}_${time.getTime()}`;
    if (this.aggTradesCache.has(key)) {
      return of(this.aggTradesCache.get(key));
    }
    return this.backendService.getAggTrades(symbol, time).pipe(
      tap((data) => {
        this.aggTradesCache.set(key, data);
      })
    );
  }

  loadDepth({ symbol, time }: { symbol: string; time: Date }) {
    const key = `${symbol}_${time.getTime()}`;
    if (this.depthCache.has(key)) {
      const data = this.depthCache.get(key);
      if (data !== undefined) {
        return of(data);
      }
    }

    return this.backendService.getDepth(symbol, time).pipe(
      tap((data) => {
        this.depthCache.set(key, data);
      })
    );
  }
}
