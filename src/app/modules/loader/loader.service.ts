import { Injectable } from '@angular/core';
import { of, tap } from 'rxjs';
import {
  BackendService,
  IAggTrade,
  ICluster,
  IDepth,
  ISnapshot,
} from '../backend/backend.service';
@Injectable()
export class LoaderService {
  private currentSymbol: string;
  private depthCache = new Map<
    string,
    Map<string, { depth: Array<IDepth>; snapshot: ISnapshot }>
  >();
  private clusterCache = new Map<string, Map<string, Array<ICluster>>>();
  private aggTradesCache = new Map<string, Map<string, Array<IAggTrade>>>();
  constructor(private backendService: BackendService) {}

  loadAggTrades({ symbol, time }: { symbol: string; time: Date }) {
    if (this.currentSymbol !== symbol) {
      this.depthCache.delete(this.currentSymbol);
      this.aggTradesCache.delete(this.currentSymbol);
      this.currentSymbol = symbol;
    }
    const key = `${time.getTime()}`;
    if (this.aggTradesCache.get(symbol)?.has(key)) {
      return of(this.aggTradesCache.get(symbol)?.get(key));
    }
    return this.backendService.getAggTrades(symbol, time).pipe(
      tap((data) => {
        this.aggTradesCache.get(symbol)?.set(key, data);
      })
    );
  }

  loadDepth({ symbol, time }: { symbol: string; time: Date }) {
    if (this.currentSymbol !== symbol) {
      this.depthCache.delete(this.currentSymbol);
      this.aggTradesCache.delete(this.currentSymbol);
      this.currentSymbol = symbol;
    }

    const key = `${time.getTime()}`;
    if (this.depthCache.get(symbol)?.has(key)) {
      const data = this.depthCache.get(symbol)?.get(key);
      if (data !== undefined) {
        return of(data);
      }
    }

    return this.backendService.getDepth(symbol, time).pipe(
      tap(({ snapshot }) => {
        snapshot?.asks.sort((a, b) => {
          if (Number(a[0]) === Number(b[0])) {
            return 0;
          }
          return Number(a[0]) < Number(b[0]) ? 1 : -1;
        });
        snapshot?.bids.sort((a, b) => {
          if (a[0] === b[0]) {
            return 0;
          }
          return a[0] < b[0] ? 1 : -1;
        });
      }),
      tap((data) => this.depthCache.get(symbol)?.set(key, data))
    );
  }

  loadCluster({ symbol, time }: { symbol: string; time: Date }) {
    if (this.currentSymbol !== symbol) {
      this.depthCache.delete(this.currentSymbol);
      this.aggTradesCache.delete(this.currentSymbol);
      this.clusterCache.delete(this.currentSymbol);
      this.currentSymbol = symbol;
    }

    const key = `${time.getTime()}`;
    if (this.clusterCache.get(symbol)?.has(key)) {
      const data = this.clusterCache.get(symbol)?.get(key);
      if (data !== undefined) {
        return of(data);
      }
    }

    return this.backendService
      .getCluster(symbol, time)
      .pipe(tap((data) => this.clusterCache.get(symbol)?.set(key, data)));
  }
}
