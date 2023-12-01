import { NgModule } from '@angular/core';

import { SettingsComponent } from './settings.component';
import { SettingsService } from './settings.service';
import { StoreModule } from '@ngrx/store';

@NgModule({
  declarations: [SettingsComponent],
  imports: [StoreModule],
  exports: [SettingsComponent],
  providers: [SettingsService],
})
export class SettingsModule {}
