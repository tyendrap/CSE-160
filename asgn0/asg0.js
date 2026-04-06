// DrawTriangle.js (c) 2012 matsuda
let ctx;
let canvas;

function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  // Draw a black rectangle
  ctx.fillStyle = "black"; // Set color to black
  ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color

  //let v1 = new Vector3([2.25, 2.25, 0]);
  //drawVector(v1,"red");
}

function drawVector(v, color) {
  ctx.strokeStyle = color;
  let cx = canvas.width/2;
  let cy = canvas.height/2;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + v.elements[0] * 20, cy - v.elements[1] * 20);
  ctx.stroke();
}

function handleDrawEvent() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let x1 = document.getElementById('v1x').value;
  let y1 = document.getElementById('v1y').value;
  let v1 = new Vector3([x1, y1, 0]); 

  let x2 = document.getElementById('v2x').value;
  let y2 = document.getElementById('v2y').value;
  let v2 = new Vector3([x2, y2, 0]);
  
  drawVector(v1, "red");
  drawVector(v2, "blue");
}

function handleDrawOperationEvent() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  let x1 = document.getElementById('v1x').value;
  let y1 = document.getElementById('v1y').value;
  let v1 = new Vector3([x1, y1, 0]); 

  let x2 = document.getElementById('v2x').value;
  let y2 = document.getElementById('v2y').value;
  let v2 = new Vector3([x2, y2, 0]);
  
  drawVector(v1, "red");
  drawVector(v2, "blue");

  let op = document.getElementById('op-select').value;
  let s = document.getElementById('scalar').value;

  if (op === "add") {
    let v3 = new Vector3(v1.elements).add(v2);
    drawVector(v3, "green");
  } else if (op === "sub") {
    let v3 = new Vector3(v1.elements).sub(v2);
    drawVector(v3, "green");
  } else if (op === "mul") {
    let v3 = new Vector3(v1.elements).mul(s);
    let v4 = new Vector3(v2.elements).mul(s);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "div") {
    let v3 = new Vector3(v1.elements).div(s);
    let v4 = new Vector3(v2.elements).div(s);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "mag") {
    console.log("Magnitude v1:", v1.magnitude());
    console.log("Magnitude v2:", v2.magnitude());
  } else if (op === "norm") {
    let v3 = new Vector3(v1.elements).normalize();
    let v4 = new Vector3(v2.elements).normalize();
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "angle") {
    let angle = angleBetween(v1, v2);
    console.log("Angle:", angle);
  } else if (op === "area") {
    let area = areaTriangle(v1, v2);
    console.log("Area of the triangle:", area);
  }
}

function angleBetween(v1, v2) {
  let dot = Vector3.dot(v1, v2);
  let m1 = v1.magnitude();
  let m2 = v2.magnitude();

  let cosAlpha = dot / (m1 * m2);

  cosAlpha = Math.min(1, Math.max(-1, cosAlpha));

  let angleRad = Math.acos(cosAlpha);
  let angleDeg = angleRad * (180 / Math.PI);

  return angleDeg;
}

function areaTriangle(v1, v2) {
  let cross = Vector3.cross(v1, v2);
  let areaPar = cross.magnitude();
  let areaTri = areaPar / 2;

  return areaTri;
}