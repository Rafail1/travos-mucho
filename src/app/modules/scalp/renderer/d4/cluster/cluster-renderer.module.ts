import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ClusterRendererComponent } from './cluster-renderer.component';
import { ClusterRendererService } from './cluster-renderer.service';

@NgModule({
  declarations: [ClusterRendererComponent],
  imports: [BrowserModule],
  exports: [ClusterRendererComponent],
  providers: [ClusterRendererService],
})
export class ClusterRendererModule {}
