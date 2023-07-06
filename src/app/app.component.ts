import {
  Component,
  ElementRef,
  InjectionToken,
  OnInit,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { GlassService } from './canvas/molecules/glass/glass';

let ctx: CanvasRenderingContext2D;
export const CANVAS_CTX = new InjectionToken<CanvasRenderingContext2D>(
  'CANVAS_CTX',
  {
    providedIn: 'root',
    factory: () => ctx,
  }
);

@Component({
  selector: 'app-root',
  template: '',
})
export class AppComponent implements OnInit {
  constructor(
    private elRef: ElementRef,
    private glassService: GlassService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const canvas = this.renderer.createElement('canvas');
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
    this.elRef.nativeElement.appendChild(canvas);
    ctx = canvas.getContext('2d');
    this.draw(ctx);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.glassService.render(
      Array.from({ length: 100 }).map((_, idx) => ({
        price: (10000 + idx).toString(),
        value: `${Math.random() * 500000 + 500_000}`,
      }))
    );
    // requestAnimationFrame(() => this.draw(ctx, glass));
  }
}
