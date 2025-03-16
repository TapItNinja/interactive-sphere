import * as THREE from "three";
import "./style.css";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { gsap } from "gsap";

// Scene setup
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.01);

// Canvas setup
const canvas = document.querySelector(".webgl");

// Renderer setup
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Camera setup
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 20);
scene.add(camera);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(8, 10, 10);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
scene.add(pointLight);

// Add a rim light for better edge definition
const rimLight = new THREE.PointLight(0x00ffff, 1);
rimLight.position.set(-10, 0, -10);
scene.add(rimLight);

// Create sphere with enhanced materials
const geometry = new THREE.SphereGeometry(3, 128, 128);

const textureLoader = new THREE.TextureLoader();
const envMap = textureLoader.load("path/to/your/hdr/image.hdr");
envMap.mapping = THREE.EquirectangularReflectionMapping;

scene.background = envMap;
scene.environment = envMap;

const material = new THREE.MeshPhysicalMaterial({
  color: 0x00ff83,
  roughness: 0.2,
  metalness: 0.8,
  reflectivity: 5,
  clearcoat: 0.5,
  clearcoatRoughness: 0.9,
  envMapIntensity: 2.0, // Stronger reflections
  envMap: envMap // Use the environment map
});

const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);

// Add particles for visual interest
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 3000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
  posArray[i] = (Math.random() - 0.5) * 50;
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(posArray, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  size: 0.01,
  color: 0xffffff,
  transparent: true,
  opacity: 0.5
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Controls setup
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.enableZoom = true;
controls.maxDistance = 50;
controls.minDistance = 5;
controls.autoRotate = true;
controls.autoRotateSpeed = 1;

// Handle window resize
window.addEventListener("resize", () => {
  // Update sizes
  const width = window.innerWidth;
  const height = window.innerHeight;

  // Update camera
  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Animation loop
const clock = new THREE.Clock();

const animate = () => {
  const elapsedTime = clock.getElapsedTime();

  // Gently animate particles
  particlesMesh.rotation.y = elapsedTime * 0.05;

  // Update controls
  controls.update();

  // Render scene
  renderer.render(scene, camera);

  // Call animate again on the next frame
  window.requestAnimationFrame(animate);
};

animate();

// Initial animations with GSAP
const timeline = gsap.timeline({
  defaults: { duration: 1.5, ease: "power3.out" }
});
timeline.fromTo(mesh.scale, { x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
timeline.fromTo(
  particlesMesh.material,
  { opacity: 0 },
  { opacity: 0.5 },
  "-=1"
);
timeline.fromTo("nav", { y: "-100%" }, { y: "0%" }, "-=1");
timeline.fromTo(".title", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.5");
timeline.fromTo(
  ".subtitle",
  { opacity: 0, y: 20 },
  { opacity: 1, y: 0 },
  "-=0.3"
);
timeline.fromTo(".cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0 }, "-=0.5");

// Enhanced interactive color change with proper HSL color model
let mouseDown = false;
let touch = false;
let prevMouseX = 0;
let prevMouseY = 0;
let hue = 170; // Initial green-blue hue
let saturation = 100;
let lightness = 50;

function updateMeshColor() {
  const colorString = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  const color = new THREE.Color(colorString);
  gsap.to(mesh.material.color, {
    r: color.r,
    g: color.g,
    b: color.b,
    duration: 0.5
  });

  // Update rim light color for complementary color effect
  const rimColor = new THREE.Color(
    `hsl(${(hue + 180) % 360}, ${saturation}%, ${lightness}%)`
  );
  rimLight.color = rimColor;
}

// Mouse controls
window.addEventListener("mousedown", () => {
  mouseDown = true;
});
window.addEventListener("mouseup", () => {
  mouseDown = false;
});
window.addEventListener("mousemove", e => {
  if (mouseDown) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Calculate the change in position
    const deltaX = mouseX - prevMouseX;
    const deltaY = mouseY - prevMouseY;

    // Update the hue and lightness based on mouse movement
    hue = (hue + deltaX * 0.5) % 360;
    lightness = Math.max(30, Math.min(70, lightness - deltaY * 0.2));

    updateMeshColor();

    // Store the current position for the next frame
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  } else {
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
  }
});

// Touch controls for mobile
window.addEventListener("touchstart", e => {
  touch = true;
  prevMouseX = e.touches[0].clientX;
  prevMouseY = e.touches[0].clientY;
});

window.addEventListener("touchend", () => {
  touch = false;
});

window.addEventListener("touchmove", e => {
  if (touch) {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;

    // Calculate the change in position
    const deltaX = touchX - prevMouseX;
    const deltaY = touchY - prevMouseY;

    // Update the hue and lightness based on touch movement
    hue = (hue + deltaX * 0.5) % 360;
    lightness = Math.max(30, Math.min(70, lightness - deltaY * 0.2));

    updateMeshColor();

    // Store the current position for the next frame
    prevMouseX = touchX;
    prevMouseY = touchY;
  }
});

// Add keyboard controls for accessibility
window.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowLeft":
      hue = (hue - 5) % 360;
      if (hue < 0) hue += 360;
      break;
    case "ArrowRight":
      hue = (hue + 5) % 360;
      break;
    case "ArrowUp":
      lightness = Math.min(70, lightness + 2);
      break;
    case "ArrowDown":
      lightness = Math.max(30, lightness - 2);
      break;
    case "r":
      // Reset to initial color and rotation
      hue = 170;
      saturation = 100;
      lightness = 50;
      controls.reset();
      break;
    case " ":
      // Toggle autoRotate
      controls.autoRotate = !controls.autoRotate;
      break;
  }
  updateMeshColor();
});

// Helper function to toggle fullscreen
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(
        `Error attempting to enable full-screen mode: ${err.message}`
      );
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

// Add fullscreen button listener
document
  .querySelector(".fullscreen-btn")
  .addEventListener("click", toggleFullscreen);

// Add color picker functionality
const colorPicker = document.getElementById("color-picker");
colorPicker.addEventListener("input", e => {
  const color = new THREE.Color(e.target.value);
  gsap.to(mesh.material.color, {
    r: color.r,
    g: color.g,
    b: color.b,
    duration: 0.5
  });
});

// Add sphere presets
document.querySelectorAll(".preset-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    const preset = e.target.dataset.preset;
    let newColor, newRoughness, newMetalness;

    // Create a feedback element
    const feedback = document.createElement("div");
    feedback.className = "feedback-text";
    feedback.textContent = `${preset.charAt(0).toUpperCase() +
      preset.slice(1)} material applied`;
    document.body.appendChild(feedback);

    // Remove feedback after 2 seconds
    setTimeout(() => {
      document.body.removeChild(feedback);
    }, 2000);

    switch (preset) {
      case "chrome":
        newColor = new THREE.Color(0xffffff);
        newRoughness = 0.0;
        newMetalness = 0.9;
        break;
      case "gold":
        newColor = new THREE.Color(0xffaa00);
        newRoughness = 0.1;
        newMetalness = 1.0;
        break;
      case "glass":
        newColor = new THREE.Color(0x88ccff);
        newRoughness = 0.0;
        newMetalness = 0.2;
        mesh.material.transparent = true;
        mesh.material.opacity = 0.7;
        break;
      case "matte":
        newColor = new THREE.Color(0x00ff83);
        newRoughness = 0.7;
        newMetalness = 0.0;
        mesh.material.transparent = false;
        mesh.material.opacity = 1.0;
        break;
    }

    gsap.to(mesh.material, {
      roughness: newRoughness,
      metalness: newMetalness,
      duration: 0.5
    });

    gsap.to(mesh.material.color, {
      r: newColor.r,
      g: newColor.g,
      b: newColor.b,
      duration: 0.5
    });
  });
});

