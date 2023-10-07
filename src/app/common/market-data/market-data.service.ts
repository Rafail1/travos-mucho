import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';

@Injectable()
export class MarketDataService {
  private apiUrl = 'https://fapi.binance.com/fapi/v1';

  constructor(private httpClient: HttpClient) {}

  getSymbols() {
    return this.httpClient.get(`${this.apiUrl}/exchangeInfo`).pipe(
      map(({ symbols }: any) =>
        symbols.reduce(
          (
            acc: Array<string>,
            { symbol, contractType, quoteAsset, status }: any
          ) => {
            if (this.isAvailable({ contractType, quoteAsset, status })) {
              acc.push(symbol);
            }

            return acc;
          },
          []
        )
      ),
      map((symbols: any) =>
        symbols.sort((a: string, b: string) => a.localeCompare(b))
      )
    );
  }

  public getCandlestickData(symbol: string, time: Date = new Date()) {
    return this.httpClient
      .get(`${this.apiUrl}/klines`, {
        params: {
          symbol,
          interval: '5m',
          startTime: time.getTime(),
          limit: 288,
        },
      })
      .pipe(
        map((data: any) =>
          data.map(([time, open, high, low, close, volume]: any) => {
            return [
              time,
              Number(open),
              Number(high),
              Number(low),
              Number(close),
              Number(volume),
            ];
          })
        )
      );
  }

  private isAvailable({ contractType, quoteAsset, status }: any) {
    return (
      contractType === 'PERPETUAL' &&
      quoteAsset === 'USDT' &&
      status === 'TRADING'
    );
  }
}
