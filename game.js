var Game = /** @class */ (function () {
    function Game(canvasElement) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
    }
    Game.prototype.createScene = function () {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new BABYLON.ArcRotateCamera('maincamera', Math.PI / 4, Math.PI / 4, 15, new BABYLON.Vector3(0, 0, 0), this._scene);
        // Target the camera to scene origin.
        this._camera.setTarget(BABYLON.Vector3.Zero());
        // Attach the camera to the canvas.
        this._camera.attachControl(this._canvas, false);
        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        this._light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), this._scene);
        // Create a built-in "ground" shape.
        var ground = BABYLON.MeshBuilder.CreateGround('ground1', { width: 12, height: 12, subdivisions: 1 }, this._scene);
        ground.position.set(-2, 0, -2);
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
