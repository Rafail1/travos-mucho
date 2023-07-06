import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Glass } from './canvas/molecules/glass/glass';

@Component({
  selector: 'app-root',
  template: '',
})
export class AppComponent implements OnInit {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  constructor(private elRef: ElementRef, private glass: Glass) {}

  ngOnInit(): void {
    const canvas = this.elRef.nativeElement.createElement('canvas');
    canvas.setAttribute('width', window.innerWidth);
    canvas.setAttribute('height', window.innerHeight);
    const ctx = canvas.getContext('2d');
    this.elRef.nativeElement.appendChild(canvas);
    this.draw(ctx, this.glass);
  }

  draw(ctx: CanvasRenderingContext2D, glass: Glass) {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    glass.render(
      Array.from({ length: 100 }).map((_, idx) => ({
        price: (10000 + idx).toString(),
        value: `${Math.random() * 500000 + 500_000}`,
      }))
    );
    // requestAnimationFrame(() => this.draw(ctx, glass));
  }
}
