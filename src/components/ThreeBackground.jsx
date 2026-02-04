import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function ThreeBackground({ scrollTop, onGuitarLoaded }) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const guitarRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.setZ(50);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    // Load guitar model
    const loader = new GLTFLoader();
loader.load(
  '/models/guitar.glb',
  function (gltf) {
    const guitarModel = gltf.scene;
    guitarModel.scale.set(50, 50, 50);
    guitarModel.position.set(30, 0, 0);
    scene.add(guitarModel);
    guitarRef.current = guitarModel;
    
    // Apply initial scroll position immediately after loading
    const t = document.body.getBoundingClientRect().top;
    guitarModel.position.x = 30 + t * 0.03;
    guitarModel.position.y = t * 0.01 - 15;
    guitarModel.rotation.y = t * 0.002;
    
    console.log('Guitar loaded!');

    // Notify that guitar has loaded 
    if (onGuitarLoaded) {
      onGuitarLoaded();
    }
  },
    );

    // Lighting
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(20, 20, 20);
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(pointLight, ambientLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;

    // Stars
    function addStar() {
      const geometry = new THREE.SphereGeometry(0.25, 24, 24);
      const material = new THREE.MeshStandardMaterial({ color: 0x404040 });
      const star = new THREE.Mesh(geometry, material);

      const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(100));

      star.position.set(x, y, z);
      scene.add(star);
    }
    Array(200).fill().forEach(addStar);

    // Background texture
    const grungeTexture = new THREE.TextureLoader().load(
      '/textures/med-annie-spratt-unsplash.jpg'
    );
    scene.background = grungeTexture;

    // Handle window resize
    function handleResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', handleResize);

    // Animation loop
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update animation based on scroll - EXACT same logic as original
  useEffect(() => {
    const t = scrollTop;

    // Animate guitar if it's loaded
    if (guitarRef.current) {
      guitarRef.current.position.x = 30 + t * 0.03;
      guitarRef.current.position.y = t * 0.01 - 15;
      guitarRef.current.rotation.y = t * 0.002;
    }

    // Camera animation
    if (cameraRef.current) {
      cameraRef.current.position.z = 50 + t * -0.01;
      cameraRef.current.position.x = t * -0.0002;
      cameraRef.current.rotation.y = t * -0.0002;
    }
  }, [scrollTop]);

  return <canvas ref={canvasRef} id="bg" />;
}