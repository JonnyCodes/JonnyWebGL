export class Vector3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public static minus(vecA: Vector3, vecB: Vector3): Vector3 {
        return new Vector3(
            vecA.x - vecB.x,
            vecA.y - vecB.y,
            vecA.z - vecB.z
        );
    }
}