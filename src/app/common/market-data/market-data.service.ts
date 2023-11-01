import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, tap } from 'rxjs';

export interface IExchangeInfo {
  symbol: string;
  tickSize: string;
  pricePrecision: number;
}

@Injectable()
export class MarketDataService {
  private apiUrl = 'https://fapi.binance.com/fapi/v1';

  constructor(private httpClient: HttpClient) {}

  getSymbols() {
    return this.httpClient.get(`${this.apiUrl}/exchangeInfo`).pipe(
      map(({ symbols }: any) =>
        symbols.reduce(
          (
            acc: Array<IExchangeInfo>,
            { symbol, contractType, quoteAsset, status, filters, pricePrecision }: any
          ) => {
            if (this.isAvailable({ contractType, quoteAsset, status })) {
              const tickSize = filters.find(
                (item: any) => item.filterType === 'PRICE_FILTER'
              )?.tickSize;
              if (tickSize) {
                acc.push({ symbol, tickSize, pricePrecision });
              }
            }

            return acc;
          },
          []
        )
      ),
      map((symbols: any) =>
        symbols.sort((a: any, b: any) => a.symbol.localeCompare(b.symbol))
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
