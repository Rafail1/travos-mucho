import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { TradesComponent } from './trades.component';

@NgModule({
  declarations: [TradesComponent],
  imports: [BrowserModule],
  exports: [TradesComponent],
})
export class TradesModule {}
