import { NgModule } from '@angular/core';
import { ChartComponent } from './chart.component';
import { HighchartsModule } from './highchart/highcharts.module';

@NgModule({
  declarations: [ChartComponent],
  imports: [HighchartsModule],
  exports: [ChartComponent],
})
export class ChartModule {}
