import Position from './position'

export default class GraphNode {
    id: number
    pos: Position 
    
    constructor(id: number, pos: Position) {
        this.id = id;
        this.pos = pos;
    }
}