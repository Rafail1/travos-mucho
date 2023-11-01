import { Component, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';
import { IExchangeInfo } from '../../market-data/market-data.service';

@Component({
  selector: 'app-symbol-select',
  templateUrl: './symbol-select.component.html',
  styleUrls: ['./symbol-select.component.scss'],
})
export class SymbolSelectComponent implements ControlValueAccessor, OnInit {
  private _symbol: string | null | undefined;
  @Input()
  set symbol(value: string | null | undefined) {
    this._symbol = value;
    this.symbolFormControl.setValue(value);
  }

  get symbol(): string | null | undefined {
    return this._symbol;
  }

  @Input()
  symbols: Array<IExchangeInfo> | null | undefined;
  symbolFormControl = new FormControl();
  onChange = (symbol: string) => {};
  onTouched = () => {};
  touched = false;
  disabled = false;

  ngOnInit() {
    this.symbolFormControl.valueChanges.subscribe((value: string) => {
      if (value === this.symbol) {
        return;
      }

      this.markAsTouched();
      if (value && !this.disabled) {
        this._symbol = value;
        this.onChange(this._symbol);
      }
    });
  }

  writeValue(symbol: string) {
    this.symbol = symbol;
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }
}
