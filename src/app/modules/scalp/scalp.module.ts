import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { BackendModule } from './backend/backend.module';
import { ScalpComponent } from './scalp.component';

@NgModule({
  declarations: [ScalpComponent],
  imports: [BrowserModule, BackendModule],
})
export class ScalpModule {}
