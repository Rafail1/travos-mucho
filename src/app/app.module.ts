import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BackendModule } from './modules/scalp/backend/backend.module';
import { ScalpModule } from './modules/scalp/scalp.module';
import { ChartModule } from './modules/chart/chart.module';
import { reducer } from './store/app.reducer';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BackendModule,
    ScalpModule,
    ChartModule,
    StoreModule.forRoot({ appReducer: reducer }),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
