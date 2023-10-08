import {
  Component,
  ElementRef,
  InjectionToken,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { GlassService } from './canvas/molecules/glass/glass';
import { Store, select } from '@ngrx/store';
import { RootState } from 'src/app/store/app.reducer';
import { selectDepth, selectTime } from 'src/app/store/app.selectors';
import {
  Observable,
  Subject,
  combineLatest,
  map,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';

let ctx: CanvasRenderingContext2D;
export const CANVAS_CTX = new InjectionToken<() => CanvasRenderingContext2D>(
  'CANVAS_CTX',
  {
    providedIn: 'root',
    factory: () => () => ctx,
  }
);

@Component({
  selector: 'app-scalp',
  template: '',
})
export class ScalpComponent implements OnInit, OnDestroy {
  private width = window.innerWidth - 20;
  private height = window.innerHeight - 20;
  private ctx: CanvasRenderingContext2D;
  private depth$: Observable<any>;
  private time$: Observable<Date | undefined>;
  private destroy$ = new Subject<void>();
  constructor(
    private elRef: ElementRef,
    private glassService: GlassService,
    private renderer: Renderer2,
    private store: Store<RootState>
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    const canvas = this.renderer.createElement('canvas');
    canvas.setAttribute('width', this.width);
    canvas.setAttribute('height', this.height);
    this.elRef.nativeElement.appendChild(canvas);
    this.ctx = canvas.getContext('2d');
    this.depth$ = this.store.pipe(
      select(selectDepth),
      takeUntil(this.destroy$)
    );
    this.time$ = this.store.pipe(select(selectTime), takeUntil(this.destroy$));
  }

  draw() {
    this.depth$.pipe(
      switchMap(({ data, snapshot }) => {
        let index = 0;
        const asks = snapshot.asks.reduce((acc: any, item: any) => {
          acc[item[0]] = item[1];
          return acc;
        }, {});
        const bids = snapshot.bids.reduce((acc: any, item: any) => {
          acc[item[0]] = item[1];
          return acc;
        }, {});
        return this.time$.pipe(
          tap((time) => {
            if (!time) {
              return;
            }
            const lastUpdateId = snapshot.lastUpdateId;
            for (; index < data.length; index++) {
              if (data[index].E < time) {
                this.updateSnapshot(data[index], asks, bids);
              } else {
                break;
              }
            }
            // пошёл по depth, depth.data.slice(0, depth.data index of time)
            // пошёл по snapshot апдейтнул цены
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.glassService.render(asks, bids);
          })
        );
      })
    );

    // setTimeout(() => {
    //   requestAnimationFrame(() => this.draw(ctx));
    // }, 2000);
  }
  updateSnapshot(data: any, asks: any, bids: any) {
    data.a.forEach((item: any) => {
      asks[item[0]] = item[1];
    });

    data.b.forEach((item: any) => {
      bids[item[0]] = item[1];
    });
  }
}
