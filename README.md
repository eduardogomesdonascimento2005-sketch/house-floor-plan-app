* {
  box-sizing: border-box;
}

:root {
  font-family: Inter, 'Segoe UI', sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color: #123a60;
  background: #edf4ff;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color-scheme: light;
}

html, body, #root {
  min-height: 100%;
  height: 100%;
  margin: 0;
}

body {
  min-height: 100vh;
  background: linear-gradient(135deg, #edf4ff 0%, #dfeeff 100%);
}

button, input {
  font: inherit;
}

button {
  cursor: pointer;
}

.app-shell {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  min-height: 100vh;
}

.sidebar {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-right: 1px solid rgba(18, 58, 96, 0.08);
  padding: 28px 20px;
}

.brand-block {
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #7ba8d9;
}

.eyebrow.dark {
  color: #6a829e;
}

h1, h2, p {
  margin: 0;
}

.brand-block h1 {
  font-size: 2rem;
  line-height: 1.1;
}

.panel {
  background: rgba(255, 255, 255, 0.64);
  border: 1px solid rgba(18, 58, 96, 0.08);
  border-radius: 18px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: 0 12px 28px rgba(17, 68, 120, 0.08);
}

.panel h2 {
  margin-bottom: 14px;
  font-size: 1.1rem;
}

.room-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pill {
  padding: 9px 10px;
  border: none;
  border-radius: 999px;
  background: #e8f1ff;
  color: #123a60;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pill:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(18, 58, 96, 0.12);
}

.room-editor {
  display: grid;
  gap: 12px;
}

.room-editor label,
.panel label {
  display: grid;
  gap: 6px;
  font-size: 0.9rem;
  color: #395b7f;
}

.room-editor input,
.panel input {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(18, 58, 96, 0.14);
  background: rgba(255, 255, 255, 0.8);
  padding: 10px 12px;
  color: #123a60;
}

.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  font-weight: 700;
}

.toggle-row {
  display: flex !important;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.toggle-row input {
  width: 18px;
  height: 18px;
}

.mini-actions {
  display: flex;
  gap: 8px;
  margin: 4px 0 10px;
}

.secondary {
  flex: 1;
  border: none;
  background: #eaf4ff;
  color: #123a60;
  border-radius: 10px;
  padding: 9px 10px;
  font-weight: 600;
}

.danger {
  border: none;
  border-radius: 10px;
  background: #ffe5e5;
  color: #b42318;
  padding: 7px 10px;
}

.stats-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #eff8ff 0%, #f0f6ff 100%);
  color: #123a60;
}

.workspace {
  display: flex;
  flex-direction: column;
  padding: 28px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(18, 58, 96, 0.08);
  border-radius: 20px;
  padding: 18px 20px;
  margin-bottom: 20px;
  box-shadow: 0 12px 28px rgba(17, 68, 120, 0.08);
}

.metrics {
  display: flex;
  align-items: center;
  gap: 18px;
  background: #edf4ff;
  border-radius: 14px;
  padding: 10px 14px;
}

.metrics div {
  min-width: 100px;
}

.metrics span {
  display: block;
  font-size: 0.72rem;
  color: #5777a1;
}

.metrics strong {
  display: block;
  font-size: 1.05rem;
}

.primary {
  border: none;
  border-radius: 12px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #0d6efd 0%, #2563eb 100%);
  color: white;
  font-weight: 700;
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
}

.canvas-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(18, 58, 96, 0.08);
  border-radius: 24px;
  box-shadow: inset 0 2px 10px rgba(18, 58, 96, 0.04);
  min-height: 560px;
  padding: 12px;
}

.canvas {
  width: min(100%, 980px);
  height: 100%;
  min-height: 500px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 18px;
  box-shadow: 0 15px 35px rgba(18, 58, 96, 0.08);
}

@media (max-width: 980px) {
  .app-shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(18, 58, 96, 0.08);
  }

  .toolbar {
    flex-wrap: wrap;
  }
}
