import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Highcharts from 'highcharts/highstock';
import HC_exporting from 'highcharts/modules/exporting';
import { Subject, takeUntil } from 'rxjs';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectCandlestickData,
  selectSymbol,
} from 'src/app/store/app.selectors';
@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
})
export class HighchartsComponent implements OnDestroy, OnInit {
  Highcharts: typeof Highcharts = Highcharts; // required
  chartConstructor: string = 'chart'; // optional string, defaults to 'chart'
  chartOptions: Highcharts.Options = {
    rangeSelector: {
      selected: 1,
    },
    chart: {
      events: {
        click: (event) => {
          console.log(event);
        },
      },
    },
    plotOptions: {
      candlestick: {
        events: {
          click: (event) => {
            console.log(event);
          },
        },
      },
    },

    navigator: {
      enabled: true,
    },
    xAxis: {
      type: 'datetime',
      ordinal: false,
      labels: {
        format: '{value:%m-%d %H:%M}',
      },
    },
    yAxis: [
      {
        labels: {
          align: 'right',
          x: -3,
        },
        title: {
          text: 'OHLC',
        },
        height: '60%',
        lineWidth: 2,
        resize: {
          enabled: true,
        },
      },
      {
        labels: {
          align: 'right',
          x: -3,
        },
        title: {
          text: 'Volume',
        },
        top: '65%',
        height: '35%',
        offset: 0,
        lineWidth: 2,
      },
    ],
    tooltip: {
      split: true,
    },
  }; // required
  updateFlag: boolean = false; // optional boolean
  oneToOneFlag: boolean = false; // optional boolean, defaults to false
  runOutsideAngular: boolean = false; // optional boolean, defaults to false
  public chartCallback: Highcharts.ChartCallbackFunction;
  private destroy$ = new Subject<void>();
  chart: Highcharts.Chart;
  chartData: Highcharts.PointOptionsType[] = [];
  chartSelected: Highcharts.SVGElement;
  constructor(private store: Store<RootState>) {
    HC_exporting(Highcharts);
  }

  ngOnInit(): void {
    const component = this;
    this.chartCallback = (chart: Highcharts.Chart) => {
      component.chart = chart;
      component.init();
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  init() {
    // Draw the area in the charts
    this.chartSelected = this.chart.renderer
      .rect(0, 0, 0, 0, 0)
      .css({
        stroke: 'red',
        strokeWidth: '.5',
        fill: 'red',
        fillOpacity: '.1',
      })
      .add();
    this.chart.addSeries({ type: 'candlestick' });
    this.store
      .select(selectSymbol)
      .pipe(takeUntil(this.destroy$))
      .subscribe((symbol) => {
        this.chart.setTitle({ text: symbol });
      });

    this.store
      .select(selectCandlestickData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (!data) {
          return;
        }
        this.chart.series[0]?.remove();
        this.chart.series[0]?.remove();
        this.chart.addSeries({
          type: 'candlestick',
          data,
          name: 'Price',
        });
        this.chart.addSeries({
          type: 'column',
          name: 'Volume',
          data: data.map((item) => [item[0], item[5]]),
          yAxis: 1,
        });

        this.chart.redraw();
      });
  }
}
