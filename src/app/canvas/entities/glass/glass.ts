export class Glass {
  public render(
    ctx: CanvasRenderingContext2D,
    {
      x,
      y,
      width,
      height,
    }: { width: number; height: number; x: number; y: number }
  ) {
    ctx.strokeRect(x, y, width, height);
  }
}
