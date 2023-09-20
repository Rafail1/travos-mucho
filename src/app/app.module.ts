import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BackendModule } from './modules/scalp/backend/backend.module';
import { ScalpModule } from './modules/scalp/scalp.module';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, AppRoutingModule, BackendModule, ScalpModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
