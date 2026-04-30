class Cube {
    constructor() {
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render(color) {

        gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // top of cube/
        drawTriangle3D([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0]);
        drawTriangle3D([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0]);

        // bottom of cube/
        drawTriangle3D([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0]);
        drawTriangle3D([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0]);

        // lighting
        gl.uniform4f(u_FragColor, color[0]*.9, color[1]*.9, color[2]*.9, color[3]);
    
        // front of cube/
        drawTriangle3D([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0]);
        drawTriangle3D([0.0,0.0,0.0, 1.0,0.0,1.0, 1.0,0.0,0.0]);

        // back of cube/
        drawTriangle3D([0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0]);
        drawTriangle3D([0.0,1.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0]);

        // left of cube/
        drawTriangle3D([0.0,1.0,1.0, 0.0,0.0,1.0, 0.0,1.0,0.0]);
        drawTriangle3D([0.0,0.0,0.0, 0.0,0.0,1.0, 0.0,1.0,0.0]);

        // right of cube
        drawTriangle3D([1.0,1.0,1.0, 1.0,0.0,1.0, 1.0,1.0,0.0]);
        drawTriangle3D([1.0,0.0,0.0, 1.0,0.0,1.0, 1.0,1.0,0.0]);
    }
}