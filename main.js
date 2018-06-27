var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var main;
(function (main) {
    var Main = /** @class */ (function () {
        function Main() {
            var canvas = document.getElementById("canvas");
            this.ctx = canvas.getContext("webgl");
            if (!this.ctx) {
                console.error("Unable to initialize WebGL.");
                return;
            }
            this.ctx.clearColor(0, 0, 0, 1);
            this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
            var shaderProgram = this.initShaderProgram(Shaders.vertexSource, Shaders.fragmentSource);
            this.programInfo = {
                program: shaderProgram,
                attribLocations: {
                    vertexPositions: this.ctx.getAttribLocation(shaderProgram, "aVertexPosition"),
                    vertexColor: this.ctx.getAttribLocation(shaderProgram, "aVertexColor")
                },
                uniformLocations: {
                    projectionMatrix: this.ctx.getUniformLocation(shaderProgram, "uProjectionMatrix"),
                    modelViewMatrix: this.ctx.getUniformLocation(shaderProgram, "uModelViewMatrix")
                }
            };
            this.shapes = [];
            this.shapes.push(new Square(this.ctx, -1, -1, 2, 2));
            this.shapes.push(new Square(this.ctx, 0, 0, 2, 2));
            this._prevTime = 0;
            requestAnimationFrame(this.render.bind(this));
        }
        Main.prototype.render = function (now) {
            now *= 0.001;
            var deltaTime = now - this._prevTime;
            this._prevTime = now;
            this.drawScene(deltaTime);
            requestAnimationFrame(this.render.bind(this));
        };
        Main.prototype.initShaderProgram = function (vsSource, fsSource) {
            var vertexShader = this.loadShader(this.ctx.VERTEX_SHADER, vsSource);
            var fragmentShader = this.loadShader(this.ctx.FRAGMENT_SHADER, fsSource);
            var shaderProgram = this.ctx.createProgram();
            this.ctx.attachShader(shaderProgram, vertexShader);
            this.ctx.attachShader(shaderProgram, fragmentShader);
            this.ctx.linkProgram(shaderProgram);
            if (!this.ctx.getProgramParameter(shaderProgram, this.ctx.LINK_STATUS)) {
                console.error("Unable to initialize shader program: " + this.ctx.getProgramInfoLog(shaderProgram));
            }
            return shaderProgram;
        };
        Main.prototype.loadShader = function (type, source) {
            var shader = this.ctx.createShader(type);
            this.ctx.shaderSource(shader, source);
            this.ctx.compileShader(shader);
            if (!this.ctx.getShaderParameter(shader, this.ctx.COMPILE_STATUS)) {
                console.error("An error occured compiling shader: " + this.ctx.getShaderInfoLog(shader));
                this.ctx.deleteShader(shader);
                return;
            }
            return shader;
        };
        Main.prototype.addSquare = function (vertexPositions) {
            var positionBuffer = this.ctx.createBuffer();
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, positionBuffer);
            this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(vertexPositions), this.ctx.STATIC_DRAW);
            var colorBuffer = this.ctx.createBuffer();
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, colorBuffer);
            var color = [
                1, 1, 1, 1,
                1, 0, 0, 1,
                0, 1, 0, 1,
                0, 0, 1, 1
            ];
            this.ctx.bufferData(this.ctx.ARRAY_BUFFER, new Float32Array(color), this.ctx.STATIC_DRAW);
            return {
                position: positionBuffer,
                color: colorBuffer
            };
        };
        Main.prototype.drawScene = function (deltaTime) {
            var _this = this;
            this.ctx.clearColor(0, 0, 0, 1);
            this.ctx.clearDepth(1);
            this.ctx.enable(this.ctx.DEPTH_TEST);
            this.ctx.depthFunc(this.ctx.LEQUAL);
            this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
            var camera = new Camera(new Vector3(0, 0, -6), 45, this.ctx.canvas.width, this.ctx.canvas.height, 0.1, 100);
            // camera.x += Math.cos(this._prevTime + deltaTime) * 1.5;
            // camera.y += Math.sin(this._prevTime + deltaTime) * 1.5;
            this.ctx.useProgram(this.programInfo.program);
            this.ctx.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, camera.projectionMatrix);
            this.ctx.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, camera.modelViewMatrix);
            this.shapes.forEach(function (shape) {
                _this.ctx.bindBuffer(_this.ctx.ARRAY_BUFFER, shape.positionBuffer);
                _this.ctx.vertexAttribPointer(_this.programInfo.attribLocations.vertexPositions, 2, _this.ctx.FLOAT, false, 0, 0);
                _this.ctx.enableVertexAttribArray(_this.programInfo.attribLocations.vertexPositions);
                _this.ctx.bindBuffer(_this.ctx.ARRAY_BUFFER, shape.colorBuffer);
                _this.ctx.vertexAttribPointer(_this.programInfo.attribLocations.vertexColor, 4, _this.ctx.FLOAT, false, 0, 0);
                _this.ctx.enableVertexAttribArray(_this.programInfo.attribLocations.vertexColor);
                _this.ctx.drawArrays(_this.ctx.TRIANGLE_STRIP, 0, shape.numVerts);
                // Move squares
                shape.x += Math.cos(_this._prevTime + deltaTime) * 0.005;
                shape.y += Math.sin(_this._prevTime + deltaTime) * 0.005;
            });
        };
        return Main;
    }());
    main.Main = Main;
    var Camera = /** @class */ (function () {
        function Camera(position, verticalFOVDegs, width, height, near, far) {
            this._vertFOV = verticalFOVDegs;
            this._width = width;
            this._height = height;
            this._near = near;
            this._far = far;
            this._position = position;
            this._projectionMatrix = new Matrix4x4();
            Matrix4x4.perspective(this._projectionMatrix, this.vertFOVRads, this.aspect, this.near, this.far);
            this._modelViewMatrix = new Matrix4x4();
            this.translate(position);
        }
        Object.defineProperty(Camera.prototype, "x", {
            get: function () { return this._position.x; },
            set: function (val) {
                this._position.x = val - this._position.x;
                this.translate(new Vector3(this._position.x, 0, 0));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "y", {
            get: function () { return this._position.y; },
            set: function (val) {
                this._position.y = val - this._position.y;
                this.translate(new Vector3(0, this._position.y, 0));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "z", {
            get: function () { return this._position.z; },
            set: function (val) {
                this._position.z = val - this._position.z;
                this.translate(new Vector3(0, 0, this._position.z));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "vertFOVDegs", {
            get: function () { return this._vertFOV; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "vertFOVRads", {
            get: function () { return this._vertFOV * Math.PI / 180; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "width", {
            get: function () { return this._width; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Camera.prototype, "height", {
            get: function () { return this._height; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(Camera.prototype, "aspect", {
            get: function () { return this._width / this._height; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "near", {
            get: function () { return this._near; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "far", {
            get: function () { return this._far; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "projectionMatrix", {
            get: function () { return this._projectionMatrix; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Camera.prototype, "modelViewMatrix", {
            get: function () { return this._modelViewMatrix; },
            enumerable: true,
            configurable: true
        });
        Camera.prototype.translate = function (position) {
            Matrix4x4.translate(this._modelViewMatrix, this._modelViewMatrix, position);
        };
        return Camera;
    }());
    main.Camera = Camera;
    var Square = /** @class */ (function () {
        function Square(ctx, x, y, width, height) {
            this.numVerts = 4;
            this._x = x;
            this._y = y;
            this._width = width;
            this._height = height;
            this._ctx = ctx;
            this._positionBuffer = ctx.createBuffer();
            this._ctx.bindBuffer(this._ctx.ARRAY_BUFFER, this._positionBuffer);
            this._ctx.bufferData(this._ctx.ARRAY_BUFFER, new Float32Array(this.getVertexPositions()), this._ctx.STATIC_DRAW);
            this._colorBuffer = ctx.createBuffer();
            this._ctx.bindBuffer(this._ctx.ARRAY_BUFFER, this._colorBuffer);
            var color = [
                1, 1, 1, 1,
                1, 0, 0, 1,
                0, 1, 0, 1,
                0, 0, 1, 1
            ];
            this._ctx.bufferData(this._ctx.ARRAY_BUFFER, new Float32Array(color), this._ctx.STATIC_DRAW);
        }
        Object.defineProperty(Square.prototype, "x", {
            get: function () { return this._x; },
            set: function (val) {
                this.translate(val - this._x, 0);
                this._x = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Square.prototype, "y", {
            get: function () { return this._y; },
            set: function (val) {
                this.translate(0, val - this._y);
                this._y = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Square.prototype, "positionBuffer", {
            get: function () { return this._positionBuffer; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Square.prototype, "colorBuffer", {
            get: function () { return this._colorBuffer; },
            enumerable: true,
            configurable: true
        });
        Square.prototype.translate = function (x, y) {
            this._x += x;
            this._y += y;
            this._ctx.bindBuffer(this._ctx.ARRAY_BUFFER, this._positionBuffer);
            this._ctx.bufferData(this._ctx.ARRAY_BUFFER, new Float32Array(this.getVertexPositions()), this._ctx.STATIC_DRAW);
        };
        // TODO : I don't understand the order of the vertices
        Square.prototype.getVertexPositions = function () {
            return [
                this._x + this._width, this._y + this._height,
                this._x, this._y + this._height,
                this._x + this._width, this._y,
                this._x, this._y // Top Left
            ];
        };
        return Square;
    }());
    main.Square = Square;
    var Shaders = /** @class */ (function () {
        function Shaders() {
        }
        Shaders.vertexSource = "\n            attribute vec4 aVertexPosition;\n            attribute vec4 aVertexColor;\n\n            uniform mat4 uModelViewMatrix;\n            uniform mat4 uProjectionMatrix;\n\n            varying lowp vec4 vColor;\n\n            void main() {\n                gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;\n                vColor = aVertexColor;\n            }\n        ";
        Shaders.fragmentSource = "\n            varying lowp vec4 vColor;\n\n            void main() {\n                gl_FragColor = vColor;\n            }\n        ";
        return Shaders;
    }());
    main.Shaders = Shaders;
    var ProgramInfo = /** @class */ (function () {
        function ProgramInfo() {
        }
        return ProgramInfo;
    }());
    main.ProgramInfo = ProgramInfo;
    var Buffers = /** @class */ (function () {
        function Buffers() {
        }
        return Buffers;
    }());
    main.Buffers = Buffers;
    var Matrix = /** @class */ (function (_super) {
        __extends(Matrix, _super);
        function Matrix(rows, cols) {
            var _this = _super.call(this, rows * cols) || this;
            _this._rows = rows;
            _this._cols = cols;
            return _this;
        }
        return Matrix;
    }(Array));
    main.Matrix = Matrix;
    var Matrix4x4 = /** @class */ (function (_super) {
        __extends(Matrix4x4, _super);
        function Matrix4x4() {
            var _this = _super.call(this, 4, 4) || this;
            _this[0] = 1;
            _this[1] = 0;
            _this[2] = 0;
            _this[3] = 0;
            _this[4] = 0;
            _this[5] = 1;
            _this[6] = 0;
            _this[7] = 0;
            _this[8] = 0;
            _this[9] = 0;
            _this[10] = 1;
            _this[11] = 0;
            _this[12] = 0;
            _this[13] = 0;
            _this[14] = 0;
            _this[15] = 1;
            return _this;
        }
        Matrix4x4.translate = function (out, a, vec) {
            out[12] = (a[0] * vec.x) + (a[4] * vec.y) + (a[8] * vec.z) + a[12];
            out[13] = (a[1] * vec.x) + (a[5] * vec.y) + (a[9] * vec.z) + a[13];
            out[14] = (a[2] * vec.x) + (a[6] * vec.y) + (a[10] * vec.z) + a[14];
            out[15] = (a[3] * vec.x) + (a[7] * vec.y) + (a[11] * vec.z) + a[15];
            return out;
        };
        Matrix4x4.perspective = function (out, verticalFOV, aspect, near, far) {
            var f = 1 / Math.tan(verticalFOV / 2);
            var nf = 1 / (near - far);
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
        };
        Matrix4x4.orthogonal = function (out, left, right, bottom, top, near, far) {
            var lr = 1 / (left - right);
            var bt = 1 / (bottom - top);
            var nf = 1 / (near - far);
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
        };
        return Matrix4x4;
    }(Matrix));
    main.Matrix4x4 = Matrix4x4;
    var Vector3 = /** @class */ (function () {
        function Vector3(x, y, z) {
            this.x = x;
            this.y = y;
            this.z = z;
        }
        return Vector3;
    }());
    main.Vector3 = Vector3;
})(main || (main = {}));
