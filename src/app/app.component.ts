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
export const CANVAS_CTX = new InjectionToken<() => CanvasRenderingContext2D>(
  'CANVAS_CTX',
  {
    providedIn: 'root',
    factory: () => () => ctx,
  }
);

@Component({
  selector: 'app-root',
  template: '',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  private width = window.innerWidth - 20;
  private height = window.innerHeight - 20;
  constructor(
    private elRef: ElementRef,
    private glassService: GlassService,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    const canvas = this.renderer.createElement('canvas');
    canvas.setAttribute('width', this.width);
    canvas.setAttribute('height', this.height);
    this.elRef.nativeElement.appendChild(canvas);
    ctx = canvas.getContext('2d');
    this.draw(ctx);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, this.width, this.height);
    this.glassService.render(
      Array.from({ length: 22 }).map((_, idx) => ({
        price: (10000 + idx).toString(),
        value: `${Math.random() * 500000 + 500_000}`,
      }))
    );
    // setTimeout(() => {
    //   requestAnimationFrame(() => this.draw(ctx));
    // }, 2000);
  }
}
