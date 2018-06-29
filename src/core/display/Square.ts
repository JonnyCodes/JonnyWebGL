export class Square {

    public numVerts: number = 4;

    private _x: number;
    public get x(): number { return this._x; }
    public set x(val: number) {
        this.translate(val - this._x, 0);
        this._x = val;
    }

    private _y: number;
    public get y(): number { return this._y; }
    public set y(val: number) {
        this.translate(0, val - this._y);
        this._y = val;
    }

    private _width: number;
    private _height: number;
    
    private _positionBuffer: WebGLBuffer;
    public get positionBuffer(): WebGLBuffer { return this._positionBuffer; }

    private _colorBuffer: WebGLBuffer;
    public get colorBuffer(): WebGLBuffer { return this._colorBuffer; }

    private _ctx: WebGLRenderingContext // I don't like having a reference to this on every object, maybe make it a global static?

    constructor(ctx: WebGLRenderingContext, x: number, y: number, width: number, height: number) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._ctx = ctx;

        this._positionBuffer = ctx.createBuffer();
        this._ctx.bindBuffer(this._ctx.ARRAY_BUFFER, this._positionBuffer);
        this._ctx.bufferData(
            this._ctx.ARRAY_BUFFER,
            new Float32Array(this.getVertexPositions()),
            this._ctx.STATIC_DRAW
        );

        this._colorBuffer = ctx.createBuffer();
        this._ctx.bindBuffer(this._ctx.ARRAY_BUFFER,  this._colorBuffer);

        const color: number[] = [
            1, 1, 1, 1, // vertex 0 = Bottom Left
            1, 0, 0, 1, // vertex 1 = Bottom Right
            0, 1, 0, 1, // vertex 2 = Top Left
            0, 0, 1, 1, // vertex 4 = Top Right
        ];
        this._ctx.bufferData(
            this._ctx.ARRAY_BUFFER,
            new Float32Array(color),
            this._ctx.STATIC_DRAW
        );
    }

    private translate(x: number, y: number): void {
        this._x += x;
        this._y += y;

        this._ctx.bindBuffer(this._ctx.ARRAY_BUFFER, this._positionBuffer);
        this._ctx.bufferData(
            this._ctx.ARRAY_BUFFER,
            new Float32Array(this.getVertexPositions()),
            this._ctx.STATIC_DRAW
        );
    }

    // Draw in CCW order
    private getVertexPositions(): number[] {
        return [
            this._x, this._y + this._height, // Bottom Left
            this._x + this._width, this._y + this._height, // Bottom Right
            this._x, this._y, // Top Left
            this._x + this._width, this._y, // Top Right
        ];
    }
}