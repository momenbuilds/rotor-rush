import * as THREE from 'three';

const canvas = document.querySelector('#game');
const isCompactDevice = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches;
const maxPixelRatio = isCompactDevice ? .75 : .9;
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: window.devicePixelRatio <= 1.5,
  powerPreference: 'low-power',
  precision: 'mediump',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x91d8ec);
scene.fog = new THREE.Fog(0x91d8ec, 70, 210);

const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 600);
camera.position.set(10, 8, 15);

const hemi = new THREE.HemisphereLight(0xeafaff, 0x4c5b46, 2.8);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1d1, 4.2);
sun.position.set(-35, 60, 20);
scene.add(sun);

const mats = {
  rock: new THREE.MeshLambertMaterial({ color: 0x31484d }),
  darkRock: new THREE.MeshLambertMaterial({ color: 0x243a40 }),
  grass: new THREE.MeshLambertMaterial({ color: 0x789560 }),
  snow: new THREE.MeshLambertMaterial({ color: 0xf5fbff }),
  road: new THREE.MeshLambertMaterial({ color: 0x99a8a8 }),
  water: new THREE.MeshPhongMaterial({ color: 0x3c96b6, shininess: 42 }),
  orange: new THREE.MeshLambertMaterial({ color: 0xff642e }),
  yellow: new THREE.MeshLambertMaterial({ color: 0xffd447, emissive: 0x4a2c00 }),
  white: new THREE.MeshLambertMaterial({ color: 0xf7fbff }),
  black: new THREE.MeshLambertMaterial({ color: 0x17232a }),
  skin: new THREE.MeshLambertMaterial({ color: 0xe4ad86 }),
  glass: new THREE.MeshPhongMaterial({ color: 0x86d7e9, shininess: 70 }),
};

function mesh(geometry, material, position, parent = scene) {
  const object = new THREE.Mesh(geometry, material);
  object.position.set(...position);
  parent.add(object);
  return object;
}

function instances(geometry, material, transforms, colors = []) {
  const objects = new THREE.InstancedMesh(geometry, material, transforms.length);
  const dummy = new THREE.Object3D();
  transforms.forEach(({ position, rotation = [0, 0, 0], scale = [1, 1, 1] }, index) => {
    dummy.position.set(...position);
    dummy.rotation.set(...rotation);
    dummy.scale.set(...scale);
    dummy.updateMatrix();
    objects.setMatrixAt(index, dummy.matrix);
    if (colors[index] !== undefined) objects.setColorAt(index, new THREE.Color(colors[index]));
  });
  objects.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  if (objects.instanceColor) objects.instanceColor.needsUpdate = true;
  scene.add(objects);
  return objects;
}

function addWorld() {
  mesh(new THREE.PlaneGeometry(500, 500), mats.water, [0, -3.4, -60]).rotation.x = -Math.PI / 2;
  const island = mesh(new THREE.CylinderGeometry(82, 98, 8, 12), mats.rock, [0, -4, -56]);
  island.scale.z = 2.4;
  mesh(new THREE.CylinderGeometry(76, 82, 1.5, 12), mats.grass, [0, .25, -56]).scale.z = 2.35;

  const road = mesh(new THREE.PlaneGeometry(12, 220), mats.road, [0, 1.05, -73]);
  road.rotation.x = -Math.PI / 2;
  road.rotation.z = -.08;

  const buildingTransforms = [];
  const roofTransforms = [];
  const buildingColors = [];
  for (let index = 0; index < 26; index += 1) {
    const side = index % 2 ? -1 : 1;
    const z = -14 - index * 5.1;
    const x = side * (10 + (index * 7) % 27);
    const height = 2.5 + (index * 1.7) % 7;
    const color = [0xe7edf0, 0xd4a65c, 0xbd5d4e, 0x7699a5][index % 4];
    const rotation = (index % 5 - 2) * .08;
    buildingTransforms.push({ position: [x, 1 + height / 2, z], rotation: [0, rotation, 0], scale: [5 + index % 4, height, 5 + (index + 1) % 4] });
    roofTransforms.push({ position: [x, 1.8 + height, z], rotation: [0, rotation + Math.PI / 4, 0], scale: [4.5, 1.5, 4.5] });
    buildingColors.push(color);
  }
  instances(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), buildingTransforms, buildingColors);
  instances(new THREE.ConeGeometry(1, 1, 4), mats.darkRock, roofTransforms);

  const church = new THREE.Group();
  church.position.set(-27, 1.2, -74);
  scene.add(church);
  mesh(new THREE.BoxGeometry(8, 10, 13), mats.white, [0, 5, 0], church);
  mesh(new THREE.ConeGeometry(4.2, 24, 4), mats.white, [0, 21, 0], church).rotation.y = Math.PI / 4;
  mesh(new THREE.BoxGeometry(2.6, 12, 3), mats.glass, [0, 11, 3.8], church);

  const mountainTransforms = [];
  const capTransforms = [];
  for (let index = 0; index < 10; index += 1) {
    const angle = index / 10 * Math.PI * 2;
    const radius = 90 + (index % 3) * 14;
    const position = [Math.cos(angle) * radius, 7, -70 + Math.sin(angle) * radius * .75];
    const mountainRadius = 18 + index % 8;
    const mountainHeight = 28 + index % 5 * 6;
    mountainTransforms.push({ position, rotation: [0, angle, 0], scale: [mountainRadius, mountainHeight, mountainRadius] });
    const capRadius = 7 + index % 4;
    capTransforms.push({ position: [position[0], 20, position[2]], rotation: [0, angle, 0], scale: [capRadius, 10, capRadius] });
  }
  instances(new THREE.ConeGeometry(1, 1, 5), mats.rock, mountainTransforms);
  instances(new THREE.ConeGeometry(1, 1, 5), mats.snow, capTransforms);

  const rockTransforms = [[], []];
  for (let index = 0; index < 36; index += 1) {
    const z = -8 - (index * 13) % 170;
    const x = ((index * 29) % 120) - 60;
    if (Math.abs(x) < 9) continue;
    const size = 1 + index % 3;
    rockTransforms[index % 2].push({
      position: [x, 1.6, z],
      rotation: [index, index * .3, index * .7],
      scale: [size, size * (.5 + (index % 4) * .15), size],
    });
  }
  instances(new THREE.DodecahedronGeometry(1, 0), mats.darkRock, rockTransforms[0]);
  instances(new THREE.DodecahedronGeometry(1, 0), mats.rock, rockTransforms[1]);
}

