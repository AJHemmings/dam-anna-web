import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * ThreeBackground - 3D guitar model with scroll-based animation
 * 
 * PERFORMANCE OPTIMIZATION:
 * Detects mobile/tablet devices via pointer: coarse (touch-primary)
 * and reduces rendering load accordingly.
 * 
 * MOBILE FIX:
 * Uses window.innerWidth and a fixed initial height for the canvas
 * to prevent the mobile browser address bar show/hide from causing
 * the canvas to resize and jump. Only width changes trigger a resize.
 * 
 * CUSTOMIZATION: Adjust the constants below per device type.
 */

// CUSTOMIZATION: Star count per device type
const STAR_COUNT_DESKTOP = 200;
const STAR_COUNT_MOBILE = 60;

// CUSTOMIZATION: Star geometry detail (sphere segments)
const STAR_SEGMENTS_DESKTOP = 24;
const STAR_SEGMENTS_MOBILE = 8;

// CUSTOMIZATION: Max pixel ratio per device type
const MAX_PIXEL_RATIO_DESKTOP = window.devicePixelRatio;
const MAX_PIXEL_RATIO_MOBILE = 1.5;

// CUSTOMIZATION: Guitar model scale
const GUITAR_SCALE = 50;

/**
 * Detect if device is touch-primary (mobile/tablet).
 */
function getIsMobileDevice() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

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

    // Detect device type once at init
    const isMobile = getIsMobileDevice();
    const starCount = isMobile ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
    const starSegments = isMobile ? STAR_SEGMENTS_MOBILE : STAR_SEGMENTS_DESKTOP;
    const maxPixelRatio = isMobile ? MAX_PIXEL_RATIO_MOBILE : MAX_PIXEL_RATIO_DESKTOP;

    console.log(`ThreeBackground: ${isMobile ? 'Mobile/Tablet' : 'Desktop'} mode — ${starCount} stars, ${starSegments} segments, pixelRatio capped at ${maxPixelRatio}`);

    // Capture initial viewport height to prevent mobile address bar resize issues.
    // On mobile, window.innerHeight changes when the address bar shows/hides,
    // which causes the canvas to resize and visually jump. By locking the height
    // at init and only updating on width changes, we avoid this.
    let currentWidth = window.innerWidth;
    let currentHeight = window.innerHeight;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      currentWidth / currentHeight,
      0.1,
      1000
    );
    camera.position.setZ(50);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
    renderer.setSize(currentWidth, currentHeight);
    rendererRef.current = renderer;

    // Load guitar model
    const loader = new GLTFLoader();
    loader.load(
      '/models/guitar.glb',
      function (gltf) {
        const guitarModel = gltf.scene;
        guitarModel.scale.set(GUITAR_SCALE, GUITAR_SCALE, GUITAR_SCALE);
        guitarModel.position.set(30, 0, 0);
        scene.add(guitarModel);
        guitarRef.current = guitarModel;
        
        // Apply initial scroll position immediately after loading
        const t = document.body.getBoundingClientRect().top;
        guitarModel.position.x = 30 + t * 0.03;
        guitarModel.position.y = t * 0.01 - 15;
        guitarModel.rotation.y = t * 0.002;

        // Notify that guitar has loaded 
        if (onGuitarLoaded) {
          onGuitarLoaded();
        }

        if (!animationFrameRef.current) {
          console.log('Starting animation loop from model load');
          animate();
        }
      },
      undefined,
      function (error) {
        console.error('Error loading guitar model:', error);
      }
    );

    // Lighting
    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(20, 20, 20);
    const ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(pointLight, ambientLight);

    // Controls - DISABLED for scroll-driven experience
    // const controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableZoom = false;
    // controls.enableRotate = false;
    // controls.enablePan = false;
    // controlsRef.current = controls;

    // Stars - count and detail based on device type
    const starGeometry = new THREE.SphereGeometry(0.25, starSegments, starSegments);
    const starMaterial = new THREE.MeshStandardMaterial({ color: 0x404040 });

    for (let i = 0; i < starCount; i++) {
      const star = new THREE.Mesh(starGeometry, starMaterial);

      const [x, y, z] = Array(3)
        .fill()
        .map(() => THREE.MathUtils.randFloatSpread(150));

      star.position.set(x, y, z);
      scene.add(star);
    }

    // Background texture
    const grungeTexture = new THREE.TextureLoader().load(
      '/textures/med-annie-spratt-unsplash.jpg'
    );
    scene.background = grungeTexture;

    // Handle window resize — only update when width actually changes.
    // This prevents the mobile address bar show/hide from resizing the canvas.
    function handleResize() {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;

      // On mobile, only resize if width changes (orientation change).
      // On desktop, resize on any change.
      if (isMobile) {
        if (newWidth === currentWidth) return; // Height-only change (address bar) — ignore
      }

      currentWidth = newWidth;
      currentHeight = newHeight;

      camera.aspect = currentWidth / currentHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentWidth, currentHeight);
    }
    window.addEventListener('resize', handleResize);

    // Animation loop
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);
      // controls.update();
      renderer.render(scene, camera);
    }
    console.log('Starting animation loop');
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      starGeometry.dispose();
      starMaterial.dispose();
      renderer.dispose();
      // controls.dispose();
    };
  }, []);

  // Update animation based on scroll
  useEffect(() => {
    const t = scrollTop;

    if (guitarRef.current) {
      guitarRef.current.position.x = 30 + t * 0.03;
      guitarRef.current.position.y = t * 0.01 - 15;
      guitarRef.current.rotation.y = t * 0.002;
    }

    if (cameraRef.current) {
      cameraRef.current.position.z = 50 + t * -0.01;
      cameraRef.current.position.x = t * -0.0002;
      cameraRef.current.rotation.y = t * -0.0002;
    }
  }, [scrollTop]);

  return <canvas ref={canvasRef} id="bg" />;
}
