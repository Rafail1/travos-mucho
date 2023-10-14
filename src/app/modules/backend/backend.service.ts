import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateService } from 'src/app/utils/date.service';
import { data } from './mock-agg-trades';
import { Observable, map, of } from 'rxjs';
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
  q: string;
  /**  ex: 'BTCUSDT'; // Symbol */
  s: string;
  /**  ex: 1691652205944; // Trade time */
  T: number;
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
  /** Event type // depthUpdate */
  e: string;
  /** Event time */
  E: string; // Event time
  /** Transaction time */
  T: string;
  /**Symbol */
  s: string;
  /** First update ID in event */
  U: number;
  /**Final update ID in event */
  u: number;
  /** Final update Id in last stream(ie `u` in last stream) */
  pu: number;
  /**  Bids to be updated [ '0.0024', // Price level to be updated '10', // Quantity]*/
  b: Array<[string, string]>;
  /** Asks to be updated  [ '0.0026', // Price level to be updated '100', // Quantity] */
  a: Array<[string, string]>;
}

@Injectable()
export class BackendService {
  private api = 'http://localhost:3000';
  constructor(
    private httpService: HttpClient,
    private dateService: DateService
  ) {}

  public getDepth(symbol: string, time: Date) {
    return this.httpService.get<{ depth: Array<IDepth>; snapshot: ISnapshot }>(
      `${this.api}/depth`,
      {
        params: new HttpParams({
          fromObject: {
            time: this.dateService.getUtcTime(time),
            symbol,
          },
        }),
      }
    );
  }

  public getAggTrades(symbol: string, time: Date): Observable<IAggTrade[]> {
    // return this.httpService.get<Array<IAggTrade>>(`${this.api}/agg-trades`, {
    //   params: new HttpParams({
    //     fromObject: {
    //       time: this.dateService.getUtcTime(time),
    //       symbol,
    //     },
    //   }),
    // });
    const cols = data.shift() as Array<keyof IAggTrade>;
    if (!cols) {
      return of([]);
    }

    const converted: IAggTrade[] = data.map((item) => {
      const result = Object.fromEntries(
        cols.map((col, idx) => [col, item[idx]])
      );
      return result as unknown as IAggTrade;
    });

    return of(converted);
  }
}
