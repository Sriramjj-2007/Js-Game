import * as THREE from 'three';
const canvas = document.getElementById('canvas');

// Scene ========================================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);
// Camera =======================================================
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, -5); // Set initial camera position
// Renderer =====================================================
const renderer = new THREE.WebGLRenderer({ canvas});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // optional: softer shadows

// Lighting ======================================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.intensity = 2;
directionalLight.castShadow = true; // Enable shadow casting
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -100;
directionalLight.shadow.camera.right = 100;
directionalLight.shadow.camera.top = 100;
directionalLight.shadow.camera.bottom = -100;

scene.add(directionalLight);

// Player ========================================================
const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x44aa88 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

renderer.render(scene, camera);