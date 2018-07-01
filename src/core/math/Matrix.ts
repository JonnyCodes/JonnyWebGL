import { Vector3 } from "./Vector";

export class Matrix extends Array {
    protected _numRows: number;
    protected _numCols: number;

    constructor(rows: number, cols: number) {
        super(rows * cols);

        this._numRows = rows;
        this._numCols = cols;

        // Set to identity matrix
        for (let i = 0; i < this._numRows; i++) {
            for (let j = 0; j < this._numCols; j++) {
                this[i * this._numCols + j] = Number(i === j);
            }
        }
    }
}

export class Matrix4x4 extends Matrix {

    constructor() {
        super(4, 4);
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