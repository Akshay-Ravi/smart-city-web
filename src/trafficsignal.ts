import Edge from './edge';
import * as constants from './constants';

export default class TrafficSignal {

    id: number

    // edges[0] : North Edge
    // edges[1] : East Edge
    // edges[2] : South Edge
    // edges[3] : West Edge
    edges: Array<Edge>

    // priorityOrder is an array of the numbers 0,1,2,3 where
    // 0 : North Edge
    // 1 : East Edge
    // 2 : South Edge
    // 3 : West Edge
    // The order of these numbers in the array dictate the priority order
    priorityOrder: Array<number>

    // Indicates the state of traffic of the possible 11 states.
    state: {
        North: number
        East: number
        South: number
        West: number
    }

    constructor(id: number, edges: Array<Edge>) {
        this.id = id;
        this.edges = edges;
        this.state = {
            North: constants.RELATIVE_DIRECTION.Red,
            East: constants.RELATIVE_DIRECTION.Red,
            South: constants.RELATIVE_DIRECTION.Red,
            West: constants.RELATIVE_DIRECTION.Red
        }
        this.priorityOrder = [0, 1, 2, 3];
        
        // Start operating as soon as the traffic signal is created
        this.operate();
    }

    operate() {
        this.findPriorityOrder();

        // Prioritize edges with a priority vehicle
        for (let i=0;i<4;i++) {
            if (this.edges[this.priorityOrder[i]].hasPriorityVehicle()) {
                this.prioritizeEdge(i);
            }
        }

        // Prioritize edges that are blocked
        for (let i=0;i<4;i++) {
            if (this.edges[this.priorityOrder[i]].isBlocked()) {
                this.prioritizeEdge(i);
            }
        }

        this.determineTrafficState();
        
        let nextOperateCall: number = constants.TRAFFIC_OPERATION_SHORT_WAIT_TIME;
        let callBack: () => void;
        for (let i = 0; i < 4; i++) {
            let states = [this.state.North, this.state.East, this.state.South, this.state.West];
            if (this.edges[i].weight > 0 && states[i] == this.edges[i].cars[0].nextTurn && (this.getDontSendCarValue(this.edges[i], this.edges[i].cars[0].nextTurn) == 0)) {
                switch (this.edges[i].cars[0].nextTurn) {
                    case constants.RELATIVE_DIRECTION.Left:
                        this.edges[(i+2)%4].dontSendCar.right++;
                        this.edges[(i+3)%4].dontSendCar.straight++;
                        callBack = () => {
                            this.edges[(i+2)%4].dontSendCar.right--;
                            this.edges[(i+3)%4].dontSendCar.straight--;
                        }
                        break;
                
                    case constants.RELATIVE_DIRECTION.Straight:
                        this.edges[(i+1)%4].dontSendCar.left++;
                        this.edges[(i+1)%4].dontSendCar.right++;
                        this.edges[(i+1)%4].dontSendCar.straight++;
                        this.edges[(i+2)%4].dontSendCar.right++;
                        this.edges[(i+3)%4].dontSendCar.right++;
                        this.edges[(i+3)%4].dontSendCar.straight++;
                        callBack = () => {
                            this.edges[(i+1)%4].dontSendCar.left--;
                            this.edges[(i+1)%4].dontSendCar.right--;
                            this.edges[(i+1)%4].dontSendCar.straight--;
                            this.edges[(i+2)%4].dontSendCar.right--;
                            this.edges[(i+3)%4].dontSendCar.right--;
                            this.edges[(i+3)%4].dontSendCar.straight--;
                        }
                        break;
                    
                    case constants.RELATIVE_DIRECTION.Right:
                        this.edges[(i+1)%4].dontSendCar.right++;
                        this.edges[(i+1)%4].dontSendCar.straight++;
                        this.edges[(i+2)%4].dontSendCar.left++;
                        this.edges[(i+2)%4].dontSendCar.right++;
                        this.edges[(i+2)%4].dontSendCar.straight++;
                        this.edges[(i+3)%4].dontSendCar.right++;
                        this.edges[(i+3)%4].dontSendCar.straight++;
                        callBack = () => {
                            this.edges[(i+1)%4].dontSendCar.right--;
                            this.edges[(i+1)%4].dontSendCar.straight--;
                            this.edges[(i+2)%4].dontSendCar.left--;
                            this.edges[(i+2)%4].dontSendCar.right--;
                            this.edges[(i+2)%4].dontSendCar.straight--;
                            this.edges[(i+3)%4].dontSendCar.right--;
                            this.edges[(i+3)%4].dontSendCar.straight--;
                        }
                }
                this.edges[i].cars[0].makeTurn(callBack);
            }
        }

        // Operate once every 0.5 seconds
        setTimeout(() => {
            this.operate();
        }, nextOperateCall);
    }

    getDontSendCarValue(edge: Edge, direction: number): number {
        switch (direction) {
            case constants.RELATIVE_DIRECTION.Left:
                return edge.dontSendCar.left
            case constants.RELATIVE_DIRECTION.Right:
                return edge.dontSendCar.right
            case constants.RELATIVE_DIRECTION.Straight:
                return edge.dontSendCar.straight
        }
    }

    findPriorityOrder() {
        this.priorityOrder = [0, 1, 2, 3];
        let edgesTotalIdleTime: Array<number> = [];

        // Get total idle times for all edges
        this.edges.forEach(edge => {
            edgesTotalIdleTime.push(edge.calcTotalIdleTime());
        });

        // Bubble Sort to find priority order
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3-i; j++) {
                // Higher idle time gets higher priority => Sort in descending order
                if (edgesTotalIdleTime[j] < edgesTotalIdleTime[j+1]) {
                    this.arraySwap(edgesTotalIdleTime, j, j+1);
                    this.arraySwap(this.priorityOrder, j, j+1);
                }
            }
        }

    }

    determineTrafficState() {
        let viableTrafficStates: Array<Array<number>> = constants.TRAFFIC_STATES;

        for (let i = 0; viableTrafficStates.length != 1 && i < 4; i++) {
            let highestPriority: number = this.priorityOrder[i];
            let highestPriorityEdge: Edge = this.edges[highestPriority];

            // If the edge doesn't have any cars, break out of the loop
            // None of the future edges will have any cars either
            if (highestPriorityEdge.weight == 0) {
                break;
            }

            // Get which direction the highest priority car has to turn
            let highestPriorityEdgesTurnDirection: number = highestPriorityEdge.cars[0].nextTurn;

            let nextIterationViableTrafficStates: Array<Array<number>> = [];
    
            viableTrafficStates.forEach(trafficState => {
                if (highestPriorityEdgesTurnDirection == trafficState[highestPriority]) {
                    nextIterationViableTrafficStates.push(trafficState);
                }
            });
    
            if (nextIterationViableTrafficStates.length > 0) {
                viableTrafficStates = nextIterationViableTrafficStates;
            }
        };

        this.state.North = viableTrafficStates[0][0];
        this.state.East = viableTrafficStates[0][1];
        this.state.South = viableTrafficStates[0][2];
        this.state.West = viableTrafficStates[0][3];
    }

    arraySwap(array: Array<number>, index1: number, index2: number) {
        let temp: number = array[index1];
        array[index1] = array[index2];
        array[index2] = temp;
    }

    prioritizeEdge(index: number) {
        let priorityEdge: number = this.priorityOrder[index];
        for (let j=index;j>0;j--) {
            this.priorityOrder[j] = this.priorityOrder[j-1];
        }
        this.priorityOrder[0] = priorityEdge;
    }
}