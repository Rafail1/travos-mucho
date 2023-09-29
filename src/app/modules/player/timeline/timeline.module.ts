import { NgModule } from '@angular/core';
import { TimelineComponent } from './timeline.component';
import { TimelineService } from './timeline.service';

@NgModule({
  declarations: [TimelineComponent],
  providers: [TimelineService],
  exports: [TimelineComponent],
})
export class TimelineModule {}
