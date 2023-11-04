import { Injectable } from '@angular/core';
import { FIVE_MINUTES } from 'src/app/modules/player/player.component';
const TIME_WINDOW = 1000 * 30;

@Injectable({ providedIn: 'root' })
export class DateService {
  public getUtcTime(date: Date) {
    // const offset = date.getTimezoneOffset();
    return new Date(date.getTime()).toISOString();
  }

  public filterTime(time: Date) {
    return new Date(
      Math.floor(time.getTime() - (time.getTime() % TIME_WINDOW))
    );
  }

  public nextFilterTime(time: Date) {
    return new Date(
      Math.floor(time.getTime() - (time.getTime() % TIME_WINDOW)) + TIME_WINDOW
    );
  }

  public getMin5Slot(time: Date) {
    return (
      Math.floor(time.getTime() - (time.getTime() % FIVE_MINUTES)) +
      FIVE_MINUTES
    );
  }
}
