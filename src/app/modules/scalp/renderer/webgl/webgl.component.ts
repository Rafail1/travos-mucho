import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-webgl',
  template: '',
})
export class WebGLRendererComponent implements OnInit {
  constructor(private renderer: Renderer2, private elRef: ElementRef) {}
  ngOnInit(): void {
    const canvas = this.renderer.createElement('canvas');
    this.elRef.nativeElement.appendChild(canvas);
    const gl = canvas.getContext('webgl');
  }
}
