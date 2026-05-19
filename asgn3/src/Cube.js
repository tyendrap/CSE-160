class Cube {
    constructor() {
        this.type = "cube";
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        //this.size = 5.0;
        this.textureNum = 0;
    }

    render(color=this.color) {
        var rgba = color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // top of cube/
        drawTriangle3DUV([0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0], [0,0, 0,1, 1,1]);

        // front of cube/
        drawTriangle3DUV([0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0], [0,0, 0,1, 1,1]);

        // lighting
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
    
        // bottom of cube/
        drawTriangle3DUV([0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,1.0], [0,0, 0,0, 1,0]);
        drawTriangle3DUV([0.0,0.0,0.0, 1.0,0.0,1.0, 1.0,0.0,0.0], [0,0, 1,0, 1,0]);

        // back of cube/
        drawTriangle3DUV([0.0,1.0,0.0, 0.0,1.0,1.0, 1.0,1.0,1.0], [0,1, 0,1, 1,1]);
        drawTriangle3DUV([0.0,1.0,0.0, 1.0,1.0,1.0, 1.0,1.0,0.0], [0,1, 1,1, 1,1]);

        // left of cube/
        drawTriangle3DUV([0.0,1.0,1.0, 0.0,0.0,1.0, 0.0,1.0,0.0], [0,1, 0,0, 0,1]);
        drawTriangle3DUV([0.0,0.0,0.0, 0.0,0.0,1.0, 0.0,1.0,0.0], [0,0, 0,0, 0,1]);

        // right of cube
        drawTriangle3DUV([1.0,1.0,1.0, 1.0,0.0,1.0, 1.0,1.0,0.0], [1,1, 1,0, 1,1]);
        drawTriangle3DUV([1.0,0.0,0.0, 1.0,0.0,1.0, 1.0,1.0,0.0], [1,0, 1,0, 1,1]);
    }

    renderfast() {
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        
        var allverts = [];
        
        // Front of cube
        allverts = allverts.concat([0,0,0, 1,1,0, 1,0,0]);
        allverts = allverts.concat([0,0,0, 0,1,0, 1,1,0]);

        // Top of cube
        allverts = allverts.concat([0,1,0, 0,1,1, 1,1,1]);
        allverts = allverts.concat([0,1,0, 1,1,1, 1,1,0]);

        // Right of cube
        allverts = allverts.concat([1,1,0, 1,1,1, 1,0,0]);
        allverts = allverts.concat([1,0,0, 1,1,1, 1,0,1]);

        // Left of cube
        allverts = allverts.concat([0,1,0, 0,1,1, 0,0,0]);
        allverts = allverts.concat([0,0,0, 0,1,1, 0,0,1]);

        // Bottom of cube
        allverts = allverts.concat([0,0,0, 0,0,1, 1,0,1]);
        allverts = allverts.concat([0,0,0, 1,0,1, 1,0,0]);

        // Back of cube
        allverts = allverts.concat([0,0,1, 1,1,1, 1,0,1]);
        allverts = allverts.concat([0,0,1, 0,1,1, 1,1,1]);

        drawTriangle3D(allverts);
    }
}