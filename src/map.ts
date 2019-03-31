import Edge from './edge';
import GraphNode from './node';
import Position from './position';
import TrafficSignal from './trafficsignal';
import * as constants from './constants';

export default class Map {
    edges: Array<Edge>
    nodes: Array<GraphNode>
    trafficSignals: Array<TrafficSignal>

    constructor() {
        this.nodes = [
            new GraphNode(1, new Position(-6.5, -7), 1),
            new GraphNode(2, new Position(-6.5, -4.7), 2),
            new GraphNode(3, new Position(-6.5, -1.3), 2),
            new GraphNode(4, new Position(-6.5, 1.3), 3),
            new GraphNode(5, new Position(-6.5, 4.7), 3),
            new GraphNode(6, new Position(-6.5, 7), 4),

            new GraphNode(7, new Position(-5.5, -7), 1),
            new GraphNode(8, new Position(-5.5, -4.7), 2),
            new GraphNode(9, new Position(-5.5, -1.3), 2),
            new GraphNode(10, new Position(-5.5, 1.3), 3),
            new GraphNode(11, new Position(-5.5, 4.7), 3),
            new GraphNode(12, new Position(-5.5, 7), 4),

            new GraphNode(13, new Position(-0.5, -7), 5),
            new GraphNode(14, new Position(-0.5, -4.7), 6),
            new GraphNode(15, new Position(-0.5, -1.3), 6),
            new GraphNode(16, new Position(-0.5, 1.3), 7),
            new GraphNode(17, new Position(-0.5, 4.7), 7),
            new GraphNode(18, new Position(-0.5, 7), 8),

            new GraphNode(19, new Position(0.5, -7), 5),
            new GraphNode(20, new Position(0.5, -4.7), 6),
            new GraphNode(21, new Position(0.5, -1.3), 6),
            new GraphNode(22, new Position(0.5, 1.3), 7),
            new GraphNode(23, new Position(0.5, 4.7), 7),
            new GraphNode(24, new Position(0.5, 7), 8),

            new GraphNode(25, new Position(5.5, -7), 9),
            new GraphNode(26, new Position(5.5, -4.7),10),
            new GraphNode(27, new Position(5.5, -1.3),10),
            new GraphNode(28, new Position(5.5, 1.3), 11),
            new GraphNode(29, new Position(5.5, 4.7), 11),
            new GraphNode(30, new Position(5.5, 7), 12),

            new GraphNode(31, new Position(6.5, -7), 9),
            new GraphNode(32, new Position(6.5, -4.7),10),
            new GraphNode(33, new Position(6.5, -1.3),10),
            new GraphNode(34, new Position(6.5, 1.3), 11),
            new GraphNode(35, new Position(6.5, 4.7), 11),
            new GraphNode(36, new Position(6.5, 7), 12),

            new GraphNode(37, new Position(-10.5, -3.5), 13),
            new GraphNode(38, new Position(-7.7, -3.5), 2),
            new GraphNode(39, new Position(-4.3, -3.5), 2),
            new GraphNode(40, new Position(-1.7, -3.5), 6),
            new GraphNode(41, new Position(1.7, -3.5), 6),
            new GraphNode(42, new Position(4.3, -3.5), 10),
            new GraphNode(43, new Position(7.7, -3.5), 10),
            new GraphNode(44, new Position(10.5, -3.5), 14),

            new GraphNode(45, new Position(-10.5, -2.5), 13),
            new GraphNode(46, new Position(-7.7, -2.5), 2),
            new GraphNode(47, new Position(-4.3, -2.5), 2),
            new GraphNode(48, new Position(-1.7, -2.5), 6),
            new GraphNode(49, new Position(1.7, -2.5), 6),
            new GraphNode(50, new Position(4.3, -2.5), 10),
            new GraphNode(51, new Position(7.7, -2.5), 10),
            new GraphNode(52, new Position(10.5, -2.5), 14),

            new GraphNode(53, new Position(-10.5, 2.5), 15),
            new GraphNode(54, new Position(-7.7, 2.5), 3),
            new GraphNode(55, new Position(-4.3, 2.5), 3),
            new GraphNode(56, new Position(-1.7, 2.5), 7),
            new GraphNode(57, new Position(1.7, 2.5), 7),
            new GraphNode(58, new Position(4.3, 2.5), 11),
            new GraphNode(59, new Position(7.7, 2.5), 11),
            new GraphNode(60, new Position(10.5, 2.5), 16),

            new GraphNode(61, new Position(-10.5, 3.5), 15),
            new GraphNode(62, new Position(-7.7, 3.5), 3),
            new GraphNode(63, new Position(-4.3, 3.5), 3),
            new GraphNode(64, new Position(-1.7, 3.5), 7),
            new GraphNode(65, new Position(1.7, 3.5), 7),
            new GraphNode(66, new Position(4.3, 3.5), 11),
            new GraphNode(67, new Position(7.7, 3.5), 11),
            new GraphNode(68, new Position(10.5, 3.5), 16),
        ]

        this.edges = [
            new Edge(1, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(1), this.getNode(2), constants.ABSOLUTE_DIRECTION.North),
            new Edge(2, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(3), this.getNode(4), constants.ABSOLUTE_DIRECTION.North),
            new Edge(3, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(5), this.getNode(6), constants.ABSOLUTE_DIRECTION.North),
            new Edge(4, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(12), this.getNode(11), constants.ABSOLUTE_DIRECTION.South),
            new Edge(5, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(10), this.getNode(9), constants.ABSOLUTE_DIRECTION.South),
            new Edge(6, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(8), this.getNode(7), constants.ABSOLUTE_DIRECTION.South),

            new Edge(7, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(13), this.getNode(14), constants.ABSOLUTE_DIRECTION.North),
            new Edge(8, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(15), this.getNode(16), constants.ABSOLUTE_DIRECTION.North),
            new Edge(9, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(17), this.getNode(18), constants.ABSOLUTE_DIRECTION.North),
            new Edge(10, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(24), this.getNode(23), constants.ABSOLUTE_DIRECTION.South),
            new Edge(11, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(22), this.getNode(21), constants.ABSOLUTE_DIRECTION.South),
            new Edge(12, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(20), this.getNode(19), constants.ABSOLUTE_DIRECTION.South),

            new Edge(13, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(25), this.getNode(26), constants.ABSOLUTE_DIRECTION.North),
            new Edge(14, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(27), this.getNode(28), constants.ABSOLUTE_DIRECTION.North),
            new Edge(15, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(29), this.getNode(30), constants.ABSOLUTE_DIRECTION.North),
            new Edge(16, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(36), this.getNode(35), constants.ABSOLUTE_DIRECTION.South),
            new Edge(17, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(34), this.getNode(33), constants.ABSOLUTE_DIRECTION.South),
            new Edge(18, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(32), this.getNode(31), constants.ABSOLUTE_DIRECTION.South),

            new Edge(19, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(44), this.getNode(43), constants.ABSOLUTE_DIRECTION.West),
            new Edge(20, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(42), this.getNode(41), constants.ABSOLUTE_DIRECTION.West),
            new Edge(21, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(40), this.getNode(39), constants.ABSOLUTE_DIRECTION.West),
            new Edge(22, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(38), this.getNode(37), constants.ABSOLUTE_DIRECTION.West),
            new Edge(23, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(45), this.getNode(46), constants.ABSOLUTE_DIRECTION.East),
            new Edge(24, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(47), this.getNode(48), constants.ABSOLUTE_DIRECTION.East),
            new Edge(25, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(49), this.getNode(50), constants.ABSOLUTE_DIRECTION.East),
            new Edge(26, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(51), this.getNode(52), constants.ABSOLUTE_DIRECTION.East),

            new Edge(27, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(60), this.getNode(59), constants.ABSOLUTE_DIRECTION.West),
            new Edge(28, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(58), this.getNode(57), constants.ABSOLUTE_DIRECTION.West),
            new Edge(29, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(56), this.getNode(55), constants.ABSOLUTE_DIRECTION.West),
            new Edge(30, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(54), this.getNode(53), constants.ABSOLUTE_DIRECTION.West),
            new Edge(31, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(61), this.getNode(62), constants.ABSOLUTE_DIRECTION.East),
            new Edge(32, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(63), this.getNode(64), constants.ABSOLUTE_DIRECTION.East),
            new Edge(33, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(65), this.getNode(66), constants.ABSOLUTE_DIRECTION.East),
            new Edge(34, constants.INITIAL_WEIGHT, constants.MAX_WEIGHT, this.getNode(67), this.getNode(68), constants.ABSOLUTE_DIRECTION.East),
        ]

        this.trafficSignals = [
            new TrafficSignal(1, [this.getEdge(5), this.getEdge(21), this.getEdge(1), this.getEdge(23)]),
            new TrafficSignal(2, [this.getEdge(4), this.getEdge(29), this.getEdge(2), this.getEdge(31)]),
            new TrafficSignal(3, [this.getEdge(11), this.getEdge(20), this.getEdge(7), this.getEdge(24)]),
            new TrafficSignal(4, [this.getEdge(10), this.getEdge(28), this.getEdge(8), this.getEdge(32)]),
            new TrafficSignal(5, [this.getEdge(17), this.getEdge(19), this.getEdge(13), this.getEdge(25)]),
            new TrafficSignal(6, [this.getEdge(16), this.getEdge(27), this.getEdge(14), this.getEdge(33)]),
        ]
    }

    getNode(id: number): GraphNode {
        return this.nodes[id-1];
    }

    getEdge(id: number): Edge {
        return this.edges[id-1];
    }

    getTrafficSignal(id: number): TrafficSignal {
        return this.trafficSignals[id-1];
    }
}