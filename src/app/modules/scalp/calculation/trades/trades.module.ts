import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { TradesService } from './trades.service';

@NgModule({
  imports: [BrowserModule],
  providers: [TradesService],
})
export class TradesModule {}
