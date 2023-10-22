import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GlassService } from './glass.service';

@NgModule({
  imports: [BrowserModule],
  providers: [GlassService],
})
export class GlassModule {}
