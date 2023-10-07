import { NgModule } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { BackendModule } from '../backend/backend.module';
import { LoaderService } from './loader.service';

@NgModule({
  imports: [BackendModule, StoreModule],
  providers: [LoaderService],
})
export class LoaderModule {}
