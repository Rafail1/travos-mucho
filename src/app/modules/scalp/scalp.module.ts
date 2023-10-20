import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { StoreModule } from '@ngrx/store';
import { BackendModule } from '../backend/backend.module';
import { GlassModule } from './canvas/molecules/glass/glass.module';
import { TradesModule } from './canvas/molecules/trades/trades.module';
import { ScalpComponent } from './scalp.component';
import { CanvasRendererModule } from './renderer/canvas/canvas-renderer.module';

@NgModule({
  declarations: [ScalpComponent],
  imports: [
    BrowserModule,
    BackendModule,
    StoreModule,
    TradesModule,
    GlassModule,
    CanvasRendererModule,
  ],
  exports: [ScalpComponent],
})
export class ScalpModule {}
