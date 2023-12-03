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
            fillAskColor: '#ffff00',
            fillBidColor: '#ff00ff',
            textColor: '#ffffff',
            backgroundColor: { ask: 'lightgreen', bid: '#FF7276' },
          },
          huge: {
            fillAskColor: '#00ffff',
            fillBidColor: '#0000ff',
            textColor: '#00ffff',
            backgroundColor: { ask: 'lightgreen', bid: '#FF7276' },
          },
        },
        barHeight: 16,
        clusterWidth: 60,
        fillCombinedColor: 'red',
        fillAskSpreadColor: '#987654',
        fillBidSpreadColor: '#456789',
        fillAskColor: 'green',
        fillBidColor: 'red',
        textColor: 'white',
        backgroundColor: { ask: 'lightgreen', bid: '#FF7276' },
        tickBuyColor: 'green',
        tickSellColor: 'red',
      },
    ],
    [
      'default',
      {
        glass: {
          width: 300,
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
            decPlaces: 5,
            shorten: true,
          },
          priceFormat: {
            decPlaces: 5,
            shorten: false,
          },
        },
        tick: {
          width: 300,
          height: 700,
          x: 300,
          y: 0,
          volumeFormat: {
            decPlaces: 5,
            shorten: true,
          },
        },
        cluster: {
          volumeFormat: {
            decPlaces: 5,
            shorten: true,
          },
        },
      },
    ],
  ]);

  public getConfig(key: string) {
    if (this.configMap.has(key)) {
      return this.configMap.get(key);
    } else {
      return this.configMap.get('default');
    }
  }
}
