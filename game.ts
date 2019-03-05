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

    constructor(canvasElement : string) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);

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
    }

    createScene() : void {

        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        this._scene.clearColor = new BABYLON.Color4(0,0,0,1); // Set background color to black

        // Create the camera
        this._camera = new BABYLON.ArcRotateCamera('maincamera', Math.PI/3, Math.PI/4, 15, new BABYLON.Vector3(0, 0, 0), this._scene);
        this._camera.attachControl(this._canvas, false); // Attach the camera to the canvas to allow mouse movement

        // Create all light necessary for the scene
        this.createLight();

        // Create a built-in "ground" shape.
        let ground = BABYLON.MeshBuilder.CreateGround('ground1', {width: 12, height: 12, subdivisions: 1}, this._scene);
        ground.position.set(0,0,0);

        // Create a box now to play around with shadows (This will be removed once we create cars and buildings)
        let box = BABYLON.MeshBuilder.CreateBox("box", {
            size: 4
        }, this._scene);
        box.position.set(0,3,0)

        this.generateShadows(ground, box);
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