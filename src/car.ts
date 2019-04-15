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
    hasReachedDestination: boolean
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

    static AverageTravelTime: number = 0;
    static numberOfCars: number = 0.0;

    constructor(id: number,
        source: GraphNode,
        destination: GraphNode,
        edge: Edge,
        idleTime: number,
        startTime: Date,
        endTime: Date,
        isMoving: boolean,
        hasReachedDestination,
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
            this.hasReachedDestination = hasReachedDestination;
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

            if (this.isVectorSame(this.mesh.position, this.destination.pos.getVector3())) {
                // If car has reached it's final destination, remove it and recalculate average travel time
                this.hasReachedDestination = true;
                this.mesh.dispose();
                this.edge.removeCar();

                this.endTime = new Date();
                let travelTimeSeconds = (this.endTime.getTime() - this.startTime.getTime())/1000

                // Calculate new average travel time
                Car.numberOfCars++;
                Car.AverageTravelTime = ((Car.AverageTravelTime*(Car.numberOfCars-1)) + travelTimeSeconds)/Car.numberOfCars

                if (this.isPriority) {
                    console.log("Priority car "+this.id+" travel time - "+travelTimeSeconds);
                }
                
                document.getElementById('avgCount').innerText = ""+Car.AverageTravelTime.toFixed(3); // 3 digits after the decimal
            } else if (this.isVectorSame(this.mesh.position, this.edge.destination.pos.getVector3())) {
                // If reached end of the edge, find the next location to move to
                this.findNextTurnAndEdge();
            }
        }
    }

    makeTurn(clearDontSendCarValuesCallback: () => void) {
        if (!this.turnDetails.isTurning) {
            // Don't make the turn if the edge to turn to is blocked
            if (this.nextEdge.isBlocked()) {
                return;
            }
            this.turnDetails.isTurning = true;
            this.turnDetails.turnRadiusX = this.nextEdge.source.pos.x - this.mesh.position.x;
            this.turnDetails.turnRadiusZ = this.nextEdge.source.pos.z - this.mesh.position.z;
            this.turnDetails.turnDegree = 0;
            this.edge.removeCar();

            // Tell cars behind it to start moving forward (edge.cars doesn't contain the turning car anymore
            // so that check needn't be done)
            for (let car of this.edge.cars) {
                if (!car.isMoving) {
                    car.move();
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
        let turnVector: BABYLON.Vector3;
        if (this.isPriority) {
            turnVector = constants.PRIORITY_TURN_VECTOR;
        } else {
            turnVector = constants.STANDARD_TURN_VECTOR
        }
        this.mesh.rotate(turnVector, BABYLON.Tools.ToRadians(rotationAngle));
        
        // Begin turning animation
        let animation = this.scene.beginAnimation(this.mesh, 0, turnFrames, false);
        animation.waitAsync().then(x => {
            this.turnDetails.turnDegree += this.turnDetails.degreeChange;
            if (this.turnDetails.turnDegree == 90 || this.isVectorSame(this.mesh.position, this.nextEdge.source.pos.getVector3())) {
                // Turn is complete
                clearDontSendCarValuesCallback();
                this.turnDetails.isTurning = false;
                this.nextEdge.addCar(this);
                this.edge = this.nextEdge;
                this.nextEdge = null;
                this.nextTurn = null;
                this.move();
            } else {
                // Turn not complete, continue turning
                this.makeTurn(clearDontSendCarValuesCallback);
            }
        })
    }

    // Dijkstra's Algorithm
    findNextTurnAndEdge() {
        const costs = {};
        const parents = {};
        const processed = [];

        const lowestCostNode = (costs, processed) => {
            return Object.keys(costs).reduce((lowest, node) => {
                if (lowest === null || costs[node] < costs[lowest]) {
                    if (!processed.includes(node)) {
                        lowest = node;
                    }
                }
                return lowest;
            }, null);
        };

        const start: number = this.edge.destination.graphID
        const finish: number = this.destination.graphID
        costs[start] = 0;
        costs[finish] = Infinity;
        parents[finish] = null;

        for (let child in constants.GAME_GRAPH[start]) {  // add children of start node
            parents[child] = start;
        }

        let node = lowestCostNode(costs, processed);

        while (node) {
            let cost = costs[node];
            let children = constants.GAME_GRAPH[node];

            for (let n in children) {
                let newCost = cost + children[n];

                if (costs[n] == undefined) {
                    costs[n] = newCost;
                    parents[n] = node;
                }

                if (costs[n] > newCost) {
                    costs[n] = newCost;
                    parents[n] = node;
                }
            }

            processed.push(node);
            node = lowestCostNode(costs, processed);
        }
        
        let optimalPath = [""+finish];
        let parent = parents[finish];
        while (parent) {
            optimalPath.push(parent);
            parent = parents[parent];
        }
        
        optimalPath.reverse();  // reverse array to get correct order

        let nextNode: number = Number.parseInt(optimalPath[1]);
        this.nextEdge = constants.GRAPH_TURNS[this.edge.destination.graphID][nextNode]
        this.nextTurn = this.getTurnDirection(this.edge.direction, this.nextEdge.direction);
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

    getTurnDirection(currentEdgeDirection: number, directionOfFutureEdge: number): number {
        switch (currentEdgeDirection) {
            case constants.ABSOLUTE_DIRECTION.North:
                switch (directionOfFutureEdge) {
                    case constants.ABSOLUTE_DIRECTION.North:
                        return constants.RELATIVE_DIRECTION.Straight;
                    case constants.ABSOLUTE_DIRECTION.East:
                        return constants.RELATIVE_DIRECTION.Right;
                    case constants.ABSOLUTE_DIRECTION.West:
                        return constants.RELATIVE_DIRECTION.Left;
                    default:
                        console.log("Error, got a U Turn");
                }
                break;
        
            case constants.ABSOLUTE_DIRECTION.East:
                switch (directionOfFutureEdge) {
                    case constants.ABSOLUTE_DIRECTION.East:
                        return constants.RELATIVE_DIRECTION.Straight;
                    case constants.ABSOLUTE_DIRECTION.South:
                        return constants.RELATIVE_DIRECTION.Right;
                    case constants.ABSOLUTE_DIRECTION.North:
                        return constants.RELATIVE_DIRECTION.Left;
                    default:
                        console.log("Error, got a U Turn");
                }
                break;

            case constants.ABSOLUTE_DIRECTION.South:
                switch (directionOfFutureEdge) {
                    case constants.ABSOLUTE_DIRECTION.South:
                        return constants.RELATIVE_DIRECTION.Straight;
                    case constants.ABSOLUTE_DIRECTION.West:
                        return constants.RELATIVE_DIRECTION.Right;
                    case constants.ABSOLUTE_DIRECTION.East:
                        return constants.RELATIVE_DIRECTION.Left;
                    default:
                        console.log("Error, got a U Turn");
                }
                break;

            case constants.ABSOLUTE_DIRECTION.West:
                switch (directionOfFutureEdge) {
                    case constants.ABSOLUTE_DIRECTION.West:
                        return constants.RELATIVE_DIRECTION.Straight;
                    case constants.ABSOLUTE_DIRECTION.North:
                        return constants.RELATIVE_DIRECTION.Right;
                    case constants.ABSOLUTE_DIRECTION.South:
                        return constants.RELATIVE_DIRECTION.Left;
                    default:
                        console.log("Error, got a U Turn");
                }
                break;
        }
    }
}