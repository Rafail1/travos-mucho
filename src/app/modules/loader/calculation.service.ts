import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { IBounds, RootState } from 'src/app/store/app.reducer';
import {
  IAggTrade,
  IBar,
  ICluster,
  IDepth,
  ISnapshot,
} from '../backend/backend.service';
import { IBarType } from '../scalp/calculation/bar/bar.interface';
import { BarService } from '../scalp/calculation/bar/bar.service';
import { selectSquiz } from 'src/app/store/config/config.selectors';
import {
  selectBounds,
  selectPricePrecision,
} from 'src/app/store/app.selectors';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { ConfigService } from 'src/app/config/config';

@Injectable({ providedIn: 'root' })
export class CalculationService {
  private squiz: number;
  private pricePrecision: number;
  private clusterVolumePrecision: number;
  constructor(
    private store: Store<RootState>,
    private barService: BarService,
    private configService: ConfigService
  ) {
    this.store.pipe(select(selectSquiz)).subscribe((data) => {
      this.squiz = data;
    });
    this.clusterVolumePrecision =
      this.configService.getConfig('default')?.cluster.volumeFormat.decPlaces;
    this.store
      .pipe(select(selectPricePrecision), filterNullish())
      .subscribe((data) => {
        this.pricePrecision = data;
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
      const price = this.getSquizedPrice(Number(item.p));
      const time = item.E;
      const type = item.m;
      const key = `${price}_${time}_${type}`;
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
      const price = this.getSquizedPrice(Number(item.p));
      const key = `${price}_${item.m}__${item.min5_slot}`;
      const existsCluster = result.get(key);
      if (!existsCluster) {
        const volume = Number(
          Number(item.volume).toFixed(this.clusterVolumePrecision)
        );
        result.set(key, { ...item, volume });
      } else {
        const volume = Number(
          (Number(item.volume) + Number(existsCluster.volume)).toFixed(
            this.clusterVolumePrecision
          )
        );
        result.set(key, { ...item, volume });
      }
    }
    return [...result.values()];
  }

  public getSquizedPrice(price: number) {
    return Number(
      (
        price -
        (price %
          Number(
            (this.squiz * (10 / Math.pow(10, this.pricePrecision))).toFixed(
              this.pricePrecision
            )
          ))
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
        result.set(
          priceSquized,
          Number((existsVolume + volumeN).toFixed(this.pricePrecision))
        );
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
