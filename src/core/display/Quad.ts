import { Vector2 } from "../math/Vector";

export class Quad {

    public numVerts: number = 4;

    public position: Vector2;

    private _width: number;
    private _height: number;

    private _texture: WebGLTexture;
    public get texture(): WebGLTexture { return this._texture; } 
    
    private _positionBuffer: WebGLBuffer;
    public get positionBuffer(): WebGLBuffer { return this._positionBuffer; }

    private _textureCoordBuffer: WebGLBuffer;
    public get textureCoordBuffer(): WebGLBuffer { return this._textureCoordBuffer; }

    constructor(ctx: WebGLRenderingContext, x: number, y: number, width: number, height: number, texture: WebGLTexture) {
        this.position = new Vector2(x, y);
        this._width = width;
        this._height = height;
        this._texture = texture

        this._positionBuffer = ctx.createBuffer();
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this._positionBuffer);
        ctx.bufferData(
            ctx.ARRAY_BUFFER,
            new Float32Array([
                0, height, // Bottom Left
                width, height, // Bottom Right
                0, 0, // Top Left
                width, 0 // Top Right
            ]),
            ctx.DYNAMIC_DRAW
        );

        this._textureCoordBuffer = ctx.createBuffer();
        ctx.bindBuffer(ctx.ARRAY_BUFFER, this._textureCoordBuffer);
        ctx.bufferData(
            ctx.ARRAY_BUFFER,
            new Float32Array([
                0, 1, // BL
                1, 1, // BR
                0, 0, // TL
                1, 0 // TR
            ]),
            ctx.STATIC_DRAW
        );
    }
}