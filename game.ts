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
    private _cityWidth: number
    private _cityHeight: number
    private _roadWidth: number

    private _allCars: Array<Car>

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
        this._cityWidth = 23;
        this._cityHeight = 16;
        this._roadWidth = 2;
    }

    createScene() : void {

        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        this._scene.clearColor = new BABYLON.Color4(0,0,0,1); // Set background color to black

        // Create the camera
        this._camera = new BABYLON.ArcRotateCamera('maincamera', BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(30), 18, new BABYLON.Vector3(0, 0, 0), this._scene);
        this._camera.attachControl(this._canvas, false); // Attach the camera to the canvas to allow mouse movement

        // Create all light necessary for the scene
        this.createLight();

        // Create a built-in "ground" shape.
        let ground = BABYLON.MeshBuilder.CreateGround('ground1', {width: this._cityWidth, height: this._cityHeight, subdivisions: 1}, this._scene);
        ground.position.set(0,0,0);
        
        // Give ground a grass texture
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this._scene);
        var groundTexture = new BABYLON.Texture("images/grass.jpg", this._scene);
        groundTexture.uScale = this._cityWidth;
        groundTexture.vScale = this._cityHeight;
        groundMaterial.diffuseTexture = groundTexture;
        ground.material = groundMaterial;

        // Create the road texture for assigning to the road meshes later
        var roadMaterial = new BABYLON.StandardMaterial("roadMaterial", this._scene);
        roadMaterial.diffuseTexture = new BABYLON.Texture("images/road.png", this._scene);
        
        // CREATE ALL ROADS
        var road1 = BABYLON.MeshBuilder.CreatePlane("road1", {width: this._roadWidth, height: this._cityHeight}, this._scene);
        road1.position.set(0,this._verticalRoadHeight,0);
        this._verticalRoads.push(road1);

        var road2 = BABYLON.MeshBuilder.CreatePlane("road2", {width: this._roadWidth, height: this._cityHeight}, this._scene);
        road2.position.set(-6,this._verticalRoadHeight,0);
        this._verticalRoads.push(road2);

        var road3 = BABYLON.MeshBuilder.CreatePlane("road3", {width: this._roadWidth, height: this._cityHeight}, this._scene);
        road3.position.set(6,this._verticalRoadHeight,0);
        this._verticalRoads.push(road3);

        var road4 = BABYLON.MeshBuilder.CreatePlane("road4", {width: this._roadWidth, height: this._cityWidth}, this._scene);
        road4.position.set(0,this._horizontalRoadHeight,-3);
        this._horizontalRoads.push(road4);

        var road5 = BABYLON.MeshBuilder.CreatePlane("road5", {width: this._roadWidth, height: this._cityWidth}, this._scene);
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

        this.addCar(new BABYLON.Vector3(0.5, 0, 0));
        this.generateShadows(ground);

    }

    addCar(position: BABYLON.Vector3): void {
        BABYLON.SceneLoader.ImportMesh("", "images/cars/Babylon/", "SportsCar.babylon", this._scene, (newmeshes) => {
            newmeshes.forEach(mesh => {
                mesh.id = "car1";
                mesh.position = position
                mesh.scaling = new BABYLON.Vector3(0.3, 0.3, 0.3);
                
                var carMesh = this._scene.getMeshByID("car1");
                // console.log(carMesh);
                // var anim = new BABYLON.Animation("rando", "position", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
                // var keys = [{frame: 0,value: carMesh.position}, {frame: 100,value: new BABYLON.Vector3(0.5, 0,-5)}];
                // anim.setKeys(keys);
                // carMesh.animations.push(anim);
                // this._scene.beginAnimation(carMesh, 0, 100, false);

                this.addToShadow(carMesh);
            });
        });

        this._allCars.push(new Car(1))
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
});