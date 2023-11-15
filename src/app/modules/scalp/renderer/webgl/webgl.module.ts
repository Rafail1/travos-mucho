import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BarRendererModule } from '../d4/bar/bar-renderer.module';
import { ClusterRendererModule } from '../d4/cluster/cluster-renderer.module';
import { GridModule } from '../d4/grid/grid.module';
import { TickRendererModule } from '../d4/tick/tick-renderer.module';
import { WebGLRendererComponent } from './webgl.component';
import { WebGLRendererService } from './webgl.service';
import { BEService } from './be.service';

@NgModule({
  declarations: [WebGLRendererComponent],
  imports: [
    BrowserModule,
    BarRendererModule,
    ClusterRendererModule,
    TickRendererModule,
    GridModule,
  ],
  exports: [WebGLRendererComponent],
  providers: [BEService, WebGLRendererService],
})
export class WebGLRendererModule {}
