import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { StoreModule } from '@ngrx/store';
import { BackendModule } from '../backend/backend.module';
import { GlassComponent } from './canvas/molecules/glass/glass.component';
import { ScalpComponent } from './scalp.component';

@NgModule({
  declarations: [ScalpComponent, GlassComponent],
  imports: [BrowserModule, BackendModule, StoreModule],
  exports: [ScalpComponent],
})
export class ScalpModule {}