function makeFaceLabel(text, color = '#13202a') {
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 256;
  labelCanvas.height = 64;
  const context = labelCanvas.getContext('2d');
  context.fillStyle = 'rgba(247,251,255,.92)';
  context.beginPath();
  context.roundRect(4, 4, 248, 56, 19);
  context.fill();
  context.fillStyle = color;
  context.font = '900 27px Avenir Next, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 128, 33);
  const texture = new THREE.CanvasTexture(labelCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
  sprite.scale.set(7.5, 1.875, 1);
  return sprite;
}

function createCharacter({ shirt = 0x1d2a32, pants = 0x20272b, hair = 0x503527, skin = 0xe4ad86, label = '' } = {}) {
  const group = new THREE.Group();
  const skinMat = new THREE.MeshLambertMaterial({ color: skin });
  const shirtMat = new THREE.MeshLambertMaterial({ color: shirt });
  const pantsMat = new THREE.MeshLambertMaterial({ color: pants });
  const hairMat = new THREE.MeshLambertMaterial({ color: hair });
  const torso = mesh(new THREE.BoxGeometry(2.4, 3.1, 1.5), shirtMat, [0, 1.6, 0], group);
  torso.scale.x = 1.1;
  const head = mesh(new THREE.BoxGeometry(1.65, 1.7, 1.55), skinMat, [0, 4.05, 0], group);
  mesh(new THREE.BoxGeometry(1.7, .42, 1.58), hairMat, [0, 4.82, -.03], group).rotation.z = -.07;
  mesh(new THREE.BoxGeometry(.17, .14, .08), mats.black, [-.35, 4.18, .79], group);
  mesh(new THREE.BoxGeometry(.17, .14, .08), mats.black, [.35, 4.18, .79], group);
  const armLeft = mesh(new THREE.BoxGeometry(.72, 2.7, .72), shirtMat, [-1.6, 1.55, 0], group);
  const armRight = mesh(new THREE.BoxGeometry(.72, 2.7, .72), shirtMat, [1.6, 1.55, 0], group);
  const legLeft = mesh(new THREE.BoxGeometry(.9, 3, .95), pantsMat, [-.65, -1.45, 0], group);
  const legRight = mesh(new THREE.BoxGeometry(.9, 3, .95), pantsMat, [.65, -1.45, 0], group);
  mesh(new THREE.BoxGeometry(1, .7, 1.65), mats.black, [-.65, -3.05, .25], group);
  mesh(new THREE.BoxGeometry(1, .7, 1.65), mats.black, [.65, -3.05, .25], group);
  if (label) {
    const sprite = makeFaceLabel(label);
    sprite.position.set(0, 6.4, 0);
    group.add(sprite);
  }
  group.userData.limbs = { armLeft, armRight, legLeft, legRight, head };
  group.userData.materials = { skinMat, shirtMat, pantsMat, hairMat };
  return group;
}

function addRotorPack(character) {
  const pack = new THREE.Group();
  pack.position.set(0, 1.5, -1.1);
  character.add(pack);
  mesh(new THREE.BoxGeometry(2.3, 3.3, .9), mats.orange, [0, 0, 0], pack);
  mesh(new THREE.BoxGeometry(1.7, 2.5, .95), mats.black, [0, 0, -.6], pack);
  const mast = mesh(new THREE.CylinderGeometry(.16, .22, 4.5, 8), mats.black, [0, 3.7, 0], pack);
  const rotor = new THREE.Group();
  rotor.position.set(0, 6, 0);
  pack.add(rotor);
  mesh(new THREE.CylinderGeometry(.35, .42, .45, 12), mats.orange, [0, 0, 0], rotor);
  mesh(new THREE.BoxGeometry(10.5, .12, .5), mats.black, [0, 0, 0], rotor);
  mesh(new THREE.BoxGeometry(.5, .1, 8), mats.black, [0, .03, 0], rotor);
  const guard = mesh(new THREE.TorusGeometry(5.1, .07, 5, 48), mats.orange, [0, 0, 0], rotor);
  guard.rotation.x = Math.PI / 2;
  const exhaustLeft = mesh(new THREE.CylinderGeometry(.23, .35, 1.3, 8), mats.black, [-.65, -2.1, -.25], pack);
  const exhaustRight = mesh(new THREE.CylinderGeometry(.23, .35, 1.3, 8), mats.black, [.65, -2.1, -.25], pack);
  exhaustLeft.rotation.x = exhaustRight.rotation.x = -.15;
  return rotor;
}

addWorld();
const player = createCharacter({ shirt: 0x182127, pants: 0x20272b, hair: 0x604232 });
player.position.set(0, 4.4, 5);
player.rotation.y = Math.PI;
player.scale.setScalar(.72);
scene.add(player);
const blockPilotParts = [...player.children];
const rotor = addRotorPack(player);

const pilotTextureLoader = new THREE.TextureLoader();
const pilotData = {
  elon: { name: 'Elon Musk', shortName: 'Elon', front: '/assets/elon-pilot.webp', shirt: 0x182127, pants: 0x20272b, hair: 0x604232, skin: 0xe4ad86 },
  trump: { name: 'Donald Trump', shortName: 'Trump', front: '/assets/trump.webp', shirt: 0x18294a, pants: 0x18294a, hair: 0xd7b46a, skin: 0xe0a47f },
  obama: { name: 'Barack Obama', shortName: 'Obama', front: '/assets/obama.webp', shirt: 0x252934, pants: 0x252934, hair: 0x28231f, skin: 0x8f5238 },
  biden: { name: 'Joe Biden', shortName: 'Biden', front: '/assets/biden.webp', shirt: 0x17274a, pants: 0x17274a, hair: 0xe8e5dc, skin: 0xe1a480 },
  hunter: { name: 'Hunter Biden', shortName: 'Hunter', front: '/assets/hunter-biden.webp', shirt: 0x232936, pants: 0x232936, hair: 0x5c463b, skin: 0xd59a75 },
};
let selectedPilotId = document.querySelector('.pilot-option[aria-pressed="true"]')?.dataset.pilot ?? 'elon';
const pilotTextures = Object.fromEntries(Object.entries(pilotData).map(([id, pilot]) => {
  const texture = pilotTextureLoader.load(pilot.front);
  texture.colorSpace = THREE.SRGBColorSpace;
  return [id, texture];
}));
const backPilotTexture = pilotTextureLoader.load('/assets/elon-pilot-back.webp', () => {
  applyPilotVisual();
});
backPilotTexture.colorSpace = THREE.SRGBColorSpace;
const realisticPilot = new THREE.Sprite(new THREE.SpriteMaterial({
  map: backPilotTexture,
  transparent: true,
  alphaTest: .04,
  depthWrite: true,
  toneMapped: true,
}));
realisticPilot.position.set(0, .75, .7);
realisticPilot.scale.set(5.1, 7.65, 1);
realisticPilot.visible = false;
realisticPilot.castShadow = true;
realisticPilot.renderOrder = 2;
player.add(realisticPilot);
const shadowCanvas = document.createElement('canvas');
shadowCanvas.width = shadowCanvas.height = 128;
const shadowContext = shadowCanvas.getContext('2d');
const shadowGradient = shadowContext.createRadialGradient(64, 64, 5, 64, 64, 61);
shadowGradient.addColorStop(0, 'rgba(19,32,42,.3)');
shadowGradient.addColorStop(.55, 'rgba(19,32,42,.16)');
shadowGradient.addColorStop(1, 'rgba(19,32,42,0)');
shadowContext.fillStyle = shadowGradient;
shadowContext.fillRect(0, 0, 128, 128);
const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
const playerShadow = mesh(
  new THREE.PlaneGeometry(5.2, 5.2),
  new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true, opacity: .8, depthWrite: false }),
  [player.position.x, 1.08, player.position.z],
);
playerShadow.rotation.x = -Math.PI / 2;

