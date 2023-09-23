import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MarketDataService } from './market-data.service';

@NgModule({
  imports: [HttpClientModule],
  providers: [MarketDataService],
})
export class MarketDataModule {}
