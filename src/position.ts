export default class Position {
    x: number;
    z: number;

    constructor(x: number, z: number) {
        this.x = x;
        this.z = z;
    }

    getVector3(): BABYLON.Vector3 {
        return new BABYLON.Vector3(this.x, 0, this.z);
    }
}