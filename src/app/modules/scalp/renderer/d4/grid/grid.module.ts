import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GridService } from './grid.service';

@NgModule({
  imports: [BrowserModule],
  providers: [GridService],
})
export class GridModule {}
