import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { EMPTY, Observable, catchError, map, merge, of, switchMap } from 'rxjs';
import { DateService, TIME_WINDOW } from 'src/app/common/utils/date.service';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { IBounds, RootState } from 'src/app/store/app.reducer';
import { selectBounds } from 'src/app/store/app.selectors';
import { FIVE_MINUTES } from '../player/player.component';
import { IBarType } from '../scalp/calculation/bar/bar.interface';
export interface IBar {
  depth: [number, number];
  backgroundColor: string;
  fillRectWidth: string;
  fillColor: string;
  priceText: string;
  textColor: string;
  volumeText: string;
  type: IBarType;
  E: string;
}

export interface IClusterParams {
  symbol: string;
  startTime: number;
  endTime: number;
}
export interface ISnapshotFormatted {
  // min: number;
  // max: number;
  E: string;
  data: { [key: number]: IBar };
}
export interface IAggTrade {
  /** ex: aggTrade  // Event type */
  e: string;
  /**  ex: 1822767676; // Aggregate trade ID */
  a: number;
  /**  ex: 1691652206099; // Event time */
  E: number;
  /**  ex: 4000633105; // First trade ID */
  f: number;
  /**  ex: 4000633105; // Last trade ID */
  l: number;
  /**  ex: true; // Is the buyer the market maker? */
  m: boolean;
  /**  ex: '29550.20'; // Price */
  p: string;
  /**  ex: '0.018'; // Quantity */
  q: number;
  /**  ex: 'BTCUSDT'; // Symbol */
  s: string;
  /**  ex: 1691652205944; // Trade time */
  T: number;
}
export interface ICluster {
  p: string;
  volume: number;
  m: boolean;
  min5_slot: number;
}
export interface ISnapshot {
  lastUpdateId: string;
  symbol: string;
  E: string; // dateString
  T: string; // dateString
  bids: Array<[string, string]>;
  asks: Array<[string, string]>;
}

export interface IDepth {
  /** Event time */
  E: string; // Event time
  /** Transaction time */
  T: string;
  /**Symbol */
  s: string;
  /** First update ID in event */
  U: string;
  /**Final update ID in event */
  u: string;
  /** Final update Id in last stream(ie `u` in last stream) */
  pu: string;
  /**  Bids to be updated [ '0.0024', // Price level to be updated '10', // Quantity]*/
  b: Array<[string, string]>;
  /** Asks to be updated  [ '0.0026', // Price level to be updated '100', // Quantity] */
  a: Array<[string, string]>;
}

@Injectable()
export class BackendService {
  private api = 'https://scalp24.store/rest/api';
  bounds: IBounds;
  private getAggTradesPromiseMap = new Map<string, Observable<IAggTrade[]>>();

  constructor(
    private httpService: HttpClient,
    private dateService: DateService,
    private store: Store<RootState>
  ) {
    this.store.pipe(select(selectBounds), filterNullish()).subscribe((data) => {
      this.bounds = data;
    });
  }

  public getDepth(
    symbol: string,
    time: Date
  ): Observable<{ depth: Array<IDepth>; snapshot: ISnapshot }> {
    return this.httpService
      .get<{ depth: Array<IDepth>; snapshot: ISnapshot }>(
        `${this.api}/depth/`,
        {
          params: new HttpParams({
            fromObject: {
              time: this.dateService.getUtcTime(time),
              here: '1',
              symbol,
            },
          }),
        }
      )
      .pipe(
        filterNullish(),
        map(({ snapshot, depth }) => {
          const result: { snapshot: ISnapshot; depth: Array<IDepth> } = {
            snapshot,
            depth: [],
          };
          for (const item of depth) {
            item.a = item.a.filter(
              ([price]) =>
                Number(price) > this.bounds.min &&
                Number(price) < this.bounds.max
            );

            item.b = item.b.filter(
              ([price]) =>
                Number(price) > this.bounds.min &&
                Number(price) < this.bounds.max
            );

            if (item.b.length + item.a.length > 0) {
              result.depth.push(item);
            }
          }

          return result;
        })
      );
  }

  public getAggTrades(
    symbol: string,
    startTime: number,
    _endTime?: number
  ): Observable<IAggTrade[]> {
    const endTime = _endTime ?? startTime + TIME_WINDOW;

    const k = `${startTime};${endTime}`;
    const exists = this.getAggTradesPromiseMap.get(k);
    if (exists) {
      return exists;
    }

    const limit = 1000;
    const observable = this.httpService
      .get<Array<IAggTrade>>(`https://fapi.binance.com/fapi/v1/aggTrades`, {
        params: new HttpParams({
          fromObject: {
            startTime,
            endTime,
            limit,
            symbol,
          },
        }),
      })
      .pipe(
        switchMap((response) => {
          const latestTs = response[response.length - 1].T;
          if (response.length === limit) {
            return merge(
              of(response),
              this.getAggTrades(symbol, latestTs, endTime)
            );
          } else {
            return of(response);
          }
        }),
        catchError((e) => {
          console.error(e);
          return EMPTY;
        })
      );
    this.getAggTradesPromiseMap.set(k, observable);
    return observable;
  }

  getCluster(symbol: string, time: Date) {
    const startTime = time.getTime();
    const endTime = startTime + FIVE_MINUTES;
    return this.getAggTrades(symbol, startTime, endTime).pipe(
      map((items) => {
        const _result: Record<string, ICluster> = {};
        for (const item of items) {
          const key = `${item.p}${item.m}`;
          const exists = _result[key];
          if (exists) {
            exists.volume += Number(item.q);
          } else {
            _result[key] = {
              p: item.p,
              volume: Number(item.q),
              m: item.m,
              min5_slot: this.dateService
                .filterTime(new Date(item.T), FIVE_MINUTES)
                .getTime(),
            };
          }
        }
        return Object.values(_result);
      })
    );
  }
}
