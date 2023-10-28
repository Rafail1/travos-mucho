import { Injectable } from '@angular/core';
import { IAggTrade } from 'src/app/modules/backend/backend.service';

@Injectable()
export class D4RendererService {
  constructor() {}

  renderBar(data: {
    depth: [string, string];
    backgroundColor: string;
    fillRectWidth: string;
    priceText: string;
    textColor: string;
    volumeText: string;
  }) {
    throw new Error('Method not implemented.');
  }

  renderTick(data: IAggTrade) {
    throw new Error('Method not implemented.');
  }
}
