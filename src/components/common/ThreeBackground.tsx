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
    camera.position.z = 32;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'fixed';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.zIndex = '0';
    container.appendChild(renderer.domElement);

    const textureLoader = new THREE.TextureLoader();

    // 1. High-Res Glossy Round Sparkling Star Canvas Texture with 4-Point Flare Rays
    const createGlossyStarTexture = () => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext('2d');
      if (ctx) {
        // Soft Outer Radial Glow Halo
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, 'rgba(255, 255, 255, 1)');
        g.addColorStop(0.2, 'rgba(224, 242, 254, 0.9)');
        g.addColorStop(0.45, 'rgba(56, 189, 248, 0.4)');
        g.addColorStop(0.75, 'rgba(14, 165, 233, 0.15)');
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();

        // Cross Flare Ray 1 (Horizontal)
        const rayGradH = ctx.createLinearGradient(4, 32, 60, 32);
        rayGradH.addColorStop(0, 'rgba(255,255,255,0)');
        rayGradH.addColorStop(0.5, 'rgba(255,255,255,0.9)');
        rayGradH.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = rayGradH;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(4, 32); ctx.lineTo(60, 32); ctx.stroke();

        // Cross Flare Ray 2 (Vertical)
        const rayGradV = ctx.createLinearGradient(32, 4, 32, 60);
        rayGradV.addColorStop(0, 'rgba(255,255,255,0)');
        rayGradV.addColorStop(0.5, 'rgba(255,255,255,0.9)');
        rayGradV.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = rayGradV;
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(32, 4); ctx.lineTo(32, 60); ctx.stroke();

        // Intense Glossy Center Nucleus
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(32, 32, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(c);
    };

    const createSunTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 512;
      const ctx = c.getContext('2d');
      if (ctx) {
        const g = ctx.createRadialGradient(256, 256, 10, 256, 256, 256);
        g.addColorStop(0, '#fffbeb');
        g.addColorStop(0.2, '#fde047');
        g.addColorStop(0.5, '#f97316');
        g.addColorStop(0.8, '#dc2626');
        g.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 300; i++) {
          ctx.fillStyle = `rgba(255, 230, 150, ${Math.random() * 0.4})`;
          ctx.beginPath();
          ctx.arc(Math.random() * 512, Math.random() * 512, Math.random() * 12, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return new THREE.CanvasTexture(c);
    };

    const createEarthTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 256;
      const ctx = c.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 512, 256);

        const g = ctx.createLinearGradient(0, 0, 512, 256);
        g.addColorStop(0, '#1e3a8a');
        g.addColorStop(0.5, '#0284c7');
        g.addColorStop(1, '#0f766e');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 256);

        ctx.fillStyle = '#15803d';
        for (let i = 0; i < 45; i++) {
          ctx.beginPath();
          ctx.ellipse(Math.random() * 512, Math.random() * 256, 20 + Math.random() * 40, 15 + Math.random() * 30, Math.random(), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 60; i++) {
          ctx.beginPath();
          ctx.ellipse(Math.random() * 512, Math.random() * 256, 30 + Math.random() * 50, 5 + Math.random() * 12, Math.random(), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      return new THREE.CanvasTexture(c);
    };

    const createJupiterTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 256;
      const ctx = c.getContext('2d');
      if (ctx) {
        const bandColors = ['#9a3412', '#c2410c', '#ea580c', '#fed7aa', '#78350f', '#f97316', '#fdba74', '#9a3412'];
        for (let y = 0; y < 256; y += 8) {
          ctx.fillStyle = bandColors[Math.floor((y / 256) * bandColors.length)];
          ctx.fillRect(0, y, 512, 8 + Math.random() * 4);
        }
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.ellipse(320, 160, 35, 20, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(c);
    };

    const createSaturnTexture = () => {
      const c = document.createElement('canvas');
      c.width = 512; c.height = 256;
      const ctx = c.getContext('2d');
      if (ctx) {
        const g = ctx.createLinearGradient(0, 0, 0, 256);
        g.addColorStop(0, '#fef08a');
        g.addColorStop(0.3, '#f59e0b');
        g.addColorStop(0.6, '#d97706');
        g.addColorStop(1, '#b45309');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 512, 256);
      }
      return new THREE.CanvasTexture(c);
    };

    const createSaturnRingTexture = () => {
      const c = document.createElement('canvas');
      c.width = 256; c.height = 256;
      const ctx = c.getContext('2d');
      if (ctx) {
        const g = ctx.createRadialGradient(128, 128, 50, 128, 128, 128);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.4, 'rgba(251, 191, 36, 0.75)');
        g.addColorStop(0.6, 'rgba(217, 119, 6, 0.85)');
        g.addColorStop(0.75, 'rgba(180, 83, 9, 0.45)');
        g.addColorStop(0.9, 'rgba(245, 158, 11, 0.65)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 256, 256);
      }
      return new THREE.CanvasTexture(c);
    };

    const starTexture = createGlossyStarTexture();
    const sunTexture = createSunTexture();
    const earthTexture = createEarthTexture();
    const jupiterTexture = createJupiterTexture();
    const saturnTexture = createSaturnTexture();
    const saturnRingTexture = createSaturnRingTexture();

    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
      (tex) => { earthMat.map = tex; earthMat.needsUpdate = true; }
    );
    textureLoader.load(
      'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/jupiter.jpg',
      (tex) => { jupiterMat.map = tex; jupiterMat.needsUpdate = true; }
    );

    // 1. REAL 3D SUN (Blazing Celestial Body)
    const sunGeo = new THREE.SphereGeometry(6, 48, 48);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture
    });
    const sun = new THREE.Mesh(sunGeo, sunMat);
    sun.position.set(-25, 14, -20);
    scene.add(sun);

    // Sun Outer Flare Halo
    const sunGlowGeo = new THREE.SphereGeometry(7.5, 32, 32);
    const sunGlowMat = new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.4,
      side: THREE.BackSide
    });
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat);
    sun.add(sunGlow);

    // 2. REAL 3D EARTH
    const earthGeo = new THREE.SphereGeometry(3.8, 48, 48);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.4,
      metalness: 0.2
    });
    const earth = new THREE.Mesh(earthGeo, earthMat);
    earth.position.set(18, -6, -10);
    earth.rotation.z = Math.PI * 0.12;
    scene.add(earth);

    // Earth Atmosphere Sheen
    const earthAtmosGeo = new THREE.SphereGeometry(4.0, 32, 32);
    const earthAtmosMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    });
    const earthAtmos = new THREE.Mesh(earthAtmosGeo, earthAtmosMat);
    earth.add(earthAtmos);

    // 3. REAL 3D SATURN WITH PLANETARY RINGS
    const saturnGroup = new THREE.Group();
    const saturnGeo = new THREE.SphereGeometry(4.2, 48, 48);
    const saturnMat = new THREE.MeshStandardMaterial({
      map: saturnTexture,
      roughness: 0.6
    });
    const saturn = new THREE.Mesh(saturnGeo, saturnMat);
    saturnGroup.add(saturn);

    const ringGeo = new THREE.RingGeometry(5.2, 9.8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      map: saturnRingTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    saturnGroup.add(ring);

    saturnGroup.position.set(-18, -12, -15);
    saturnGroup.rotation.z = Math.PI * 0.18;
    scene.add(saturnGroup);

    // 4. REAL 3D JUPITER
    const jupiterGeo = new THREE.SphereGeometry(4.8, 48, 48);
    const jupiterMat = new THREE.MeshStandardMaterial({
      map: jupiterTexture,
      roughness: 0.7
    });
    const jupiter = new THREE.Mesh(jupiterGeo, jupiterMat);
    jupiter.position.set(24, 12, -22);
    scene.add(jupiter);

    // 5. Glossy Round Starfield (3200 Round Twinkling Stars with Flare Texture)
    const starCount = window.innerWidth < 768 ? 1500 : 3200;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    const starColorsList = [
      new THREE.Color('#ffffff'), // Pure White
      new THREE.Color('#e0f2fe'), // Ice Blue
      new THREE.Color('#fef08a'), // Solar Yellow
      new THREE.Color('#f472b6'), // Nebula Pink
      new THREE.Color('#a7f3d0')  // Emerald Mint
    ];

    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 180;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 180;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 150;

      const c = starColorsList[Math.floor(Math.random() * starColorsList.length)];
      starColors[i * 3] = c.r;
      starColors[i * 3 + 1] = c.g;
      starColors[i * 3 + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    // CRITICAL: map is attached to guarantee 100% round glossy sparkling star rendering
    const starMat = new THREE.PointsMaterial({
      size: 1.25,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Lights
    const sunLight = new THREE.PointLight(0xfffbe8, 3.5, 200);
    sunLight.position.copy(sun.position);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // Mouse & Scroll Parallax Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let scrollY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.0016;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.0016;
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

      // Rotate Planets on their Axes
      sun.rotation.y = elapsedTime * 0.02;
      earth.rotation.y = elapsedTime * 0.12;
      jupiter.rotation.y = elapsedTime * 0.09;
      saturn.rotation.y = elapsedTime * 0.08;
      saturnGroup.rotation.y = elapsedTime * 0.03;

      // Sparkling / Twinkling Star Animation
      starField.rotation.y = elapsedTime * 0.008;
      starMat.size = 1.2 + Math.sin(elapsedTime * 2.5) * 0.2;

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
      sunGeo.dispose();
      sunMat.dispose();
      earthGeo.dispose();
      earthMat.dispose();
      saturnGeo.dispose();
      saturnMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      jupiterGeo.dispose();
      jupiterMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      starTexture.dispose();
      sunTexture.dispose();
      earthTexture.dispose();
      jupiterTexture.dispose();
      saturnTexture.dispose();
      saturnRingTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={containerRef} className="pointer-events-none fixed inset-0 z-0 overflow-hidden" />;
};
