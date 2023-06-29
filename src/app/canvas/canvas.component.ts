import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent {
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  private ctx: CanvasRenderingContext2D;

  ngOnInit(): void {
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) {
      throw Error('no canvas found');
    }

    this.ctx = ctx;
    this.animate();
  }

  animate(): void {
    this.ctx.fillStyle = 'green';
    this.ctx.fillRect(10, 10, 150, 100);
  }
}
