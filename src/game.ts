import Edge from './edge';
import Car from './car';
import * as constants from './constants';
import GraphNode from './node';

class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene: BABYLON.Scene;
    private _camera: BABYLON.ArcRotateCamera;
    private _directionalLight: {
        light: BABYLON.DirectionalLight,
        position: BABYLON.Vector3,
        direction: BABYLON.Vector3,
        intensity: number
    }
    private _ambientLight: {
        light: BABYLON.HemisphericLight,
        direction: BABYLON.Vector3,
        intensity: number
    }
    private _verticalRoads: Array<BABYLON.Mesh>
    private _horizontalRoads: Array<BABYLON.Mesh>
    private _verticalRoadHeight: number
    private _horizontalRoadHeight: number
    private _labelHeight: number
    private _cityWidth: number
    private _cityHeight: number
    private _roadWidth: number

    private _cars: Array<Car>
    private _numberOfCars: number
    private _ticks: number

    constructor(canvasElement : string) {

        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);
        this._engine.enableOfflineSupport = false;

        // Initialize properties
        this._directionalLight = {
            light: undefined,
            position: new BABYLON.Vector3(0, 10, 0),
            direction: new BABYLON.Vector3(-0.5, -1, -0.5),
            intensity: 0.6
        }
        this._ambientLight = {
            light: undefined,
            direction: new BABYLON.Vector3(0, 1, 0),
            intensity: 0.3
        }
        this._verticalRoads = [];
        this._horizontalRoads = [];
        this._verticalRoadHeight = 0.01;
        this._horizontalRoadHeight = 0.02;
        this._labelHeight = 0.03;
        this._cityWidth = 23;
        this._cityHeight = 16;
        this._roadWidth = 2;
        this._numberOfCars = 0;
        this._ticks = 0;
        this._cars = [];
    }

    createScene() : void {

        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        this._scene.clearColor = new BABYLON.Color4(0,0,0,1); // Set background color to black

        // Create the camera
        this._camera = new BABYLON.ArcRotateCamera('maincamera', BABYLON.Tools.ToRadians(250), BABYLON.Tools.ToRadians(40), 18, new BABYLON.Vector3(-2, 0, -2), this._scene);
        this._camera.attachControl(this._canvas, false); // Attach the camera to the canvas to allow mouse movement

        // Create all light necessary for the scene
        this.createLight();

        // Create a built-in "ground" shape.
        let ground = BABYLON.MeshBuilder.CreateGround('ground1', {width: this._cityWidth, height: this._cityHeight, subdivisions: 1}, this._scene);
        ground.position.set(0,0,0);
        
        // Give ground a grass texture
        let groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this._scene);
        let groundTexture = new BABYLON.Texture("../images/grass.jpg", this._scene);
        groundTexture.uScale = this._cityWidth;
        groundTexture.vScale = this._cityHeight;
        groundMaterial.diffuseTexture = groundTexture;
        ground.material = groundMaterial;

        // Create the road texture for assigning to the road meshes later
        let roadMaterial = new BABYLON.StandardMaterial("roadMaterial", this._scene);
        roadMaterial.diffuseTexture = new BABYLON.Texture("../images/road.png", this._scene);
        
        // CREATE ALL ROADS
        let road1 = BABYLON.MeshBuilder.CreatePlane("road1", {width: this._roadWidth, height: this._cityHeight}, this._scene);
        road1.position.set(0,this._verticalRoadHeight,0);
        this._verticalRoads.push(road1);

        let road2 = BABYLON.MeshBuilder.CreatePlane("road2", {width: this._roadWidth, height: this._cityHeight}, this._scene);
        road2.position.set(-6,this._verticalRoadHeight,0);
        this._verticalRoads.push(road2);

        let road3 = BABYLON.MeshBuilder.CreatePlane("road3", {width: this._roadWidth, height: this._cityHeight}, this._scene);
        road3.position.set(6,this._verticalRoadHeight,0);
        this._verticalRoads.push(road3);

        let road4 = BABYLON.MeshBuilder.CreatePlane("road4", {width: this._roadWidth, height: this._cityWidth}, this._scene);
        road4.position.set(0,this._horizontalRoadHeight,-3);
        this._horizontalRoads.push(road4);

        let road5 = BABYLON.MeshBuilder.CreatePlane("road5", {width: this._roadWidth, height: this._cityWidth}, this._scene);
        road5.position.set(0,this._horizontalRoadHeight,3);
        this._horizontalRoads.push(road5);
        
        this._verticalRoads.forEach(road => {
            road.material = roadMaterial;
            road.rotate(new BABYLON.Vector3(0,1,0), BABYLON.Tools.ToRadians(180));
            road.rotate(new BABYLON.Vector3(1,0,0), BABYLON.Tools.ToRadians(90));
        });

        this._horizontalRoads.forEach(road => {
            road.material = roadMaterial;
            road.rotate(new BABYLON.Vector3(0,1,0), BABYLON.Tools.ToRadians(270));
            road.rotate(new BABYLON.Vector3(1,0,0), BABYLON.Tools.ToRadians(90));
        });

        // Add road labels
        let labelPositions = [
            [-6, -(this._cityHeight - constants.LABEL_SIZE)/2],
            [0, -(this._cityHeight - constants.LABEL_SIZE)/2],
            [6, -(this._cityHeight - constants.LABEL_SIZE)/2],
            [-(this._cityWidth - constants.LABEL_SIZE)/2, -3],
            [(this._cityWidth - constants.LABEL_SIZE)/2, -3],
            [-(this._cityWidth - constants.LABEL_SIZE)/2, 3],
            [(this._cityWidth - constants.LABEL_SIZE)/2, 3],
            [-6, (this._cityHeight - constants.LABEL_SIZE)/2],
            [0, (this._cityHeight - constants.LABEL_SIZE)/2],
            [6, (this._cityHeight - constants.LABEL_SIZE)/2],
        ]

        let labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
        for (let i=0;i<labelPositions.length;i++) {
            let plane = BABYLON.MeshBuilder.CreatePlane("label", {size: constants.LABEL_SIZE}, this._scene);
            plane.position.set(labelPositions[i][0],this._labelHeight,labelPositions[i][1]);
            plane.rotate(new BABYLON.Vector3(1,0,0), BABYLON.Tools.ToRadians(90));

            let dynamicTexture = new BABYLON.DynamicTexture("dynamicTexture", {width:256, height:256}, this._scene, false);
            dynamicTexture.drawText(labels[i], 64, 200, "bold 180px Arial","white","");
            let planeMaterial = new BABYLON.StandardMaterial("labelMaterial"+i, this._scene);
            planeMaterial.diffuseTexture = dynamicTexture;
            planeMaterial.diffuseTexture.hasAlpha = true;
            plane.material = planeMaterial;

            switch (i) {
                case 3:
                case 5:
                    plane.rotate(new BABYLON.Vector3(0,0,1), BABYLON.Tools.ToRadians(270));
                    break;
                case 4:
                case 6:
                    plane.rotate(new BABYLON.Vector3(0,0,1), BABYLON.Tools.ToRadians(90));
                    break;
                case 7:
                case 8:
                case 9:
                    plane.rotate(new BABYLON.Vector3(0,0,1), BABYLON.Tools.ToRadians(180));
                    break;
            }
        }
        
        this.generateShadows(ground);

    }

    addCar(edge: Edge, destination: GraphNode, isPriority: boolean): void {
        this._numberOfCars++;

        BABYLON.SceneLoader.ImportMesh("", "../images/cars/Babylon/", "SportsCar.babylon", this._scene, (newmeshes) => {
            newmeshes.forEach(mesh => {
                mesh.id = "car"+this._numberOfCars;
                mesh.position = edge.source.pos.getVector3();
                mesh.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);

                switch (edge.direction) {
                    case constants.ABSOLUTE_DIRECTION.North:
                        mesh.rotate(new BABYLON.Vector3(0,0,1), BABYLON.Tools.ToRadians(180));
                        break;
                    case constants.ABSOLUTE_DIRECTION.East:
                        mesh.rotate(new BABYLON.Vector3(0,0,1), BABYLON.Tools.ToRadians(270));
                        break;
                    case constants.ABSOLUTE_DIRECTION.South:
                        mesh.rotate(new BABYLON.Vector3(0,0,1), BABYLON.Tools.ToRadians(0));
                        break;
                    case constants.ABSOLUTE_DIRECTION.West:
                        mesh.rotate(new BABYLON.Vector3(0,0,1), BABYLON.Tools.ToRadians(90));
                        break;
                }
                
                let car = new Car(this._numberOfCars, edge.source, destination, edge, 0, new Date(), null, false, false, null, null, isPriority, mesh, this._scene);
                this._cars.push(car);
                edge.addCar(car);
                car.move();
                this.addToShadow(mesh);
            });
        });
    }

    createLight(): void {
        // Directional Light is used to generate shadows
        this._directionalLight.light = new BABYLON.DirectionalLight("sunlight", this._directionalLight.direction, this._scene);
        this._directionalLight.light.position = this._directionalLight.position;
        this._directionalLight.light.intensity = this._directionalLight.intensity;

        // Ambient Light is of type Hemispheric Light
        this._ambientLight.light = new BABYLON.HemisphericLight("ambientlight", this._ambientLight.direction, this._scene);
        this._ambientLight.light.intensity = this._ambientLight.intensity;
    }

    generateShadows(ground: BABYLON.Mesh, ...items: BABYLON.AbstractMesh[]): void {
        let shadowGenerator = new BABYLON.ShadowGenerator(512, this._directionalLight.light);
        items.forEach(item => {
            shadowGenerator.getShadowMap().renderList.push(item)
        });

        ground.receiveShadows = true;
    }

    addToShadow(...items: BABYLON.AbstractMesh[]): void {
        let shadowGenerator = new BABYLON.ShadowGenerator(512, this._directionalLight.light);
        items.forEach(item => {
            shadowGenerator.getShadowMap().renderList.push(item)
        });
    }

    doRender() : void {
        // Run the render loop.
        this._engine.runRenderLoop(() => {
            this._scene.render();
            this._ticks++;
            if (this._ticks == 6) {
                // 1/10th of a second is over
                this._cars.forEach(car => {
                    if (car.hasReachedDestination) {
                        // Remove car from array if it has reached it's destination
                        this._cars.splice(this._cars.indexOf(car), 1);
                    } else if (!car.isMoving) {
                        // Update the idle times of all cars that are not moving
                        car.idleTime += 0.1
                    }
                });
                this._ticks = 0;
            }
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Create the game using the 'renderCanvas'.
    let game = new Game('renderCanvas');

    // Create the scene.
    game.createScene();

    // Start render loop.
    game.doRender();

    // Map add car to button
    document.getElementById('addCarButton').onclick = () => {
        let source: String = (document.getElementById('sourceDropdown') as HTMLSelectElement).value;
        let destn: String = (document.getElementById('destnDropdown') as HTMLSelectElement).value;
        let isPriority: boolean = (document.getElementById('priorityBox') as HTMLInputElement).checked;
        addCar(game, source, destn, isPriority);
    }

    addCar(game, "a", "b", false);
    addCar(game, "c", "b", false);
    addCar(game, "d", "b", true);
    addCar(game, "e", "b", false);
    addCar(game, "i", "d", false);
    addCar(game, "h", "g", false);
    addCar(game, "j", "e", false);
});

function addCar(game: Game, source: String, destination: String, isPriority: boolean) {
    let errorElement: HTMLElement = document.getElementById('errorMessage');
    if (source == destination) {
        errorElement.innerText = "Source can not be same as destination";
        errorElement.style.opacity = ""+1;
    } else {
        errorElement.style.opacity = ""+0;
        let sourceEdge: Edge = convertSourceToEdge(source);
        let destnNode: GraphNode = convertDestinationToNode(destination);
        if (sourceEdge.isBlocked()) {
            errorElement.innerText = "The chosen edge is blocked right now";
            errorElement.style.opacity = ""+1;
        } else {
            errorElement.style.opacity = ""+0;
            game.addCar(sourceEdge, destnNode, isPriority);
        }
    }
}

function convertSourceToEdge(source: String): Edge {
    switch (source) {
        case "a":
            return constants.GAME_MAP.getEdge(1);
        case "b":
            return constants.GAME_MAP.getEdge(7);
        case "c":
            return constants.GAME_MAP.getEdge(13);
        case "d":
            return constants.GAME_MAP.getEdge(23);
        case "e":
            return constants.GAME_MAP.getEdge(19);
        case "f":
            return constants.GAME_MAP.getEdge(31);
        case "g":
            return constants.GAME_MAP.getEdge(27);
        case "h":
            return constants.GAME_MAP.getEdge(4);
        case "i":
            return constants.GAME_MAP.getEdge(10);
        case "j":
            return constants.GAME_MAP.getEdge(16);
    }
}

function convertDestinationToNode(destn: String): GraphNode {
    switch (destn) {
        case "a":
            return constants.GAME_MAP.getNode(7);
        case "b":
            return constants.GAME_MAP.getNode(19);
        case "c":
            return constants.GAME_MAP.getNode(31);
        case "d":
            return constants.GAME_MAP.getNode(37);
        case "e":
            return constants.GAME_MAP.getNode(52);
        case "f":
            return constants.GAME_MAP.getNode(53);
        case "g":
            return constants.GAME_MAP.getNode(68);
        case "h":
            return constants.GAME_MAP.getNode(6);
        case "i":
            return constants.GAME_MAP.getNode(18);
        case "j":
            return constants.GAME_MAP.getNode(30);
    }
}