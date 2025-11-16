import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div
      className="tldraw-transparent"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        background: "transparent",
      }}
    >
      <Tldraw />
    </div>
  );
}

export default LandingPage;
