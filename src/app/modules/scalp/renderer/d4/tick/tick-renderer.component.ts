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
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { TradesService } from '../../../calculation/trades/trades.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-tick-renderer',
  template: '',
  styleUrls: ['./tick-renderer.component.scss'],
})
export class TickRendererComponent implements OnInit, OnDestroy {
  @Input() data: IAggTrade;
  private destroy$ = new Subject<void>();
  private ticks: Array<IAggTrade> = [];
  constructor(
    private tickService: TradesService,
    private elRef: ElementRef,
    private configService: ConfigService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.createSvg();
    this.tickService.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.renderTick(data);
    });
  }

  renderTick(data: IAggTrade) {
    this.ticks.push(data);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createSvg(): void {
    d3.select(this.elRef.nativeElement)
      .append('svg')
      //   .attr('width', this.data.)
      //   .attr('height', 16)
      .append('g');
  }
}
