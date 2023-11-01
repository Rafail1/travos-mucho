import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BarRendererModule } from './bar/bar-renderer.module';
import { D4Component } from './d4-renderer.component';
import { D4RendererService } from './d4-renderer.service';
import { ClusterRendererModule } from './cluster/cluster-renderer.module';
import { TickRendererModule } from './tick/tick-renderer.module';
import { GridModule } from './grid/grid.module';

@NgModule({
  declarations: [D4Component],
  imports: [
    BrowserModule,
    BarRendererModule,
    ClusterRendererModule,
    TickRendererModule,
    GridModule
  ],
  exports: [D4Component],
  providers: [D4RendererService],
})
export class D4RendererModule {}
