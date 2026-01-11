import * as THREE from 'https://cdn.skypack.dev/three@0.128.0';

// Mobile detection for performance optimization
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

// Optimize settings based on device
const PARTICLE_COUNT = isMobile ? 500 : 2000;
const SHAPE_COUNT = isMobile ? 2 : 5;
const FOG_DENSITY = isMobile ? 0.003 : 0.002;
const ENABLE_MOUSE_INTERACTION = !isMobile;

const container = document.getElementById('canvas-container');

if (container) {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050510, FOG_DENSITY);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isMobile,
        powerPreference: isMobile ? 'low-power' : 'high-performance'
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
    container.appendChild(renderer.domElement);

    // PARTICLE SYSTEM
    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 50;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    const material = new THREE.PointsMaterial({
        size: isMobile ? 0.08 : 0.05,
        color: 0x00c6ff,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    // GEOMETRIC SHAPES
    const shapes = [];
    const geometry = new THREE.IcosahedronGeometry(1, 0);
    const glassMaterial = new THREE.MeshPhongMaterial({
        color: 0x7000df,
        emissive: 0x111111,
        specular: 0xffffff,
        shininess: 100,
        transparent: true,
        opacity: 0.1,
        wireframe: true
    });

    for (let i = 0; i < SHAPE_COUNT; i++) {
        const mesh = new THREE.Mesh(geometry, glassMaterial);
        mesh.position.x = (Math.random() - 0.5) * 30;
        mesh.position.y = (Math.random() - 0.5) * 30;
        mesh.position.z = (Math.random() - 0.5) * 30;
        scene.add(mesh);
        shapes.push(mesh);
    }

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff0055, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    camera.position.z = 15;

    // MOUSE INTERACTION (Desktop only)
    let mouseX = 0;
    let mouseY = 0;

    if (ENABLE_MOUSE_INTERACTION) {
        document.addEventListener('mousemove', (event) => {
            mouseX = event.clientX / window.innerWidth - 0.5;
            mouseY = event.clientY / window.innerHeight - 0.5;
        });
    }

    // ANIMATION LOOP
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Rotate System
        particlesMesh.rotation.y = elapsedTime * 0.05;

        if (ENABLE_MOUSE_INTERACTION) {
            particlesMesh.rotation.x = mouseY * 0.5;
            particlesMesh.rotation.y += mouseX * 0.5;
        }

        // Animate Shapes
        shapes.forEach((shape, i) => {
            shape.rotation.x += 0.01 * (i + 1);
            shape.rotation.y += 0.01 * (i + 1);
            shape.position.y += Math.sin(elapsedTime + i) * 0.01;
        });

        renderer.render(scene, camera);
    }

    animate();

    // RESIZE
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1 : 2));
        }, 250); // Debounce resize
    });
}
