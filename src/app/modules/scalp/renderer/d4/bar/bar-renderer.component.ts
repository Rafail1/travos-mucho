import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as d3 from 'd3';
import { Subject, takeUntil } from 'rxjs';
import { IBar } from 'src/app/modules/backend/backend.service';
import { RootState } from 'src/app/store/app.reducer';
import { selectSymbol } from 'src/app/store/app.selectors';
import { GlassService } from '../../../calculation/glass/glass.service';
import { BarRendererService } from './bar-renderer.service';

@Component({
  selector: 'app-bar-renderer',
  template: '',
  styleUrls: ['./bar-renderer.component.scss'],
})
export class BarRendererComponent implements OnInit {
  @Input() data: IBar;
  private destroy$ = new Subject<void>();
  constructor(
    private elRef: ElementRef,
    private barRendererService: BarRendererService,
    private glassService: GlassService,
    private store: Store<RootState>
  ) {}

  ngOnInit(): void {
    this.createSvg();
    this.glassService.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.renderBar(data);
    });
    this.store
      .pipe(select(selectSymbol), takeUntil(this.destroy$))
      .subscribe(() => {
        this.barRendererService.clean();
      });
  }

  private createSvg(): void {
    this.barRendererService.setSvg(
      d3.select<SVGElement, IBar>(this.elRef.nativeElement).append('svg')
    );
  }

  private renderBar(data: { [key: number]: IBar }) {
    this.barRendererService.render(data);
  }
}
