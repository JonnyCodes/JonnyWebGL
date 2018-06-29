import { Vector3 } from "../math/Vector";
import { Matrix4x4 } from "../math/Matrix";
import { Camera } from "./Camera";

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