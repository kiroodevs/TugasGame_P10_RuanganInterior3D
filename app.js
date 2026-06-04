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

camera.position.set(0, 2.5, 8);

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


// Lantai
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.MeshStandardMaterial({
        color: 0x2B2F3A,
        roughness: 0.8,
        metalness: 0.0
    })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
floor.receiveShadow = true;

scene.add(ambient, dirLight, floor);


// 5 Objek ruangan interior
const geoList = [
    new THREE.BoxGeometry(0.9, 1.4, 0.5),
    new THREE.TorusGeometry(0.45, 0.08, 16, 60),
    new THREE.SphereGeometry(0.4, 32, 32),
    new THREE.CylinderGeometry(0.1, 0.1, 1.2, 32),
    new THREE.ConeGeometry(0.6, 0.8, 32)
];

const colors = [
    0x7B5B3A,
    0xC0C0C0,
    0xFFE066,
    0x888888,
    0xB05030
];

const roughVals = [ 0.9, 0.3, 0.1, 0.5, 0.7 ];
const metalVals = [ 0.0, 0.8, 0.0, 0.6, 0.0 ];

const names = [
    'Lemari (Box)',
    'Jam Dinding (Torus)',
    'Lampu Gantung (Sphere)',
    'Tiang Lampu (Cylinder)',
    'Atap Rumah (Cone)'
];

const objects = [];

geoList.forEach((geo, i) => {

    const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshStandardMaterial({
            color: colors[i],
            roughness: roughVals[i],
            metalness: metalVals[i]
        })
    );

    mesh.position.set((i - 2) * 2.5, 1.5, -2);

    mesh.castShadow =
    mesh.receiveShadow = true;

    mesh.userData.name = names[i];

    scene.add(mesh);
    objects.push(mesh);

});


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
renderer.setAnimationLoop(() => {

    objects.forEach(o => {

        if(o === selected) return;

        o.rotation.y += 0.01;
        o.rotation.x += 0.005;

    });

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
