import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { SymbolSelectComponent } from './symbol-select.component';
import { NgFor } from '@angular/common';

@NgModule({
  imports: [ReactiveFormsModule, NgFor],
  declarations: [SymbolSelectComponent],
  exports: [SymbolSelectComponent],
})
export class SymbolSelectModule {}
