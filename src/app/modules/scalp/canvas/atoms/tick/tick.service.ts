import { Inject, Injectable } from '@angular/core';
import { ConfigService } from 'src/app/config/config';
import { CANVAS_CTX } from '../../molecules/glass/glass.component';
import { IAggTrade } from 'src/app/modules/backend/backend.service';

@Injectable({ providedIn: 'root' })
export class TickService {
  constructor(
    @Inject(CANVAS_CTX) private ctx: () => CanvasRenderingContext2D,
    private configService: ConfigService
  ) {}

  public render(tick: IAggTrade) {
    console.log(tick)
  }
}
