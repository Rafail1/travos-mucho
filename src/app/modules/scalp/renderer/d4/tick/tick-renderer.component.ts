import { Component, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';
import * as d3 from 'd3';
import { ConfigService } from 'src/app/config/config';
import { IAggTrade } from 'src/app/modules/backend/backend.service';

@Component({
  selector: 'app-tick-renderer',
  template: '',
  styleUrls: ['./tick-renderer.component.scss'],
})
export class TickRendererComponent implements OnInit {
  @Input() data: IAggTrade;
  constructor(
    private elRef: ElementRef,
    private configService: ConfigService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.createSvg();
  }

  private createSvg(): void {
    d3.select(this.elRef.nativeElement)
      .append('svg')
    //   .attr('width', this.data.)
    //   .attr('height', 16)
      .append('g');
  }
}
