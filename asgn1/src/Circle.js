class Circle {
    constructor() {
        this.type = 'circle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 3;
    }

    render() {
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        var d = size/200.0; // delta
        
        let angleStep = 360/this.segments;
        for (var angle = 0; angle < 360; angle = angle + angleStep) {
            let centerPt = [xy[0], xy[1]];
            let a1 = angle;
            let a2 = angle + angleStep;
            let v1 = [Math.cos(a1*Math.PI/180)*d, Math.sin(a1*Math.PI/180)*d];
            let v2 = [Math.cos(a2*Math.PI/180)*d, Math.sin(a2*Math.PI/180)*d];
            let pt1 = [centerPt[0] + v1[0], centerPt[1] + v1[1]];
            let pt2 = [centerPt[0] + v2[0], centerPt[1] + v2[1]];

            drawTriangle([xy[0], xy[1], pt1[0], pt1[1], pt2[0], pt2[1]]);
        }
    }
}