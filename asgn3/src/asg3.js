// Vertex shader program
var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;

    void main(){
        gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }

`;

var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;

    void main(){
        if (u_whichTexture == -2) {                     // use color
            gl_FragColor = u_FragColor;
        } else if (u_whichTexture == -1) {              // use UV debug color
            gl_FragColor = vec4(v_UV, 1.0, 1.0);
        } else if (u_whichTexture == 0) {               // use texture0
            gl_FragColor = texture2D(u_Sampler0, v_UV);
        } else if (u_whichTexture == 1) {               // use texture1
            gl_FragColor = texture2D(u_Sampler1, v_UV);
        } else {                                        // error, put redish
            gl_FragColor = vec4(1, 0.2, 0.2, 1);
        }
    }

`;

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    
    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    // Get the storage location of u_Sampler0
    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return false;
    }

    // Get the storage location of u_Sampler0
    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return false;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Globals related to UI elements
let g_selectedColor = [1.0, 0.0, 0.0, 1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_feetAngle = 0;
let g_globalAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_feetAnimation = false;
let g_mouseDown = false;
let g_lastX = 0;
let g_lastY = 0;
let g_rotateX = 0;
let g_rotateY = 0;
let g_wiggle = false;


function addActionsForHtmlUI() {
    // Button events
    document.getElementById('animationFeetOffButton').onclick = function() { g_feetAnimation=false; };
    document.getElementById('animationFeetOnButton').onclick = function() { g_feetAnimation=true; };
    document.getElementById('animationMagentaOffButton').onclick = function() { g_magentaAnimation=false; };
    document.getElementById('animationMagentaOnButton').onclick = function() { g_magentaAnimation=true; };
    document.getElementById('animationYellowOffButton').onclick = function() { g_yellowAnimation=false; };
    document.getElementById('animationYellowOnButton').onclick = function() { g_yellowAnimation=true; };

    // Slider events
    document.getElementById('feetSlide').addEventListener('mousemove', function() { g_feetAngle = this.value; renderAllShapes(); });
    document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });
    document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });

    document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}

function initTextures() {
    var image = new Image();  // Create the image object
    if (!image) {
        console.log('Failed to create the image object');
        return false;
    }
    // Register the event handler to be called on loading an image
    image.onload = function(){ sendTextureToTEXTURE0(image); };
    // Tell the browser to load an image
    image.src = 'sky.jpg';

    var image2 = new Image();
    if (!image2) {
        console.log('Failed to create the image object');
        return false;
    }
    image2.onload = function() { sendTextureToTEXTURE1(image2); };
    image2.src = 'wall.jpg';

    return true;
}

function sendTextureToTEXTURE0(image) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip th e image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);
    
    //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
    console.log("finished loadTexture")
}
function sendTextureToTEXTURE1(image) {
    var texture = gl.createTexture();   // Create a texture object
    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip th e image's y axis
    // Enable texture unit0
    gl.activeTexture(gl.TEXTURE1);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    
    // Set the texture unit 1 to the sampler
    gl.uniform1i(u_Sampler1, 1);
    
    //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

    //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
    console.log("finished loadTexture")
}

