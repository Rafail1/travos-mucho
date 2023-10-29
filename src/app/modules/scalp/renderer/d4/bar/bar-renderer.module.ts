import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BarRendererComponent } from './bar-renderer.component';
import { BarRendererService } from './bar-renderer.service';

@NgModule({
  declarations: [BarRendererComponent],
  imports: [BrowserModule],
  exports: [BarRendererComponent],
  providers: [BarRendererService],
})
export class BarRendererModule {}
