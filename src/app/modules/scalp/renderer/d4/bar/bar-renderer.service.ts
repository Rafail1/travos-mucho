import { Injectable } from '@angular/core';
import { IBar } from 'src/app/modules/backend/backend.service';

@Injectable()
export class BarRendererService {
  updateTextColor(key: string, textColor: string) {
    throw new Error('Method not implemented.');
  }
  updatePriceText(key: string, priceText: string) {
    throw new Error('Method not implemented.');
  }
  updateFillRectWidth(key: string, fillRectWidth: string) {
    throw new Error('Method not implemented.');
  }
  updateBackgroundColor(key: string, backgroundColor: string) {
    throw new Error('Method not implemented.');
  }
  updateVolume(arg0: string, arg1: string) {
    throw new Error('Method not implemented.');
  }
  update(data: IBar) {
    throw new Error('Method not implemented.');
  }
  add(data: IBar) {
    throw new Error('Method not implemented.');
  }
}
