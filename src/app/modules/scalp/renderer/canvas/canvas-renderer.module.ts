import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CanvasRendererComponent } from './canvas-renderer.component';
import { CanvasRendererService } from './canvas-renderer.service';

@NgModule({
  declarations: [CanvasRendererComponent],
  imports: [BrowserModule],
  exports: [CanvasRendererComponent],
  providers: [CanvasRendererService],
})
export class CanvasRendererModule {}
