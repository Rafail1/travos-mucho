import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as d3 from 'd3';
import { Subject, takeUntil } from 'rxjs';
import { DateService } from 'src/app/common/utils/date.service';
import { filterNullish } from 'src/app/common/utils/filter-nullish';
import { IAggTrade, ICluster } from 'src/app/modules/backend/backend.service';
import { FIVE_MINUTES } from 'src/app/modules/player/player.component';
import { RootState } from 'src/app/store/app.reducer';
import { selectClusters, selectSymbol } from 'src/app/store/app.selectors';
import { TradesService } from '../../../calculation/trades/trades.service';
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
    private store: Store<RootState>,
    private dateService: DateService,
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
        min5_slot: this.dateService
          .filterTime(new Date(data.T), FIVE_MINUTES)
          .getTime(),
      });
    });
    this.store
      .pipe(select(selectSymbol), takeUntil(this.destroy$))
      .subscribe(() => {
        this.clusterRendererService.clean();
      });

    this.store
      .pipe(select(selectClusters), filterNullish(), takeUntil(this.destroy$))
      .subscribe((clusters) => {
        this.clusterRendererService.addClusters(clusters);
      });
  }

  private createSvg(): void {
    this.clusterRendererService.setSvg(
      d3.select(this.elRef.nativeElement).append('svg')
    );
  }

  private renderCluster(data: ICluster) {
    this.clusterRendererService.updateCluster(data);
  }
}
