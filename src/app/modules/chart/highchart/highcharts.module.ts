import { HighchartsChartModule } from 'highcharts-angular';
import { NgModule } from '@angular/core';
import { HighchartsComponent } from './highcharts.component';
@NgModule({
  imports: [HighchartsChartModule],
  declarations: [HighchartsComponent],
  exports: [HighchartsComponent],
})
export class HighchartsModule {}
