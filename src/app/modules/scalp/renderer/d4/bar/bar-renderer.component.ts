import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import { ConfigService } from 'src/app/config/config';
import * as d3 from 'd3';
import { IBar } from 'src/app/modules/backend/backend.service';
import { BarRendererService } from './bar-renderer.service';
import { GlassService } from '../../../calculation/glass/glass.service';
import { Subject, takeUntil } from 'rxjs';

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
    private configService: ConfigService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.createSvg();
    this.glassService.data$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.renderBar(data);
    });
  }

  private createSvg(): void {
    this.barRendererService.setSvg(
      d3.select(this.elRef.nativeElement).append('svg')
    );
  }

  renderBar(data: IBar) {
    this.barRendererService.render(data)
  }
}
