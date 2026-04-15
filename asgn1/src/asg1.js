// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;

    void main(){
        gl_Position = a_Position;
        gl_PointSize = u_Size;
    }

`;

var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;

    void main(){
        gl_FragColor = u_FragColor;
    }

`;

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSeg = 3;

function addActionsForHtmlUI() {
    // Button event
    document.getElementById('clearButton').onclick = function() { g_shapesList=[]; renderAllShapes(); };

    document.getElementById('pointButton').onclick = function() { g_selectedType = POINT; };
    document.getElementById('triangleButton').onclick = function() { g_selectedType = TRIANGLE; };
    document.getElementById('circleButton').onclick = function() { g_selectedType = CIRCLE; };

    // Slider events
    document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
    document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
    document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

    document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

    document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedSeg = this.value; });
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();

    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;
    canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

    // Stroke ends when mouse is lifted
    canvas.onmouseup = function() { g_prevX = null; g_prevY = null; };

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
// Storing mouse positions
let g_prevX = null;
let g_prevY = null;

function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);

    // If first click, just draw normally
    if (g_prevX === null) {
        // Extracting shape modes into addShape
        addShape(x, y);
        g_prevX = x;
        g_prevY = y;
        return;
    }

    // Direction of stroke + how many points needed to fill in gaps
    let dx = x - g_prevX;
    let dy = y - g_prevY;
    let dist = Math.sqrt(dx*dx + dy*dy);

    // Number of steps (trying to control smoothness but adds a little lag)
    let steps = Math.ceil(dist / 0.02);

    // Loop through "in between" points
    for (let i = 0; i <= steps; i++) {
        let t = i / steps;
        let interpX = g_prevX + t * dx;
        let interpY = g_prevY + t * dy;
        addShape(interpX, interpY);
    }

    // Update previous position
    g_prevX = x;
    g_prevY = y;

    renderAllShapes();
}

function addShape(x, y) {
    let shape;

    if (g_selectedType == POINT) {
        shape = new Point();
    } else if (g_selectedType == TRIANGLE) {
        shape = new Triangle();
    } else {
        shape = new Circle();
        shape.segments = g_selectedSeg;
    }

    shape.position = [x, y];
    shape.color = g_selectedColor.slice();
    shape.size = g_selectedSize;

    g_shapesList.push(shape);
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x, y]);
}

function renderAllShapes() {
    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;

    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }
}

function drawPicture() {
    // Sky
    gl.uniform4f(u_FragColor, 0.53, 0.81, 0.92, 1.0);
    drawTriangle([-1.0, -1.0, 1.0, -1.0, -1.0,  1.0]);
    drawTriangle([1.0, -1.0, 1.0,  1.0, -1.0,  1.0]);

    // Sand
    gl.uniform4f(u_FragColor, 0.94, 0.87, 0.55, 1.0);
    drawTriangle([-1.0, -1.0, 1.0, -1.0, -1.0, -0.3]);
    drawTriangle([1.0, -1.0,1.0, -0.3,-1.0, -0.3]);

    // Tree (T)
    // Trunk
    gl.uniform4f(u_FragColor, 0.55, 0.27, 0.07, 1.0);
    drawTriangle([-0.6, -0.2, -0.2, -0.2, -0.6, 0.0]);
    drawTriangle([-0.2, -0.2, -0.2, 0.0, -0.6, 0.0]);
    drawTriangle([-0.45, -0.2, -0.35, -0.2, -0.45, -0.8]);
    drawTriangle([-0.35, -0.2, -0.35, -0.8, -0.45, -0.8]);

    // Leaves
    gl.uniform4f(u_FragColor, 0.0, 0.6, 0.2, 1.0);
    drawTriangle([-0.4, 0.0, -0.8, 0.4, -0.8, 0.1]);
    drawTriangle([-0.4, 0.0, 0.0, 0.4, 0.0, 0.1]);
    drawTriangle([-0.4, 0.0, -0.6, 0.6, -0.2, 0.6]);

    // Surfboard (Y)
    gl.uniform4f(u_FragColor, 1.0, 0.52, 0.0, 1.0);
    drawTriangle([0.2, -0.2, 0.4, 0.3, 0.6, -0.2]);
    drawTriangle([0.2, -0.2, 0.4, -0.8, 0.6, -0.2]);
    gl.uniform4f(u_FragColor, 0.2, 0.2, 0.2, 1.0);
    drawTriangle([0.4, -0.2, 0.3, 0.0, 0.35, 0.05]);
    drawTriangle([0.4, -0.2, 0.5, 0.0, 0.45, 0.05]);
    drawTriangle([0.38, -0.2, 0.42, -0.2, 0.4, -0.8]);
}