// Mobile menu toggle
const menuToggle = document.querySelector(".menu-toggle");
const navList = document.querySelector("nav ul");

menuToggle.addEventListener("click", e => {
  e.stopPropagation(); // Prevent click from bubbling to document
  navList.classList.toggle("active");
  menuToggle.classList.toggle("active");
});

// Close menu when clicking outside
document.addEventListener("click", e => {
  // Only close menu if clicking outside nav AND menu is active
  if (!e.target.closest("nav") && navList.classList.contains("active")) {
    navList.classList.remove("active");
    menuToggle.classList.remove("active");
  }
});

// Add this to make the menu close when a link is clicked
document.querySelectorAll("nav ul li a").forEach(link => {
  link.addEventListener("click", () => {
    navList.classList.remove("active");
    menuToggle.classList.remove("active");
  });
});

// Control panel toggle
const panelToggle = document.querySelector(".panel-toggle");
const controlPanel = document.querySelector(".control-panel");

panelToggle.addEventListener("click", () => {
  controlPanel.classList.toggle("active");
});

// Close panel when clicking elsewhere
document.addEventListener("click", e => {
  if (
    !e.target.closest(".control-panel") &&
    !e.target.closest(".panel-toggle")
  ) {
    controlPanel.classList.remove("active");
  }
});

// CTA button animation
const ctaBtn = document.querySelector(".cta-btn");

ctaBtn.addEventListener("mouseenter", () => {
  gsap.to(ctaBtn, {
    scale: 1.05,
    duration: 0.3
  });
});

ctaBtn.addEventListener("mouseleave", () => {
  gsap.to(ctaBtn, {
    scale: 1,
    duration: 0.3
  });
});

// Initialize spinner
window.addEventListener("load", () => {
  // Remove spinner if it exists
  const spinner = document.querySelector(".loading-spinner");
  if (spinner) {
    spinner.remove();
  }
});

// Create loading spinner
const spinner = document.createElement("div");
spinner.classList.add("loading-spinner");
document.body.appendChild(spinner);

// Handle external links
document.querySelectorAll("nav ul li a").forEach(link => {
  if (link.getAttribute("href").startsWith("http")) {
    link.setAttribute("target", "_blank");
    link.setAttribute("rel", "noopener noreferrer");
  }
});
