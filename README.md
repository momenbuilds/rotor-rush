# Rotor Rush

Rotor Rush is a lightweight 3D browser game about flying a ridiculous helicopter backpack through Reykjavík. Pick a pilot, clear seven aerial gates, spot oversized celebrity landmarks, and collect followers along the way.

**[Play Rotor Rush](https://rotor-rush.vercel.app)** · [Report a bug](https://github.com/momenbuilds/rotor-rush/issues)

The game is built with vanilla JavaScript, Three.js, and Vite. It runs entirely in the browser with no account, backend, tracking, or paid API.

## Highlights

- Five selectable pilots: Elon Musk, Donald Trump, Barack Obama, Joe Biden, and Hunter Biden
- Rear Chase and front-facing camera modes
- Seven checkpoint flight course with route guidance
- Celebrity sightings, follower rewards, rotor power, altitude, and finish scoring
- Keyboard and touch controls
- Pause, rescue, sound, and instant replay controls
- Adaptive rendering that targets 60 FPS during movement and throttles while idle
- GPU-instanced scenery and compact WebP character textures

## Quick start

Requirements: Node.js 20 or newer and npm.

```bash
git clone https://github.com/momenbuilds/rotor-rush.git
cd rotor-rush
npm install
npm run dev
```

Open the local URL printed by Vite.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | `W A S D` or arrow keys | Direction pad |
| Rise | `Space` | Lift button |
| Boost | `Shift` | — |
| Change camera | `C` | Camera button |
| Pause | `Esc` or `P` | Pause button |
| Return to route | — | Rescue button |

## Commands

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run preview  # Preview the production build
npm run check    # Build and verify required output
```

## Project structure

```text
.
├── public/assets/       # Optimized character sprites
├── scripts/             # Build verification
├── src/main.js          # Three.js world and game logic
├── src/style.css        # Interface and responsive styles
├── index.html           # App shell and accessible controls
└── vercel.json          # Hosting and cache configuration
```

## Performance design

Rotor Rush deliberately favors smooth play and cool devices:

- Static buildings, roofs, mountains, and rocks use `InstancedMesh` batches.
- Character images are 512×768 WebP textures totaling under 200 KB.
- Real-time shadow maps are replaced by a cheap soft blob shadow.
- Rendering uses a reduced pixel ratio, 60 FPS while moving, 30 FPS while idle, and 15 FPS on overlays.
- HUD writes are throttled and hot-loop vector objects are reused.

## Contributing

Bug reports, performance improvements, accessibility fixes, and new course ideas are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Disclaimer

Rotor Rush is an independent parody game. It is not affiliated with, endorsed by, or sponsored by any person depicted in the game. Public-figure likenesses are used as fictional game characters and do not imply participation or approval.

## License

The project is available under the [MIT License](LICENSE).
