import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { map, tap } from 'rxjs';
import { GridService } from 'src/app/modules/scalp/renderer/d4/grid/grid.service';
import { setBounds } from 'src/app/store/app.actions';
import { RootState } from 'src/app/store/app.reducer';

export interface IExchangeInfo {
  symbol: string;
  tickSize: string;
  pricePrecision: number;
}

@Injectable()
export class MarketDataService {
  private apiUrl = 'https://fapi.binance.com/fapi/v1';

  constructor(
    private httpClient: HttpClient,
    private gridService: GridService,
    private store: Store<RootState>
  ) {}

  getSymbols() {
    return this.httpClient.get(`${this.apiUrl}/exchangeInfo`).pipe(
      map(({ symbols }: any) =>
        symbols.reduce(
          (
            acc: Array<IExchangeInfo>,
            {
              symbol,
              contractType,
              quoteAsset,
              status,
              filters,
              pricePrecision,
            }: any
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
        map((data: any) => {
          const result: [number, number, number, number, number, number][] = [];
          let min = Number(data[0][3]);
          let max = Number(data[0][2]);
          for (const [time, open, high, low, close, volume] of data) {
            const highN = Number(high);
            const lowN = Number(low);

            if (highN > max) {
              max = highN;
            }

            if (min > lowN) {
              min = lowN;
            }

            result.push([
              time,
              Number(open),
              highN,
              lowN,
              Number(close),
              Number(volume),
            ]);
          }

          this.store.dispatch(setBounds({ min, max }));

          return result;
        })
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
