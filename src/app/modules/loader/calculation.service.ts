import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { RootState } from 'src/app/store/app.reducer';
import { IBar, IDepth, ISnapshot } from '../backend/backend.service';
import { IBarType } from '../scalp/calculation/bar/bar.interface';
import { BarService } from '../scalp/calculation/bar/bar.service';
import { selectSquiz } from 'src/app/store/config/config.selectors';
import { selectPricePrecision } from 'src/app/store/app.selectors';
import { filterNullish } from 'src/app/common/utils/filter-nullish';

@Injectable({ providedIn: 'root' })
export class CalculationService {
  private squiz: number;
  private pricePrecision: number;
  constructor(private store: Store<RootState>, private barService: BarService) {
    this.store.pipe(select(selectSquiz)).subscribe((data) => {
      this.squiz = data;
    });

    this.store
      .pipe(select(selectPricePrecision), filterNullish())
      .subscribe((data) => {
        this.pricePrecision = data;
      });
  }

  public getFormattedDepth(depth: IDepth[]) {
    const formattedDepth: IBar[] = [];
    for (let index = 0; index < depth.length; index++) {
      formattedDepth.concat(this.format(depth[index].a, 'ask', depth[index].E));
      formattedDepth.concat(this.format(depth[index].b, 'bid', depth[index].E));
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

  private squizData(data: Array<[string, string]>) {
    const result = new Map<number, number>();
    if (this.pricePrecision === 1) {
      return data.map((item) => [Number(item[0]), Number(item[1])]);
    }
    for (const [price, volume] of data) {
      const priceN = Number(price);
      const volumeN = Number(volume);

      const priceSquized = Number(
        (
          priceN -
          (priceN %
            Number(
              (this.squiz * (10 / Math.pow(10, this.pricePrecision))).toFixed(
                this.pricePrecision
              )
            ))
        ).toFixed(this.pricePrecision)
      );
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
