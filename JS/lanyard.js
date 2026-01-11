
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

/**
 * Lanyard Simulation using Verlet Integration
 * Simulates a swinging rope with a card at the end.
 */

// Module-level cache for texture
let cachedLanyardTexture = null;

export function initLanyard(container, navigateCallback) {
    if (!container) return;

    // --- CONFIGURATION ---
    const config = {
        ropeSegments: 30,
        ropeLength: 15,
        gravity: 0.5,
        friction: 0.9,
        iterations: 5,
        cardSize: { width: 4, height: 6, depth: 0.2 },
        pullThreshold: 1.0, // Reduced threshold for easier trigger
        maxDragDistance: 40, // Constraint for dragging
        logoPath: '../IMAGES/istelogofinal-removebg-preview.png'
    };

    // --- SETUP THREE.JS SCENE ---
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();

    // Transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Position camera to see the hanging rope
    camera.position.set(0, 0, 40);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    // --- PHYSICS STATE (Verlet) ---
    const particles = [];
    const constraints = [];

    // Initialize Rope Particles
    // Start from top left (-12, 15, 0) hanging down
    const aspect = width / height;
    const startX = aspect < 1.0 ? 0 : -12; // Center on mobile/portrait, left on desktop
    const startPos = new THREE.Vector3(startX, 15, 0);
    const segmentLen = config.ropeLength / config.ropeSegments;

    for (let i = 0; i <= config.ropeSegments; i++) {
        // Simple straight line init
        const p = {
            pos: new THREE.Vector3(startPos.x, startPos.y - i * segmentLen, startPos.z),
            oldPos: new THREE.Vector3(startPos.x, startPos.y - i * segmentLen, startPos.z),
            pinned: i === 0, // Pin the top particle
            mass: 1
        };
        particles.push(p);

        // Constraint to previous
        if (i > 0) {
            constraints.push({
                p1: particles[i - 1],
                p2: p,
                length: segmentLen
            });
        }
    }

    // Identify the "Card" particle (the last one)
    const cardParticle = particles[particles.length - 1];

    // --- MESHES ---

    // 1. Rope Mesh
    const curve = new THREE.CatmullRomCurve3(particles.map(p => p.pos));
    const ropeGeom = new THREE.TubeGeometry(curve, config.ropeSegments, 0.15, 8, false);
    const ropeMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.5,
        metalness: 0.1
    });
    const ropeMesh = new THREE.Mesh(ropeGeom, ropeMat);
    scene.add(ropeMesh);

    // 2. Card Mesh
    // Card Box
    const cardGeom = new THREE.BoxGeometry(config.cardSize.width, config.cardSize.height, config.cardSize.depth);

    // Materials
    // 1. Base Material (Sides/Top/Bottom) - Black Plastic
    const baseMat = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
    });

    // 2. Face Material - Starts Black, updates with logo texture
    const faceMat = new THREE.MeshPhysicalMaterial({
        color: 0x000000,
        roughness: 0.2,
        clearcoat: 1.0,
        metalness: 0.1
    });

    // OPTIMIZATION: Check Cache
    if (cachedLanyardTexture) {
        faceMat.map = cachedLanyardTexture;
        faceMat.color.setHex(0xffffff);
        faceMat.needsUpdate = true;
    } else {
        // Load Image and Composite onto Black Canvas
        const imgLoader = new THREE.ImageLoader();
        imgLoader.load(config.logoPath, (image) => {
            const canvas = document.createElement('canvas');
            // Fit canvas to card aspect ratio (high res)
            const resolution = 256;
            canvas.width = resolution * config.cardSize.width;   // e.g. 512
            canvas.height = resolution * config.cardSize.height; // e.g. 768

            const ctx = canvas.getContext('2d');

            // 1. Fill Solid Black Background
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // 2. Draw Image Centered (Contain)
            const imgAspect = image.width / image.height;
            const canvasAspect = canvas.width / canvas.height;

            let drawW, drawH, renderX, renderY;

            // Logic to "contain" the image
            if (imgAspect > canvasAspect) {
                const margin = 0.8;
                drawW = canvas.width * margin;
                drawH = drawW / imgAspect;
            } else {
                const margin = 0.8;
                drawH = canvas.height * margin;
                drawW = drawH * imgAspect;
            }

            renderX = (canvas.width - drawW) / 2 + 25; // Shift right ~5 visual px
            renderY = (canvas.height - drawH) / 2;

            ctx.drawImage(image, renderX, renderY, drawW, drawH);

            // 3. Create Texture from Canvas
            const texture = new THREE.CanvasTexture(canvas);
            texture.encoding = THREE.sRGBEncoding;

            // Cache it!
            cachedLanyardTexture = texture;

            // 4. Update Material
            faceMat.map = texture;
            faceMat.color.setHex(0xffffff); // Set to white to show texture colors true
            faceMat.needsUpdate = true;
        });
    }

    const materials = [
        baseMat, // right
        baseMat, // left
        baseMat, // top
        baseMat, // bottom
        faceMat, // front
        faceMat  // back
    ];

    const cardMesh = new THREE.Mesh(cardGeom, materials);
    scene.add(cardMesh);

    // --- INTERACTION STATE ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isDragging = false;
    let dragOffset = new THREE.Vector3();
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // Intersection plane at Z=0
    let didTriggerNav = false;

    // --- PHYSICS LOOP ---
    function updatePhysics() {
        // 1. Accumulate Forces / Integrate
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            if (p.pinned) continue; // Pinned point doesn't move

            // If being dragged, this particle (the card) follows the mouse, simplified
            if (isDragging && p === cardParticle) {
                // Determine mouse pos in 3D
                raycaster.setFromCamera(mouse, camera);
                const target = new THREE.Vector3();
                raycaster.ray.intersectPlane(plane, target);

                let dragPos = target.sub(dragOffset);

                // CLAMP DRAG DISTANCE
                // Limit distance from anchor (startPos)
                const dist = dragPos.distanceTo(startPos);
                if (dist > config.maxDragDistance) {
                    const direction = new THREE.Vector3().subVectors(dragPos, startPos).normalize();
                    dragPos = startPos.clone().add(direction.multiplyScalar(config.maxDragDistance));
                }

                p.pos.copy(dragPos);
                continue;
            }

            // Normal Physics
            // Velocity = (pos - oldPos) * friction
            const vx = (p.pos.x - p.oldPos.x) * config.friction;
            const vy = (p.pos.y - p.oldPos.y) * config.friction;
            const vz = (p.pos.z - p.oldPos.z) * config.friction;

            p.oldPos.copy(p.pos);

            p.pos.x += vx;
            p.pos.y += vy;
            p.pos.z += vz;

            // Gravity
            p.pos.y -= config.gravity * 0.1; // Scale timestep
        }

        // 2. Constraints (Relaxation)
        for (let k = 0; k < config.iterations; k++) {
            for (let i = 0; i < constraints.length; i++) {
                const c = constraints[i];
                const dx = c.p2.pos.x - c.p1.pos.x;
                const dy = c.p2.pos.y - c.p1.pos.y;
                const dz = c.p2.pos.z - c.p1.pos.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
                const diff = (c.length - dist) / dist; // % to move

                const scalar = 0.5; // Shared evenly

                const offsetX = dx * diff * scalar;
                const offsetY = dy * diff * scalar;
                const offsetZ = dz * diff * scalar;

                // Move p1
                if (!c.p1.pinned) {
                    // If p2 is dragged (pinned effectively), p1 takes full movement?
                    // Standard Relaxation
                    c.p1.pos.x -= offsetX;
                    c.p1.pos.y -= offsetY;
                    c.p1.pos.z -= offsetZ;
                }

                // Move p2
                if (!c.p2.pinned) {
                    // if p2 is dragged it is essentially pinned to mouse, so don't relax it?
                    if (isDragging && c.p2 === cardParticle) {
                        // Don't move the dragged card via constraint, let it pull the rope
                    } else {
                        c.p2.pos.x += offsetX;
                        c.p2.pos.y += offsetY;
                        c.p2.pos.z += offsetZ;
                    }
                }
            }
        }
    }

    function triggerNavigation() {
        if (didTriggerNav) return;
        didTriggerNav = true;

        // Visual feedback?
        // Maybe change color or flash?

        // Haptic vibe on mobile?
        if (navigator.vibrate) navigator.vibrate(50);

        // Navigate
        // Call the provided callback
        if (navigateCallback) navigateCallback();
    }

    // --- ANIMATION LOOP ---
    let frameId;
    function animate() {
        frameId = requestAnimationFrame(animate);

        updatePhysics();

        // Sync Meshes
        // Rope
        // Important: Update curve points
        // CatmullRomCurve3 is reference based if we updated vector objects, but we might need to verify
        // The points array is [p.pos...]. Since p.pos are Vector3 objects being mutated, the array contents change.
        // However, TubeGeometry usually computes initial frenet frames. We might need to handle buffer updates manually for performance,
        // or just recreate geometry if segment count is low (easiest for prototype).
        // Standard cheap trick:
        // ropeMesh.geometry.dispose();
        // ropeMesh.geometry = new THREE.TubeGeometry(curve, config.ropeSegments, 0.15, 8, false);
        // Better: Update position attribute of a line? But tube gives thickness.
        // Let's use setPoints if curve supports it, or just update params.
        // CatmullRomCurve3.points is the reference array.

        // Re-copy points just to be safe if curve copies them on init
        // But curve.points is exposed.
        // TubeGeometry needs update.
        // For performance, lets just use MeshLine or a thick Line, but Tube looks better.
        // We will just dispose/recreate for < 50 segments it is fine on desktop.

        ropeMesh.geometry.dispose();
        ropeMesh.geometry = new THREE.TubeGeometry(curve, config.ropeSegments, 0.1, 8, false);

        // Card
        // Position at last particle
        cardMesh.position.copy(cardParticle.pos);

        // Rotation: Look at previous particle to align with rope?
        // Let's make it hang naturally.
        // A simple approximation is to allow it to rotate based on velocity or just align with the last constraint segment.
        const prev = particles[particles.length - 2];
        const dir = new THREE.Vector3().subVectors(cardParticle.pos, prev.pos).normalize();

        // Align Y axis of card to dir?
        // Actually card should hang flat-ish but tilt.
        // Let's use lookAt but correct orientation.
        // This is tricky without a rigid body rotation solver.
        // Simplified: Set rotation.z based on x difference
        const angleZ = -Math.atan2(dir.x, dir.y); // Tilt sideways
        const angleX = Math.atan2(dir.z, dir.y); // Tilt forward/back

        // Dampen rotation
        cardMesh.rotation.z = angleZ;
        cardMesh.rotation.x = angleX;

        renderer.render(scene, camera);
    }

    animate();

    // --- EVENTS ---
    function onDown(e) {
        e.preventDefault();

        // Normalized coordinates
        const rect = renderer.domElement.getBoundingClientRect();
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);

        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(cardMesh);

        if (intersects.length > 0) {
            isDragging = true;
            document.body.style.cursor = 'grabbing';
            // Calc offset
            // We want to drag the center of the card relative to pick point?
            // Simplified: just snap center to mouse plane for now, or keep offset z
        }
    }

    function onMove(e) {
        if (!isDragging) return;
        const rect = renderer.domElement.getBoundingClientRect();
        const clientX = e.clientX || (e.touches ? e.touches[0].clientX : 0);
        const clientY = e.clientY || (e.touches ? e.touches[0].clientY : 0);

        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    }

    function onUp() {
        if (isDragging) {
            // Check if pulled far enough to trigger nav
            const cardP = particles[particles.length - 1];
            // Tie this to the same threshold logic
            if (cardP.pos.y < -config.pullThreshold) {
                triggerNavigation();
            }
        }
        isDragging = false;
        document.body.style.cursor = 'auto';
    }

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    canvas.addEventListener('touchstart', onDown, { passive: false });
    canvas.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);

    // cleanup
    return () => {
        cancelAnimationFrame(frameId);
        container.removeChild(canvas);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('touchend', onUp);

        // Dispose Three.js resources
        ropeGeom.dispose();
        ropeMat.dispose();
        cardGeom.dispose();
        baseMat.dispose();
        faceMat.dispose();
        renderer.dispose();
    };
}
