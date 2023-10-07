import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MarketDataModule } from './common/market-data/market-data.module';
import { SymbolSelectModule } from './common/modules/symbol-select/symbol-select.module';
import { BackendModule } from './modules/backend/backend.module';
import { ChartModule } from './modules/chart/chart.module';
import { LoaderModule } from './modules/loader/loader.module';
import { PlayerModule } from './modules/player/player.module';
import { ScalpModule } from './modules/scalp/scalp.module';
import { AppEffects } from './store/app.effects';
import { appReducer } from './store/app.reducer';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BackendModule,
    ScalpModule,
    ChartModule,
    SymbolSelectModule,
    MarketDataModule,
    PlayerModule,
    LoaderModule,
    StoreModule.forRoot({ app: appReducer }),
    EffectsModule.forRoot([AppEffects]),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
