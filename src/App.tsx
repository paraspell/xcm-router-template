import "./App.css";
import XcmTransfer from "./XcmTransfer";

const App = () => (
  <>
    <div className="header">
      <h1>Vite + React + </h1>
      <a
        href="https://paraspell.github.io/docs/router/getting-strtd.html"
        target="_blank"
        className="logo"
      >
        <img src="/spellrouter.png" alt="ParaSpell logo" />
      </a>
    </div>
    <XcmTransfer />
    <p className="read-the-docs">
      Click on the SpellRouter logo to read the docs
    </p>
  </>
);

export default App;
