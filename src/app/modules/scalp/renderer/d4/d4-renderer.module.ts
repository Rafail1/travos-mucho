import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BarRendererModule } from './bar/bar-renderer.module';
import { D4Component } from './d4-renderer.component';
import { D4RendererService } from './d4-renderer.service';

@NgModule({
  declarations: [D4Component],
  imports: [BrowserModule, BarRendererModule],
  exports: [D4Component],
  providers: [D4RendererService],
})
export class D4RendererModule {}
