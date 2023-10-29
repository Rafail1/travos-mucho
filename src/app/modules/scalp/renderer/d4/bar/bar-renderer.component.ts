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
  private bars = new Map<string, IBar>();
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
    d3.select(this.elRef.nativeElement).append('svg').append('g');
  }

  renderBar(data: IBar) {
    const key = data.depth[0];
    if (!this.bars.has(key)) {
      this.barRendererService.add(data);
      this.bars.set(data.depth[0], data);
      return;
    }

    const prevBar = this.bars.get(key) as IBar;
    const {
      backgroundColor,
      depth,
      fillRectWidth,
      priceText,
      textColor,
      volumeText,
    } = prevBar;
    if (depth[1] !== data.depth[1]) {
      this.barRendererService.updateVolume(key, data.depth[1]);
    }

    if (backgroundColor !== data.backgroundColor) {
      this.barRendererService.updateBackgroundColor(key, data.backgroundColor);
    }

    if (fillRectWidth !== data.fillRectWidth) {
      this.barRendererService.updateFillRectWidth(key, data.fillRectWidth);
    }

    if (priceText !== data.priceText) {
      this.barRendererService.updatePriceText(key, data.priceText);
    }

    if (textColor !== data.textColor) {
      this.barRendererService.updateTextColor(key, data.textColor);
    }

    if (volumeText !== data.volumeText) {
      this.barRendererService.updateVolume(key, data.volumeText);
    }

    this.bars.set(data.depth[0], data);
  }
}
