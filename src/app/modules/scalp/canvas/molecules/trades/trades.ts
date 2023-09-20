import { Injectable } from '@angular/core';
import { ConfigService, STYLE_THEME_KEY } from 'src/app/config/config';
import { TickService } from '../../atoms/tick/tick.service';
import { ITick } from './trades.interface';

@Injectable({ providedIn: 'root' })
export class TradesService {
  private config: any;
  constructor(
    private tickService: TickService,
    private configService: ConfigService
  ) {
    const { tick } = this.configService.getConfig('default');
    this.config = { tick };
  }

  public render(data: ITick) {
    const { tick } = this.config;
    this.tickService.render();
  }

}
