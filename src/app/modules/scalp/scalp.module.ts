import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BackendModule } from '../backend/backend.module';
import { ScalpComponent } from './scalp.component';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [ScalpComponent],
  imports: [BrowserModule, BackendModule, StoreModule],
  exports: [ScalpComponent],
})
export class ScalpModule {}