const landmarkData = [
  { name: 'Donald Trump', pilotId: 'trump', color: 0xe44f37, position: [-27, 1.2, -35] },
  { name: 'Barack Obama', pilotId: 'obama', color: 0x3478d4, position: [28, 1.2, -74] },
  { name: 'Joe Biden', pilotId: 'biden', color: 0x79c7e8, position: [-29, 1.2, -112] },
  { name: 'Hunter Biden', pilotId: 'hunter', color: 0xe1a33e, position: [27, 1.2, -150] },
];

const celebrityLandmarks = landmarkData.map(({ name, pilotId, color, position }) => {
  const group = new THREE.Group();
  group.position.set(...position);
  scene.add(group);
  const platformMaterial = new THREE.MeshLambertMaterial({ color });
  const platform = mesh(new THREE.CylinderGeometry(6.2, 7, 1.3, 12), platformMaterial, [0, 0, 0], group);
  const haloMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .72 });
  const halo = mesh(new THREE.TorusGeometry(6.7, .16, 5, 24), haloMaterial, [0, .78, 0], group);
  halo.rotation.x = Math.PI / 2;
  const texture = pilotTextures[pilotId];
  const character = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, alphaTest: .05, depthWrite: true, toneMapped: true }));
  character.position.set(0, 6.4, 0);
  character.scale.set(7.5, 11.25, 1);
  group.add(character);
  const label = makeFaceLabel(name);
  label.position.set(0, 13.3, 0);
  label.scale.set(9, 2.25, 1);
  group.add(label);
  return { name, group, platform, halo, spotted: false };
});

