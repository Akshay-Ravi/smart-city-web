# Smart City

### Requirements
This is a list of languages/libraries you'll need to be familiar in to work on this project :-

1. Basic HTML
2. Basic JavaScript
3. Babylon JS : A library to simplify 3D rendering on the HTML Canvas. Click [here](https://doc.babylonjs.com/#getting-started) to get started.

### Installation
1. If you're on windows, FOR THE LOVE OF GOD, reboot into Linux. Any distro, I don't care.

2. Clone the repo
```bash
git clone https://github.com/gauthamk97/smart-city-web
```

3. Navigate to the root directory of the project
```bash
cd smart-city-web
```

4. Install all the required dependencies using npm (node package manager)
```bash
npm install
```
If you don't have npm installed, click [here](https://www.npmjs.com/get-npm) to install it. (You can check if you do have it installed by simply running `npm` in the terminal)

5. Compile the typescript files into javascript along with all of their dependencies.
```bash
npm run build
```
 > Note : I'm using webpack for this - click [here](https://webpack.js.org/guides/getting-started) if you want to know more about webpack. Else, just run the command and move on.

 > This command will continue watching for any changes to the code, and automatically recompile when any changes are detected.

6. Open a separate terminal and run any webserver of your choice (I prefer python's built in SimpleHTTPServer)
```bash
python -m "SimpleHTTPServer"
```

> Note : I use Python v2.7.15

7. Open Google Chrome and visit *localhost:8000/dist*

### To Do/Bugs to iron out
1. Traffic Signals max lights increase
2. Implement Base Paper