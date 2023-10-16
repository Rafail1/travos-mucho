import { Injectable } from '@angular/core';
import { ConfigService } from 'src/app/config/config';
import { IAggTrade } from 'src/app/modules/backend/backend.service';
import { TickService } from '../../atoms/tick/tick.service';

@Injectable({ providedIn: 'root' })
export class TradesService {
  private config: any;
  constructor(
    private tickService: TickService,
    private configService: ConfigService
  ) {
    const { tick } = this.configService.getConfig('default');
    this.config = tick;
  }

  public render(data: IAggTrade[]) {
    for (const i in data) {
      this.tickService.render(data[i], Number(i));
    }
  }
}
