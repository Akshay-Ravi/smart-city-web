var Game = /** @class */ (function () {
    function Game(canvasElement) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
        // Initialize properties
        this._directionalLight = {
            light: undefined,
            position: new BABYLON.Vector3(0, 10, 0),
            direction: new BABYLON.Vector3(-0.5, -1, -0.5),
            intensity: 0.6
        };
        this._ambientLight = {
            light: undefined,
            direction: new BABYLON.Vector3(0, 1, 0),
            intensity: 0.3
        };
        this._verticalRoads = [];
        this._horizontalRoads = [];
    }
    Game.prototype.createScene = function () {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        this._scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // Set background color to black
        // Create the camera
        this._camera = new BABYLON.ArcRotateCamera('maincamera', BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(30), 18, new BABYLON.Vector3(0, 0, 0), this._scene);
        this._camera.attachControl(this._canvas, false); // Attach the camera to the canvas to allow mouse movement
        // Create all light necessary for the scene
        this.createLight();
        // Create a built-in "ground" shape.
        var ground = BABYLON.MeshBuilder.CreateGround('ground1', { width: 20, height: 12, subdivisions: 1 }, this._scene);
        ground.position.set(0, 0, 0);
        // Give ground a grass texture
        var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", this._scene);
        var groundTexture = new BABYLON.Texture("images/grass.jpg", this._scene);
        groundTexture.uScale = 20;
        groundTexture.vScale = 12;
        groundMaterial.diffuseTexture = groundTexture;
        ground.material = groundMaterial;
        // Create the road texture for assigning to the road meshes later
        var roadMaterial = new BABYLON.StandardMaterial("roadMaterial", this._scene);
        roadMaterial.diffuseTexture = new BABYLON.Texture("images/road.png", this._scene);
        // CREATE ALL ROADS
        var road1 = BABYLON.MeshBuilder.CreatePlane("road1", { width: 2, height: 12 }, this._scene);
        road1.position.set(0, 0.01, 0);
        this._verticalRoads.push(road1);
        var road2 = BABYLON.MeshBuilder.CreatePlane("road1", { width: 2, height: 12 }, this._scene);
        road2.position.set(-6, 0.01, 0);
        this._verticalRoads.push(road2);
        var road3 = BABYLON.MeshBuilder.CreatePlane("road1", { width: 2, height: 12 }, this._scene);
        road3.position.set(6, 0.01, 0);
        this._verticalRoads.push(road3);
        var road4 = BABYLON.MeshBuilder.CreatePlane("road1", { width: 2, height: 20 }, this._scene);
        road4.position.set(0, 0.02, -3);
        this._horizontalRoads.push(road4);
        var road5 = BABYLON.MeshBuilder.CreatePlane("road1", { width: 2, height: 20 }, this._scene);
        road5.position.set(0, 0.02, 3);
        this._horizontalRoads.push(road5);
        this._verticalRoads.forEach(function (road) {
            road.material = roadMaterial;
            road.rotate(new BABYLON.Vector3(0, 1, 0), BABYLON.Tools.ToRadians(180));
            road.rotate(new BABYLON.Vector3(1, 0, 0), BABYLON.Tools.ToRadians(90));
        });
        this._horizontalRoads.forEach(function (road) {
            road.material = roadMaterial;
            road.rotate(new BABYLON.Vector3(0, 1, 0), BABYLON.Tools.ToRadians(270));
            road.rotate(new BABYLON.Vector3(1, 0, 0), BABYLON.Tools.ToRadians(90));
        });
        this.generateShadows(ground);
    };
    Game.prototype.createLight = function () {
        // Directional Light is used to generate shadows
        this._directionalLight.light = new BABYLON.DirectionalLight("sunlight", this._directionalLight.direction, this._scene);
        this._directionalLight.light.position = this._directionalLight.position;
        this._directionalLight.light.intensity = this._directionalLight.intensity;
        // Ambient Light is of type Hemispheric Light
        this._ambientLight.light = new BABYLON.HemisphericLight("ambientlight", this._ambientLight.direction, this._scene);
        this._ambientLight.light.intensity = this._ambientLight.intensity;
    };
    Game.prototype.generateShadows = function (ground) {
        var items = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            items[_i - 1] = arguments[_i];
        }
        var shadowGenerator = new BABYLON.ShadowGenerator(512, this._directionalLight.light);
        items.forEach(function (item) {
            shadowGenerator.getShadowMap().renderList.push(item);
        });
        ground.receiveShadows = true;
    };
    Game.prototype.doRender = function () {
        var _this = this;
        // Run the render loop.
        this._engine.runRenderLoop(function () {
            _this._scene.render();
        });
        // The canvas/window resize event handler.
        window.addEventListener('resize', function () {
            _this._engine.resize();
        });
    };
    return Game;
}());
window.addEventListener('DOMContentLoaded', function () {
    // Create the game using the 'renderCanvas'.
    var game = new Game('renderCanvas');
    // Create the scene.
    game.createScene();
    // Start render loop.
    game.doRender();
});
