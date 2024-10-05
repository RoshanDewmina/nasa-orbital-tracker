import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const orbitScaleFactor = 10; // Adjust the orbit scaling factor

// Calculates the orbit points considering semi-major axis and eccentricity
const calculateOrbitPoints = (e, q, numPoints = 100) => {
    const points = [];
    const a = (q / (1 - e)) * orbitScaleFactor; // Semi-major axis
    for (let i = 0; i <= numPoints; i++) {
        const theta = (i / numPoints) * Math.PI * 2; // Angle in radians
        const r = a * (1 - e * Math.cos(theta)); // Distance from the focus
        const x = r * Math.cos(theta); // X coordinate
        const y = r * Math.sin(theta); // Y coordinate
        points.push(new THREE.Vector3(x, y, 0)); // Orbit points on a 2D plane
    }
    return points;
};

const getColor = (index) => {
    const colors = [
        0xff5733, 0x33ff57, 0x3357ff, 0xff33a1, 0xfff033, 0x33fff7, 0xf733ff
    ];
    return colors[index % colors.length];
};

const Orrery = () => {
    const mountRef = useRef(null);
    const [orbitalData, setOrbitalData] = useState([]);

    useEffect(() => {
        fetch('/orbitalData.json')
            .then(response => response.json())
            .then(data => setOrbitalData(data))
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    useEffect(() => {
        if (orbitalData.length === 0) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        camera.position.set(0, 0, 200);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 500);
        pointLight.position.set(0, 0, 100);
        scene.add(pointLight);

        // Sun
        const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
        const sunMaterial = new THREE.MeshStandardMaterial({
            color: 0xffff00,
            emissive: 0xffff00,
            emissiveIntensity: 1.5,
        });
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sun);

        orbitalData.forEach((obj, index) => {
            const { e, q_au_1, inclination, longitudeOfAscendingNode, name } = obj;
        
            // Orbit points calculation
            const orbitPoints = calculateOrbitPoints(e, parseFloat(q_au_1));
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x888888 });
            const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        
            // Create a group for each orbit
            const orbitGroup = new THREE.Group();
            orbitGroup.add(orbitLine);
        
            // Apply the transformation in the correct order:
            // 1. Rotate around the z-axis (longitude of ascending node)
            // 2. Tilt the orbit around the x-axis (inclination)
        
            // Rotation around z-axis (longitude of ascending node)
            const ascendingNodeRad = THREE.MathUtils.degToRad(longitudeOfAscendingNode || 0);
            orbitGroup.rotation.z = ascendingNodeRad;
        
            // Tilt around x-axis (inclination)
            const inclinationRad = THREE.MathUtils.degToRad(inclination || 0);
            orbitGroup.rotation.x = inclinationRad;
        
            scene.add(orbitGroup);
        
            // Planet creation and positioning
            const planetGeometry = new THREE.SphereGeometry(4, 32, 32);
            const planetMaterial = new THREE.MeshStandardMaterial({
                color: getColor(index),
                emissive: getColor(index),
                emissiveIntensity: 0.5
            });
            const planet = new THREE.Mesh(planetGeometry, planetMaterial);
            scene.add(planet);
        
            // Set the initial position of the planet on the orbit
            planet.position.copy(orbitPoints[0]);
        
            let currentIndex = 0;
            const speed = 0.02; // Animation speed
        
            // Animation function to move the planet along the orbit
            const animatePlanet = () => {
                currentIndex = (currentIndex + speed) % orbitPoints.length;
                planet.position.copy(orbitPoints[Math.floor(currentIndex)]);
        
                // Apply the orbit's transformations to the planet's position
                planet.position.applyMatrix4(orbitGroup.matrixWorld);
            };
        
            setInterval(animatePlanet, 100);
        });
        
        

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;
        controls.enableZoom = true;

        const animate = () => {
            requestAnimationFrame(animate);
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
