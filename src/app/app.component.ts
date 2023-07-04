import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CanvasService } from './canvas/canvas.service';
import { Bar } from './canvas/atoms/bar/bar';
import { Glass } from './canvas/molecules/glass/glass';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  constructor(private canvasService: CanvasService) {}

  ngAfterViewInit(): void {
    const ctx = this.canvasService.getCanvas(this.canvas.nativeElement);
    const glass = new Glass();
    this.draw(ctx, glass);
  }

  draw(ctx: CanvasRenderingContext2D, glass: Glass) {
    ctx.clearRect(0, 0, 500, 500);
    glass.render(
      ctx,
      Array.from({ length: 100 }).map((_, idx) => ({
        price: (10000 + idx).toString(),
        value: `${Math.random() * 500000 + 500_000}`,
      }))
    );
    requestAnimationFrame(() => this.draw(ctx, glass));
  }
}
