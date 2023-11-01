import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GlassService } from './glass.service';
import { GridModule } from '../../renderer/d4/grid/grid.module';

@NgModule({
  imports: [BrowserModule, GridModule],
  providers: [GlassService],
})
export class GlassModule {}
