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
import { Observable, Subject, combineLatest, takeUntil } from 'rxjs';

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
    combineLatest([this.depth$, this.time$]).subscribe(([depth, time]) => {

      // пошёл по depth, depth.data.slice(0, depth.data index of time)
      // пошёл по snapshot апдейтнул цены
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.glassService.render(
        Array.from({ length: 22 }).map((_, idx) => ({
          price: (10000 + idx).toString(),
          value: `${Math.random() * 500000 + 500_000}`,
        }))
      );
    });

    // setTimeout(() => {
    //   requestAnimationFrame(() => this.draw(ctx));
    // }, 2000);
  }
}
