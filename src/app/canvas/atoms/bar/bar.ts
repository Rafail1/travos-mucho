export class Bar {
  public render(
    ctx: CanvasRenderingContext2D,
    {
      x,
      y,
      width,
      height,
      color = 'black',
    }: { width: number; height: number; x: number; y: number; color: string }
  ) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
  }
}
