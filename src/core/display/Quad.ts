export class Quad {

    public numVerts: number = 4;

    private _x: number;
    public get x(): number { return this._x + this._translationX; }
    public set x(val) { this._translationX = val - this._x; }
    private _y: number;
    public get y(): number { return this._y + this._translationY; }
    public set y(val) { this._translationY = val - this._y; }

    private _width: number;
    private _height: number;

    private _texture: WebGLTexture;
    public get texture(): WebGLTexture { return this._texture; } 
    
    private _positionBuffer: WebGLBuffer;
    public get positionBuffer(): WebGLBuffer { return this._positionBuffer; }

    public get translation(): number[] { return [this._translationX, this._translationY]; }
    private _translationX: number;
    private _translationY: number;

    private _textureCoordBuffer: WebGLBuffer;
    public get textureCoordBuffer(): WebGLBuffer { return this._textureCoordBuffer; }

    private _ctx: WebGLRenderingContext // I don't like having a reference to this on every object, maybe make it a global static/singleton?

    constructor(ctx: WebGLRenderingContext, x: number, y: number, width: number, height: number, texture: WebGLTexture) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
        this._texture = texture
        this._ctx = ctx;

        this._translationX = 0;
        this._translationY = 0;

        this._positionBuffer = ctx.createBuffer();
        this._ctx.bindBuffer(this._ctx.ARRAY_BUFFER, this._positionBuffer);
        this._ctx.bufferData(
            this._ctx.ARRAY_BUFFER,
            new Float32Array(this.getVertexPositions()),
            this._ctx.DYNAMIC_DRAW
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