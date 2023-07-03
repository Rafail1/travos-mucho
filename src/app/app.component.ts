import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CanvasService } from './canvas/canvas.service';
import { Bar } from './canvas/atoms/bar/bar';

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
    const bar = new Bar();
    bar.render(ctx, {
      x: 0,
      y: 0,
      width: 500,
      height: 16,
      max: 1_000_000,
      value: 400_000,
      thresholds: [
        {
          value: 200_000,
          fillColor: '#ff0000',
          textColor: '#ffffff',
          backgroundColor: '#00FF00',
        },
        {
          value: 400_000,
          fillColor: '#00ff00',
          textColor: '#0000ff',
          backgroundColor: '#00dd00',
        },
        {
          value: 800_000,
          fillColor: '#0000ff',
          textColor: '#00ffff',
          backgroundColor: '#0000dd',
        },
      ],
    });
  }
}
