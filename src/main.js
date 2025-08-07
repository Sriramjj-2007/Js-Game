import * as THREE from 'three';
import { inverseLerp, lerp } from 'three/src/math/MathUtils.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { log } from 'three/tsl';

const text = {
  0: ["Js-Game", "Wall 1", "Wall 1", "Wall 1", "Wall 1", "Wall 1"],
  1: ["Wall 2", "Wall 2", "Wall 2", "Wall 2", "Wall 2", "Wall 2"],
  2: ["Wall 3"],
  3: ["Wall 4"],
  4: ["Wall 5"],
  5: ["Wall 6"]
};

const NoOfWalls = 6; // Number of walls in the scene
const InteriorAngle = (2 * Math.PI) / NoOfWalls; // Interior angle between walls


const hasMouse = window.matchMedia("(pointer: fine)").matches;
let isPointerLocked = false;

let maxMousePositionX = window.innerWidth - 15; // Maximum mouse X position based on window width
let mousePositionX = 0;
let mousePositionY = 0;
let touchStartX = 0;
let touchPositionX = mousePositionX;
let touchStartY = 0;
let touchPositionY = mousePositionY;

const initialCubePositionY = 100;

const pivot = new THREE.Vector3(0, 0, 0);
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
  mousePositionX -= event.movementX * 0.002;
  mousePositionY -= event.movementY * 0.01; // Add mouse Y movement
  mousePositionY = Math.min(0, mousePositionY); // Ensure mouse Y position doesn't go above 0
});

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length === 1) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    touchPositionX = mousePositionX;
    touchPositionY = mousePositionY;
  }
});

canvas.addEventListener('touchmove', (e) => {
  if (e.touches.length === 1) {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const deltaX = touchX - touchStartX;
    const deltaY = touchY - touchStartY;
    mousePositionX = touchPositionX - deltaX * 0.05; // Adjust sensitivity here
    mousePositionY = touchPositionY - deltaY * 0.1; // Adjust sensitivity here
  }
});

// Cube
const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 });
const cube = new THREE.Mesh(geometry, material);
cube.position.y = initialCubePositionY; // Set initial Y position
cube.castShadow = true; // Enable shadow casting
scene.add(cube);

// Text Mesh
const textMeshs = [];

// Wall Texture
const textureLoader = new THREE.TextureLoader();
const wallTexture = textureLoader.load('https://thumbs.dreamstime.com/b/futuristic-metallic-brick-texture-glowing-blue-purple-neon-lines-cyberpunk-sci-fi-aesthetic-sleek-modern-seamless-hd-pattern-362054057.jpg');
wallTexture.wrapS = wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(1, 25 / 2); // Repeat texture across large plane

// Wall Plane
const walls = [];
const wallGeometry = new THREE.PlaneGeometry(10, 100);
const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture });
const wall = new THREE.Mesh(wallGeometry, wallMaterial);

// Create 6 walls
for (let i = 0; i < NoOfWalls; i++) {
  const wallClone = wall.clone(); // Position each wall clone slightly below the previous one
  wallClone.receiveShadow = true; // Enable shadow receiving
  walls.push(wallClone);
  wallClone.position.set(0, -48, 8.66); // Position each wall clone
  wallClone.rotation.y = Math.PI;
  rotateAroundPoint(wallClone, InteriorAngle * i);

  // Add text to the walls
  PlaceText(i, text);

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
  maxMousePositionX = window.innerWidth - 15; // Update maxmousePositionX
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (cube.position.y > 1) {
    cube.position.y = lerp(cube.position.y, 0, 0.1) // Smoothly move cube to Y position 0

  }
  else {
    // if (!hasMouse) mousePositionX = mapRange(mousePositionX, 0, maxmousePositionX, 0, Math.PI * 2);
    // console.log(`Mouse Y Position: ${mousePositionY}, mousePositionX: ${mousePositionX}, Width: ${window.innerWidth}`); // Log mouse Y position and mouse X position

    // console.log(textMesh.position, cube.position);
    cube.rotation.y = mousePositionX; // Rotate cube based on mousePositionX

    // Move cube based on mouse Y movement and mousePositionX
    const cubeTargetPosition = new THREE.Vector3(0, mousePositionY, 0);
    cube.position.lerp(cubeTargetPosition, 0.1); // Smoothly interpolate cube position

    cube.position.y = Math.round(cube.position.y * 100) / 100; // Round Y position to 2 decimal places
  }
  // Smooth follow camera
  const cameraOffset = new THREE.Vector3(0, 0, 4).applyAxisAngle(new THREE.Vector3(0, 1, 0), mousePositionX);
  const cameraTargetPosition = cube.position.clone().add(cameraOffset);
  camera.position.lerp(cameraTargetPosition, 0.25); // Smoothly interpolate camera position
  camera.lookAt(cube.position);

  renderer.render(scene, camera);
}
animate();

// Function to rotate an object around a point
function rotateAroundPoint(obj, theta, point = new THREE.Vector3(0, 0, 0), axis = new THREE.Vector3(0, 1, 0)) {
  obj.position.sub(point); // translate to pivot point
  obj.position.applyAxisAngle(axis, theta); // rotate around axis
  obj.position.add(point); // translate back
  obj.rotateOnAxis(axis, theta); // rotate object's orientation
}

// Function to map a value from one range to another
function mapRange(value, oldMin, oldMax, newMin, newMax) {
  return ((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin) + newMin;
}

// Add text to the scene
function addText(text = "Text", obj, onReady) {
  const loader = new FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeometry = new TextGeometry(text, {
      font: font,
      size: 1,
      height: 0.002,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5
    });

    const textMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      emissive: 0x00ff44,
      emissiveIntensity: 0.2
    });

    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Center the text geometry
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    const textHeight = textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y;

    textMesh.position.set(-textWidth / 2, 0, -58.6); // Center the text mesh
    textMesh.castShadow = true;
    textMesh.receiveShadow = true;

    textMeshs.push(textMesh); // Store the text mesh in the array

    // Add text
    if (obj) {
      obj.add(textMesh);
    } else {
      scene.add(textMesh);
    }

    // Call the callback now that the textMesh is ready
    if (onReady) onReady(textMesh);
  });
}

function PlaceText(wallNumber, textArray) {

  const texts = textArray[wallNumber]; // Get texts for the wall number
  if (!texts) return;

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    if (!text) continue;

    addText(text, null, (textMesh) => {
      textMesh.position.y = -4 * i // Set position for the text mesh
      if (wallNumber === 0) return;
      rotateAroundPoint(textMesh, -InteriorAngle * (wallNumber)); // Rotate text mesh around the wall);
      console.log(`Adding text: ${text} to wall ${wallNumber}`);

    });
  }
}
