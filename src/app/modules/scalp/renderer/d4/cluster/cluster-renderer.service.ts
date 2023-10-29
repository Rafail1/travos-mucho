import { Injectable } from '@angular/core';
import { IClusterData } from '../d4-renderer.service';

@Injectable()
export class ClusterRendererService {
  render(data: IClusterData | undefined) {
    throw new Error('Method not implemented.');
  }
}