const gates = [];
const gatePositions = [
  [2, 10, -18], [-15, 14, -43], [12, 20, -67], [0, 12, -91], [22, 18, -117], [-13, 25, -143], [2, 14, -172],
];
gatePositions.forEach((position, index) => {
  const gate = new THREE.Group();
  gate.position.set(...position);
  const ringMat = new THREE.MeshLambertMaterial({ color: index === 6 ? 0xff642e : 0xffd447, emissive: index === 6 ? 0x5c1000 : 0x5c3d00 });
  const ring = mesh(new THREE.TorusGeometry(5, .55, 8, 24), ringMat, [0, 0, 0], gate);
  ring.rotation.y = Math.PI / 2;
  const label = makeFaceLabel(index === 6 ? 'FINISH' : `GATE ${index + 1}`, index === 6 ? '#d33b17' : '#13202a');
  label.position.y = 7.2;
  gate.add(label);
  scene.add(gate);
  gates.push(gate);
});

const guideDots = [];
for (let index = 0; index < 7; index += 1) {
  const guideMaterial = new THREE.MeshLambertMaterial({ color: 0xffd447, emissive: 0x9b5b00, transparent: true, opacity: .9 });
  const guideDot = mesh(new THREE.OctahedronGeometry(.34, 0), guideMaterial, [0, 0, 0]);
  guideDot.visible = false;
  guideDots.push(guideDot);
}

const particles = [];
for (let index = 0; index < 12; index += 1) {
  const particle = mesh(new THREE.SphereGeometry(.13 + index % 3 * .04, 5, 5), mats.yellow, [0, 0, 0]);
  particle.visible = false;
  particles.push(particle);
}

const keys = new Set();
let gameState = 'menu';
let checkpoint = 0;
let fuel = 100;
let followers = 1_200_000;
let sightings = 0;
let startTime = 0;
let soundEnabled = true;
let faceCamera = false;
let toastTimer;
let hudUpdateElapsed = 1;
let renderedFrames = 0;
let fpsWindowStart = performance.now();
let needsRender = true;
const velocity = new THREE.Vector3();
const cameraTarget = new THREE.Vector3();
const movementHeading = new THREE.Vector3();
const routeVector = new THREE.Vector3();
const cameraForward = new THREE.Vector3();
const desiredCamera = new THREE.Vector3();

