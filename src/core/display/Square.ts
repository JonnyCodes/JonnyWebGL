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

    private _textureCoordBuffer: WebGLBuffer;
    public get textureCoordBuffer(): WebGLBuffer { return this._textureCoordBuffer; }

    private _ctx: WebGLRenderingContext // I don't like having a reference to this on every object, maybe make it a global static/singleton?

    constructor(ctx: WebGLRenderingContext, x: number, y: number, width: number, height: number, image: HTMLImageElement) {
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

        this._textureCoordBuffer = ctx.createBuffer();
        this._ctx.bindBuffer(this._ctx.ARRAY_BUFFER, this._textureCoordBuffer);
        this._ctx.bufferData(
            this._ctx.ARRAY_BUFFER,
            new Float32Array([
                0, 1, // BL
                1, 1, // BR
                0, 0, // TL
                1, 0 // TR
            ]),
            this._ctx.STATIC_DRAW
        );

        var texture = this._ctx.createTexture();
        this._ctx.bindTexture(this._ctx.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        this._ctx.texParameteri(this._ctx.TEXTURE_2D, this._ctx.TEXTURE_WRAP_S, this._ctx.CLAMP_TO_EDGE);
        this._ctx.texParameteri(this._ctx.TEXTURE_2D, this._ctx.TEXTURE_WRAP_T, this._ctx.CLAMP_TO_EDGE);
        this._ctx.texParameteri(this._ctx.TEXTURE_2D, this._ctx.TEXTURE_MIN_FILTER, this._ctx.NEAREST);
        this._ctx.texParameteri(this._ctx.TEXTURE_2D, this._ctx.TEXTURE_MAG_FILTER, this._ctx.NEAREST);

        // Upload the image into the texture.
        this._ctx.texImage2D(this._ctx.TEXTURE_2D, 0, this._ctx.RGBA, this._ctx.RGBA, this._ctx.UNSIGNED_BYTE, image);
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