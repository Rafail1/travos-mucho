import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { StoreModule } from '@ngrx/store';
import { BackendModule } from '../backend/backend.module';
import { D4RendererModule } from './renderer/d4/d4-renderer.module';
import { ScalpComponent } from './scalp.component';
import { GlassModule } from './calculation/glass/glass.module';
import { TradesModule } from './calculation/trades/trades.module';
import { SettingsModule } from './settings/settings.module';

@NgModule({
  declarations: [ScalpComponent],
  imports: [
    BrowserModule,
    BackendModule,
    StoreModule,
    TradesModule,
    GlassModule,
    D4RendererModule,
    SettingsModule,
  ],
  exports: [ScalpComponent],
})
export class ScalpModule {}