const ui = {
  start: document.querySelector('#startScreen'), hud: document.querySelector('#hud'), finish: document.querySelector('#finishScreen'),
  checkpoint: document.querySelector('#checkpointText'), altitude: document.querySelector('#altitudeText'), followers: document.querySelector('#followersText'),
  fuel: document.querySelector('#fuelText'), fuelBar: document.querySelector('#fuelBar'), speed: document.querySelector('#speedLines'), toast: document.querySelector('#toast'),
  finalTime: document.querySelector('#finalTime'), finalFollowers: document.querySelector('#finalFollowers'), sound: document.querySelector('#soundButton'),
  routeArrow: document.querySelector('#routeArrow'), routeName: document.querySelector('#routeName'), routeDistance: document.querySelector('#routeDistance'),
  camera: document.querySelector('#cameraButton'), sightings: document.querySelector('#sightingsText'), fps: document.querySelector('#fpsText'),
  selectedPilot: document.querySelector('#selectedPilotName'), startButtonText: document.querySelector('#startButtonText'), missionPilot: document.querySelector('#missionPilot'),
  pauseScreen: document.querySelector('#pauseScreen'), pause: document.querySelector('#pauseButton'),
};

function applyPilotVisual() {
  const pilot = pilotData[selectedPilotId];
  const showRealistic = faceCamera || selectedPilotId === 'elon';
  realisticPilot.material.map = faceCamera ? pilotTextures[selectedPilotId] : backPilotTexture;
  realisticPilot.material.needsUpdate = true;
  realisticPilot.visible = showRealistic;
  blockPilotParts.forEach(part => { part.visible = !showRealistic; });
  const { skinMat, shirtMat, pantsMat, hairMat } = player.userData.materials;
  skinMat.color.setHex(pilot.skin);
  shirtMat.color.setHex(pilot.shirt);
  pantsMat.color.setHex(pilot.pants);
  hairMat.color.setHex(pilot.hair);
  needsRender = true;
}

