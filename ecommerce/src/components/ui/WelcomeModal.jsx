import React, { useEffect, useRef, useState } from "react";
import "./WelcomeModal.css";
import { RiShoppingBag4Line } from "react-icons/ri";

// ── Full-screen confetti canvas ───────────────────────────────────────────────
function FullScreenConfetti({ running }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!running) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set canvas to fill the viewport
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const onResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const COLORS = [
      "#ff4757",
      "#ffa502",
      "#2ed573",
      "#1e90ff",
      "#ff6b81",
      "#eccc68",
      "#a29bfe",
      "#fd79a8",
      "#00cec9",
      "#fdcb6e",
      "#ff7f50",
      "#7bed9f",
      "#70a1ff",
      "#ff6348",
      "#5352ed",
      "#ff4500",
    ];
    const SHAPES = ["rect", "circle", "ribbon"];

    const makePiece = (stagger = 0) => ({
      x: Math.random() * window.innerWidth,
      y: -(20 + stagger * 3 + Math.random() * 120),
      w: 8 + Math.random() * 10,
      h: 4 + Math.random() * 6,
      r: 4 + Math.random() * 5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      vx: (Math.random() - 0.5) * 4,
      vy: 3 + Math.random() * 4,
      swing: 0.04 + Math.random() * 0.08,
      swingBase: Math.random() * Math.PI * 2,
      opacity: 1,
      age: 0,
    });

    const pieces = Array.from({ length: 200 }, (_, i) => makePiece(i));

    let raf;
    let alive = true;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of pieces) {
        p.age++;
        p.x += p.vx + Math.sin(p.age * p.swing + p.swingBase) * 1.2;
        p.y += p.vy;
        p.rot += p.rotSpeed;

        // Start fading in bottom 35% of screen
        if (p.y > canvas.height * 0.65) {
          p.opacity = Math.max(0, p.opacity - 0.02);
        }

        // Recycle piece once gone
        if (p.opacity <= 0 || p.y > canvas.height + 20) {
          Object.assign(p, makePiece());
          p.y = -20;
          p.opacity = 1;
          p.age = 0;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;

        switch (p.shape) {
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.fill();
            break;
          case "ribbon":
            ctx.fillRect(-p.w * 1.6, -p.h * 0.35, p.w * 3.2, p.h * 0.7);
            break;
          default: // rect
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }

        ctx.restore();
      }

      if (alive) raf = requestAnimationFrame(draw);
    };

    // Kick off immediately
    raf = requestAnimationFrame(draw);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [running]);

  return (
    <canvas
      ref={canvasRef}
      className="wm-confetti-fullscreen"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

// ── WelcomeModal ──────────────────────────────────────────────────────────────
export default function WelcomeModal() {
  const [visible, setVisible] = useState(false);
  const [userName, setUserName] = useState("");
  const [animate, setAnimate] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false);

  useEffect(() => {
    const showWelcome = localStorage.getItem("showWelcome");
    if (showWelcome === "true") {
      const raw = localStorage.getItem("user");
      let name = "Member";
      if (raw) {
        try {
          const u = JSON.parse(raw);
          name =
            u.name ||
            u.firstName ||
            u.username ||
            u.email?.split("@")[0] ||
            "Member";
        } catch (_) {}
      }
      setUserName(name);
      localStorage.removeItem("showWelcome");

      // Show confetti first, then slide card in
      setConfettiOn(true);
      setVisible(true);
      setTimeout(() => setAnimate(true), 40);
    }
  }, []);

  const close = () => {
    setAnimate(false);
    setConfettiOn(false);
    setTimeout(() => setVisible(false), 320);
  };

  if (!visible) return null;

  return (
    <>
      {/* Full-screen confetti layer */}
      <FullScreenConfetti running={confettiOn} />

      {/* Modal overlay — click backdrop to close */}
      <div
        className={`wm-overlay ${animate ? "wm-overlay--in" : ""}`}
        onClick={close}
      >
        <div
          className={`wm-card ${animate ? "wm-card--in" : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Party icon with bounce animation */}
          <div className="wm-emoji">🎉</div>

          <div className="wm-body">
            <h2 className="wm-title">
              Welcome! <span className="wm-name">{userName}</span>
            </h2>
            <p className="wm-member">
              You are a member of <strong>shop.com</strong>
            </p>

            {/* Static discount badge — no pulse */}
            <div className="wm-badge">
              <span className="wm-badge-percent">20%</span>
              <div className="wm-badge-right">
                <span className="wm-badge-label">DISCOUNT</span>
                <span className="wm-badge-text">
                  On your any first time buy!
                </span>
              </div>
            </div>
          </div>

          <button className="wm-cta" onClick={close}>
            Start Shopping <RiShoppingBag4Line />
          </button>
        </div>
      </div>
    </>
  );
}
