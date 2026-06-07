import * as THREE from 'three';

import { OrbitControls }
from 'three/addons/controls/OrbitControls.js';

import { GLTFLoader }
from 'three/addons/loaders/GLTFLoader.js';

const material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(5,5,10);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10,10,10);
scene.add(directionalLight);

const loader = new THREE.CubeTextureLoader();

const skybox = loader.load([
    "sky.jpg",
    "sky.jpg",
    "sky.jpg",
    "sky.jpg",
    "sky.jpg",
    "sky.jpg"
]);

scene.background = skybox;

const spotLight = new THREE.SpotLight(0xffffff, 50);
spotLight.position.set(0,10,0);
spotLight.distance = 100;
scene.add(spotLight);

const textureLoader = new THREE.TextureLoader();

const grassTexture = textureLoader.load("grass.jpg");
grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10);

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ map: grassTexture })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = -1;

scene.add(ground);

const gltfLoader = new GLTFLoader();
let targetModel;

gltfLoader.load(
    "Bowls Cat.glb",
    (gltf) => {
        targetModel = gltf.scene;

        targetModel.scale.set(1, 1, 1);
        targetModel.position.set(3, -0.85, 0);

        scene.add(targetModel);
    }
);

gltfLoader.load(
    "Tree.glb",
    (gltf) => {
        const model = gltf.scene;

        model.scale.set(10, 10, 10);
        model.position.set(9, 10, 0);

        scene.add(model);
    }
);

const body =
new THREE.Mesh(
  new THREE.BoxGeometry(2, 1, 1),
  new THREE.MeshStandardMaterial({ color:0x999999 })
);

scene.add(body);

const head =
new THREE.Mesh(
  new THREE.BoxGeometry(0.8, 0.8, 0.8),
  new THREE.MeshStandardMaterial({ color:0xaaaaaa })
);

head.position.set(1.3, 0.5, 0);

body.add(head);

const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);

const eye1 = new THREE.Mesh(eyeGeo, new THREE.MeshStandardMaterial({ color: 0x000000 }));
eye1.position.set(0.4, 0.2, 0.25);
head.add(eye1);

const eye2 = new THREE.Mesh(eyeGeo, new THREE.MeshStandardMaterial({ color: 0x000000 }));
eye2.position.set(0.4, 0.2, -0.25);
head.add(eye2);

const earGeo = new THREE.ConeGeometry(0.15, 0.4, 8);

const ear1 = new THREE.Mesh(earGeo, material);
ear1.position.set(0.2, 0.55, 0.3);
ear1.rotation.x = 0.3;
head.add(ear1);

const ear2 = new THREE.Mesh(earGeo, material);
ear2.position.set(0.2, 0.55, -0.3);
ear2.rotation.x = -0.3;
head.add(ear2);

const nose = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xff8888 })
);

nose.position.set(0.45, 0.0, 0);
head.add(nose);

function createLeg(x, z) {
    const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.8, 0.2),
        material
    );

    leg.position.set(x, -0.6, z);
    body.add(leg);

    return leg;
}

const legFL = createLeg(0.6, 0.375);
const legFR = createLeg(0.6, -0.375);
const legBL = createLeg(-0.6, 0.375);
const legBR = createLeg(-0.6, -0.375);

function createWhisker(x, y, z) {
    const whisker = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.02, 0.02),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );

    whisker.position.set(x, y, z);
    head.add(whisker);

    return whisker;
}

createWhisker(0.4, 0.05, 0.2);
createWhisker(0.4, 0.0, 0.2);
createWhisker(0.4, -0.05, 0.2);

createWhisker(0.4, 0.05, -0.2);
createWhisker(0.4, 0.0, -0.2);
createWhisker(0.4, -0.05, -0.2);

const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.000005, 0.1, 2, 8), material);
tail.position.set(-1.1, 0, 0);
tail.rotation.z = Math.PI / 2;
body.add(tail);

for (let i = 0; i < 10; i++) {
    const ball = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffaa00 })
    );

    ball.position.set(Math.random() * 20 - 10, -0.85, Math.random() * 20 - 10);
    scene.add(ball);
}

document.getElementById("lightOffButton").onclick = () => { spotLight.visible = false; };
document.getElementById("lightOnButton").onclick = () => { spotLight.visible = true; };
document.getElementById("lightSlideX").addEventListener( "input", e => { spotLight.position.x = Number(e.target.value); } );
document.getElementById("lightSlideY").addEventListener( "input", e => { spotLight.position.y = Number(e.target.value); } );
document.getElementById("lightSlideZ").addEventListener( "input", e => { spotLight.position.z = Number(e.target.value); });

const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    legFL.rotation.z = Math.sin(t * 5) * 0.5;
    legBR.rotation.z = Math.sin(t * 5) * 0.5;

    legFR.rotation.z = Math.sin(t * 5 + 1) * 0.5;
    legBL.rotation.z = Math.sin(t * 5 + 1) * 0.5;

    tail.rotation.y = Math.sin(t * 2) * 0.4;

    if (targetModel) {
        targetModel.position.x = Math.cos(t) * 5;
        targetModel.position.z = Math.sin(t) * 5;

        const desiredPos = targetModel.position.clone();
        desiredPos.x -= 5;
        desiredPos.y = 0;

        body.position.lerp(desiredPos, 0.02);
    }

    controls.update();

    renderer.render(scene, camera);
}

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();