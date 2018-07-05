export class Vector2 {

    public get x(): number { return this._points[0] };
    public set x(val: number) { this._points[0] = val; }

    public get y(): number { return this._points[1] };
    public set y(val: number) { this._points[1] = val; }

    protected _points: number[];

    constructor(x: number = 0, y: number = 0) {
        this._points = [x, y];
    }

    public asArray(): number[] {
        return this._points;
    }
}

export class Vector3 extends Vector2 {
       
    public get z(): number { return this._points[2] };
    public set z(val: number) { this._points[2] = val; }

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        super(x, y);
        this._points[2] = z;
    }

    public static minus(vecA: Vector3, vecB: Vector3): Vector3 {
        return new Vector3(
            vecA.x - vecB.x,
            vecA.y - vecB.y,
            vecA.z - vecB.z
        );
    }
}

export class Vector4 extends Vector3 {

    public get w(): number { return this._points[3] };
    public set w(val: number) { this._points[3] = val; }

    // Alternate getters for colors
    public get r(): number { return this._points[0] };
    public set r(val: number) { this._points[0] = val; }
    
    public get g(): number { return this._points[1] };
    public set g(val: number) { this._points[1] = val; }

    public get b(): number { return this._points[2] };
    public set b(val: number) { this._points[2] = val; }

    public get a(): number { return this._points[3] };
    public set a(val: number) { this._points[3] = val; }

    constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
        super(x, y, z);
        this._points[3] = w;
    }
}