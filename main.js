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
            this.camera = new OrthogonalCamera(new Vector3(0, 0, -1), 0.1, 100);
            var shaderProgram = this.initShaderProgram(Shaders.vertexSource, Shaders.fragmentSource);
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
            };
            this.shapes = [];
            this.shapes.push(new Square(this.ctx, 0, 0, 25, 25));
            this.shapes.push(new Square(this.ctx, (this.ctx.canvas.width - 50) / 2, (this.ctx.canvas.height - 50) / 2, 50, 50));
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
        Main.prototype.drawScene = function (deltaTime) {
            var _this = this;
            this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.clearColor(0, 0, 0, 1);
            this.ctx.clearDepth(1);
            this.ctx.enable(this.ctx.DEPTH_TEST);
            this.ctx.depthFunc(this.ctx.LEQUAL);
            this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
            // this.camera.x += Math.cos(this._prevTime + deltaTime) * 0.005;
            // this.camera.y += Math.sin(this._prevTime + deltaTime) * 0.005;
            this.ctx.useProgram(this.programInfo.program);
            this.ctx.uniformMatrix4fv(this.programInfo.uniformLocations.projectionMatrix, false, this.camera.projectionMatrix);
            this.ctx.uniformMatrix4fv(this.programInfo.uniformLocations.modelViewMatrix, false, this.camera.modelViewMatrix);
            this.shapes.forEach(function (shape) {
                _this.ctx.bindBuffer(_this.ctx.ARRAY_BUFFER, shape.positionBuffer);
                _this.ctx.vertexAttribPointer(_this.programInfo.attribLocations.vertexPositions, 2, _this.ctx.FLOAT, false, 0, 0);
                _this.ctx.enableVertexAttribArray(_this.programInfo.attribLocations.vertexPositions);
                _this.ctx.uniform2f(_this.programInfo.uniformLocations.resolutionVec2, _this.ctx.canvas.width, _this.ctx.canvas.height);
                _this.ctx.bindBuffer(_this.ctx.ARRAY_BUFFER, shape.colorBuffer);
                _this.ctx.vertexAttribPointer(_this.programInfo.attribLocations.vertexColor, 4, _this.ctx.FLOAT, false, 0, 0);
                _this.ctx.enableVertexAttribArray(_this.programInfo.attribLocations.vertexColor);
                _this.ctx.drawArrays(_this.ctx.TRIANGLE_STRIP, 0, shape.numVerts);
                // Move squares
                shape.x += Math.cos(_this._prevTime + deltaTime) * 0.5;
                shape.y += Math.sin(_this._prevTime + deltaTime) * 0.5;
            });
        };
        return Main;
    }());
    main.Main = Main;
    var Camera = /** @class */ (function () {
        function Camera(position, near, far) {
            this._position = position;
            this._near = near;
            this._far = far;
            this._projectionMatrix = new Matrix4x4();
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
    var OrthogonalCamera = /** @class */ (function (_super) {
        __extends(OrthogonalCamera, _super);
        function OrthogonalCamera(position, near, far, zoomScale) {
            if (zoomScale === void 0) { zoomScale = 1; }
            var _this = _super.call(this, position, near, far) || this;
            // These coords are in clipspace, should they be in pixels?
            Matrix4x4.orthogonal(_this._projectionMatrix, -1, 1, -1, 1, 0.1, 100);
            _this.zoomScale = zoomScale;
            return _this;
        }
        Object.defineProperty(OrthogonalCamera.prototype, "zoomScale", {
            get: function () { return this._zoomScale; },
            set: function (val) {
                this._zoomScale = val;
                Matrix4x4.scale(this._projectionMatrix, this._projectionMatrix, new Vector3(this._zoomScale, this._zoomScale, 1));
            },
            enumerable: true,
            configurable: true
        });
        ;
        return OrthogonalCamera;
    }(Camera));
    main.OrthogonalCamera = OrthogonalCamera;
    var PerspectiveCamera = /** @class */ (function (_super) {
        __extends(PerspectiveCamera, _super);
        function PerspectiveCamera(position, near, far, verticalFOVDegs, width, height) {
            var _this = _super.call(this, position, near, far) || this;
            _this._vertFOV = verticalFOVDegs;
            _this._width = width;
            _this._height = height;
            Matrix4x4.perspective(_this._projectionMatrix, _this.vertFOVRads, _this.aspect, _this._near, _this._far);
            return _this;
        }
        Object.defineProperty(PerspectiveCamera.prototype, "vertFOVDegs", {
            get: function () { return this._vertFOV; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerspectiveCamera.prototype, "vertFOVRads", {
            get: function () { return this._vertFOV * Math.PI / 180; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PerspectiveCamera.prototype, "width", {
            get: function () { return this._width; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(PerspectiveCamera.prototype, "height", {
            get: function () { return this._height; },
            enumerable: true,
            configurable: true
        });
        ;
        Object.defineProperty(PerspectiveCamera.prototype, "aspect", {
            get: function () { return this._width / this._height; },
            enumerable: true,
            configurable: true
        });
        return PerspectiveCamera;
    }(Camera));
    main.PerspectiveCamera = PerspectiveCamera;
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
        Shaders.vertexSource = "\n            attribute vec2 aVertexPosition;\n            attribute vec4 aVertexColor;\n\n            uniform vec2 uResolution;\n            uniform mat4 uModelViewMatrix;\n            uniform mat4 uProjectionMatrix;\n\n            varying lowp vec4 vColor;\n\n            void main() {\n                vec2 zeroToOne = aVertexPosition / uResolution;\n                vec2 zeroToTwo = zeroToOne * 2.0;\n                vec2 clipSpace = zeroToTwo - 1.0;\n                gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(clipSpace * vec2(1, -1), 0, 1);\n                vColor = aVertexColor;\n            }\n        ";
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
        Matrix4x4.scale = function (out, a, vec) {
            out[0] = a[0] * vec.x;
            out[5] = a[5] * vec.y;
            out[10] = a[10] * vec.z;
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
