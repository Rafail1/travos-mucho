import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DateService } from '../utils/date.service';

@Injectable()
export class BackendService {
  private api = 'http://localhost:3000';
  constructor(
    private httpService: HttpClient,
    private dateService: DateService
  ) {}

  public getDepth(symbol: string, time: Date) {
    return this.httpService.get(`${this.api}/depth`, {
      params: new HttpParams({
        fromObject: {
          time: this.dateService.getUtcTime(time),
          symbol,
        },
      }),
    });
  }

  public getAggTrades(symbol: string, time: Date) {
    return this.httpService.get(`${this.api}/agg-trades`, {
      params: new HttpParams({
        fromObject: {
          time: this.dateService.getUtcTime(time),
          symbol,
        },
      }),
    });
  }

  public getDepthUpdates(symbol: string, time: Date) {
    return this.httpService.get(`${this.api}/depth-updates`, {
      params: new HttpParams({
        fromObject: {
          time: this.dateService.getUtcTime(time),
          symbol,
        },
      }),
    });
  }
}
