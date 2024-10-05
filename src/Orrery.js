import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const orbitScaleFactor = 175; // Adjusted for better spacing in scene

const loadTexture = (path) => {
  return new THREE.TextureLoader().load(path);
};

const Orrery = () => {
  const mountRef = useRef(null);
  const [orbitalData, setOrbitalData] = useState([]);

  const planetSizes = {
    planet_Mercury: 0.38,
    planet_Venus: 0.95,
    planet_Earth: 1,
    planet_Mars: 0.53,
    planet_Jupiter: 11.21,
    planet_Saturn: 9.45,
    planet_Uranus: 4.01,
    planet_Neptune: 3.88,
    moon: 0.27, // Moon size relative to Earth
  };

  const slider = 5; // Number of planets to show

  useEffect(() => {
    fetch('/orbitalData.json')
      .then((response) => response.json())
      .then((data) => setOrbitalData(data.slice(0, slider + 8)))
      //.then((data) => setOrbitalData(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, []);

  useEffect(() => {
    if (orbitalData.length === 0) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.set(0, -400, 100);

    // Lighting setup
    const sunLight = new THREE.PointLight(0xffffff, 3, 2000);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 10); // softer global light
    scene.add(ambientLight);

    // Background: Starfield
    const createStarfieldBackground = () => {
      const starGeometry = new THREE.SphereGeometry(7500, 64, 64);
      const starMaterial = new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load('/textures/8k_stars.jpg'),
        side: THREE.BackSide, // Render inside of the sphere
      });
      const starfield = new THREE.Mesh(starGeometry, starMaterial);
      return starfield;
    };

    const starfield = createStarfieldBackground();
    scene.add(starfield);

    // Sun with emissive material
    const sunTexture = loadTexture('/textures/sun.jpg');
    const sunGeometry = new THREE.SphereGeometry(50, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTexture,
      emissive: 0xffff00, // Glowing effect
      emissiveIntensity: 2,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;
    controls.minDistance = 75;  // Minimum zoom distance (how close you can zoom in)
    controls.maxDistance = 2500; // Maximum zoom distance (how far you can zoom out)

    const planets = [];

    orbitalData.forEach((obj, index) => {
      const { e, q_au_1, i_deg, longitudeOfAscendingNode, object_name, p_yr } = obj;

      // Calculate orbit points
      const a = (parseFloat(q_au_1) / (1 - e)) * orbitScaleFactor;
      const b = a * Math.sqrt(1 - e * e);
      const points = [];
      for (let i = 0; i <= 100; i++) {
        const theta = (i / 100) * Math.PI * 2;
        const x = a * Math.cos(theta);
        const y = b * Math.sin(theta);
        points.push(new THREE.Vector3(x, y, 0));
      }

      // Orbit Line
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

      // Orbit Group
      const orbitGroup = new THREE.Group();
      orbitGroup.add(orbitLine);
      orbitGroup.rotation.z = THREE.MathUtils.degToRad(longitudeOfAscendingNode || 0);
      orbitGroup.rotation.x = THREE.MathUtils.degToRad(i_deg || 0);
      scene.add(orbitGroup);

      // Planet Setup
      let texture;
      if (object_name.includes('Earth')) texture = loadTexture('/textures/earth.jpg');
      if (object_name.includes('Mars')) texture = loadTexture('/textures/mars.jpg');
      if (object_name.includes('Jupiter')) texture = loadTexture('/textures/jupiter.jpg');
      if (object_name.includes('Mercury')) texture = loadTexture('/textures/mercury.jpg');
      if (object_name.includes('Venus')) texture = loadTexture('/textures/venus.jpg');
      if (object_name.includes('Uranus')) texture = loadTexture('/textures/uranus.jpg');
      if (object_name.includes('Neptune')) texture = loadTexture('/textures/neptune.jpg');
      if (object_name.includes('Saturn')) texture = loadTexture('/textures/saturn.jpg');

      const sizeFactor = planetSizes[object_name] || 1;
      const planetGeometry = new THREE.SphereGeometry(5 * sizeFactor, 32, 32);
      const planetMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.1,
        roughness: 1,
      });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);

      scene.add(planet);

      // Add Moon for Earth
      let moon;
      if (object_name.includes('Earth')) {
        const moonTexture = loadTexture('/textures/moon.jpg');
        const moonGeometry = new THREE.SphereGeometry(5 * planetSizes['moon'], 32, 32);
        const moonMaterial = new THREE.MeshStandardMaterial({
          map: moonTexture,
          metalness: 0.1,
          roughness: 1,
        });
        moon = new THREE.Mesh(moonGeometry, moonMaterial);
        planet.add(moon);
      }

      planets.push({
        planet,
        moon,
        orbitGroup,
        points,
        speed: ((2 * Math.PI) / Math.abs(parseFloat(p_yr))) * 0.01,
        currentIndex: 0,
      });
    });

    const animate = () => {
      requestAnimationFrame(animate);

      planets.forEach((data) => {
        const { planet, points, orbitGroup, speed, moon } = data;
        data.currentIndex = (data.currentIndex + speed) % points.length;
        const point1 = points[Math.floor(data.currentIndex)];
        const point2 = points[Math.ceil(data.currentIndex) % points.length];
        const t = data.currentIndex % 1;

        // Smooth position interpolation
        const interpolatedPosition = new THREE.Vector3().lerpVectors(point1, point2, t);
        planet.position.copy(interpolatedPosition);
        planet.position.applyMatrix4(orbitGroup.matrixWorld); // Apply orbital transformations

        // Moon orbit around Earth
        if (moon) {
          const moonOrbitRadius = 30; // Approximate distance between Earth and Moon
          const moonSpeed = 0.5; // Speed of Moon orbiting Earth
          moon.position.set(
            Math.cos(data.currentIndex * moonSpeed) * moonOrbitRadius,
            Math.sin(data.currentIndex * moonSpeed) * moonOrbitRadius,
            0
          );
        }
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    return () => {
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [orbitalData]);

  return <div ref={mountRef} />;
};

export default Orrery;
