import { useRef } from "react";
import { AsciiObject } from "./components/AsciiObject";

function TuxSection() {
  const statusRef = useRef(null);
  return (
    <section className="tux-section" aria-label="Interactive ASCII Tux">
      <div className="ascii-stage">
        <AsciiObject
          src="/assets/tux.glb"
          style={{ position: "absolute", inset: 0 }}
          cellSize={10}
          cellAspect={0.6}
          contrast={1.5}
          edgeContrast={3}
          exposure={1}
          environmentIntensity={1}
          roughness={0.15}
          scale={3}
          floatIntensity={2}
          rotationIntensity={1}
          floatSpeed={2}
          fov={65}
          cameraDistance={4.2}
          ascii
          colored
          invert={false}
          autoRotate={false}
          zoom={false}
          color="#ffffff"
          highlight="#066aff"
          onLoad={() => { if (statusRef.current) statusRef.current.textContent = "Drag to rotate"; }}
          onError={(error) => { if (statusRef.current) statusRef.current.textContent = "Could not load tux.glb"; console.error(error); }}
        />
        <p ref={statusRef} className="ascii-status">Loading tux.glb...</p>
      </div>
    </section>
  );
}

function PortfolioContent() {
  return <>
    <section><h2>About</h2><p>I'm a teenage developer who loves working on open source projects and learning new things. I love coding and hacking, as well as robotics and IoT.</p><p>I compete in CTFs with <a href="https://phishersofmen.net">Phishers of Men</a>, focusing on binary exploitation, reverse engineering, blockchain, and web. I mostly use Python, C, C++, Go, or Rust, with Linux as my OS.</p></section>
    <section><h2>Projects</h2><ul className="projects">
      <li><a href="https://github.com/GeckoOS/GeckoOS" target="_blank" rel="noreferrer">GeckoOS <span className="lang">C</span></a><p>An operating system built from scratch with a community of contributors.</p></li>
      <li><a href="https://github.com/Ember2819/BumbleBee" target="_blank" rel="noreferrer">BumbleBee <span className="lang">Python</span></a><p>Network utility for knocking devices off of a network.</p></li>
      <li><a href="https://github.com/Ember2819/ollama-scout" target="_blank" rel="noreferrer">ollama-scout <span className="lang">HTML</span></a><p>Finds and tests publicly exposed Ollama endpoints running without authentication.</p></li>
      <li><a href="https://github.com/Ember2819/Discord2Matrix" target="_blank" rel="noreferrer">Discord2Matrix <span className="lang">Python</span></a><p>Mirrors a Discord server and a Matrix.org room in real time.</p></li>
    </ul></section>
    <section><h2>Contributed to</h2><ul className="projects"><li><a href="https://github.com/sazardev/shiki" target="_blank" rel="noreferrer">shiki <span className="lang">Rust</span></a><p>A TUI note taking app.</p></li></ul></section>
    <section><h2>Links</h2><ul className="links"><li><a href="https://tierhive.com/r/A211AF23F791" target="_blank" rel="noreferrer">VPS</a></li></ul><a className="donate-button" href="https://app.paymento.io/payment-link/203f4e90381448a4a1f1deb86e2c03d8" target="_blank" rel="noreferrer">Donate</a></section>
    <section><h2>Contact</h2><p>Looking for a developer for your project? Send me a message.</p><ul className="links"><li><a href="mailto:olenthompson2819@gmail.com">Email</a></li><li><a href="https://github.com/Ember2819" target="_blank" rel="noreferrer">GitHub</a></li><li><a href="https://x.com/Ember2819" target="_blank" rel="noreferrer">X</a></li></ul></section>
  </>;
}

export default function App() {
  return <main><header><h1>Olen&nbsp;Thompson</h1><p className="role">Developer · Security Researcher</p></header><PortfolioContent /><TuxSection /></main>;
}
