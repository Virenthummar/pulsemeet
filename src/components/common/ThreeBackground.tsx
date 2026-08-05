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
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '0';
    container.appendChild(renderer.domElement);

    // 1. Vibrant Multi-Color Particle Constellation
    const particleCount = window.innerWidth < 768 ? 500 : 1100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Vibrant Electric Neon Color Palette
    const palette = [
      new THREE.Color('#8b5cf6'), // Electric Violet
      new THREE.Color('#ec4899'), // Hot Pink
      new THREE.Color('#06b6d4'), // Neon Cyan
      new THREE.Color('#10b981'), // Emerald Green
      new THREE.Color('#f59e0b')  // Amber Gold
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 85;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 85;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 65;

      const randomColor = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = randomColor.r;
      colors[i * 3 + 1] = randomColor.g;
      colors[i * 3 + 2] = randomColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle Glow Texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.75,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 2. Floating Glowing 3D Geometries
    // Neon Torus Knot
    const torusKnotGeo = new THREE.TorusKnotGeometry(4.5, 1.4, 120, 16);
    const torusKnotMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7, // Purple glow
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const torusKnot = new THREE.Mesh(torusKnotGeo, torusKnotMat);
    torusKnot.position.set(-20, 12, -12);
    scene.add(torusKnot);

    // Neon Cyan Icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(5.5, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4, // Cyan glow
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const icosahedron = new THREE.Mesh(icoGeo, icoMat);
    icosahedron.position.set(22, -14, -14);
    scene.add(icosahedron);

    // Emerald Octahedron
    const octGeo = new THREE.OctahedronGeometry(4, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald glow
      wireframe: true,
      transparent: true,
      opacity: 0.22
    });
    const octahedron = new THREE.Mesh(octGeo, octMat);
    octahedron.position.set(0, -18, -10);
    scene.add(octahedron);

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

      camera.position.x = targetX * 16;
      camera.position.y = -targetY * 16 - scrollY * 0.25;
      camera.lookAt(scene.position);

      // Rotate 3D objects
      particles.rotation.y = elapsedTime * 0.035;
      particles.rotation.x = elapsedTime * 0.02;

      torusKnot.rotation.x = elapsedTime * 0.22;
      torusKnot.rotation.y = elapsedTime * 0.28;

      icosahedron.rotation.y = elapsedTime * 0.18;
      icosahedron.rotation.z = elapsedTime * 0.12;

      octahedron.rotation.x = elapsedTime * 0.15;
      octahedron.rotation.y = elapsedTime * 0.2;

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
      geometry.dispose();
      material.dispose();
      torusKnotGeo.dispose();
      torusKnotMat.dispose();
      icoGeo.dispose();
      icoMat.dispose();
      octGeo.dispose();
      octMat.dispose();
      particleTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" />;
};
