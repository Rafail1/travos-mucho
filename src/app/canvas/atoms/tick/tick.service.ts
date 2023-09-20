import { Inject, Injectable } from '@angular/core';
import { CANVAS_CTX } from 'src/app/app.component';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';

@Injectable({ providedIn: 'root' })
export class TickService {
  constructor(
    @Inject(CANVAS_CTX) private ctx: () => CanvasRenderingContext2D,
    private configService: ConfigService
  ) {}

  public render() {}
}
