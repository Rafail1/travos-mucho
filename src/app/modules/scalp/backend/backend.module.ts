import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BackendService } from './backend.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [BackendService],
})
export class BackendModule {}
