

// Scene Setup
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  50,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(60, 40, 60); 
camera.lookAt(0, 0, 0);         



const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("solarCanvas"),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(0, 0, 0);
scene.add(pointLight);
const ambientLight = new THREE.AmbientLight(0x404040, 0.5); 
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 0, 0); 
scene.add(directionalLight);

const textureLoader = new THREE.TextureLoader();


let starSphere, starMat;

function createStars(texturePath) {
  const starTexture = textureLoader.load(texturePath);
  const starGeo = new THREE.SphereGeometry(300, 64, 64);
  starMat = new THREE.MeshBasicMaterial({
    map: starTexture,
    side: THREE.BackSide,
    opacity: 0.8,
    transparent: true
  });
  starSphere = new THREE.Mesh(starGeo, starMat);
  scene.add(starSphere);
}

// Call it with initial dark texture
createStars('textures/stars.jpg');


//  Sun 
const sunTexture = textureLoader.load("textures/sun.jpg");
const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
const sunGeometry = new THREE.SphereGeometry(12, 32, 32);
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

//  Planets 
const planetData = [
  { name: 'Mercury', size: 1.2 , distance: 14, texture: 'textures/mercury.jpg', speed: 0.04 },
  { name: 'Venus', size: 1.7, distance: 17, texture: 'textures/venus.jpg', speed: 0.015 },
  { name: 'Earth', size: 2, distance: 22, texture: 'textures/earth.jpg', speed: 0.01 },
  { name: 'Mars', size: 1.6, distance: 25, texture: 'textures/mars.jpg', speed: 0.008 },
  { name: 'Jupiter', size: 4, distance: 30, texture: 'textures/jupiter.jpg', speed: 0.004 },
  { name: 'Saturn', size: 3.4, distance: 34, texture: 'textures/saturn.jpg', speed: 0.003 },
  { name: 'Uranus', size: 2.7, distance: 38, texture: 'textures/uranus.jpg', speed: 0.002 },
  { name: 'Neptune', size: 2.5, distance: 42, texture: 'textures/neptune.jpg', speed: 0.0015 }
];

const planets = [];

planetData.forEach((planet) => {
  const geometry = new THREE.SphereGeometry(planet.size, 32, 32);
  const texture = textureLoader.load(planet.texture);
  const material = new THREE.MeshBasicMaterial({ map: texture }); 
  const mesh = new THREE.Mesh(geometry, material);
  if (planet.name === 'Saturn') {
  const ringTexture = textureLoader.load("textures/saturn_ring.png");

  const ringGeometry = new THREE.RingGeometry(planet.size + 0.5, planet.size + 2, 64);
  const ringMaterial = new THREE.MeshBasicMaterial({
    map: ringTexture,
    side: THREE.DoubleSide,
    transparent: true
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2; 
  mesh.add(ring); 
}

  scene.add(mesh);

  planets.push({
    mesh,
    distance: planet.distance,
    angle: 0,
    speed: planet.speed,
    name: planet.name
  });
});

//  Speed Controls

const speedDropdown = document.getElementById("speedDropdown");
const advancedToggleBtn = document.getElementById("advancedToggleBtn");
const controlsDiv = document.getElementById("controls");

// Global speed control
speedDropdown.addEventListener("change", (e) => {
  const newSpeed = parseFloat(e.target.value);
  planets.forEach((planet) => {
    planet.speed = newSpeed;
  });
});


let showAdvanced = false;
advancedToggleBtn.addEventListener("click", () => {
  showAdvanced = !showAdvanced;
  controlsDiv.style.display = showAdvanced ? "block" : "none";
  advancedToggleBtn.innerText = showAdvanced ? "Hide Advanced" : "Advanced";
});


planetData.forEach((planet, index) => {
  const label = document.createElement("label");
  label.innerText = `${planet.name} speed:`;
  label.style.display = 'block';
  label.style.marginTop = '8px';

  const input = document.createElement("input");
  input.type = "range";
  input.min = 0.001;
  input.max = 0.1;
  input.step = 0.001;
  input.value = planet.speed;

  input.addEventListener("input", (e) => {
    planets[index].speed = parseFloat(e.target.value);
  });

  controlsDiv.appendChild(label);
  controlsDiv.appendChild(input);
});

// orbits
function createOrbit(distance) {
  const curve = new THREE.EllipseCurve(
    0, 0,
    distance, distance,
    0, 2 * Math.PI,
    false,
    0
  );
  const points = curve.getPoints(100);
  const geometry = new THREE.BufferGeometry().setFromPoints(points.map(p => new THREE.Vector3(p.x, 0, p.y)));
  const material = new THREE.LineBasicMaterial({
  color: 0xffffff,
  opacity: 0.15,
  transparent: true
});
  const orbit = new THREE.Line(geometry, material);
  orbit.computeLineDistances();
  scene.add(orbit);
}

const orbitSpacing = 0.5; 
planetData.forEach((p, i) => createOrbit(p.distance + i * orbitSpacing));


//  Pause / Resume
let isPaused = false;
document.getElementById("toggleBtn").addEventListener("click", () => {
  isPaused = !isPaused;
  document.getElementById("toggleBtn").innerText = isPaused ? "Resume" : "Pause";
});

//  Theme Toggle 
let darkMode = true;

document.getElementById("themeBtn").addEventListener("click", () => {
  darkMode = !darkMode;
  document.getElementById("themeBtn").innerText = darkMode ? "Light Mode" : "Dark Mode";

  // Optional body color
  const bg = darkMode ? "#0d1b2a" : "#4ecdc4";
  document.body.style.backgroundColor = bg;

  // 🌌 Change star background texture in 3D scene
  const newTexture = darkMode ? "textures/dark.jpg" : "textures/stars.jpg";
  textureLoader.load(newTexture, (loadedTexture) => {
    starMat.map = loadedTexture;
    starMat.needsUpdate = true;
  });
});


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const tooltip = document.createElement("div");

tooltip.style.position = "absolute";
tooltip.style.padding = "4px 8px";
tooltip.style.background = "rgba(0, 0, 0, 0.7)";
tooltip.style.color = "white";
tooltip.style.fontSize = "12px";
tooltip.style.borderRadius = "4px";
tooltip.style.display = "none";
tooltip.style.zIndex = "999";
document.body.appendChild(tooltip);

window.addEventListener("mousemove", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const planet = planets.find(p => p.mesh === intersects[0].object);
    tooltip.innerText = planet.name;
 const tooltipWidth = 100;
tooltip.style.left = Math.min(event.clientX + 10, window.innerWidth - tooltipWidth) + "px";
tooltip.style.top = event.clientY + "px";

    tooltip.style.display = "block";
  } else {
    tooltip.style.display = "none";
  }
});

window.addEventListener("click", () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(planets.map(p => p.mesh));

  if (intersects.length > 0) {
    const planet = planets.find(p => p.mesh === intersects[0].object);
    const targetZ = planet.distance + 5;
    const startZ = camera.position.z;
    const step = (targetZ - startZ) / 20;
    let count = 0;

    const zoomInterval = setInterval(() => {
      if (count >= 20) return clearInterval(zoomInterval);
      camera.position.z += step;
      count++;
    }, 16);
  }
});


function animate() {
  requestAnimationFrame(animate);

  if (!isPaused) {
    planets.forEach((planet) => {
      planet.angle += planet.speed;
      planet.mesh.position.x = planet.distance * Math.cos(planet.angle);
      planet.mesh.position.z = planet.distance * Math.sin(planet.angle);
    });
  }

  renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
