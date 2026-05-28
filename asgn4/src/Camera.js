class Camera{
    constructor(){
        this.eye = new Vector3([0,0,2]);
        this.at = new Vector3([0,0,-1]);
        this.up = new Vector3([0,1,0]);
        this.fov = 90;
        
        this.viewMatrix = new Matrix4();
        this.updateViewMatrix();

        this.projectionMatrix = new Matrix4();
        this.projectionMatrix.setPerspective(this.fov, canvas.width/canvas.height, 0.1, 1000);
    }

    updateViewMatrix() {
        this.viewMatrix.setLookAt(
            this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
            this.at.elements[0],  this.at.elements[1],  this.at.elements[2],
            this.up.elements[0],  this.up.elements[1],  this.up.elements[2]
        );
    }

    moveForward() {
        let speed = 0.2;

        let fx = this.at.elements[0] - this.eye.elements[0];
        let fy = this.at.elements[1] - this.eye.elements[1];
        let fz = this.at.elements[2] - this.eye.elements[2];

        let len = Math.sqrt(fx*fx + fy*fy + fz*fz);

        fx = (fx / len) * speed;
        fy = (fy / len) * speed;
        fz = (fz / len) * speed;

        this.eye.elements[0] += fx;
        this.eye.elements[1] += fy;
        this.eye.elements[2] += fz;

        this.at.elements[0] += fx;
        this.at.elements[1] += fy;
        this.at.elements[2] += fz;

        this.updateViewMatrix();
    }

    moveBackwards() {
        let speed = 0.2;

        let bx = this.eye.elements[0] - this.at.elements[0];
        let by = this.eye.elements[1] - this.at.elements[1];
        let bz = this.eye.elements[2] - this.at.elements[2];

        let len = Math.sqrt(bx*bx + by*by + bz*bz);

        bx = (bx / len) * speed;
        by = (by / len) * speed;
        bz = (bz / len) * speed;

        this.eye.elements[0] += bx;
        this.eye.elements[1] += by;
        this.eye.elements[2] += bz;

        this.at.elements[0] += bx;
        this.at.elements[1] += by;
        this.at.elements[2] += bz;

        this.updateViewMatrix();
    }

    moveLeft() {
        let speed = 0.2;

        let fx = this.at.elements[0] - this.eye.elements[0];
        let fy = this.at.elements[1] - this.eye.elements[1];
        let fz = this.at.elements[2] - this.eye.elements[2];

        let sx = this.up.elements[1]*fz - this.up.elements[2]*fy;
        let sy = this.up.elements[2]*fx - this.up.elements[0]*fz;
        let sz = this.up.elements[0]*fy - this.up.elements[1]*fx;

        let len = Math.sqrt(sx*sx + sy*sy + sz*sz);

        sx = (sx / len) * speed;
        sy = (sy / len) * speed;
        sz = (sz / len) * speed;

        this.eye.elements[0] += sx;
        this.eye.elements[1] += sy;
        this.eye.elements[2] += sz;

        this.at.elements[0] += sx;
        this.at.elements[1] += sy;
        this.at.elements[2] += sz;

        this.updateViewMatrix();
    }

    moveRight() {
        let speed = 0.2;

        let fx = this.at.elements[0] - this.eye.elements[0];
        let fy = this.at.elements[1] - this.eye.elements[1];
        let fz = this.at.elements[2] - this.eye.elements[2];

        let sx = fy * this.up.elements[2] - fz * this.up.elements[1];
        let sy = fz * this.up.elements[0] - fx * this.up.elements[2];
        let sz = fx * this.up.elements[1] - fy * this.up.elements[0];

        let len = Math.sqrt(sx*sx + sy*sy + sz*sz);

        sx = (sx / len) * speed;
        sy = (sy / len) * speed;
        sz = (sz / len) * speed;

        this.eye.elements[0] += sx;
        this.eye.elements[1] += sy;
        this.eye.elements[2] += sz;

        this.at.elements[0] += sx;
        this.at.elements[1] += sy;
        this.at.elements[2] += sz;

        this.updateViewMatrix();
    }

    panLeft() {
        let alpha = 5;

        let fx = this.at.elements[0] - this.eye.elements[0];
        let fy = this.at.elements[1] - this.eye.elements[1];
        let fz = this.at.elements[2] - this.eye.elements[2];

        let f = new Vector3([fx, fy, fz]);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(
            alpha,
            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );

        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at.elements[0] = this.eye.elements[0] + f_prime.elements[0];
        this.at.elements[1] = this.eye.elements[1] + f_prime.elements[1];
        this.at.elements[2] = this.eye.elements[2] + f_prime.elements[2];

        this.updateViewMatrix();
    }

    panRight() {
        let alpha = -5;

        let fx = this.at.elements[0] - this.eye.elements[0];
        let fy = this.at.elements[1] - this.eye.elements[1];
        let fz = this.at.elements[2] - this.eye.elements[2];

        let f = new Vector3([fx, fy, fz]);

        let rotationMatrix = new Matrix4();
        rotationMatrix.setRotate(
            alpha,
            this.up.elements[0],
            this.up.elements[1],
            this.up.elements[2]
        );

        let f_prime = rotationMatrix.multiplyVector3(f);

        this.at.elements[0] = this.eye.elements[0] + f_prime.elements[0];
        this.at.elements[1] = this.eye.elements[1] + f_prime.elements[1];
        this.at.elements[2] = this.eye.elements[2] + f_prime.elements[2];

        this.updateViewMatrix();
    }
}
