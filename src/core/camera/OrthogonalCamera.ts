import { Vector3 } from "../math/Vector";
import { Matrix4x4 } from "../math/Matrix";
import { Camera } from "./Camera";

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

        // These coords are in clipspace, I want them in pixels
        Matrix4x4.orthogonal(
            this._projectionMatrix,
            -1, 1,
            -1, 1,
            0.1, 100
        );

        this.zoomScale = zoomScale;
    }
}