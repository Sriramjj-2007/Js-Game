import * as THREE from 'three';
import { lerp } from 'three/src/math/MathUtils.js';
let maxYaw = window.innerWidth - 15; // Maximum yaw based on window width
let yaw = 0;
let scrollPosition = 0;
const initialCubePositionY = 100;
const platform = navigator.platform.toLowerCase();
let isPointerLocked = false;

const canvas = document.getElementById('canvas');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, initialCubePositionY, -5); // Set initial camera position

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // optional: softer shadows

// Camera Controls
// Movement tracking

document.addEventListener('click', () => {
  canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === canvas;
});

document.addEventListener('mousemove', (event) => {
  if (!isPointerLocked) return;
  yaw -= event.movementX * 0.002;
});

window.addEventListener('scroll', (event) => {
  scrollPosition = window.scrollY; // Store scroll position
  if (platform.includes('android') || platform.includes('iphone') || platform.includes('ipad')) {
    yaw = window.scrollX; // Adjust yaw based on scroll
  }
});

// Cube
const geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
const cube = new THREE.Mesh(geometry, material);
cube.position.y = initialCubePositionY; // Set initial Y position
cube.castShadow = true; // Enable shadow casting
scene.add(cube);

// Wall Texture
const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(1, 25); // Repeat texture across large plane

// Wall Plane
const walls = [];
const wallGeometry = new THREE.PlaneGeometry(10, 100);
const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture });
const wall = new THREE.Mesh(wallGeometry, wallMaterial);

for (let i = 0; i < 6; i++) {
  const wallClone = wall.clone(); // Position each wall clone slightly below the previous one
  wallClone.receiveShadow = true; // Enable shadow receiving
  walls.push(wallClone);
  wallClone.position.set(0, -50, -8.66); // Position each wall clone
  rotateAroundPoint(wallClone, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1, 0), Math.PI / 3 * i);

  scene.add(wallClone);
}

// Add a light so we can see the material properly
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 50, 0); // Position the light above the scene
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

// Add a helper to visualize the shadow camera
const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(helper);

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

while (cube.position.y < -1) {
  cube.position.y = lerp(cube.position.y, 0, 0.1) // Smoothly move cube to Y position 0
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  if (platform.includes('android') || platform.includes('iphone') || platform.includes('ipad')) yaw = mapRange(yaw, 0, maxYaw, 0, Math.PI * 2); // Map yaw to a full rotation
  // console.log(`Scroll Position: ${scrollPosition}, Yaw: ${yaw}, Width: ${window.innerWidth}`); // Log scroll position and yaw

  cube.rotation.y = yaw; // Rotate cube based on yaw

  // Move cube based on input and yaw
  const constantOfMobility = 0.1; // Speed of movement
  const cubeTargetPosition = new THREE.Vector3(0, -scrollPosition, 0).multiplyScalar(constantOfMobility);
  cube.position.lerp(cubeTargetPosition, 0.1); // Smoothly interpolate cube position

  cube.position.y = Math.round(cube.position.y * 100) / 100; // Round Y position to 2 decimal places

  // Smooth follow camera
  const cameraOffset = new THREE.Vector3(0, 0, -4).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  const cameraTargetPosition = cube.position.clone().add(cameraOffset);
  camera.position.lerp(cameraTargetPosition, 0.25); // Smoothly interpolate camera position
  camera.lookAt(cube.position);

  renderer.render(scene, camera);
}
animate();

// Function to rotate an object around a point
function rotateAroundPoint(obj, point, axis, theta) {
  obj.position.sub(point); // translate to pivot point
  obj.position.applyAxisAngle(axis, theta); // rotate around axis
  obj.position.add(point); // translate back
  obj.rotateOnAxis(axis, theta); // rotate object's orientation
}

// Function to map a value from one range to another
function mapRange(value, oldMin, oldMax, newMin, newMax) {
  return ((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}