function selectPilot(pilotId) {
  selectedPilotId = pilotId;
  const pilot = pilotData[pilotId];
  document.querySelectorAll('.pilot-option').forEach(option => {
    const selected = option.dataset.pilot === pilotId;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  ui.selectedPilot.textContent = pilot.name;
  ui.startButtonText.textContent = `Fly as ${pilot.shortName}`;
  ui.missionPilot.textContent = `${pilot.shortName} flight`;
  applyPilotVisual();
}

function formatFollowers(value) { return value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)}M` : `${Math.round(value / 1000)}K`; }

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ui.toast.classList.remove('visible'), 1200);
}

function updateGateEmphasis() {
  gates.forEach((gate, index) => {
    if (!gate.visible) return;
    const isCurrent = index === checkpoint;
    gate.children[0].material.opacity = isCurrent ? 1 : .16;
    gate.children[0].material.transparent = !isCurrent;
    gate.children[1].visible = isCurrent;
    gate.scale.setScalar(isCurrent ? 1 : .64);
  });
}

let audioContext;
let rotorOscillator;
let rotorGain;
function startAudio() {
  if (!soundEnabled) return;
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') audioContext.resume();
  if (rotorOscillator) return;
  rotorOscillator = audioContext.createOscillator();
  rotorGain = audioContext.createGain();
  rotorOscillator.type = 'sawtooth';
  rotorOscillator.frequency.value = 42;
  rotorGain.gain.value = .025;
  rotorOscillator.connect(rotorGain).connect(audioContext.destination);
  rotorOscillator.start();
}

function resetGame() {
  checkpoint = 0;
  fuel = 100;
  followers = 1_200_000;
  sightings = 0;
  faceCamera = false;
  applyPilotVisual();
  ui.camera.innerHTML = '↗ <span>Chase</span>';
  keys.clear();
  player.position.set(0, 4.4, 5);
  player.rotation.set(0, Math.PI, 0);
  velocity.set(0, 0, 0);
  gates.forEach(gate => { gate.visible = true; gate.scale.setScalar(1); });
  celebrityLandmarks.forEach(landmark => {
    landmark.spotted = false;
    landmark.halo.material.opacity = .72;
    landmark.halo.scale.setScalar(1);
  });
  ui.checkpoint.textContent = 'Gate 1 / 7';
  ui.sightings.textContent = `0 / ${celebrityLandmarks.length}`;
  updateGateEmphasis();
  ui.finish.classList.remove('visible');
  gameState = 'playing';
  startTime = performance.now();
  startAudio();
}

function rescuePlayer() {
  const previousPosition = checkpoint === 0 ? new THREE.Vector3(0, 4.4, 5) : gates[checkpoint - 1].position;
  const targetPosition = gates[checkpoint]?.position ?? gatePositions[0];
  player.position.copy(previousPosition).add(new THREE.Vector3(0, checkpoint === 0 ? 0 : 1.5, checkpoint === 0 ? 0 : 6));
  routeVector.subVectors(targetPosition, player.position);
  player.rotation.set(0, Math.atan2(routeVector.x, routeVector.z), 0);
  velocity.set(0, 0, 0);
  fuel = 100;
  showToast('Back on route!');
}

export function startGame() {
  ui.start.classList.add('hidden');
  ui.hud.classList.add('visible');
  resetGame();
  showToast(`${pilotData[selectedPilotId].shortName} is airborne!`);
}

function showPilotMenu() {
  gameState = 'menu';
  keys.clear();
  faceCamera = false;
  applyPilotVisual();
  ui.camera.innerHTML = '↗ <span>Chase</span>';
  ui.hud.classList.remove('visible');
  ui.finish.classList.remove('visible');
  ui.pauseScreen.classList.remove('visible');
  ui.pauseScreen.setAttribute('aria-hidden', 'true');
  ui.start.classList.remove('hidden');
  if (rotorGain) rotorGain.gain.setTargetAtTime(0, audioContext.currentTime, .08);
}

function togglePause() {
  if (gameState === 'playing') {
    gameState = 'paused';
    keys.clear();
    ui.pauseScreen.classList.add('visible');
    ui.pauseScreen.setAttribute('aria-hidden', 'false');
    if (rotorGain) rotorGain.gain.setTargetAtTime(.004, audioContext.currentTime, .08);
  } else if (gameState === 'paused') {
    gameState = 'playing';
    ui.pauseScreen.classList.remove('visible');
    ui.pauseScreen.setAttribute('aria-hidden', 'true');
    startAudio();
  }
}

function applyTapImpulse(code) {
  if (gameState !== 'playing') return;
  movementHeading.set(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
  if (code === 'KeyW' || code === 'ArrowUp') velocity.addScaledVector(movementHeading, 2.2);
  if (code === 'KeyS' || code === 'ArrowDown') velocity.addScaledVector(movementHeading, -1.6);
  if (code === 'KeyA' || code === 'ArrowLeft') player.rotation.y += .1;
  if (code === 'KeyD' || code === 'ArrowRight') player.rotation.y -= .1;
  if (code === 'Space') velocity.y = Math.min(14, Math.max(velocity.y, 0) + 2.1);
  if ((code === 'ShiftLeft' || code === 'ShiftRight') && fuel >= 5) {
    velocity.addScaledVector(movementHeading, 5.5);
    fuel -= 5;
  }
}

function finishGame() {
  gameState = 'finished';
  const elapsed = Math.floor((performance.now() - startTime) / 1000);
  ui.finalTime.textContent = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, '0')}`;
  ui.finalFollowers.textContent = formatFollowers(followers - 1_200_000);
  ui.finish.classList.add('visible');
  if (rotorGain) rotorGain.gain.setTargetAtTime(.006, audioContext.currentTime, .2);
}

document.addEventListener('pilotchange', event => selectPilot(event.detail));
document.querySelector('#restartButton').addEventListener('click', resetGame);
document.querySelector('#changePilotButton').addEventListener('click', showPilotMenu);
document.querySelector('#pauseChangePilotButton').addEventListener('click', showPilotMenu);
document.querySelector('#resumeButton').addEventListener('click', togglePause);
document.querySelector('#rescueButton').addEventListener('click', rescuePlayer);
ui.pause.addEventListener('click', togglePause);
ui.camera.addEventListener('click', () => {
  faceCamera = !faceCamera;
  applyPilotVisual();
  ui.camera.innerHTML = faceCamera ? '◉ <span>Face</span>' : '↗ <span>Chase</span>';
  showToast(faceCamera ? 'Face camera' : 'Chase camera');
});
ui.sound.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  ui.sound.textContent = soundEnabled ? '♪' : '×';
  if (soundEnabled) startAudio(); else if (rotorGain) rotorGain.gain.setTargetAtTime(0, audioContext.currentTime, .08);
});

window.addEventListener('keydown', event => {
  keys.add(event.code);
  if (!event.repeat) applyTapImpulse(event.code);
  if (!event.repeat && event.code === 'KeyC' && gameState === 'playing') ui.camera.click();
  if (!event.repeat && (event.code === 'Escape' || event.code === 'KeyP')) togglePause();
  if (event.code === 'Enter' && gameState === 'menu') startGame();
  if (['Space', 'ArrowUp', 'ArrowDown'].includes(event.code)) event.preventDefault();
});
window.addEventListener('keyup', event => keys.delete(event.code));
document.querySelectorAll('[data-key]').forEach(button => {
  const key = button.dataset.key;
  const press = event => { event.preventDefault(); keys.add(key); applyTapImpulse(key); };
  const release = event => { event.preventDefault(); keys.delete(key); };
  button.addEventListener('pointerdown', press);
  button.addEventListener('pointerup', release);
  button.addEventListener('pointercancel', release);
  button.addEventListener('pointerleave', release);
});

