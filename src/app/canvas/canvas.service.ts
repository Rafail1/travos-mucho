import { Injectable } from '@angular/core';

@Injectable()
export class CanvasService {
  getCanvas(nativeElement: HTMLCanvasElement) {
    const canvas = nativeElement.getContext('2d');
    if (!canvas) {
      throw `can't getContext`;
    }
    return canvas
  }
}
