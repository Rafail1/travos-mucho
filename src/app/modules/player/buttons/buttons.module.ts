import { NgModule } from '@angular/core';
import { NgIconsModule } from '@ng-icons/core';
import { matPlayCircleOutline } from '@ng-icons/material-icons/outline';
import {
  matFastForwardSharp,
  matFastRewindSharp,
} from '@ng-icons/material-icons/sharp';
import { ButtonsComponent } from './buttons.component';
import { ButtonsService } from './buttons.service';
import { StoreModule } from '@ngrx/store';
@NgModule({
  imports: [
    StoreModule,
    NgIconsModule.withIcons({
      matPlayCircleOutline,
      matFastRewindSharp,
      matFastForwardSharp,
    }),
  ],
  declarations: [ButtonsComponent],
  providers: [ButtonsService],
  exports: [ButtonsComponent],
})
export class ButtonsModule {}
