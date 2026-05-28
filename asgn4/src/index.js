import { setupWebGL, connectVariablesToGLSL, camera, projectionMatrix, viewMatrix, stats } from "./Setup";
//import Model from "./Model";

// set up webgl variables
let gl = setupWebGL();
let program = connectVariablesToGLSL(gl);
gl.clearColor(0, 0, 0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// load obj
let teapot = new Model(gl, "teapot.obj");

// prettier-ignore
function renderAllShapes(time) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  stats.begin();

  // send uniforms to shader
  gl.uniformMatrix4fv(program.u_ProjectionMatrix, false, projectionMatrix.elements);
  gl.uniformMatrix4fv(program.u_ViewMatrix, false, viewMatrix.elements);
  gl.uniform3fv(program.u_CameraPos, camera.eye);

  // render obj
  teapot.color = [1.0, 1.0, 1.0, 1.0];
  teapot.matrix.translate(-4, 0, -4);
  teapot.render(gl, program);
  teapot.render(gl, program);

  teapot.color = [1.0, 1.0, 0.0, 1.0];
  teapot.matrix.setScale(0.75, 0.75, 0.75);
  teapot.matrix.rotate(180, 0, 1, 0);
  teapot.matrix.translate(1, 0, 1);
  teapot.render(gl, program);

  stats.end();
  requestAnimationFrame(renderAllShapes);
}

renderAllShapes();
