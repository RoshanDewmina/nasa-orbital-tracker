// import { useRef, useEffect } from "react";
// import * as THREE from "three";

// const SolarSystem = () => {
//   const mountRef = useRef(null);

//   useEffect(() => {
//     // Setup the scene, camera, and renderer
//     const scene = new THREE.Scene();
//     const camera = new THREE.PerspectiveCamera(
//       60,
//       window.innerWidth / window.innerHeight,
//       0.1,
//       1000
//     );
//     const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

//     // Set renderer properties
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     renderer.setPixelRatio(window.devicePixelRatio);
//     mountRef.current.appendChild(renderer.domElement);

//     // Add ambient and directional light
//     const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
//     scene.add(ambientLight);

//     const sunLight = new THREE.PointLight(0xffffff, 2, 300);
//     sunLight.position.set(0, 0, 0);
//     scene.add(sunLight);

//     // Camera initial position
//     camera.position.set(0, 50, 80);
//     camera.lookAt(scene.position);

//     renderer.render(scene, camera);
//   }, []);

//   return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
// };


// export default SolarSystem;

