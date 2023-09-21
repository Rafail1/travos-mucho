import { NgModule } from '@angular/core';
import { ChartComponent } from './chart.component';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  declarations: [ChartComponent],
  imports: [HighchartsChartModule],
})
export class ChartModule {}
