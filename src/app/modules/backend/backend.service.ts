import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { DateService } from 'src/app/common/utils/date.service';
import { response } from './mock-trades';
import { IBarType } from '../scalp/calculation/bar/bar.interface';
import { BarService } from '../scalp/calculation/bar/bar.service';
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

export interface ISnapshotFormatted {
  min: number;
  max: number;
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
  q: string;
  /**  ex: 'BTCUSDT'; // Symbol */
  s: string;
  /**  ex: 1691652205944; // Trade time */
  T: number;
}
export interface ICluster {
  p: string;
  volume: number;
  m: boolean;
  min5_slot: Date;
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
  private api = 'http://localhost:3000';
  constructor(
    private httpService: HttpClient,
    private dateService: DateService,
    private barService: BarService
  ) {}

  public getDepth(symbol: string, time: Date) {
    // return of(response);
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
    return this.httpService.get<Array<IAggTrade>>(`${this.api}/agg-trades`, {
      params: new HttpParams({
        fromObject: {
          time: this.dateService.getUtcTime(time),
          symbol,
        },
      }),
    });
  }

  getCluster(symbol: string, time: Date) {
    // return of([]);

    return this.httpService.get<Array<ICluster>>(`${this.api}/cluster`, {
      params: new HttpParams({
        fromObject: {
          time: this.dateService.getUtcTime(time),
          symbol,
        },
      }),
    });
  }
}
