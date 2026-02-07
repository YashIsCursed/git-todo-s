"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setLoaded(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Subtle time update for greeting
    const timer = setInterval(() => setTime(new Date()), 60000);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(timer);
    };
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour < 12) return "good morning";
    if (hour < 17) return "good afternoon";
    return "good evening";
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-[var(--organic-cream)]">
      {/* Ambient Background Layers */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large floating shapes */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--organic-sage) 0%, transparent 70%)",
            top: "5%",
            left: "-10%",
            transform: `translate(${mousePos.x * 0.02}px, ${mousePos.y * 0.02}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--organic-sky) 0%, transparent 70%)",
            bottom: "10%",
            right: "-5%",
            transform: `translate(${mousePos.x * -0.015}px, ${mousePos.y * -0.015}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--organic-terracotta) 0%, transparent 70%)",
            bottom: "30%",
            left: "20%",
            transform: `translate(${mousePos.x * 0.01}px, ${mousePos.y * 0.01}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(var(--organic-forest) 1px, transparent 1px),
              linear-gradient(90deg, var(--organic-forest) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Decorative elements */}
      <div className="fixed top-8 left-8 flex items-center gap-3 z-50">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center">
          <span className="text-white text-lg">🌿</span>
        </div>
        <span className="display-font text-lg text-[var(--organic-forest)]">
          GitHub Manager
        </span>
      </div>

      {/* Main Content */}
      <main className="min-h-screen flex flex-col items-center justify-center px-8 relative z-10">
        <div className="max-w-4xl w-full">
          {/* Hero Section */}
          <div className="text-center mb-16">
            {/* Greeting */}
            <div
              className={`grow-in ${loaded ? "visible" : ""}`}
              style={{ transitionDelay: "0.1s" }}
            >
              <span className="handwritten text-2xl text-[var(--organic-terracotta)] tracking-wide">
                {getGreeting()}, developer
              </span>
            </div>

            {/* Title */}
            <div
              className={`grow-in mt-6 mb-8 ${loaded ? "visible" : ""}`}
              style={{ transitionDelay: "0.3s" }}
            >
              <h1 className="display-font text-7xl md:text-9xl leading-[0.9] tracking-tight">
                <span className="text-[var(--organic-forest)] block">
                  Manage.
                </span>
                <span className="text-[var(--organic-sage)] block italic">
                  Organize.
                </span>
                <span className="text-[var(--organic-earth)] block">Ship.</span>
              </h1>
            </div>

            {/* Description */}
            <div
              className={`grow-in mb-12 ${loaded ? "visible" : ""}`}
              style={{ transitionDelay: "0.5s" }}
            >
              <p className="text-xl text-[var(--organic-earth)] leading-relaxed max-w-xl mx-auto">
                The missing layer between your code and your to-do list.
                <span className="text-[var(--organic-forest)] font-medium">
                  {" "}
                  Track tasks directly in your repositories
                </span>
                , anchor them to specific files and lines.
              </p>
            </div>

            {/* CTAs */}
            <div
              className={`grow-in flex flex-wrap gap-4 justify-center ${loaded ? "visible" : ""}`}
              style={{ transitionDelay: "0.7s" }}
            >
              <Link href="/login" className="organic-btn text-lg px-8 py-4">
                Start Managing →
              </Link>
              <Link
                href="https://github.com"
                target="_blank"
                className="organic-btn outline text-lg px-8 py-4"
              >
                View on GitHub
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div
            className={`grow-in grid md:grid-cols-3 gap-4 ${loaded ? "visible" : ""}`}
            style={{ transitionDelay: "0.9s" }}
          >
            {[
              {
                icon: "📍",
                title: "Code Anchoring",
                desc: "Pin tasks to specific files and line ranges in your repository",
              },
              {
                icon: "🏷️",
                title: "Smart Labels",
                desc: "TODO, BUG, FIXME, SECURITY — organize with meaningful types",
              },
              {
                icon: "⚡",
                title: "Instant Sync",
                desc: "Real-time sync with GitHub, no configuration needed",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="organic-card p-6 group hover:scale-[1.02] transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-[var(--organic-sage)]/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[var(--organic-forest)] mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[var(--organic-earth)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div
            className={`grow-in text-center mt-16 ${loaded ? "visible" : ""}`}
            style={{ transitionDelay: "1.1s" }}
          >
            <p className="text-sm text-[var(--organic-sage)]">
              Built with Next.js, Supabase, and GitHub OAuth
            </p>
          </div>
        </div>
      </main>

      {/* Floating decorative leaves */}
      <div
        className="fixed bottom-8 right-8 text-4xl float z-40 opacity-50"
        style={{ animationDelay: "-2s" }}
      >
        🍂
      </div>
      <div
        className="fixed top-32 right-12 text-2xl float z-40 opacity-50"
        style={{ animationDelay: "-4s" }}
      >
        🌿
      </div>
    </div>
  );
}
