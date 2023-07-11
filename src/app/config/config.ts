import { Injectable } from '@angular/core';
export const STYLE_THEME_KEY = 'theme';
@Injectable({ providedIn: 'root' })
export class ConfigService {
  private configMap = new Map<string, any>([
    [
      STYLE_THEME_KEY,
      {
        thresholds: {
          big: {
            fillAskColor: '#ff0000',
            fillBidColor: '#ff0000',
            textColor: '#ffffff',
            backgroundColor: '#00FF00',
          },
          huge: {
            fillAskColor: '#0000ff',
            fillBidColor: '#0000ff',
            textColor: '#00ffff',
            backgroundColor: '#0000dd',
          },
        },
        barHeight: 16,
        fillCombinedColor: 'red',
        fillAskSpreadColor: '#987654',
        fillBidSpreadColor: '#456789',
        fillAskColor: '#654321',
        fillBidColor: '#123321',
        textColor: 'white',
        backgroundColor: '#123456',
      },
    ],
    [
      'foo',
      {
        glass: {
          width: 500,
          height: 700,
          x: 0,
          y: 0,
        },
        thresholds: {
          big: 200_000,
          huge: 800_000,
        },
        bars: {
          volumeFormat: {
            max: 1_000_000,
            decPlaces: 2,
            shorten: true,
          },
          priceFormat: {
            decPlaces: 2,
            shorten: false,
          },
        },
      },
    ],
  ]);

  public getConfig(key: string) {
    return this.configMap.get(key);
  }
}
