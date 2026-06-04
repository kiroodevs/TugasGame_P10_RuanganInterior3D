import * as THREE from
    'https://esm.sh/three@0.160.0';

import { OrbitControls } from
    'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';


// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.Fog(0x1a1a2e, 15, 40);

const camera = new THREE.PerspectiveCamera(
    75,
    innerWidth / innerHeight,
    0.1,
    1000
);

camera.position.set(0, 4, 10);

const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('c'),
    antialias: true
});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.xr.enabled = true;

const info = document.getElementById('info');


// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.5);

const dirLight = new THREE.DirectionalLight(
    0xffffff,
    1.5
);

dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;


// Lantai — dinaikkan supaya keliatan di VR
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({
        color: 0x4a3728,
        roughness: 0.9,
        metalness: 0.0
    })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;

scene.add(ambient, dirLight, floor);


// Objek 1 - Meja (Box)
const table = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.2, 1.8),
    new THREE.MeshStandardMaterial({
        color: 0x8B5E3C,
        roughness: 0.8,
        metalness: 0.0
    })
);

table.position.set(0, 0.8, -2);
table.castShadow =
table.receiveShadow = true;
table.userData.name = 'Meja (Box)';
scene.add(table);


// Objek 2 - Bola Lampu (Sphere)
const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 32, 32),
    new THREE.MeshStandardMaterial({
        color: 0xFFE066,
        roughness: 0.1,
        metalness: 0.0,
        emissive: 0xFFE066,
        emissiveIntensity: 0.6
    })
);

lamp.position.set(0, 3, -2);
lamp.castShadow =
lamp.receiveShadow = true;
lamp.userData.name = 'Lampu (Sphere)';
scene.add(lamp);


// Objek 3 - Gelas (Cylinder)
const glass = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.15, 0.6, 32),
    new THREE.MeshStandardMaterial({
        color: 0x88CCEE,
        roughness: 0.1,
        metalness: 0.2
    })
);

glass.position.set(0.8, 1.2, -2);
glass.castShadow =
glass.receiveShadow = true;
glass.userData.name = 'Gelas (Cylinder)';
scene.add(glass);


// Objek 4 - Cincin (Torus)
const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.3, 0.08, 16, 60),
    new THREE.MeshStandardMaterial({
        color: 0xE8B84B,
        roughness: 0.3,
        metalness: 0.9
    })
);

ring.position.set(-0.8, 1.2, -2);
ring.castShadow =
ring.receiveShadow = true;
ring.userData.name = 'Cincin (Torus)';
scene.add(ring);


// Objek 5 - Topi (Cone)
const hat = new THREE.Mesh(
    new THREE.ConeGeometry(0.4, 0.8, 32),
    new THREE.MeshStandardMaterial({
        color: 0xC0392B,
        roughness: 0.7,
        metalness: 0.0
    })
);

hat.position.set(0, 1.4, -2.5);
hat.castShadow =
hat.receiveShadow = true;
hat.userData.name = 'Topi (Cone)';
scene.add(hat);


// Semua objek interaktif
const objects = [ table, lamp, glass, ring, hat ];


// OrbitControls
const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2;


// Raycasting
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let selected = null;
let hovered = null;

window.addEventListener('mousemove', e => {

    mouse.x =
    (e.clientX / innerWidth) * 2 - 1;

    mouse.y =
    -(e.clientY / innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const hits =
    raycaster.intersectObjects(objects);

    if(hovered && hovered !== selected){
        hovered.material.emissive.setHex(0x000000);
        hovered.scale.setScalar(1);
    }

    hovered = null;

    if(hits.length > 0){
        hovered = hits[0].object;
        document.body.style.cursor = 'pointer';
        if(hovered !== selected){
            hovered.material.emissive.setHex(0x221100);
            hovered.scale.setScalar(1.08);
        }
    } else {
        document.body.style.cursor = 'default';
    }

});

window.addEventListener('click', () => {

    raycaster.setFromCamera(mouse, camera);

    const hits =
    raycaster.intersectObjects(objects);

    if(selected){
        selected.material.emissive.setHex(0x0);
        selected.scale.setScalar(1);
    }

    if(hits.length > 0 && hits[0].object !== selected){

        selected = hits[0].object;

        selected.material.emissive.setHex(
            0x334400
        );

        selected.scale.setScalar(1.3);

        info.textContent =
        'Objek: ' + selected.userData.name;

    } else {

        selected = null;
        info.textContent =
        'Klik objek untuk melihat informasi';

    }

});


// Animation Loop
let t = 0;

renderer.setAnimationLoop(() => {

    t += 0.02;

    // lampu naik turun
    lamp.position.y = 3 + Math.sin(t) * 0.8;

    // cincin berputar
    ring.rotation.x += 0.03;
    ring.rotation.y += 0.03;

    // gelas berputar pelan
    glass.rotation.y += 0.02;

    // topi berputar
    hat.rotation.y += 0.025;

    controls.update();
    renderer.render(scene, camera);

});


// Resize
window.addEventListener('resize', () => {

    camera.aspect =
    innerWidth / innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        innerWidth,
        innerHeight
    );

});


// WebXR
const vrBtn =
document.getElementById('vrBtn');

async function checkXRSupport(){

    if(!('xr' in navigator)){
        vrBtn.innerText = 'WebXR tidak tersedia';
        vrBtn.disabled = true;
        return;
    }

    const ok =
    await navigator.xr.isSessionSupported(
        'immersive-vr'
    );

    if(!ok){
        vrBtn.innerText = 'VR tidak didukung';
        vrBtn.disabled = true;
        return;
    }

    vrBtn.disabled = false;
    vrBtn.innerText = 'Masuk VR';

}

vrBtn.addEventListener('click', async () => {

    try{

        const session =
        await navigator.xr.requestSession(
            'immersive-vr',
            { optionalFeatures: ['local-floor'] }
        );

        await renderer.xr.setSession(session);

        vrBtn.innerText = 'VR Aktif';

        session.addEventListener('end', () => {
            vrBtn.innerText = 'Masuk VR';
        });

    } catch(e){

        console.error(e);

    }

});

checkXRSupport();