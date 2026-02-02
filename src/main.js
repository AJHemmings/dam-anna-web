import './style.css'
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('bg'),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(50);

// Load guitar model - store reference to the model
let guitarModel = null;

const loader = new GLTFLoader();
loader.load('/models/guitar.glb', function (gltf) {
  guitarModel = gltf.scene;
  guitarModel.scale.set(50, 50, 50);
  // Start off-screen to the right, in front of camera
  guitarModel.position.set(30, 0, 0);
  scene.add(guitarModel);
  // Apply initial position based on current scroll
  moveCamera();
  console.log('Guitar loaded!');
}, undefined, function (error) {
  console.error('Error loading guitar:', error);
});

const pointLight = new THREE.PointLight(0xffffff);
pointLight.position.set(20, 20, 20);

const ambientLight = new THREE.AmbientLight(0xffffff);
scene.add(pointLight, ambientLight);

const controls = new OrbitControls(camera, renderer.domElement);

function addStar() {
  const geometry = new THREE.SphereGeometry(0.25, 24, 24);
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
  const star = new THREE.Mesh(geometry, material);

  const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
  
  star.position.set(x, y, z);
  scene.add(star);
}
Array(200).fill().forEach(addStar);

const grungeTexture = new THREE.TextureLoader().load('/textures/med-annie-spratt-unsplash.jpg');
scene.background = grungeTexture;

// Scroll animation function
function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  
  // Animate guitar if it's loaded
  if (guitarModel) {
    // Calculate position based on scroll - starts off-screen right, moves to center-left
    // t starts at 0 and becomes more negative as you scroll down
    guitarModel.position.x = 30 + t * 0.03; // Moves from right (30) to left as you scroll
    guitarModel.position.y = t * 0.01; // Slight vertical movement
    
    // Only horizontal spin (y-axis rotation)
    guitarModel.rotation.y = t * 0.002;
  }
  
  camera.position.z = 50 + t * -0.01;
  camera.position.x = t * -0.0002;
  camera.rotation.y = t * -0.0002;
}

document.body.onscroll = moveCamera;
moveCamera();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  
  controls.update();
  renderer.render(scene, camera);
}

animate();