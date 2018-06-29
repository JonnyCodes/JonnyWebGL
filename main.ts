namespace main {

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
                    vertexColor: this.ctx.getAttribLocation(shaderProgram, "aVertexColor")
                },
                uniformLocations: {
                    resolutionVec2: this.ctx.getUniformLocation(shaderProgram, "uResolution"),
                    projectionMatrix: this.ctx.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                    modelViewMatrix: this.ctx.getUniformLocation(shaderProgram, "uModelViewMatrix")
                }
            }
            this.shapes = [];

            this.shapes.push(new Square(this.ctx, 0, 0, 25, 25));
            this.shapes.push(new Square(this.ctx, (this.ctx.canvas.width - 50) / 2, (this.ctx.canvas.height - 50) / 2, 50, 50));

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

            // this.camera.x += Math.cos(this._prevTime + deltaTime) * 0.005;
            // this.camera.y += Math.sin(this._prevTime + deltaTime) * 0.005;

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

                this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, shape.colorBuffer);
                this.ctx.vertexAttribPointer(
                    this.programInfo.attribLocations.vertexColor,
                    4,
                    this.ctx.FLOAT,
                    false,
                    0,
                    0
                );
                this.ctx.enableVertexAttribArray(this.programInfo.attribLocations.vertexColor);

                this.ctx.drawArrays(this.ctx.TRIANGLE_STRIP, 0, shape.numVerts);

                // Move squares
                shape.x += Math.cos(this._prevTime + deltaTime) * 0.5;
                shape.y += Math.sin(this._prevTime + deltaTime) * 0.5;
            });
        }
    }

    export class Camera {

        protected _position: Vector3;
        public get x(): number { return this._position.x; }
        public set x(val: number) {
            this._position.x = val - this._position.x;
            this.translate(new Vector3(this._position.x, 0, 0));
        }
        public get y(): number { return this._position.y; }
        public set y(val: number) {
            this._position.y = val - this._position.y;
            this.translate(new Vector3(0, this._position.y, 0));
        }
        public get z(): number { return this._position.z; }
        public set z(val: number) {
            this._position.z = val - this._position.z;
            this.translate(new Vector3(0, 0, this._position.z));
        }

        protected _near: number;
        public get near(): number { return this._near; }
        protected _far: number;
        public get far(): number { return this._far; }

        protected _projectionMatrix: Matrix4x4;
        public get projectionMatrix(): Matrix4x4 { return this._projectionMatrix; }
        protected _modelViewMatrix: Matrix4x4;
        public get modelViewMatrix(): Matrix4x4 { return this._modelViewMatrix; }

        constructor(position: Vector3, near: number, far: number) {
            this._position = position;
            this._near = near;
            this._far = far;

            this._projectionMatrix = new Matrix4x4();            

            this._modelViewMatrix = new Matrix4x4();
            this.translate(position);
        }

        public translate(position: Vector3): void {
            Matrix4x4.translate(
                this._modelViewMatrix,
                this._modelViewMatrix,
                position
            );
        }
    }

    export class OrthogonalCamera extends Camera {

        private _zoomScale: number;
        public get zoomScale(): number { return this._zoomScale; }
        public set zoomScale(val: number) {
            this._zoomScale = val;

            Matrix4x4.scale(
                this._projectionMatrix,
                this._projectionMatrix,
                new Vector3(this._zoomScale, this._zoomScale, 1)
            );
        };

        constructor(position: Vector3, near: number, far: number, zoomScale: number = 1) {
            super(position, near, far);

            // These coords are in clipspace, should they be in pixels?
            Matrix4x4.orthogonal(
                this._projectionMatrix,
                -1, 1,
                -1, 1,
                0.1, 100
            );

            this.zoomScale = zoomScale;
        }
    }

    export class PerspectiveCamera extends Camera {

        private _vertFOV: number;
        public get vertFOVDegs(): number { return this._vertFOV; }
        public get vertFOVRads(): number { return this._vertFOV * Math.PI / 180; }

        private _width: number;
        public get width(): number { return this._width };
        private _height: number;
        public get height(): number { return this._height };
        public get aspect(): number { return this._width / this._height; }

        constructor(position: Vector3, near: number, far: number,  verticalFOVDegs: number, width: number, height: number) {
            super(position, near, far);

            this._vertFOV = verticalFOVDegs;
            this._width = width;
            this._height = height;

            Matrix4x4.perspective(
                this._projectionMatrix,
                this.vertFOVRads,
                this.aspect,
                this._near,
                this._far
            );
        }
    }

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

    export class Shaders {
        public static vertexSource: string = `
            attribute vec2 aVertexPosition;
            attribute vec4 aVertexColor;

            uniform vec2 uResolution;
            uniform mat4 uModelViewMatrix;
            uniform mat4 uProjectionMatrix;

            varying lowp vec4 vColor;

            void main() {
                vec2 zeroToOne = aVertexPosition / uResolution;
                vec2 zeroToTwo = zeroToOne * 2.0;
                vec2 clipSpace = zeroToTwo - 1.0;
                gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(clipSpace * vec2(1, -1), 0, 1);
                vColor = aVertexColor;
            }
        `;

        public static fragmentSource: string = `
            varying lowp vec4 vColor;

            void main() {
                gl_FragColor = vColor;
            }
        `;
    }

    export class ProgramInfo {
        public program: WebGLProgram;
        public attribLocations: { vertexPositions: number, vertexColor: number };
        public uniformLocations: { 
            resolutionVec2?: WebGLUniformLocation,
            projectionMatrix: WebGLUniformLocation,
            modelViewMatrix: WebGLUniformLocation
        };
    }

    export class Matrix extends Array {
        protected _rows: number;
        protected _cols: number;

        constructor(rows: number, cols: number) {
            super(rows * cols);

            this._rows = rows;
            this._cols = cols;

            // Set to identity matrix
            for (let i = 0; i < this._rows; i++) {
                for (let j = 0; j < this._cols; j++) {
                    this[i + j] = i === j;
                }
            }
        }
    }

    export class Matrix4x4 extends Matrix {

        constructor() {
            super(4, 4);

            this[0] = 1;
            this[1] = 0;
            this[2] = 0;
            this[3] = 0;
            this[4] = 0;
            this[5] = 1;
            this[6] = 0;
            this[7] = 0;
            this[8] = 0;
            this[9] = 0;
            this[10] = 1;
            this[11] = 0;
            this[12] = 0;
            this[13] = 0;
            this[14] = 0;
            this[15] = 1;
        }

        public static translate(out: Matrix4x4, a: Matrix4x4, vec: Vector3): Matrix4x4 {
            out[12] = (a[0] * vec.x) + (a[4] * vec.y) + (a[8] * vec.z) + a[12];
            out[13] = (a[1] * vec.x) + (a[5] * vec.y) + (a[9] * vec.z) + a[13];
            out[14] = (a[2] * vec.x) + (a[6] * vec.y) + (a[10] * vec.z) + a[14];
            out[15] = (a[3] * vec.x) + (a[7] * vec.y) + (a[11] * vec.z) + a[15];

            return out;
        }

        public static scale(out: Matrix4x4, a: Matrix4x4, vec: Vector3): Matrix4x4 {
            out[0] = a[0] * vec.x;
            out[5] = a[5] * vec.y;
            out[10] = a[10] * vec.z;

            return out;
        }

        public static perspective(out: Matrix4x4, verticalFOV: number, aspect: number, near: number, far: number): Matrix4x4 {
            const f: number = 1 / Math.tan(verticalFOV / 2);
            const nf: number = 1 / (near - far);

            out[0] = f / aspect;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = f;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = (far + near) * nf;
            out[11] = -1;
            out[12] = 0;
            out[13] = 0;
            out[14] = 2 * far * near * nf;
            out[15] = 0;

            return out;
        }

        public static orthogonal(out: Matrix4x4, left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix4x4 {
            const lr: number = 1 / (left - right);
            const bt: number = 1 / (bottom - top);
            const nf: number = 1 / (near - far);

            out[0] = -2 * lr;
            out[1] = 0;
            out[2] = 0;
            out[3] = 0;
            out[4] = 0;
            out[5] = -2 * bt;
            out[6] = 0;
            out[7] = 0;
            out[8] = 0;
            out[9] = 0;
            out[10] = 2 * nf;
            out[11] = 0;
            out[12] = (left + right) * lr;
            out[13] = (top + bottom) * bt;
            out[14] = (near + far) * nf;
            out[15] = 1;

            return out;
        }
    }

    export class Vector3 {
        public x: number;
        public y: number;
        public z: number;

        constructor(x: number, y: number, z: number) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
    }
}
