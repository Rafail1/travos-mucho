import {
  Component,
  ElementRef,
  InjectionToken,
  Input,
  OnInit,
  Renderer2,
} from '@angular/core';
import { ConfigService } from 'src/app/config/config';
import { GlassService } from '../../calculation/glass/glass.service';
import { TradesService } from '../../calculation/trades/trades.service';

@Component({
  selector: 'app-d4-renderer',
  templateUrl: './d4-renderer.component.html',
  styleUrls: ['./d4-renderer.component.scss'],
})
export class D4Component implements OnInit {
  @Input() width: number;
  constructor(
    private elRef: ElementRef,
    private configService: ConfigService,
    private renderer: Renderer2,
    private tradesService: TradesService,
    private glassService: GlassService
  ) {}

  ngOnInit(): void {
    this.tradesService.init();
    this.glassService.init();
  }
}
