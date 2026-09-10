import './style.css';

const pilots = {
  elon: { name: 'Elon Musk', shortName: 'Elon' },
  trump: { name: 'Donald Trump', shortName: 'Trump' },
  obama: { name: 'Barack Obama', shortName: 'Obama' },
  biden: { name: 'Joe Biden', shortName: 'Biden' },
  hunter: { name: 'Hunter Biden', shortName: 'Hunter' },
};

const startButton = document.querySelector('#startButton');
const startButtonText = document.querySelector('#startButtonText');
const selectedPilotName = document.querySelector('#selectedPilotName');
const missionPilot = document.querySelector('#missionPilot');
let gameModule;

function choosePilot(pilotId) {
  const pilot = pilots[pilotId];
  document.querySelectorAll('.pilot-option').forEach(option => {
    const selected = option.dataset.pilot === pilotId;
    option.classList.toggle('selected', selected);
    option.setAttribute('aria-pressed', String(selected));
  });
  selectedPilotName.textContent = pilot.name;
  startButtonText.textContent = `Fly as ${pilot.shortName}`;
  missionPilot.textContent = `${pilot.shortName} flight`;
  document.dispatchEvent(new CustomEvent('pilotchange', { detail: pilotId }));
}

document.querySelectorAll('.pilot-option').forEach(option => {
  option.addEventListener('click', () => choosePilot(option.dataset.pilot));
});

startButton.addEventListener('click', async () => {
  if (startButton.disabled) return;
  const selectedPilot = document.querySelector('.pilot-option[aria-pressed="true"]')?.dataset.pilot ?? 'elon';
  startButton.disabled = true;
  startButtonText.textContent = 'Starting rotors…';
  try {
    gameModule ??= await import('./main.js');
    document.dispatchEvent(new CustomEvent('pilotchange', { detail: selectedPilot }));
    gameModule.startGame();
  } finally {
    startButton.disabled = false;
    startButtonText.textContent = `Fly as ${pilots[selectedPilot].shortName}`;
  }
});

window.addEventListener('keydown', event => {
  if (event.code === 'Enter' && !document.querySelector('#startScreen').classList.contains('hidden')) startButton.click();
});
