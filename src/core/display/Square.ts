export class Square {

    public numVerts: number = 4;

    public x: number;
    public y: number;

    private _width: number;
    private _height: number;

    private _texture: WebGLTexture;
    public get texture(): WebGLTexture { return this._texture; } 
    
    private _positionBuffer: WebGLBuffer;
    public get positionBuffer(): WebGLBuffer { return this._positionBuffer; }

    private _textureCoordBuffer: WebGLBuffer;
    public get textureCoordBuffer(): WebGLBuffer { return this._textureCoordBuffer; }

    private _ctx: WebGLRenderingContext // I don't like having a reference to this on every object, maybe make it a global static/singleton?

    constructor(ctx: WebGLRenderingContext, x: number, y: number, width: number, height: number, texture: WebGLTexture) {
        this.x = x;
        this.y = y;
        this._width = width;
        this._height = height;
        this._texture = texture
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
    }

    public update(): void {
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
            this.x, this.y + this._height, // Bottom Left
            this.x + this._width, this.y + this._height, // Bottom Right
            this.x, this.y, // Top Left
            this.x + this._width, this.y, // Top Right
        ];
    }
}