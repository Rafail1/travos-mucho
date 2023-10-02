import { NgModule } from '@angular/core';
import { TimelineComponent } from './timeline.component';
import { TimelineService } from './timeline.service';
import { CommonModule } from '@angular/common';
import { StoreModule } from '@ngrx/store';

@NgModule({
  imports: [CommonModule, StoreModule],
  declarations: [TimelineComponent],
  providers: [TimelineService],
  exports: [TimelineComponent],
})
export class TimelineModule {}
