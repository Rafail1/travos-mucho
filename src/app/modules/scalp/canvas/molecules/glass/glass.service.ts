import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { BarService } from '../../atoms/bar/bar.service';
import { putBarY } from 'src/app/store/app.actions';
import { Store } from '@ngrx/store';
import { RootState } from 'src/app/store/app.reducer';
import { CanvasRendererService } from '../../../renderer/canvas/canvas-renderer.service';
interface BarData {
  type: 'ask' | 'bid';
  value: string;
  price: string;
  spread?: boolean;
  y: number;
  x: number;
  width: number;
  barHeight: number;
}
@Injectable({ providedIn: 'root' })
export class GlassService {
  private config: any;
  private squiz$ = new BehaviorSubject<number>(1);
  constructor(
    private configService: ConfigService,
    private canvasRenderer: CanvasRendererService
  ) {
    const { glass } = this.configService.getConfig('default');
    const { barHeight } = this.configService.getConfig(STYLE_THEME_KEY);
    this.config = { glass, barHeight };
  }

  public render(
    asks: Record<string, [string, string]>,
    bids: Record<string, [string, string]>
  ) {
    const { glass, barHeight } = this.config;
    const sortedAsks = Object.values(asks).sort((a, b) => {
      if (Number(a[0]) === Number(b[0])) {
        return 0;
      }
      return Number(a[0]) < Number(b[0]) ? 1 : -1;
    });
    const sortedBids = Object.values(bids).sort((a, b) => {
      if (a[0] === b[0]) {
        return 0;
      }
      return a[0] < b[0] ? 1 : -1;
    });

    if (this.squiz$.value > 1) {
      this.squiz(sortedAsks);
      this.squiz(sortedBids);
    }
    this.canvasRenderer.renderBars({
      asks: sortedAsks,
      bids: sortedBids,
      barHeight,
      glassWidth: glass.width,
      glassX: glass.x,
      glassY: glass.y,
    });
  }

  public squiz(data: Array<Array<string>>) {
    if (this.squiz$.value <= 1) {
      return;
    }

    for (let i = 0; i < data.length; i++) {
      if (!data[i]) {
        console.log(i);
      }
      const trown = data.splice(i, this.squiz$.value);
      if (!trown.length) {
        break;
      }
      if (!data[i]) {
        data[i] = trown[0];
      }
      for (let j = 0; j < trown.length; j++) {
        const sum = Number(data[i][1]) + Number(trown[j][1]);
        data[i] = [data[i][0], sum.toString()];
      }
    }
  }

  // TODO(Rafa): move logic to renderer
  // TODO(Rafa): end move logic to renderer
}