function burst(position) {
  particles.forEach((particle, index) => {
    particle.position.copy(position);
    particle.visible = true;
    particle.userData.life = .6 + index * .02;
    particle.userData.velocity = new THREE.Vector3((index % 5 - 2) * 2.5, 2 + (index % 4), ((index * 3) % 7 - 3) * 1.5);
  });
}

function updateParticles(delta) {
  particles.forEach(particle => {
    if (!particle.visible) return;
    particle.userData.life -= delta;
    particle.position.addScaledVector(particle.userData.velocity, delta);
    particle.userData.velocity.y -= 7 * delta;
    particle.scale.setScalar(Math.max(0, particle.userData.life));
    if (particle.userData.life <= 0) particle.visible = false;
  });
}

function updatePlayer(delta, elapsed) {
  const boosting = (keys.has('ShiftLeft') || keys.has('ShiftRight')) && fuel > 0;
  const lift = keys.has('Space');
  const forward = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
  const turn = (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0) - (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0);

  player.rotation.y += turn * delta * 1.45;
  movementHeading.set(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
  const acceleration = boosting ? 35 : 22;
  velocity.addScaledVector(movementHeading, forward * acceleration * delta);
  velocity.y += ((lift ? 18 : 4.5) - 8.5) * delta;
  velocity.multiplyScalar(Math.pow(.34, delta));
  velocity.x = THREE.MathUtils.clamp(velocity.x, -22, 22);
  velocity.y = THREE.MathUtils.clamp(velocity.y, -12, 14);
  velocity.z = THREE.MathUtils.clamp(velocity.z, -22, 22);
  player.position.addScaledVector(velocity, delta);
  player.position.y = THREE.MathUtils.clamp(player.position.y, 3.1, 42);
  player.position.x = THREE.MathUtils.clamp(player.position.x, -58, 58);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -188, 18);
  if (player.position.y <= 3.11 && velocity.y < 0) velocity.y = 0;
  playerShadow.position.set(player.position.x, 1.08, player.position.z);
  const shadowScale = THREE.MathUtils.clamp(1.2 - (player.position.y - 3) * .025, .35, 1.15);
  playerShadow.scale.setScalar(shadowScale);
  playerShadow.material.opacity = .35 + shadowScale * .45;

  if (boosting) fuel = Math.max(0, fuel - 18 * delta); else fuel = Math.min(100, fuel + 8 * delta);
  rotor.rotation.y += delta * (boosting ? 46 : lift ? 35 : 20);
  const limbSwing = Math.sin(elapsed * 7) * Math.min(.35, velocity.length() * .03);
  player.userData.limbs.armLeft.rotation.x = -.35 + limbSwing;
  player.userData.limbs.armRight.rotation.x = -.35 - limbSwing;
  player.userData.limbs.legLeft.rotation.x = limbSwing;
  player.userData.limbs.legRight.rotation.x = -limbSwing;
  player.rotation.z = THREE.MathUtils.lerp(player.rotation.z, -turn * .22, 5 * delta);
  player.rotation.x = THREE.MathUtils.lerp(player.rotation.x, forward * .11, 5 * delta);

  if (rotorGain && soundEnabled) {
    rotorOscillator.frequency.setTargetAtTime(boosting ? 74 : lift ? 58 : 42, audioContext.currentTime, .08);
    rotorGain.gain.setTargetAtTime(boosting ? .045 : .025, audioContext.currentTime, .1);
  }

  celebrityLandmarks.forEach(landmark => {
    if (landmark.spotted || player.position.distanceToSquared(landmark.group.position) >= 430) return;
    landmark.spotted = true;
    sightings += 1;
    followers += 250000;
    landmark.halo.material.opacity = .2;
    landmark.halo.scale.setScalar(1.2);
    ui.sightings.textContent = `${sightings} / ${celebrityLandmarks.length}`;
    showToast(`${landmark.name} spotted! +250K`);
  });

  const gate = gates[checkpoint];
  if (gate && gate.visible && player.position.distanceTo(gate.position) < 5.5) {
    gate.visible = false;
    burst(gate.position);
    checkpoint += 1;
    followers += 130000 + checkpoint * 47000;
    updateGateEmphasis();
    if (checkpoint >= gates.length) {
      finishGame();
    } else {
      ui.checkpoint.textContent = `Gate ${checkpoint + 1} / ${gates.length}`;
      showToast(`Gate ${checkpoint} cleared! +${177 + checkpoint * 47}K`);
    }
  }

  const navigationGate = gates[checkpoint];
  if (navigationGate) {
    navigationGate.rotation.y = Math.sin(elapsed * .8) * .05;
    navigationGate.children[0].rotation.z += delta * .65;
    navigationGate.scale.setScalar(1 + Math.sin(elapsed * 4) * .035);
    const toGate = routeVector.subVectors(navigationGate.position, player.position);
    const horizontalDistance = Math.hypot(toGate.x, toGate.z);
    const desiredHeading = Math.atan2(toGate.x, toGate.z);
    const headingDelta = Math.atan2(Math.sin(desiredHeading - player.rotation.y), Math.cos(desiredHeading - player.rotation.y));
    guideDots.forEach((dot, index) => {
      const progress = .14 + index * .115;
      dot.visible = true;
      dot.position.lerpVectors(player.position, navigationGate.position, progress);
      dot.position.y += Math.sin(elapsed * 4 - index * .55) * .45;
      dot.rotation.y += delta * 2.5;
      dot.rotation.x += delta * 1.3;
      dot.scale.setScalar(.75 + Math.sin(elapsed * 5 - index) * .18);
    });
    hudUpdateElapsed += delta;
    if (hudUpdateElapsed >= .1) {
      ui.routeArrow.style.transform = `rotate(${-headingDelta}rad)`;
      ui.routeName.textContent = checkpoint === gates.length - 1 ? 'Finish ring' : `Gate ${checkpoint + 1}`;
      ui.routeDistance.textContent = `${Math.round(horizontalDistance)} m · ${toGate.y > 2 ? 'climb' : toGate.y < -2 ? 'descend' : 'level'}`;
      ui.altitude.textContent = Math.max(0, Math.round((player.position.y - 3) * 3.2));
      ui.followers.textContent = formatFollowers(followers);
      ui.fuel.textContent = `${Math.round(fuel)}%`;
      ui.fuelBar.style.transform = `scaleX(${fuel / 100})`;
      ui.fuelBar.style.background = fuel < 25 ? '#ff642e' : '#ffd447';
      ui.speed.classList.toggle('visible', boosting && velocity.length() > 8);
      hudUpdateElapsed = 0;
    }
  } else {
    guideDots.forEach(dot => { dot.visible = false; });
  }
}

