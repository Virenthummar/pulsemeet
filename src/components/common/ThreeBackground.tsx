import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 35;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '0';
    container.appendChild(renderer.domElement);

    // Canvas texture generator for glowing star particles
    const createStarTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.2, 'rgba(224, 242, 254, 0.9)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
      }
      return new THREE.CanvasTexture(canvas);
    };

    const starTexture = createStarTexture();

    // 1. Distant Star Field (2500 Stars)
    const starCount = window.innerWidth < 768 ? 1200 : 2800;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starPalette = [
      new THREE.Color('#ffffff'), // White
      new THREE.Color('#38bdf8'), // Ice Blue
      new THREE.Color('#34d399'), // Emerald Mint
      new THREE.Color('#fbbf24'), // Warm Gold
      new THREE.Color('#818cf8')  // Soft Azure
    ];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 160;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 160;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 140;

      const col = starPalette[Math.floor(Math.random() * starPalette.length)];
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // 2. 3D Spiral Galaxy Arms (Cosmic Dust Particles)
    const galaxyCount = window.innerWidth < 768 ? 1800 : 4000;
    const galaxyGeo = new THREE.BufferGeometry();
    const galaxyPos = new Float32Array(galaxyCount * 3);
    const galaxyColors = new Float32Array(galaxyCount * 3);

    const arms = 3;
    const radius = 24;

    for (let i = 0; i < galaxyCount; i++) {
      const r = Math.pow(Math.random(), 2) * radius;
      const spinAngle = r * 0.8;
      const branchAngle = ((i % arms) * (2 * Math.PI)) / arms;

      const randomX = (Math.random() - 0.5) * (r * 0.3);
      const randomY = (Math.random() - 0.5) * (r * 0.3);
      const randomZ = (Math.random() - 0.5) * (r * 0.3);

      galaxyPos[i * 3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      galaxyPos[i * 3 + 1] = randomY;
      galaxyPos[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      // Color gradient from bright cyan core to emerald edge
      const mixRatio = r / radius;
      const coreColor = new THREE.Color('#38bdf8');
      const edgeColor = new THREE.Color('#10b981');
      coreColor.lerp(edgeColor, mixRatio);

      galaxyColors[i * 3] = coreColor.r;
      galaxyColors[i * 3 + 1] = coreColor.g;
      galaxyColors[i * 3 + 2] = coreColor.b;
    }

    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyColors, 3));

    const galaxyMat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
    galaxy.position.set(-8, 4, -15);
    galaxy.rotation.x = Math.PI * 0.25;
    scene.add(galaxy);

    // 3. 3D Ringed Planet (Saturn-like Celestial Body)
    const planetGroup = new THREE.Group();
    
    // Planet Sphere
    const planetGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const planetMat = new THREE.MeshStandardMaterial({
      color: 0x0f766e, // Deep Emerald Teal
      roughness: 0.6,
      metalness: 0.2,
      wireframe: true
    });
    const planet = new THREE.Mesh(planetGeo, planetMat);
    planetGroup.add(planet);

    // Planetary Rings
    const ringGeo = new THREE.RingGeometry(4.8, 7.5, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      wireframe: true
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.3;
    planetGroup.add(ring);

    planetGroup.position.set(18, -8, -12);
    planetGroup.rotation.z = Math.PI * 0.15;
    scene.add(planetGroup);

    // 4. Secondary Gas Giant Planet
    const gasGiantGeo = new THREE.SphereGeometry(2.5, 24, 24);
    const gasGiantMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7, // Azure Cyan
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const gasGiant = new THREE.Mesh(gasGiantGeo, gasGiantMat);
    gasGiant.position.set(-22, -12, -18);
    scene.add(gasGiant);

    // Orbiting Moon
    const moonGeo = new THREE.SphereGeometry(0.6, 16, 16);
    const moonMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      wireframe: true
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    scene.add(moon);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Mouse & Scroll Parallax Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.0018;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.0018;
    };

    const handleScroll = () => {
      scrollY = window.scrollY * 0.012;
    };

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera motion
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 18;
      camera.position.y = -targetY * 18 - scrollY * 0.25;
      camera.lookAt(scene.position);

      // Rotate Stars & Galaxy
      starField.rotation.y = elapsedTime * 0.012;
      galaxy.rotation.z = elapsedTime * 0.025;

      // Rotate Planets
      planet.rotation.y = elapsedTime * 0.1;
      planetGroup.rotation.y = elapsedTime * 0.05;
      gasGiant.rotation.y = elapsedTime * 0.08;

      // Orbit Moon around Saturn planet
      const moonOrbitRadius = 8;
      moon.position.x = planetGroup.position.x + Math.cos(elapsedTime * 0.8) * moonOrbitRadius;
      moon.position.z = planetGroup.position.z + Math.sin(elapsedTime * 0.8) * moonOrbitRadius;
      moon.position.y = planetGroup.position.y + Math.sin(elapsedTime * 0.4) * 2;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      starGeo.dispose();
      starMat.dispose();
      galaxyGeo.dispose();
      galaxyMat.dispose();
      planetGeo.dispose();
      planetMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      gasGiantGeo.dispose();
      gasGiantMat.dispose();
      moonGeo.dispose();
      moonMat.dispose();
      starTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" />;
};
