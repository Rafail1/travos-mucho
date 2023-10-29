import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import * as d3 from 'd3';
import { Subject, takeUntil } from 'rxjs';
import { ConfigService } from 'src/app/config/config';
import { IAggTrade, ICluster } from 'src/app/modules/backend/backend.service';
import { TradesService } from '../../../calculation/trades/trades.service';
import { IClusterData } from '../d4-renderer.service';
import { ClusterRendererService } from './cluster-renderer.service';

@Component({
  selector: 'app-cluster-renderer',
  template: '',
  styleUrls: ['./cluster-renderer.component.scss'],
})
export class ClusterRendererComponent implements OnInit, OnDestroy {
  @Input() data: IAggTrade;
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
    this.clusterRendererService.setSvg(
      d3.select(this.elRef.nativeElement).append('svg')
    );
  }

  private renderCluster(data: ICluster) {
    this.clusterRendererService.render(data);
  }
}