function updateCamera(delta) {
  cameraForward.set(Math.sin(player.rotation.y), 0, Math.cos(player.rotation.y));
  desiredCamera.copy(player.position);
  if (faceCamera) {
    desiredCamera.addScaledVector(cameraForward, 10.5);
    desiredCamera.y += 5.5;
  } else {
    desiredCamera.addScaledVector(cameraForward, -13);
    desiredCamera.y += 6.5;
  }
  camera.position.lerp(desiredCamera, 1 - Math.pow(.002, delta));
  cameraTarget.copy(player.position);
  if (!faceCamera) cameraTarget.addScaledVector(cameraForward, 5);
  cameraTarget.y += faceCamera ? 1.8 : 2.1;
  camera.lookAt(cameraTarget);
}

let previousFrameTime = performance.now();
function animate(frameTime = performance.now()) {
  requestAnimationFrame(animate);
  if (gameState !== 'playing' && !needsRender) return;
  const activeFlight = gameState === 'playing' && (keys.size > 0 || velocity.lengthSq() > .7);
  const targetFps = gameState === 'playing' ? (activeFlight ? 60 : 30) : 15;
  const frameInterval = 1000 / targetFps;
  const frameElapsed = frameTime - previousFrameTime;
  if (frameElapsed < frameInterval - .5) return;
  const delta = Math.min(frameElapsed / 1000, .05);
  const elapsed = frameTime / 1000;
  previousFrameTime = frameTime - (frameElapsed % frameInterval);
  if (gameState === 'playing') updatePlayer(delta, elapsed);
  else rotor.rotation.y += delta * 5;
  updateParticles(delta);
  updateCamera(delta);
  renderer.render(scene, camera);
  needsRender = false;
  renderedFrames += 1;
  if (frameTime - fpsWindowStart >= 1000) {
    ui.fps.textContent = `${Math.round(renderedFrames * 1000 / (frameTime - fpsWindowStart))} fps`;
    renderedFrames = 0;
    fpsWindowStart = frameTime;
  }
}
animate();
document.documentElement.classList.add('game-ready');

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));
  needsRender = true;
});
