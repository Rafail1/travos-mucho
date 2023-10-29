import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import * as d3 from 'd3';
import { ConfigService } from 'src/app/config/config';
import { IAggTrade, ICluster } from 'src/app/modules/backend/backend.service';
import { IClusterData } from '../d4-renderer.service';
import { ClusterRendererService } from './cluster-renderer.service';
import { TradesService } from '../../../calculation/trades/trades.service';
import { Subject, map, takeUntil } from 'rxjs';

@Component({
  selector: 'app-cluster-renderer',
  template: '',
  styleUrls: ['./cluster-renderer.component.scss'],
})
export class ClusterRendererComponent implements OnInit, OnDestroy {
  @Input() data: IAggTrade;
  private clusters = new Map<Date, Map<string, IClusterData>>();
  private destroy$ = new Subject<void>();

  constructor(
    private elRef: ElementRef,
    private clusterRendererService: ClusterRendererService,
    private tickService: TradesService,
    private configService: ConfigService,
    private renderer: Renderer2
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    this.createSvg();
    this.tickService.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.renderCluster({
        m: data.m,
        volume: Number(data.q),
        p: data.p,
        min5_slot: new Date(data.E),
      });
    });
  }

  private createSvg(): void {
    d3.select(this.elRef.nativeElement)
      .append('svg')
      //   .attr('width', this.data.)
      //   .attr('height', 16)
      .append('g');
  }

  private renderCluster(data: ICluster) {
    if (!this.clusters.has(data.min5_slot)) {
      this.clusters.set(
        data.min5_slot,
        new Map([
          [
            data.p,
            {
              askVolume: data.m ? Number(data.volume) : 0,
              bidVolume: data.m ? 0 : Number(data.volume),
            },
          ],
        ])
      );
    } else if (!this.clusters.get(data.min5_slot)?.has(data.p)) {
      this.clusters.get(data.min5_slot)?.set(data.p, {
        askVolume: data.m ? Number(data.volume) : 0,
        bidVolume: data.m ? 0 : Number(data.volume),
      });
    } else {
      const currentVolume = this.clusters
        .get(data.min5_slot)
        ?.get(data.p) as IClusterData;

      if (data.m) {
        currentVolume.askVolume = currentVolume.askVolume + Number(data.volume);
      } else {
        currentVolume.bidVolume = currentVolume.bidVolume + Number(data.volume);
      }
    }

    this.clusterRendererService.render(
      this.clusters.get(data.min5_slot)?.get(data.p)
    );
  }
}