function main() {
    setupWebGL();

    camera = new Camera();

    connectVariablesToGLSL();

    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    //canvas.onmousedown = click;
    //canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
    //canvas.onmousedown = function(ev) {
    //    g_mouseDown = true;
    //    g_lastX = ev.clientX;
    //    g_lastY = ev.clientY;

    //    if (ev.shiftKey) {
    //        g_wiggle = true;
    //    }
    //};

    //canvas.onmouseup = function() {
    //    g_mouseDown = false;
    //    g_wiggle = false;
    //};

    //canvas.onmousemove = function(ev) {
    //    if (g_mouseDown) {
    //        let dx = ev.clientX - g_lastX;
    //        let dy = ev.clientY - g_lastY;

    //        g_rotateY += dx * 0.5;
    //        g_rotateX += dy * 0.5;

    //        g_lastX = ev.clientX;
    //        g_lastY = ev.clientY;
    //    }
    //};

    document.onkeydown = keydown;
    initTextures();

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick() {
    g_seconds = performance.now()/1000.0 - g_startTime;
    //console.log(g_seconds);

    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function updateAnimationAngles() {
    if (g_yellowAnimation) {
        g_yellowAngle = (45*Math.sin(g_seconds));
    }
    if (g_magentaAnimation) {
        g_magentaAngle = (45*Math.sin(3*g_seconds));
    }
    if (g_feetAnimation) {
        g_feetAngle = (45*Math.sin(6*g_seconds));
    }
    if (g_wiggle) {
        g_yellowAngle = 30 * Math.sin(12 * g_seconds);
        g_magentaAngle = 30 * Math.sin(18 * g_seconds);
        g_feetAngle = 20 * Math.sin(20 * g_seconds);
    }
}

var g_shapesList = [];
// Storing mouse positions
let g_prevX = null;
let g_prevY = null;

function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);

    let point;
    if (g_selectedType == POINT) {
        point = new Point();
    } else if (g_selectedType == TRIANGLE) {
        point = new Triangle();
    } else {
        point = new Circle();
    }
    point.position = [x,y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

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

function drawLeg(baseMatrix, x, z) {
    // thigh
    var thigh = new Cube();
    thigh.textureNum = -2;
    thigh.matrix = new Matrix4(baseMatrix);
    thigh.matrix.translate(x, -0.1, z);
    thigh.matrix.rotate(-g_yellowAngle, 0, 0, 1);

    var thighMat = new Matrix4(thigh.matrix);
    thigh.matrix.translate(0, -0.25, 0);
    thigh.matrix.scale(0.1, 0.35, 0.1);
    thigh.render([0.5, 0.5, 0.5, 1.0]);

    // calf
    var calf = new Cube();
    calf.textureNum = -2;
    calf.matrix = new Matrix4(thighMat);
    calf.matrix.translate(0, -0.25, 0);
    calf.matrix.rotate(g_magentaAngle, 0, 0, 1);

    var calfMat = new Matrix4(calf.matrix);
    calf.matrix.translate(0, -0.25, 0);
    calf.matrix.scale(0.08, 0.25, 0.08);
    calf.render([0.4, 0.4, 0.4, 1.0]);

    // foot
    var foot = new Cube();
    foot.textureNum = -2;
    foot.matrix = new Matrix4(calfMat);
    foot.matrix.translate(0, -0.3, 0);
    foot.matrix.rotate(g_feetAngle, 0, 0, 1);
    foot.matrix.scale(0.12, 0.05, 0.15);
    foot.render([0.8, 0.5, 0.5, 1.0]);
}

function drawWhisker(headMatrix, yOffset, zOffset) {
    var w = new Cube();
    w.textureNum = -2;
    w.matrix = new Matrix4(headMatrix);
    w.matrix.translate(1.0, yOffset, zOffset);
    w.matrix.scale(0.4, 0.02, 0.02);
    w.render([1.0, 1.0, 1.0, 1.0]);
}

function keydown(ev, gl, n, u_ViewMatrix, viewMatrix) {
    if (ev.keyCode == 87) {        // W key was pressed
        camera.moveForward();
    } else if (ev.keyCode == 83) { // s key was pressed
        camera.moveBackwards();
    } else if (ev.keyCode == 65) { // A key was pressed
        camera.moveLeft();
    } else if (ev.keyCode == 68) { // D was pressed
        camera.moveRight();
    } else if (ev.keyCode == 81) { // Q was pressed
        camera.panLeft();
    } else if (ev.keyCode == 69) { // E was pressed
        camera.panRight();
    } else { return; }

    renderAllShapes();    
    console.log(ev.keyCode);
}

//var g_eye = [0,0,1.5];
//var g_at = [0,0,-100];
//var g_up = [0,1,0];
var camera;

var map = [
    [1, 1, 1, 1, 1, 1, 1, 1], 
    [1, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 1, 1, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 1], 
    [1, 0, 0, 0, 1, 0, 0, 1], 
    [1, 0, 0, 0, 0, 0, 0, 1]
];

function drawMap() {
    for (x = 0; x < 32; x++) {
        for (y = 0; y < 32; y++) {
            var body = new Cube();
            body.color = [0.8, 1.0, 1.0, 1.0];
            body.matrix.translate(0, -0.75, 0);
            body.matrix.scale(0.4, 0.4, 0.4);
            body.matrix.translate(x-16, 0, y-16);
            body.textureNum = -2;
            body.renderfast(); 
        }
    }
}


function renderAllShapes() {
    var startTime = performance.now();

    var projMat = camera.projectionMatrix;
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = camera.viewMatrix;
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngle, 0, 1, 0);
    globalRotMat.rotate(g_rotateX, 1, 0, 0);
    globalRotMat.rotate(g_rotateY, 0, 1, 0);

    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // draw sky cube
    var sky = new Cube();
    //sky.textureNum = 1;
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-0.5, -0.5, -0.5);
    sky.render([0.5, 0.8, 1.0, 1.0]);


    // draw floor cube
    var floor = new Cube();
    floor.textureNum = -2;
    floor.matrix.translate(0, -0.75, 0.0);
    floor.matrix.scale(10, 0, 10);
    floor.matrix.translate(-0.5, 0, -1);
    floor.render([0.47, 0.84, 0.5, 1.0]);

    drawMap();

    // draw body cube
    var body = new Cube();
    body.textureNum = -2;
    body.matrix.translate(-0.25, -0.5, 0.0);
    body.matrix.scale(0.5, 0.25, 0.3);
    body.render([0.6, 0.6, 0.6, 1.0]);

    // draw head
    var head = new Cube();
    head.textureNum = -2;
    head.matrix.set(body.matrix);
    head.matrix.translate(0.9, 0.3, 0.35);
    head.matrix.scale(0.3, 0.3, 0.3);
    head.render([0.7, 0.7, 0.7, 1.0]);

    // draw eyes
    var eye1 = new Cube();
    eye1.textureNum = -2;
    eye1.matrix.set(head.matrix);
    eye1.matrix.translate(0.95, 0.7, 0.1);
    eye1.matrix.scale(0.1, 0.1, 0.1);
    eye1.render([1.0, 0.0, 0.0, 1.0]);

    var eye2 = new Cube();
    eye2.textureNum = -2;
    eye2.matrix.set(head.matrix);
    eye2.matrix.translate(0.95, 0.7, 0.7);
    eye2.matrix.scale(0.1, 0.1, 0.1);
    eye2.render([1.0, 0.0, 0.0, 1.0]);

    // draw ears
    var ear1 = new Cube();
    ear1.textureNum = -2;
    ear1.matrix.set(head.matrix);
    ear1.matrix.translate(0.2, 1.0, 0.2);
    ear1.matrix.scale(0.2, 0.2, 0.1);
    ear1.render([1.0, 0.7, 0.7, 1.0]);

    var ear2 = new Cube();
    ear2.textureNum = -2;
    ear2.matrix.set(head.matrix);
    ear2.matrix.translate(0.2, 1.0, 0.7);
    ear2.matrix.scale(0.2, 0.2, 0.1);
    ear2.render([1.0, 0.7, 0.7, 1.0]);

    // draw legs
    drawLeg(body.matrix, 0.2, 0.1);   // front left
    drawLeg(body.matrix, 0.2, 0.8);   // front right
    drawLeg(body.matrix, 0.6, 0.1);   // back left
    drawLeg(body.matrix, 0.6, 0.8);   // back right

    // draw whiskers
    drawWhisker(head.matrix, 0.4, 0.2);
    drawWhisker(head.matrix, 0.5, 0.2);
    drawWhisker(head.matrix, 0.3, 0.2);
    drawWhisker(head.matrix, 0.4, 0.7);
    drawWhisker(head.matrix, 0.5, 0.7);
    drawWhisker(head.matrix, 0.3, 0.7);

    // draw nose
    var nose = new Cube();
    nose.textureNum = -2;
    nose.matrix.set(head.matrix);
    nose.matrix.translate(1.0, 0.4, 0.4);
    nose.matrix.scale(0.1, 0.1, 0.1);
    nose.render([1.0, 0.6, 0.6, 1.0]);

    // draw tail (2 parts wag independently)
    var tail1 = new Cylinder();
    tail1.textureNum = -2;
    tail1.matrix.set(body.matrix);
    tail1.matrix.translate(-0.01, 0.3, 0.5);
    tail1.matrix.rotate(90, 0, 0, 1);
    tail1.matrix.rotate(20*Math.sin(g_seconds), 1, 0, 0);
    var tailMat = new Matrix4(tail1.matrix);
    tail1.matrix.scale(0.05, 0.4, 0.05);
    tail1.render([0.8, 0.6, 0.6, 1.0]);

    var tail2 = new Cylinder();
    tail2.textureNum = -2;
    tail2.matrix = new Matrix4(tailMat);
    tail2.matrix.translate(0, 0.4, 0);
    tail2.matrix.rotate(20*Math.sin(g_seconds+1), 1, 0, 0);
    tail2.matrix.scale(0.05, 0.4, 0.05);
    tail2.render([0.8, 0.6, 0.6, 1.0]);

    var duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(1000/duration), "fps");
}

function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}