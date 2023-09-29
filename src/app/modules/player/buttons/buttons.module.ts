import { NgModule } from '@angular/core';
import { ButtonsComponent } from './buttons.component';
import { ButtonsService } from './buttons.service';

@NgModule({
  declarations: [ButtonsComponent],
  providers: [ButtonsService],
  exports: [ButtonsComponent],
})
export class ButtonsModule {}
