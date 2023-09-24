import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as Highcharts from 'highcharts/highstock';
import HC_hollowcandlestick from 'highcharts/modules/hollowcandlestick';
import HC_draggable from 'highcharts/modules/draggable-points';
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
  plotLine: Highcharts.PlotLineOrBand | undefined;
  height = window.innerHeight / 2;
  Highcharts: typeof Highcharts = Highcharts; // required
  chartConstructor: string = 'chart'; // optional string, defaults to 'chart'
  chartOptions: Highcharts.Options = {
    rangeSelector: {
      selected: 1,
    },
    chart: {
      panKey: "shift",
      events: {
        click: (event) => {
          if (this.chart.hoverPoint?.category) {
            this.plotLine?.destroy();
            this.plotLine = this.chart.xAxis[0].addPlotLine({
              color: '#00ff00',
              width: 2,
              value: Number(this.chart.hoverPoint.category),
            });
          }
        },
      },
      panning: {
        enabled: true,
        type: 'x',
      },
    },
    scrollbar: {
      enabled: false,
    },
    plotOptions: {
      hollowcandlestick: {
        events: {
          click: (event) => {
            this.plotLine?.destroy();
            this.plotLine = this.chart.xAxis[0].addPlotLine({
              color: '#00ff00',
              width: 2,
              value: Number(event.point.category),
            });
          },
        },
      },
    },
    title: {
      text: '',
    },
    legend: {
      enabled: false,
    },
    navigator: {
      enabled: false,
      // adaptToUpdatedData: true,
    },
    xAxis: {
      type: 'datetime',
      ordinal: false,
      labels: {
        format: '{value:%m-%d %H:%M}',
      },
      crosshair: {
        width: 1,
      },
      scrollbar: {
        enabled: true,
      },
    },
    yAxis: [
      {
        labels: {
          align: 'left',
          x: 3,
        },
        title: {
          text: '',
        },
        height: '100%',
        lineWidth: 0,
        resize: {
          enabled: true,
        },
        opposite: true,
      },
      {
        labels: {
          enabled: false,
        },
        title: {
          text: '',
        },
        top: '80%',
        height: '20%',
        offset: 0,
        lineWidth: 0,
      },
    ],
  }; // required
  updateFlag: boolean = true; // optional boolean
  oneToOneFlag: boolean = true; // optional boolean, defaults to false
  runOutsideAngular: boolean = true; // optional boolean, defaults to false
  public chartCallback: Highcharts.ChartCallbackFunction;
  private destroy$ = new Subject<void>();
  chart: Highcharts.Chart;
  chartData: Highcharts.PointOptionsType[] = [];
  chartSelected: Highcharts.SVGElement;
  constructor(private store: Store<RootState>) {
    HC_hollowcandlestick(Highcharts);
    HC_draggable(Highcharts);
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
          type: 'hollowcandlestick',
          minPointLength: 0,
          data: data.map(([time, open, high, low, close]) => [
            time,
            open,
            high,
            low,
            close,
          ]),
          name: 'Price',
        });
        this.chart.addSeries({
          type: 'column',
          data: data.map((item) => [item[0], item[5]]),
          yAxis: 1,
          enableMouseTracking: false,
          states: {
            inactive: {
              enabled: false,
            },
          },
          name: 'Volume',
        });
        this.plotLine?.destroy();
        this.plotLine = this.chart.xAxis[0].addPlotLine({
          color: '#00ff00',
          width: 2,
          value: data[0][0],
        });

        // const catLen = this.chart.xAxis[0].categories?.length - 1;
        // this.chart.xAxis[0].setExtremes(catLen, catLen);
        // this.chart
      });
  }
}
