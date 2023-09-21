import {
  Component,
  ElementRef,
  InjectionToken,
  OnInit,
  Renderer2,
} from '@angular/core';
import { BackendService } from './backend/backend.service';
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
  selector: 'app-scalp',
  template: '<button (click)="getData()">getData</button>',
})
export class ScalpComponent implements OnInit {
  private width = window.innerWidth - 20;
  private height = window.innerHeight - 20;
  private ctx: CanvasRenderingContext2D;
  constructor(
    private elRef: ElementRef,
    private glassService: GlassService,
    private renderer: Renderer2,
    private backendService: BackendService
  ) {}

  ngOnInit(): void {
    const canvas = this.renderer.createElement('canvas');
    canvas.setAttribute('width', this.width);
    canvas.setAttribute('height', this.height);
    this.elRef.nativeElement.appendChild(canvas);
    this.ctx = canvas.getContext('2d');
  }

  getData() {
    this.backendService
      .getDepth('ETHUSDT', new Date('2023-08-23 12:36:17'))
      .subscribe((data) => {
        console.log(data);
      });
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
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
