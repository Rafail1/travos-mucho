import { NgModule } from '@angular/core';
import { PlayerComponent } from './player.component';
import { PlayerService } from './player.service';
import { ButtonsModule } from './buttons/buttons.module';
import { TimelineModule } from './timeline/timeline.module';

@NgModule({
  imports: [ButtonsModule, TimelineModule],
  declarations: [PlayerComponent],
  providers: [PlayerService],
  exports: [PlayerComponent],
})
export class PlayerModule {}
