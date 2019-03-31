import Position from './position'

export default class GraphNode {
    id: number
    pos: Position
    graphID: number
    
    constructor(id: number, pos: Position, graphID: number) {
        this.id = id;
        this.pos = pos;
        this.graphID = graphID;
    }
}