# ✈️ Aerohawk Services

> Premium cleaning solutions across Australia — powered by a cinematic 3D web experience.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r184-black?logo=threedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?logo=tailwindcss&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)

---

## 🎬 The Experience

This isn't a typical landing page. Scrolling drives a **cinematic camera journey** through a luxury home, telling the Aerohawk story in three acts:

| Phase | Scroll Range | What You See |
|-------|-------------|--------------|
| **🚪 The Hero** | 0% – 25% | A premium matte-blue front door with metallic Aerohawk handle. The door swings open and the camera dollies through. |
| **🤖 The Service** | 26% – 60% | A modern living room where a sleek cleaning drone sweeps a glass partition, leaving a glowing trail of pristine light. The glass wipes clean and the camera dives through. |
| **✨ The Result** | 61% – 100% | An immaculate, sunlit room with dust motes floating in golden light — the backdrop for the booking form. |

All 3D environments are built **procedurally with Three.js primitives** — no external model files. Every mesh, material, and shader is constructed in code.

---

## 🛠️ Tech Stack

- **React 19** — Component architecture with hooks
- **Three.js + React Three Fiber** — Hardware-accelerated 3D rendering
- **@react-three/drei** — Utility components for R3F
- **Framer Motion** — Smooth HTML overlay animations
- **GSAP** — Animation toolkit
- **Zustand** — Lightweight state management (scroll progress, mouse position)
- **Tailwind CSS 4** — Utility-first styling with custom design tokens
- **Vite 8** — Lightning-fast HMR and bundling

---

## 📁 Project Structure

```
src/
├── App.jsx                          # Root: scroll listeners, layout, overlay timing
├── main.jsx                         # Entry point
├── index.css                        # Design system, glass effects, scroll architecture
├── store/
│   └── useViewStore.js              # Zustand store: scroll phase, door/glass progress
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx               # Glassmorphic responsive navigation
│   │   └── ScrollFadeWrapper.jsx    # Scroll-progress opacity controller
│   ├── three/
│   │   ├── ThreeScene.jsx           # Root Canvas with all 3D scenes
│   │   ├── CameraController.jsx     # 13-waypoint cinematic camera path
│   │   ├── AmbientLighting.jsx      # Phase-aware crossfading lighting
│   │   ├── DoorScene.jsx            # Phase A: front door + opening animation
│   │   ├── LivingRoomScene.jsx      # Phase B: living room + drone + glass wipe
│   │   └── SunlitRoomScene.jsx      # Phase C: sunlit room + dust particles
│   └── views/
│       ├── HomeView.jsx             # Hero section with animated typography
│       ├── ServicesView.jsx         # Service cards grid
│       └── BookingView.jsx          # Booking form with validation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/GauravDulal/Aerohawk-services.git
cd Aerohawk-services

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and scroll to experience the journey.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-aero-deep` | `#0A1628` | Primary background |
| `--color-aero-cyan` | `#00D4FF` | Brand accent, interactive elements |
| `--color-aero-violet` | `#7C3AED` | Secondary accent, gradients |
| `--font-heading` | Plus Jakarta Sans | Headlines |
| `--font-body` | Inter | Body text |
| `--font-accent` | Syne | Buttons, labels, UI |

---

## 📄 License

This project is proprietary. All rights reserved by Aerohawk Service.

---

<p align="center">
  <strong>Aerohawk Service</strong> · NSW, Australia · info@aerohawk.com.au
</p>
