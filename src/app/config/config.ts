import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  private configMap = new Map<string, any>([
    [
      'foo',
      {
        threshold: [
          {
            value: 200_000,
            fillColor: '#ff0000',
            textColor: '#ffffff',
            backgroundColor: '#00FF00',
          },
          {
            value: 400_000,
            fillColor: '#00ff00',
            textColor: '#0000ff',
            backgroundColor: '#00dd00',
          },
          {
            value: 800_000,
            fillColor: '#0000ff',
            textColor: '#00ffff',
            backgroundColor: '#0000dd',
          },
        ],
        max: 1_000_000,
        width: 500,
        height: 16,
        fillColor: 'green',
        textColor: 'white',
        backgroundColor: 'yellow',
      },
    ],
  ]);
  public getConfig(key: string) {
    return this.configMap.get(key);
  }
}
