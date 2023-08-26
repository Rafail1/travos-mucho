import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class BackendService {
  private api = 'backend/';
  constructor(private httpService: HttpClient) {}

  public getDepth(symbol: string, time: Date) {
    return this.httpService.get(`${this.api}/depth`, {
      params: new HttpParams({
        fromObject: { time: time.toUTCString(), symbol },
      }),
    });
  }

  public getAggTrades(symbol: string, time: Date) {
    return this.httpService.get(`${this.api}/agg-trades`, {
      params: new HttpParams({
        fromObject: { time: time.toUTCString(), symbol },
      }),
    });
  }
}
