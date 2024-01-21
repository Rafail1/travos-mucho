import { Injectable } from '@angular/core';
export const TIME_WINDOW = 1000 * 30;

@Injectable({ providedIn: 'root' })
export class DateService {
  public getUtcTime(date: Date) {
    return new Date(date.getTime()).toISOString();
  }

  public filterTime(time: Date, interval = TIME_WINDOW) {
    return new Date(Math.floor(time.getTime() - (time.getTime() % interval)));
  }

  public nextFilterTime(time: Date, interval = TIME_WINDOW) {
    return new Date(
      Math.floor(time.getTime() - (time.getTime() % interval)) + interval
    );
  }

  public prevFilterTime(time: Date, interval = TIME_WINDOW) {
    return new Date(
      Math.floor(time.getTime() - (time.getTime() % interval)) - interval
    );
  }
}
