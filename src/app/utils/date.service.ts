import { Injectable } from '@angular/core';
export const timeInterval = 1000 * 10;

@Injectable({ providedIn: 'root' })
export class DateService {
  public getUtcTime(date: Date) {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString();
  }

  public filterTime(time: Date) {
    return new Date(Math.floor(time.getTime() - (time.getTime() % timeInterval)));
  }

  public nextFilterTime(time: Date) {
    return new Date(Math.floor(time.getTime() - (time.getTime() % timeInterval)) + timeInterval);
  }
}
