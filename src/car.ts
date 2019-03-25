import GraphNode from './node';
import Edge from './edge';
import * as constants from './constants';
import Map from './map';

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
    scene: BABYLON.Scene
    turnDetails: {
        isTurning: boolean
        turnDegree: number
        degreeChange: number
        turnRadiusX: number
        turnRadiusZ: number
    }

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
        mesh: BABYLON.AbstractMesh,
        scene: BABYLON.Scene) {
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
            this.scene = scene;
            this.turnDetails = {
                isTurning: false,
                turnDegree: 0,
                degreeChange: constants.TURN_DEGREE_CHANGE,
                turnRadiusX: 0,
                turnRadiusZ: 0
            }
        }

    move() {
        let nextPosition = new BABYLON.Vector3(this.mesh.position.x,
            this.mesh.position.y,
            this.mesh.position.z);

        switch (this.edge.direction) {
            case constants.ABSOLUTE_DIRECTION.North:
                nextPosition.z += constants.CAR_SPEED;
                break;
            case constants.ABSOLUTE_DIRECTION.East:
                nextPosition.x += constants.CAR_SPEED;
                break;
            case constants.ABSOLUTE_DIRECTION.South:
                nextPosition.z -= constants.CAR_SPEED;
                break;
            case constants.ABSOLUTE_DIRECTION.West:
                nextPosition.x -= constants.CAR_SPEED;
                break;
            default:
                console.log("Error in finding direction the car should move");
        }

        if (!this.isVectorSame(this.mesh.position, this.edge.destination.pos.getVector3())) {
            this.isMoving = true;
            let anim = new BABYLON.Animation("carmovement", "position", constants.FRAMES_PER_SECOND, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            let keys = [{frame: 0,value: this.mesh.position}, {frame: 60,value: this.edge.destination.pos.getVector3()}];
            anim.setKeys(keys);
            this.mesh.animations.push(anim);
            let animation = this.scene.beginAnimation(this.mesh, 0, 60, false);

            animation.waitAsync().then(x => {
                const GAME_MAP = new Map();
                if (this.edge.id == 1) {
                    this.nextEdge = GAME_MAP.getEdge(2);
                    this.nextTurn = constants.RELATIVE_DIRECTION.Straight;
                } else if (this.edge.id == 7) {
                    this.nextEdge = GAME_MAP.getEdge(25);
                    this.nextTurn = constants.RELATIVE_DIRECTION.Right;
                } else if (this.edge.id == 10) {
                    this.nextEdge = GAME_MAP.getEdge(33);
                    this.nextTurn = constants.RELATIVE_DIRECTION.Left;
                } else if (this.edge.id == 28) {
                    this.nextEdge = GAME_MAP.getEdge(9);
                    this.nextTurn = constants.RELATIVE_DIRECTION.Right;
                } else if (this.edge.id == 14) {
                    this.nextEdge = GAME_MAP.getEdge(34);
                    this.nextTurn = constants.RELATIVE_DIRECTION.Right;
                } else if (this.edge.id == 17) {
                    this.nextEdge = GAME_MAP.getEdge(26);
                    this.nextTurn = constants.RELATIVE_DIRECTION.Left;
                }
                this.makeTurn();
            })
        } 
        // else {
        //     this.makeTurn();
        // }
        // else {
        //     this.isMoving = false;
        // }

        // if (this.isMoving == false) {
        //     this.idleTime += 0.1;
        //     setTimeout(this.move, 100);
        // }
    }

    makeTurn() {
        if (!this.turnDetails.isTurning) {
            this.turnDetails.isTurning = true;
            this.turnDetails.turnRadiusX = this.nextEdge.source.pos.x - this.mesh.position.x;
            this.turnDetails.turnRadiusZ = this.nextEdge.source.pos.z - this.mesh.position.z;
            this.turnDetails.turnDegree = 0;
        }

        let rotationAngle: number = 0 // Take straight as default
        if (this.nextTurn == constants.RELATIVE_DIRECTION.Left) {
            rotationAngle = -(this.turnDetails.degreeChange);
        } else if (this.nextTurn == constants.RELATIVE_DIRECTION.Right) {
            rotationAngle = this.turnDetails.degreeChange;
        }

        let changeInX: number = 0;
        let changeInZ: number = 0;

        if (this.edge.direction == constants.ABSOLUTE_DIRECTION.North || this.edge.direction == constants.ABSOLUTE_DIRECTION.South) {
            changeInX = this.turnDetails.turnRadiusX*(Math.cos(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree)) - Math.cos(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree + this.turnDetails.degreeChange)))
            changeInZ = this.turnDetails.turnRadiusZ*(Math.sin(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree + this.turnDetails.degreeChange)) - Math.sin(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree)))
        } else {
            changeInX = this.turnDetails.turnRadiusX*(Math.sin(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree + this.turnDetails.degreeChange)) - Math.sin(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree)))
            changeInZ = this.turnDetails.turnRadiusZ*(Math.cos(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree)) - Math.cos(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree + this.turnDetails.degreeChange)))
        }
        
        let nextPosition = new BABYLON.Vector3(this.mesh.position.x + changeInX, 0, this.mesh.position.z + changeInZ)

        let moveAnim = new BABYLON.Animation("carturnmove", "position", constants.FRAMES_PER_SECOND, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        let keys = [{frame : 0, value : this.mesh.position}, {frame : constants.TURN_FRAMES_PER_MOVEMENT, value : nextPosition}]; 
        moveAnim.setKeys(keys);
        this.mesh.animations.push(moveAnim);

        this.mesh.rotate(new BABYLON.Vector3(0,0,1), BABYLON.Tools.ToRadians(rotationAngle));
        
        let animation = this.scene.beginAnimation(this.mesh, 0, constants.TURN_FRAMES_PER_MOVEMENT, false);
        animation.waitAsync().then(x => {
            this.turnDetails.turnDegree += this.turnDetails.degreeChange;
            if (this.turnDetails.turnDegree == 90) {
                this.turnDetails.isTurning = false;
                this.edge.removeCar();
                this.nextEdge.addCar(this);
                this.edge = this.nextEdge;
                this.nextEdge = null;
                this.nextTurn = null;
            } else {
                this.makeTurn();
            }
        })
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