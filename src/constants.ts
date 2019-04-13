import Map from './map';

export const INITIAL_WEIGHT = 0;
export const MAX_WEIGHT = 2;
export const STARTING_IDLE_TIME = 0;
export const FRAMES_PER_SECOND = 30;
export const FRAMES_PER_MOVEMENT = 2; // Higher value reduces car speed. This value is also used for straight turns
export const CAR_SPEED = 0.1; // Higher value increases car speed (MUST BE A FACTOR OF 0.1)
export const TURN_FRAMES_PER_MOVEMENT_RIGHT = 1; // Higher value reduces the turn speed for right turns
export const TURN_FRAMES_PER_MOVEMENT_LEFT = 0.5; // Higher value reduces the turn speed for left turns
export const TURN_DEGREE_CHANGE = 2; // Higher value increases the turn speed (MUST BE A FACTOR OF 90)
export const CAR_WIDTH = 1.5 // Used to prevent collisions
export const TRAFFIC_OPERATION_SHORT_WAIT_TIME = 500;
export const TRAFFIC_OPERATION_LONG_WAIT_TIME = 3200;
export const LABEL_SIZE = 1;

export const ABSOLUTE_DIRECTION = {
    North: 1,
    East: 2,
    South: 3,
    West: 4
}

export const RELATIVE_DIRECTION = {
    Left: 1,
    Straight: 2,
    Right: 3,
    Red: 4
}

// The game map in graph form used to implement Dijkstras Algorithm. It's value is populated on creating edges.
export const GAME_GRAPH = {}

// Used to indicate absolute direction to go from a source graphnode to a destination graphnode
export const GRAPH_TURNS = {};

// All 11 possible traffic states
export const TRAFFIC_STATES: Array<Array<number>> = [
    [
        RELATIVE_DIRECTION.Straight,
        RELATIVE_DIRECTION.Red,
        RELATIVE_DIRECTION.Straight,
        RELATIVE_DIRECTION.Red
    ],
    [
        RELATIVE_DIRECTION.Straight,
        RELATIVE_DIRECTION.Red,
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Left
    ],
    [
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Straight,
        RELATIVE_DIRECTION.Red
    ],
    [
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Right,
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Red
    ],
    [
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Red,
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Right
    ],
    [
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Straight,
        RELATIVE_DIRECTION.Red,
        RELATIVE_DIRECTION.Left
    ],
    [
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Left
    ],
    [
        RELATIVE_DIRECTION.Right,
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Red,
        RELATIVE_DIRECTION.Left
    ],
    [
        RELATIVE_DIRECTION.Red,
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Straight
    ],
    [
        RELATIVE_DIRECTION.Red,
        RELATIVE_DIRECTION.Left,
        RELATIVE_DIRECTION.Right,
        RELATIVE_DIRECTION.Left
    ],
    [
        RELATIVE_DIRECTION.Red,
        RELATIVE_DIRECTION.Straight,
        RELATIVE_DIRECTION.Red,
        RELATIVE_DIRECTION.Straight
    ]
]

export const RED_LIGHT_HEIGHT = 2.6;
export const GREEN_STRAIGHT_HEIGHT = 2.2;
export const GREEN_LEFT_HEIGHT = 1.8;
export const GREEN_RIGHT_HEIGHT = 1.4;
export const TRAFFIC_HEIGHT = 2;
export const TRAFFIC_ANGLE = BABYLON.Tools.ToRadians(10);
export const TRAFFIC_EXPONENT = 100;

export const OPERATE_OLD_MODE = false;

// The single instance of the game map that will be used by all
export const GAME_MAP = new Map();