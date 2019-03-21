import GraphNode from './node';
import Edge from './edge';
import * as constants from './constants';

export default class Car {
    source: GraphNode
    destination: GraphNode
    edge: Edge
    idleTime: number
    startTime: Date
    endTime: Date
    isMoving: boolean
    nextTurn: number
    nextEdge: Edge
    isPriority: boolean
    mesh: BABYLON.AbstractMesh

    constructor(source: GraphNode,
        destination: GraphNode,
        edge: Edge,
        idleTime: number,
        startTime: Date,
        endTime: Date,
        isMoving: boolean,
        nextTurn: number,
        nextEdge: Edge,
        isPriority: boolean,
        mesh: BABYLON.AbstractMesh) {
            this.source = source;
            this.destination = destination;
            this.edge = edge;
            this.idleTime = idleTime;
            this.startTime = startTime;
            this.endTime = endTime;
            this.isMoving = isMoving;
            this.nextTurn = nextTurn;
            this.nextEdge = nextEdge;
            this.isPriority = isPriority;
            this.mesh = mesh;
        }

    move(scene: BABYLON.Scene) {
        let nextPosition = new BABYLON.Vector3(this.mesh.position.x,
            this.mesh.position.y,
            this.mesh.position.z);

        switch (this.edge.direction) {
            case constants.ABSOLUTE_DIRECTION.North:
                nextPosition.z += 0.1;
                break;
            case constants.ABSOLUTE_DIRECTION.East:
                nextPosition.x += 0.1;
                break;
            case constants.ABSOLUTE_DIRECTION.South:
                nextPosition.z -= 0.1;
                break;
            case constants.ABSOLUTE_DIRECTION.West:
                nextPosition.x -= 0.1;
                break;
            default:
                console.log("Error in finding direction the car should move");
        }

        if (!this.isVectorSame(this.mesh.position, this.edge.destination.pos.getVector3())) {
            this.isMoving = true;
            var anim = new BABYLON.Animation("rando", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            var keys = [{frame: 0,value: this.mesh.position}, {frame: 5,value: nextPosition}];
            anim.setKeys(keys);
            this.mesh.animations.push(anim);
            let animation = scene.beginAnimation(this.mesh, 0, 5, false);

            animation.waitAsync().then(x => {
                this.move(scene);
            })
        }
        // else {
        //     this.isMoving = false;
        // }

        // if (this.isMoving == false) {
        //     this.idleTime += 0.1;
        // }
    }

    isVectorSame(vec1: BABYLON.Vector3, vec2: BABYLON.Vector3): boolean {
        if (this.areTwoNumbersEffectivelySame(vec1.x, vec2.x) &&
                this.areTwoNumbersEffectivelySame(vec1.y, vec2.y) &&
                this.areTwoNumbersEffectivelySame(vec1.z, vec2.z)) {
            return true;
        } else {
            return false;
        }
    }

    areTwoNumbersEffectivelySame(num1: number, num2: number): boolean {
        if (Math.abs(num1 - num2) <= 0.005) {
            return true;
        } else {
            return false;
        }
    }
}