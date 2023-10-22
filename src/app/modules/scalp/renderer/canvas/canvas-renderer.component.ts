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
const fullHeight = 16000;
let tradesCtx: CanvasRenderingContext2D;
export const TRADES_CANVAS_CTX = new InjectionToken<
  () => CanvasRenderingContext2D
>('TRADES_CANVAS_CTX', {
  providedIn: 'root',
  factory: () => () => tradesCtx,
});

let glassCtx: CanvasRenderingContext2D;
export const GLASS_CANVAS_CTX = new InjectionToken<
  () => CanvasRenderingContext2D
>('GLASS_CANVAS_CTX', {
  providedIn: 'root',
  factory: () => () => glassCtx,
});

@Component({
  selector: 'app-canvas-renderer',
  template: '',
  styleUrls: ['./canvas-renderer.component.scss'],
})
export class CanvasRendererComponent implements OnInit {
  @Input() width: number;
  constructor(
    private elRef: ElementRef,
    private configService: ConfigService,
    private renderer: Renderer2,
    private tradesService: TradesService,
    private glassService: GlassService
  ) {}

  ngOnInit(): void {
    this.initGlassCtx();
    this.initTradesCtx();
    this.tradesService.init();
    this.glassService.init();
  }

  initGlassCtx(): void {
    const {
      glass: { width },
    } = this.configService.getConfig('default');

    const canvas = this.renderer.createElement('canvas');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', fullHeight);
    this.elRef.nativeElement.appendChild(canvas);
    glassCtx = canvas.getContext('2d');
  }

  initTradesCtx(): void {
    const {
      tick: { width },
    } = this.configService.getConfig('default');

    const canvas = this.renderer.createElement('canvas');
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', fullHeight);
    this.elRef.nativeElement.appendChild(canvas);
    tradesCtx = canvas.getContext('2d');
  }
}
