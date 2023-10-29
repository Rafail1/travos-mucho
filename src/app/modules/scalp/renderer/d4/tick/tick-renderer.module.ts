import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TickRendererComponent } from './tick-renderer.component';
import { TickRendererService } from './tick-renderer.service';

@NgModule({
  declarations: [TickRendererComponent],
  imports: [BrowserModule],
  exports: [TickRendererComponent],
  providers: [TickRendererService],
})
export class TickRendererModule {}
