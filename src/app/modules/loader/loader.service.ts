import { Injectable } from '@angular/core';
import { map, of, tap } from 'rxjs';
import {
  BackendService,
  IAggTrade,
  IBar,
  ICluster,
  IDepth,
  ISnapshot,
} from '../backend/backend.service';
import { IBarType } from '../scalp/calculation/bar/bar.interface';
import { BarService } from '../scalp/calculation/bar/bar.service';
@Injectable()
export class LoaderService {
  private currentSymbol: string;
  private depthCache = new Map<
    string,
    Map<string, { depth: Array<IBar>; snapshot: { E: number; data: IBar[] } }>
  >();
  private clusterCache = new Map<string, Map<string, Array<ICluster>>>();
  private aggTradesCache = new Map<string, Map<string, Array<IAggTrade>>>();
  constructor(
    private backendService: BackendService,
    private barService: BarService
  ) {}

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
        snapshot?.asks.sort((a: any, b: any) => {
          if (Number(a[0]) === Number(b[0])) {
            return 0;
          }
          return Number(a[0]) < Number(b[0]) ? 1 : -1;
        });
        snapshot?.bids.sort((a: any, b: any) => {
          if (a[0] === b[0]) {
            return 0;
          }
          return a[0] < b[0] ? 1 : -1;
        });
      }),
      map((data) => {
        const d = [
          ...data.snapshot.asks.map((item) => ({
            depth: item,
            type: 'ask' as IBarType,
            ...this.barService.calculateOptions({
              type: 'ask',
              price: Number(item[0]),
              value: Number(item[1]),
            }),
          })),
          ...data.snapshot.bids.map((item) => ({
            depth: item,
            type: 'bid' as IBarType,
            ...this.barService.calculateOptions({
              type: 'bid',
              price: Number(item[0]),
              value: Number(item[1]),
            }),
          })),
        ].reduce((acc, item) => {
          acc[Number(item.depth[0])] = item;
          return acc;
        }, {} as any);

        const formattedData = [];
        for (let index = 0; index < data.depth.length; index++) {
          for (const item of data.depth[index].a) {
            formattedData.push({
              E: data.depth[index].E,
              depth: item,
              type: 'ask' as IBarType,
              ...this.barService.calculateOptions({
                type: 'ask',
                price: Number(item[0]),
                value: Number(item[1]),
              }),
            });
          }
          for (const item of data.depth[index].b) {
            formattedData.push({
              E: data.depth[index].E,
              depth: item,
              type: 'bid' as IBarType,
              ...this.barService.calculateOptions({
                type: 'bid',
                price: Number(item[0]),
                value: Number(item[1]),
              }),
            });
          }
        }
        this.depthCache.get(symbol)?.set(key, {
          depth: formattedData,
          snapshot: { E: data.snapshot.E, data: d },
        });
        return formattedData;
      })
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
