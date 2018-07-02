import { OrthogonalCamera } from "./core/camera/OrthogonalCamera";
import { Square } from "./core/display/Square";
import { Vector3 } from "./core/math/Vector";
import { Shaders } from "./core/shaders/Shaders";
import { MathUtil } from "./core/math/MathUtil";

export class Main {

    private ctx: WebGLRenderingContext;
    private camera: OrthogonalCamera;
    private programInfo: ProgramInfo;
    private shapes: Square[];

    private _prevTime: number;

    constructor() {
        const canvas: HTMLCanvasElement = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = canvas.getContext("webgl");

        if (!this.ctx) {
            console.error("Unable to initialize WebGL.");
            return;
        }

        this.ctx.enable(this.ctx.CULL_FACE);
        this.ctx.clearColor(0, 0, 0, 1);
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);

        this.camera = new OrthogonalCamera(
            new Vector3(0, 0, -1),
            0.1,
            100
        );

        const shaderProgram: WebGLProgram = this.initShaderProgram(Shaders.vertexSource, Shaders.fragmentSource);
        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPositions: this.ctx.getAttribLocation(shaderProgram, "aVertexPosition"),
                textureCoord: this.ctx.getAttribLocation(shaderProgram, "aTextureCoord")
            },
            uniformLocations: {
                resolutionVec2: this.ctx.getUniformLocation(shaderProgram, "uResolution"),
                projectionMatrix: this.ctx.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                modelViewMatrix: this.ctx.getUniformLocation(shaderProgram, "uModelViewMatrix")
            }
        }
        this.shapes = [];
        

        // TODO: Load images and create textures, store them in an object (key = url?)
        const testImage: HTMLImageElement = document.getElementById("testImage") as HTMLImageElement;
        const texture = this.ctx.createTexture();
        this.ctx.bindTexture(this.ctx.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_S, this.ctx.CLAMP_TO_EDGE);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_WRAP_T, this.ctx.CLAMP_TO_EDGE);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MIN_FILTER, this.ctx.NEAREST);
        this.ctx.texParameteri(this.ctx.TEXTURE_2D, this.ctx.TEXTURE_MAG_FILTER, this.ctx.NEAREST);

        // Upload the image into the texture.
        this.ctx.texImage2D(this.ctx.TEXTURE_2D, 0, this.ctx.RGBA, this.ctx.RGBA, this.ctx.UNSIGNED_BYTE, testImage);

        for (let i = 0; i < 5000; i++) {
            const randWidth: number = MathUtil.getRandInt(10, 100);
            const randHeight: number = MathUtil.getRandInt(10, 100);

            this.shapes.push(new Square(
                this.ctx,
                MathUtil.getRandInt(0, this.ctx.canvas.width - randWidth),
                MathUtil.getRandInt(0, this.ctx.canvas.width - randHeight),
                randWidth,
                randHeight,
                texture
            ));
        }

        this._prevTime = 0;

        requestAnimationFrame(this.render.bind(this));
    }

    private render(now: number): void {
        now *= 0.001;
        const deltaTime: number = now - this._prevTime;
        this._prevTime = now;

        this.drawScene(deltaTime);

        requestAnimationFrame(this.render.bind(this));
    }

    private initShaderProgram(vsSource: string, fsSource: string): WebGLProgram {
        const vertexShader: WebGLShader = this.loadShader(this.ctx.VERTEX_SHADER, vsSource);
        const fragmentShader: WebGLShader = this.loadShader(this.ctx.FRAGMENT_SHADER, fsSource);

        const shaderProgram: WebGLProgram = this.ctx.createProgram();
        this.ctx.attachShader(shaderProgram, vertexShader);
        this.ctx.attachShader(shaderProgram, fragmentShader);
        this.ctx.linkProgram(shaderProgram);

        if (!this.ctx.getProgramParameter(shaderProgram, this.ctx.LINK_STATUS)) {
            console.error("Unable to initialize shader program: " + this.ctx.getProgramInfoLog(shaderProgram));
        }

        return shaderProgram;
    }

    private loadShader(type: number, source: string): WebGLShader {
        const shader: WebGLShader = this.ctx.createShader(type);

        this.ctx.shaderSource(shader, source);
        this.ctx.compileShader(shader);

        if (!this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS)) {
            console.error("An error occured compiling shader: " + this.ctx.getShaderInfoLog(shader));
            this.ctx.deleteShader(shader);
            return;
        }

        return shader;
    }

    private drawScene(deltaTime: number): void {
        this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.clearColor(0, 0, 0, 1);
        this.ctx.clearDepth(1);
        this.ctx.enable(this.ctx.DEPTH_TEST);
        this.ctx.depthFunc(this.ctx.LEQUAL);

        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);

        this.ctx.useProgram(this.programInfo.program);

        this.ctx.uniformMatrix4fv(
            this.programInfo.uniformLocations.projectionMatrix,
            false,
            this.camera.projectionMatrix
        );
        this.ctx.uniformMatrix4fv(
            this.programInfo.uniformLocations.modelViewMatrix,
            false,
            this.camera.modelViewMatrix
        );

        this.shapes.forEach(shape => {

            this.ctx.activeTexture(this.ctx.TEXTURE0);
            this.ctx.bindTexture(this.ctx.TEXTURE_2D, shape.texture);

            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, shape.positionBuffer);
            this.ctx.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPositions,
                2,
                this.ctx.FLOAT,
                false,
                0,
                0
            );
            this.ctx.enableVertexAttribArray(this.programInfo.attribLocations.vertexPositions);

            this.ctx.uniform2f(this.programInfo.uniformLocations.resolutionVec2, this.ctx.canvas.width, this.ctx.canvas.height);

            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, shape.textureCoordBuffer);
            this.ctx.vertexAttribPointer(
                this.programInfo.attribLocations.textureCoord,
                2,
                this.ctx.FLOAT,
                false,
                0,
                0
            );
            this.ctx.enableVertexAttribArray(this.programInfo.attribLocations.textureCoord);

            this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, shape.numVerts);

            // Move squares
            shape.x += Math.cos(this._prevTime + deltaTime) * 0.5;
            shape.y += Math.sin(this._prevTime + deltaTime) * 0.5;
            shape.update();
        });
    }
}

export class ProgramInfo {
    public program: WebGLProgram;
    public attribLocations: { vertexPositions: number, textureCoord: number };
    public uniformLocations: { 
        resolutionVec2: WebGLUniformLocation,
        projectionMatrix: WebGLUniformLocation,
        modelViewMatrix: WebGLUniformLocation
    };
}

// TODO: Stop using parcelJS

// const loader: Loader = new Loader(
//     [
//         "./img/uv_test.jpg"
//     ],
//     (images: HTMLImageElement[]) => {
//         new Main(images);
//     }
// );

// loader.start();


let image: HTMLImageElement = document.getElementById("testImage") as HTMLImageElement;
image.onload = () => {
    new Main();
};