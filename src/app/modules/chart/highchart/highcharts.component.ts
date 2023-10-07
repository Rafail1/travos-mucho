import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import * as Highcharts from 'highcharts/highstock';
import HC_draggable from 'highcharts/modules/draggable-points';
import HC_hollowcandlestick from 'highcharts/modules/hollowcandlestick';
import { Subject, takeUntil, map, Observable } from 'rxjs';
import { setTime, setTimeFrom, setTimeTo } from 'src/app/store/app.actions';
import { RootState } from 'src/app/store/app.reducer';
import {
  selectCandlestickData,
  selectLoadingChart,
  selectTime,
} from 'src/app/store/app.selectors';

@Component({
  selector: 'app-highcharts',
  templateUrl: './highcharts.component.html',
})
export class HighchartsComponent implements OnDestroy, OnInit {
  loading$: Observable<boolean>;
  plotLine: Highcharts.PlotLineOrBand | undefined;
  plotLineValue: number;
  Highcharts: typeof Highcharts = Highcharts; // required
  chartConstructor: string = 'chart'; // optional string, defaults to 'chart'
  chartOptions: Highcharts.Options = {
    rangeSelector: {
      selected: 1,
    },
    chart: {
      panKey: 'shift',
      events: {
        click: () => {
          if (this.chart.hoverPoint?.category) {
            this.drawPlotLine(Number(this.chart.hoverPoint.category));
            const time = new Date(this.chart.hoverPoint.category);
            this.store.dispatch(setTime({ time }));
          }
        },
      },
      panning: {
        enabled: true,
      },
    },
    scrollbar: {
      enabled: false,
    },
    plotOptions: {
      hollowcandlestick: {
        events: {
          click: (event) => {
            if (!this.chart.hoverPoint?.category) {
              return;
            }
            this.drawPlotLine(Number(this.chart.hoverPoint.category));
            const time = new Date(event.point.category);
            this.store.dispatch(setTime({ time }));
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
  chartSelected: Highcharts.SVGElement;
  constructor(private store: Store<RootState>) {
    HC_hollowcandlestick(Highcharts);
    HC_draggable(Highcharts);
    this.loading$ = this.store.pipe(select(selectLoadingChart));
  }

  ngOnInit(): void {
    const component = this;
    this.chartCallback = (chart: Highcharts.Chart) => {
      component.chart = chart;
      component.init();
      component.store
        .pipe(
          select(selectTime),
          map((time) => {
            if (time) {
              component.drawPlotLine(time.getTime());
            }
          })
        )
        .subscribe();
    };
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  init() {
    this.loading$.subscribe((loading) => {
      if (loading) {
        this.chart.showLoading();
      } else {
        this.chart.hideLoading();
      }
    });
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

        this.store.dispatch(setTimeFrom({ time: new Date(data[0][0]) }));
        this.store.dispatch(
          setTimeTo({ time: new Date(data[data.length - 1][0]) })
        );

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
        this.drawPlotLine(data[0][0]);
      });
  }

  private drawPlotLine(time: number) {
    const value = time - (time % (1000 * 60 * 5));
    if (this.plotLineValue && this.plotLineValue === value) {
      return;
    }
    this.plotLineValue = value;
    this.plotLine?.destroy();
    this.plotLine = this.chart.xAxis[0].addPlotLine({
      color: '#00ff00',
      width: 2,
      value: this.plotLineValue,
    });
  }
}
