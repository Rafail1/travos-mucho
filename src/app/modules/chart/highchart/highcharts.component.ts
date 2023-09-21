import { Component } from '@angular/core';
import * as Highcharts from 'highcharts/highstock';
import { data } from './dummy-data';
@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
})
export class HighchartsComponent {
  Highcharts: typeof Highcharts = Highcharts; // required
  chartConstructor: string = 'chart'; // optional string, defaults to 'chart'
  chartOptions: Highcharts.Options = {
    rangeSelector: {
      selected: 1,
    },

    title: {
      text: 'AAPL Stock Price',
    },

    series: [
      {
        type: 'candlestick',
        name: 'AAPL Stock Price',
        data,
        dataGrouping: {
          units: [
            [
              'week', // unit name
              [1], // allowed multiples
            ],
            ['month', [1, 2, 3, 4, 6]],
          ],
        },
      },
    ],
  }; // required
  chartCallback: Highcharts.ChartCallbackFunction = function (chart) {}; // optional function, defaults to null
  updateFlag: boolean = false; // optional boolean
  oneToOneFlag: boolean = true; // optional boolean, defaults to false
  runOutsideAngular: boolean = false; // optional boolean, defaults to false
}
