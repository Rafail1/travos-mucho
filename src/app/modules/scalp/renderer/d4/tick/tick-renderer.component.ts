import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as d3 from 'd3';
import { Subject, takeUntil } from 'rxjs';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { RootState } from 'src/app/store/app.reducer';
import { selectSymbol } from 'src/app/store/app.selectors';
import { TradesService } from '../../../calculation/trades/trades.service';
import { TickRendererService } from './tick-renderer.service';

@Component({
  selector: 'app-tick-renderer',
  template: '',
  styleUrls: ['./tick-renderer.component.scss'],
})
export class TickRendererComponent implements OnInit, OnDestroy {
  @Input() data: IAggTrade;
  private destroy$ = new Subject<void>();
  constructor(
    private tickService: TradesService,
    private elRef: ElementRef,
    private tickRendererService: TickRendererService,
    private store: Store<RootState>
  ) {}

  ngOnInit(): void {
    this.createSvg();
    this.tickService.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.renderTick(data);
    });
    this.store
      .pipe(select(selectSymbol), takeUntil(this.destroy$))
      .subscribe(() => {
        this.tickRendererService.clean();
      });
  }

  renderTick(data: IAggTrade) {
    this.tickRendererService.render(data);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createSvg(): void {
    this.tickRendererService.setSvg(
      d3.select(this.elRef.nativeElement).append('svg')
    );
  }
}
