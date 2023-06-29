import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CanvasService } from './canvas/canvas.service';

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
    ctx.fillRect(10, 10, 150, 100);
  }
}
