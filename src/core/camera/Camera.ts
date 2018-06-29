import { Vector3 } from "../math/Vector";
import { Matrix4x4 } from "../math/Matrix";

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