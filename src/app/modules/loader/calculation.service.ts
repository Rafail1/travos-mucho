import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectPricePrecision,
  selectTickSize,
} from 'src/app/store/app.selectors';
import { selectSquiz } from 'src/app/store/config/config.selectors';
import {
  IAggTrade,
  IBar,
  ICluster,
  IDepth,
  ISnapshot,
} from '../backend/backend.service';
import { IBarType } from '../scalp/calculation/bar/bar.interface';
import { BarService } from '../scalp/calculation/bar/bar.service';

@Injectable({ providedIn: 'root' })
export class CalculationService {
  private squiz: number;
  private pricePrecision: number;
  private tickSize: number;
  constructor(private store: Store<RootState>, private barService: BarService) {
    this.store.pipe(select(selectSquiz)).subscribe((data) => {
      this.squiz = data;
    });
    this.store
      .pipe(select(selectPricePrecision), filterNullish())
      .subscribe((data) => {
        this.pricePrecision = data;
      });

    this.store
      .pipe(select(selectTickSize), filterNullish())
      .subscribe((data) => {
        this.tickSize = Number(data);
      });
  }

  public getFormattedDepth(depth: IDepth[]) {
    let formattedDepth: IBar[] = [];
    for (let index = 0; index < depth.length; index++) {
      formattedDepth = formattedDepth.concat(
        this.format(depth[index].a, 'ask', depth[index].E)
      );
      formattedDepth = formattedDepth.concat(
        this.format(depth[index].b, 'bid', depth[index].E)
      );
    }

    return formattedDepth;
  }

  public getFormattedSnapshot(snapshot: ISnapshot) {
    const formattedSnapshot = [
      ...this.format(snapshot.asks, 'ask', snapshot.E),
      ...this.format(snapshot.bids, 'bid', snapshot.E),
    ];

    return formattedSnapshot.reduce((acc: any, item) => {
      acc[item.depth[0]] = item;
      return acc;
    }, {} as { [key: number]: IBar });
  }

  public getFormattedAggTrades(data: IAggTrade[]) {
    const result = new Map<string, IAggTrade>();
    for (const item of data) {
      item.p = String(this.getSquizedPrice(Number(item.p)));
      const time = item.E;
      const type = item.m;
      const key = `${item.p}_${time}_${type}`;
      const existsAggTrade = result.get(key);

      if (!existsAggTrade) {
        result.set(key, {
          ...item,
          q: Number(Number(item.q).toFixed(this.pricePrecision)),
        });
      } else {
        const quantity = Number(
          (Number(item.q) + existsAggTrade.q).toFixed(this.pricePrecision)
        );
        result.set(key, { ...item, q: quantity });
      }
    }

    return [...result.values()];
  }

  public getFormattedClusters(data: ICluster[]) {
    const result = new Map<string, ICluster>();
    for (const item of data) {
      item.p = String(this.getSquizedPrice(Number(item.p)));
      const key = `${item.p}_${item.m}__${item.min5_slot}`;
      const existsCluster = result.get(key);
      if (!existsCluster) {
        result.set(key, item);
      } else {
        const volume = Number(item.volume) + Number(existsCluster.volume);
        result.set(key, { ...item, volume });
      }
    }
    return [...result.values()];
  }

  public getSquizedPrice(price: number) {
    if (this.squiz === 1) {
      return price;
    }
    return Number(
      (
        price -
        (price %
          Number((this.squiz * this.tickSize).toFixed(this.pricePrecision)))
      ).toFixed(this.pricePrecision)
    );
  }

  private squizData(data: Array<[string, string]>) {
    const result = new Map<number, number>();
    if (this.pricePrecision === 1) {
      return data.map((item) => [Number(item[0]), Number(item[1])]);
    }
    for (const [price, volume] of data) {
      const priceN = Number(price);
      const volumeN = Number(volume);

      const priceSquized = this.getSquizedPrice(priceN);
      const existsVolume = result.get(priceSquized);
      if (existsVolume === undefined) {
        result.set(priceSquized, volumeN);
      } else {
        result.set(priceSquized, existsVolume + volumeN);
      }
    }

    return [...result.entries()];
  }

  private format(
    data: Array<[string, string]>,
    type: IBarType,
    E: string
  ): IBar[] {
    const squizedData = this.squizData(data);
    return squizedData.map((item) => ({
      E,
      depth: [Number(item[0]), item[1]],
      type,
      ...this.barService.calculateOptions({
        type,
        price: Number(item[0]),
        value: Number(item[1]),
      }),
    }));
  }
}
