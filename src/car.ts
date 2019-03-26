import GraphNode from './node';
import Edge from './edge';
import * as constants from './constants';
import Position from './position';

export default class Car {
    id: number
    source: GraphNode
    destination: GraphNode
    edge: Edge
    edgeCarNumber: number
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

    constructor(id: number,
        source: GraphNode,
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
            this.id = id;
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
        // Find next position to move to
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

        if (!this.isVectorSame(this.mesh.position, this.getCollisionProofDestination())) {
            // Car can still move so create the animation to move
            this.isMoving = true;

            let anim = new BABYLON.Animation("carmovement", "position", constants.FRAMES_PER_SECOND, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
            let keys = [{frame: 0,value: this.mesh.position}, {frame: constants.FRAMES_PER_MOVEMENT,value: nextPosition}];
            anim.setKeys(keys);
            this.mesh.animations.push(anim);
            let animation = this.scene.beginAnimation(this.mesh, 0, constants.FRAMES_PER_MOVEMENT, false);

            animation.waitAsync().then(x => {
                this.move();
            });
        } else {
            // Car can no longer move (either due to collision or it reached the end of the edge)
            this.isMoving = false;

            // A hardcoded paths for the cars to follow (Will be removed later)
            if (this.edge.id == 1) {
                this.nextEdge = constants.GAME_MAP.getEdge(24);
                this.nextTurn = constants.RELATIVE_DIRECTION.Right;
            } else if (this.edge.id == 24) {
                this.nextEdge = constants.GAME_MAP.getEdge(25);
                this.nextTurn = constants.RELATIVE_DIRECTION.Straight;
            } else if (this.edge.id == 25) {
                this.nextEdge = constants.GAME_MAP.getEdge(14);
                this.nextTurn = constants.RELATIVE_DIRECTION.Left;
            } else if (this.edge.id == 14) {
                this.nextEdge = constants.GAME_MAP.getEdge(34);
                this.nextTurn = constants.RELATIVE_DIRECTION.Right;
            }

            // If reached end of the edge, make the turn (Will be removed later as making turn
            // will be called by the traffic controllers)
            if (this.isVectorSame(this.mesh.position, this.edge.destination.pos.getVector3())) {
                this.makeTurn();
            }
        }

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
            this.edge.removeCar();

            // // Tell cars behind it to start moving forward
            for (let car of this.edge.cars) {
                if (car == this) {
                    console.log("Car "+car.id+" is turning");
                } else {
                    if (!car.isMoving) {
                        car.move();
                    }
                }
            }
        }

        let rotationAngle: number
        let turnFrames: number

        // Get degree and speed according to the turn direction
        if (this.nextTurn == constants.RELATIVE_DIRECTION.Left) {
            rotationAngle = -(this.turnDetails.degreeChange);
            turnFrames = constants.TURN_FRAMES_PER_MOVEMENT_LEFT
        } else if (this.nextTurn == constants.RELATIVE_DIRECTION.Right) {
            rotationAngle = this.turnDetails.degreeChange;
            turnFrames = constants.TURN_FRAMES_PER_MOVEMENT_RIGHT
        } else if (this.nextTurn == constants.RELATIVE_DIRECTION.Straight) {
            rotationAngle = 0;
            turnFrames = constants.FRAMES_PER_MOVEMENT
        }

        // Find next position for the car, while turning
        let changeInX: number = 0;
        let changeInZ: number = 0;

        if (this.edge.direction == constants.ABSOLUTE_DIRECTION.North || this.edge.direction == constants.ABSOLUTE_DIRECTION.South) {
            changeInX = this.turnDetails.turnRadiusX*(Math.cos(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree)) - Math.cos(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree + this.turnDetails.degreeChange)))
            changeInZ = this.turnDetails.turnRadiusZ*(Math.sin(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree + this.turnDetails.degreeChange)) - Math.sin(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree)))
        } else {
            changeInX = this.turnDetails.turnRadiusX*(Math.sin(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree + this.turnDetails.degreeChange)) - Math.sin(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree)))
            changeInZ = this.turnDetails.turnRadiusZ*(Math.cos(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree)) - Math.cos(BABYLON.Tools.ToRadians(this.turnDetails.turnDegree + this.turnDetails.degreeChange)))
        }
        
        // If car is going straight, override all cos and sin functions above and simply move at a constant speed
        if (this.nextTurn == constants.RELATIVE_DIRECTION.Straight) {
            switch (this.edge.direction) {
                case constants.ABSOLUTE_DIRECTION.North:
                    changeInX = 0;
                    changeInZ = constants.CAR_SPEED;
                    break;
                case constants.ABSOLUTE_DIRECTION.South:
                    changeInX = 0;
                    changeInZ = -(constants.CAR_SPEED);
                    break;
                case constants.ABSOLUTE_DIRECTION.East:
                    changeInX = constants.CAR_SPEED;
                    changeInZ = 0;
                    break;
                case constants.ABSOLUTE_DIRECTION.West:
                    changeInX = -(constants.CAR_SPEED);
                    changeInZ = 0;
                    break;
                default:
                    break;
            }
        }
        
        let nextPosition = new BABYLON.Vector3(this.mesh.position.x + changeInX, 0, this.mesh.position.z + changeInZ)

        let moveAnim = new BABYLON.Animation("carturnmove", "position", constants.FRAMES_PER_SECOND, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        let keys = [{frame : 0, value : this.mesh.position}, {frame : turnFrames, value : nextPosition}]; 
        moveAnim.setKeys(keys);
        this.mesh.animations.push(moveAnim);

        // Rotate car to give turning effect
        this.mesh.rotate(new BABYLON.Vector3(0,0,1), BABYLON.Tools.ToRadians(rotationAngle));
        
        // Begin turning animation
        let animation = this.scene.beginAnimation(this.mesh, 0, turnFrames, false);
        animation.waitAsync().then(x => {
            this.turnDetails.turnDegree += this.turnDetails.degreeChange;
            if (this.turnDetails.turnDegree == 90) {
                // Turn is complete
                this.turnDetails.isTurning = false;
                this.nextEdge.addCar(this);
                this.edge = this.nextEdge;
                this.nextEdge = null;
                this.nextTurn = null;
                this.move();
            } else {
                // Turn not complete, continue turning
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

    // Find where the car should go to, accounting for the cars that are in front of it
    getCollisionProofDestination(): BABYLON.Vector3 {
        let destinationPosition: Position = new Position(this.edge.destination.pos.x, this.edge.destination.pos.z);
        let numberOfCarsInFront = this.edgeCarNumber - 1;

        switch (this.edge.direction) {
            case constants.ABSOLUTE_DIRECTION.North:
                destinationPosition.z -= (numberOfCarsInFront*constants.CAR_WIDTH);
                break;
            case constants.ABSOLUTE_DIRECTION.South:
                destinationPosition.z += (numberOfCarsInFront*constants.CAR_WIDTH);
                break;
            case constants.ABSOLUTE_DIRECTION.East:
                destinationPosition.x -= (numberOfCarsInFront*constants.CAR_WIDTH);
                break;
            case constants.ABSOLUTE_DIRECTION.West:
                destinationPosition.x += (numberOfCarsInFront*constants.CAR_WIDTH);
                break;
        }
        
        return destinationPosition.getVector3();
    }
}