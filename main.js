import * as THREE from 'three';
let yaw = 0;
let pitch = 0;
let isPointerLocked = false;

const canvas = document.getElementById('canvas');

// Scene, Camera, Renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 3, -5); // Set initial camera position

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // optional: softer shadows

// Camera Controls
document.addEventListener('click', () => {
  canvas.requestPointerLock();
});

document.addEventListener('pointerlockchange', () => {
  isPointerLocked = document.pointerLockElement === canvas;
});

document.addEventListener('mousemove', (event) => {
  if (!isPointerLocked) return;

  yaw -= event.movementX * 0.002;
  pitch -= event.movementY * 0.002;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
});

// Cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
const cube = new THREE.Mesh(geometry, material);
cube.position.y = 0.5;
cube.castShadow = true; // Enable shadow casting
scene.add(cube);

// Ground Texture
const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('https://threejs.org/examples/textures/terrain/grasslight-big.jpg');
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(25, 25); // Repeat texture across large plane

// Ground Plane
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ map: groundTexture });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);

ground.rotation.x = -Math.PI / 2; // Rotate to lie flat (XZ plane)
ground.position.y = -0.5; // Lower it slightly below the cube
ground.receiveShadow = true; // Enable shadow receiving
scene.add(ground);

// Add a light so we can see the material properly
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

// Add a helper to visualize the shadow camera
const helper = new THREE.CameraHelper(directionalLight.shadow.camera);
scene.add(helper);

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Movement tracking
const keysPressed = {};

// Listen for key events
document.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
});

// Movement input handling
var MoveInput = new THREE.Vector2(0, 0);

// Update MoveInput based on key presses
function InputUpdate() {
  MoveInput.set(0, 0); // Reset MoveInput each frame
  if (keysPressed['w']) MoveInput.y = 1;
  if (keysPressed['s']) MoveInput.y = -1;

  if (keysPressed['a']) MoveInput.x = 1;
  if (keysPressed['d']) MoveInput.x = -1;

  MoveInput.normalize(); // Normalize to ensure consistent speed
  console.log(MoveInput);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  InputUpdate();

  cube.rotation.y = yaw; // Rotate cube based on yaw

  // Move cube based on input and yaw
  let moveSpeed = 0.25;
  if (keysPressed['shift']) moveSpeed = 0.5;
  const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)).multiplyScalar(MoveInput.y);
  const right = new THREE.Vector3(Math.sin(yaw + Math.PI / 2), 0, Math.cos(yaw + Math.PI / 2)).multiplyScalar(MoveInput.x);
  const move = forward.add(right).multiplyScalar(moveSpeed);
  cube.position.add(move);

  // Smooth follow camera
  const cameraOffset = new THREE.Vector3(0, 2, -4).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  const targetPosition = cube.position.clone().add(cameraOffset);
  camera.position.lerp(targetPosition, 0.2); // Smoothly interpolate camera position
  camera.lookAt(cube.position);

  renderer.render(scene, camera);
}
animate();