import { NgModule } from '@angular/core';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';

@NgModule({
  declarations: [SettingsComponent],
  imports: [StoreModule, ReactiveFormsModule, FormsModule],
  exports: [SettingsComponent],
  providers: [SettingsService],
})
export class SettingsModule {}
