import GraphNode from './node';
import Car from './car';
import * as constants from './constants'

export default class Edge {
    id: number
    weight: number
    maxWeight: number
    source: GraphNode
    destination: GraphNode
    cars: Array<Car>
    direction: number
    receivingCar: boolean
    dontSendCar: {
        straight: number,
        left: number,
        right: number
    }

    constructor(id: number, weight: number, maxWeight: number, source: GraphNode, destn: GraphNode, direction: number) {
        this.id = id;
        this.weight = weight;
        this.maxWeight = maxWeight;
        this.source = source;
        this.destination = destn;
        this.cars = [];
        this.direction = direction;
        this.receivingCar = false;
        this.dontSendCar = {
            straight: 0,
            left: 0,
            right: 0
        };

        if (constants.GAME_GRAPH[this.source.graphID] == undefined) {
            constants.GAME_GRAPH[this.source.graphID] = {};
        }
        constants.GAME_GRAPH[this.source.graphID][this.destination.graphID] = 2;

        if (constants.GRAPH_TURNS[this.source.graphID] == undefined) {
            constants.GRAPH_TURNS[this.source.graphID] = {};
        }
        constants.GRAPH_TURNS[this.source.graphID][this.destination.graphID] = this;

    }

    addCar(c: Car) {
        this.cars.push(c);
        this.weight++;
        constants.GAME_GRAPH[this.source.graphID][this.destination.graphID]++;
        this.receivingCar = false;

        c.edgeCarNumber = this.weight
    }

    removeCar() {
        this.cars.shift();
        this.weight--;
        constants.GAME_GRAPH[this.source.graphID][this.destination.graphID]--;

        // Since a car has been removed, the rest of the cars have moved one step closer to being the first car in the edge
        for (const car of this.cars) {
            car.edgeCarNumber--;
        }
    }

    calcTotalIdleTime(): number {
        let totalIdleTime = 0;
        this.cars.forEach(car => {
            totalIdleTime += car.idleTime;
        });
        return totalIdleTime;
    }

    isBlocked(): boolean {
        return (this.weight == this.maxWeight);
    }

    hasPriorityVehicle(): boolean {
        let hasPriorityVehicle = false;

        for (let car of this.cars) {
            if (car.isPriority) {
                hasPriorityVehicle = true;
                break;
            }
        }

        return hasPriorityVehicle;
    }
}