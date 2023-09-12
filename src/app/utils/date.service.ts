import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateService {
  public getUtcTime(date: Date) {
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString();
  }
}
