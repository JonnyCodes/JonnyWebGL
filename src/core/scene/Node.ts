import { Matrix4x4 } from "../math/Matrix";

export class Node {

    public parent: Node;

    private _children: Node[];
    private _localMatrix: Matrix4x4;
    private _worldMatrix: Matrix4x4;

    constructor() {
        this._children = [];
        this._localMatrix = new Matrix4x4();
        this._worldMatrix = new Matrix4x4();
    }

    public setParent(parent: Node): Node {
        if (this.parent) {
            this.parent.removeChild(this);
        }

        if (parent) {
            parent.addChild(this);
        }

        return parent;
    }

    public addChild(child: Node): Node {

        if (this._children.indexOf(child) >= 0) {
            this.removeChild(child);
        }

        this._children.push(child);
        child.parent = this;

        return child;
    }

    public removeChild(child: Node): Node {

        const childIndex: number = this._children.indexOf(child)
        if (childIndex >= 0) {
            this._children.splice(childIndex, 1);
            child.parent = null;
        }

        return child;
    }

    public updateWorldMatrix(parentWorldMatrix: Matrix4x4): void {
        if (parentWorldMatrix) {
            Matrix4x4.multiply(this._worldMatrix, this._localMatrix, parentWorldMatrix);
        }

        this._children.forEach(child => {
            child.updateWorldMatrix(this._worldMatrix);
        });
    }
}