class Cylinder {
    constructor() {
        this.type = 'cylinder';
        this.color = [1, 1, 1, 1];
        this.matrix = new Matrix4();
        this.segments = 20;
    }

    render(color) {
        gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let angleStep = 360 / this.segments;

        for (let i = 0; i < this.segments; i++) {
            let angle1 = i * angleStep;
            let angle2 = (i + 1) * angleStep;

            let rad1 = angle1 * Math.PI / 180;
            let rad2 = angle2 * Math.PI / 180;

            let x1 = Math.cos(rad1) * 0.5;
            let z1 = Math.sin(rad1) * 0.5;
            let x2 = Math.cos(rad2) * 0.5;
            let z2 = Math.sin(rad2) * 0.5;

            // side (two triangles)
            drawTriangle3D([x1,0,z1, x2,0,z2, x2,1,z2]);

            drawTriangle3D([x1,0,z1, x2,1,z2, x1,1,z1]);

            // top
            drawTriangle3D([0,1,0, x2,1,z2, x1,1,z1]);

            // bottom
            drawTriangle3D([0,0,0, x1,0,z1, x2,0,z2]);
        }
    }
}