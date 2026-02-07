"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";

interface SettingsContentProps {
  user: any;
  userMeta: any;
}

// Task types for default selection
const TASK_TYPES = [
  { value: "TODO", label: "TODO", emoji: "📋" },
  { value: "FIXME", label: "FIXME", emoji: "🔧" },
  { value: "BUG", label: "BUG", emoji: "🐛" },
  { value: "ALERT", label: "ALERT", emoji: "⚠️" },
  { value: "HACK", label: "HACK", emoji: "💡" },
  { value: "NOTE", label: "NOTE", emoji: "📝" },
  { value: "OPTIMIZE", label: "OPTIMIZE", emoji: "⚡" },
  { value: "SECURITY", label: "SECURITY", emoji: "🔒" },
  { value: "DEPRECATED", label: "DEPRECATED", emoji: "🗑️" },
  { value: "REVIEW", label: "REVIEW", emoji: "👀" },
];

const PRIORITIES = [
  { value: "low", label: "Low", emoji: "🌱" },
  { value: "medium", label: "Medium", emoji: "🌿" },
  { value: "high", label: "High", emoji: "🔥" },
  { value: "critical", label: "Critical", emoji: "🚨" },
];

const THEMES = [
  {
    value: "light",
    label: "Light Garden",
    emoji: "☀️",
    desc: "Warm, organic tones",
  },
  {
    value: "dark",
    label: "Midnight Aurora",
    emoji: "🌌",
    desc: "Deep green with glow",
  },
  { value: "auto", label: "System", emoji: "💻", desc: "Match your device" },
];

const CODE_FONTS = [
  { value: "jetbrains-mono", label: "JetBrains Mono" },
  { value: "fira-code", label: "Fira Code" },
  { value: "source-code-pro", label: "Source Code Pro" },
  { value: "cascadia-code", label: "Cascadia Code" },
];

const SIDEBAR_POSITIONS = [
  { value: "left", label: "Left (Fixed)", emoji: "⬅️" },
  { value: "collapsible", label: "Collapsible", emoji: "↔️" },
];

// Default settings
const DEFAULT_SETTINGS = {
  theme: "light",
  codeFont: "jetbrains-mono",
  codeFontSize: 14,
  defaultTaskType: "TODO",
  defaultPriority: "medium",
  notifications: true,
  emailDigest: false,
  compactMode: false,
  showLineNumbers: true,
  syntaxHighlighting: true,
  sidebarPosition: "left",
};

export function SettingsContent({ user, userMeta }: SettingsContentProps) {
  // Settings state with defaults
  const [theme, setTheme] = useState(DEFAULT_SETTINGS.theme);
  const [codeFont, setCodeFont] = useState(DEFAULT_SETTINGS.codeFont);
  const [codeFontSize, setCodeFontSize] = useState(
    DEFAULT_SETTINGS.codeFontSize,
  );
  const [defaultTaskType, setDefaultTaskType] = useState(
    DEFAULT_SETTINGS.defaultTaskType,
  );
  const [defaultPriority, setDefaultPriority] = useState(
    DEFAULT_SETTINGS.defaultPriority,
  );
  const [notifications, setNotifications] = useState(
    DEFAULT_SETTINGS.notifications,
  );
  const [emailDigest, setEmailDigest] = useState(DEFAULT_SETTINGS.emailDigest);
  const [compactMode, setCompactMode] = useState(DEFAULT_SETTINGS.compactMode);
  const [showLineNumbers, setShowLineNumbers] = useState(
    DEFAULT_SETTINGS.showLineNumbers,
  );
  const [syntaxHighlighting, setSyntaxHighlighting] = useState(
    DEFAULT_SETTINGS.syntaxHighlighting,
  );
  const [sidebarPosition, setSidebarPosition] = useState(
    DEFAULT_SETTINGS.sidebarPosition,
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("selfManagerSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setTheme(parsed.theme || DEFAULT_SETTINGS.theme);
        setCodeFont(parsed.codeFont || DEFAULT_SETTINGS.codeFont);
        setCodeFontSize(parsed.codeFontSize || DEFAULT_SETTINGS.codeFontSize);
        setDefaultTaskType(
          parsed.defaultTaskType || DEFAULT_SETTINGS.defaultTaskType,
        );
        setDefaultPriority(
          parsed.defaultPriority || DEFAULT_SETTINGS.defaultPriority,
        );
        setNotifications(
          parsed.notifications ?? DEFAULT_SETTINGS.notifications,
        );
        setEmailDigest(parsed.emailDigest ?? DEFAULT_SETTINGS.emailDigest);
        setCompactMode(parsed.compactMode ?? DEFAULT_SETTINGS.compactMode);
        setShowLineNumbers(
          parsed.showLineNumbers ?? DEFAULT_SETTINGS.showLineNumbers,
        );
        setSyntaxHighlighting(
          parsed.syntaxHighlighting ?? DEFAULT_SETTINGS.syntaxHighlighting,
        );
        setSidebarPosition(
          parsed.sidebarPosition || DEFAULT_SETTINGS.sidebarPosition,
        );
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (!isLoaded) return;

    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // Auto - check system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme, isLoaded]);

  const handleSaveSettings = () => {
    const settings = {
      theme,
      codeFont,
      codeFontSize,
      defaultTaskType,
      defaultPriority,
      notifications,
      emailDigest,
      compactMode,
      showLineNumbers,
      syntaxHighlighting,
      sidebarPosition,
    };

    localStorage.setItem("selfManagerSettings", JSON.stringify(settings));
    toast.success("Settings saved! 🌸");

    // Apply theme immediately
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
    }
  };

  const handleResetSettings = () => {
    setTheme(DEFAULT_SETTINGS.theme);
    setCodeFont(DEFAULT_SETTINGS.codeFont);
    setCodeFontSize(DEFAULT_SETTINGS.codeFontSize);
    setDefaultTaskType(DEFAULT_SETTINGS.defaultTaskType);
    setDefaultPriority(DEFAULT_SETTINGS.defaultPriority);
    setNotifications(DEFAULT_SETTINGS.notifications);
    setEmailDigest(DEFAULT_SETTINGS.emailDigest);
    setCompactMode(DEFAULT_SETTINGS.compactMode);
    setShowLineNumbers(DEFAULT_SETTINGS.showLineNumbers);
    setSyntaxHighlighting(DEFAULT_SETTINGS.syntaxHighlighting);
    setSidebarPosition(DEFAULT_SETTINGS.sidebarPosition);
    localStorage.removeItem("selfManagerSettings");
    toast.info("Settings reset to defaults");
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-[var(--organic-sage)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <section className="organic-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">👤</span>
          <h2 className="display-font text-xl text-[var(--organic-forest)]">
            Profile
          </h2>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <img
              src={userMeta?.avatar_url || "/placeholder-avatar.png"}
              alt="Profile"
              className="w-20 h-20 rounded-full border-4 border-[var(--organic-sage)]/30 object-cover"
            />
            <span className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-2 border-white rounded-full flex items-center justify-center text-[10px]">
              ✓
            </span>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-lg text-[var(--organic-forest)]">
              {userMeta?.full_name || userMeta?.name || "Gardener"}
            </h3>
            <p className="text-sm text-[var(--organic-earth)]">{user.email}</p>
            <p className="text-xs text-[var(--organic-sage)] mt-1 flex items-center gap-1">
              <span>🌿</span>
              Connected via GitHub: @
              {userMeta?.user_name || userMeta?.preferred_username || "unknown"}
            </p>
          </div>

          <Link
            href="/logout"
            className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors border border-red-200"
          >
            Sign Out
          </Link>
        </div>
      </section>

      {/* Appearance Section */}
      <section className="organic-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🎨</span>
          <h2 className="display-font text-xl text-[var(--organic-forest)]">
            Appearance
          </h2>
        </div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--organic-forest)] mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    theme === t.value
                      ? "border-[var(--organic-forest)] bg-[var(--organic-sage)]/20 ring-2 ring-[var(--organic-forest)]/20"
                      : "border-[var(--organic-sage)]/20 hover:border-[var(--organic-sage)]/50"
                  }`}
                >
                  <span className="text-2xl mb-2 block">{t.emoji}</span>
                  <span className="font-medium text-sm text-[var(--organic-forest)] block">
                    {t.label}
                  </span>
                  <span className="text-xs text-[var(--organic-earth)]">
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sidebar Position */}
          <div>
            <label className="block text-sm font-medium text-[var(--organic-forest)] mb-3">
              Sidebar Position
            </label>
            <div className="grid grid-cols-2 gap-3">
              {SIDEBAR_POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setSidebarPosition(pos.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    sidebarPosition === pos.value
                      ? "border-[var(--organic-forest)] bg-[var(--organic-sage)]/20 ring-2 ring-[var(--organic-forest)]/20"
                      : "border-[var(--organic-sage)]/20 hover:border-[var(--organic-sage)]/50"
                  }`}
                >
                  <span className="text-xl mb-1 block">{pos.emoji}</span>
                  <span className="font-medium text-sm text-[var(--organic-forest)]">
                    {pos.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Compact Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-[var(--organic-forest)]">
                Compact Mode
              </label>
              <p className="text-sm text-[var(--organic-earth)]">
                Reduce spacing for more content
              </p>
            </div>
            <button
              onClick={() => setCompactMode(!compactMode)}
              className={`w-14 h-7 rounded-full relative transition-all ${
                compactMode
                  ? "bg-[var(--organic-forest)]"
                  : "bg-[var(--organic-sage)]/30"
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all shadow-sm ${
                  compactMode ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Code Editor Section */}
      <section className="organic-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">💻</span>
          <h2 className="display-font text-xl text-[var(--organic-forest)]">
            Code Editor
          </h2>
        </div>

        <div className="space-y-6">
          {/* Code Font Selection */}
          <div>
            <label className="block text-sm font-medium text-[var(--organic-forest)] mb-2">
              Code Font
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CODE_FONTS.map((font) => (
                <button
                  key={font.value}
                  onClick={() => setCodeFont(font.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-left code-font text-sm ${
                    codeFont === font.value
                      ? "border-[var(--organic-forest)] bg-[var(--organic-sage)]/20"
                      : "border-[var(--organic-sage)]/20 hover:border-[var(--organic-sage)]/50"
                  }`}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size Slider */}
          <div>
            <label className="block text-sm font-medium text-[var(--organic-forest)] mb-2">
              Font Size:{" "}
              <span className="text-[var(--organic-terracotta)]">
                {codeFontSize}px
              </span>
            </label>
            <input
              type="range"
              min="10"
              max="20"
              value={codeFontSize}
              onChange={(e) => setCodeFontSize(Number(e.target.value))}
              className="w-full h-2 bg-[var(--organic-sage)]/20 rounded-lg appearance-none cursor-pointer accent-[var(--organic-forest)]"
            />
            <div className="flex justify-between text-xs text-[var(--organic-sage)] mt-1">
              <span>10px</span>
              <span>20px</span>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-slate-900 rounded-xl p-4 overflow-hidden">
            <div className="text-xs text-slate-500 mb-2">Preview</div>
            <pre
              className="code-font text-green-400"
              style={{ fontSize: `${codeFontSize}px` }}
            >
              {`function greetGardener(name) {
  console.log(\`Hello, \${name}! 🌱\`);
  return { status: "blooming" };
}`}
            </pre>
          </div>

          {/* Line Numbers Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-[var(--organic-forest)]">
                Show Line Numbers
              </label>
              <p className="text-sm text-[var(--organic-earth)]">
                Display line numbers in code viewer
              </p>
            </div>
            <button
              onClick={() => setShowLineNumbers(!showLineNumbers)}
              className={`w-14 h-7 rounded-full relative transition-all ${
                showLineNumbers
                  ? "bg-[var(--organic-forest)]"
                  : "bg-[var(--organic-sage)]/30"
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all shadow-sm ${
                  showLineNumbers ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Syntax Highlighting Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium text-[var(--organic-forest)]">
                Syntax Highlighting
              </label>
              <p className="text-sm text-[var(--organic-earth)]">
                Colorize code based on language
              </p>
            </div>
            <button
              onClick={() => setSyntaxHighlighting(!syntaxHighlighting)}
              className={`w-14 h-7 rounded-full relative transition-all ${
                syntaxHighlighting
                  ? "bg-[var(--organic-forest)]"
                  : "bg-[var(--organic-sage)]/30"
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all shadow-sm ${
                  syntaxHighlighting ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Default Task Settings Section */}
      <section className="organic-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">📋</span>
          <h2 className="display-font text-xl text-[var(--organic-forest)]">
            Task Defaults
          </h2>
        </div>

        <div className="space-y-6">
          {/* Default Task Type */}
          <div>
            <label className="block text-sm font-medium text-[var(--organic-forest)] mb-3">
              Default Task Type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TASK_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setDefaultTaskType(type.value)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    defaultTaskType === type.value
                      ? "border-[var(--organic-forest)] bg-[var(--organic-sage)]/20 ring-2 ring-[var(--organic-forest)]/20"
                      : "border-[var(--organic-sage)]/20 hover:border-[var(--organic-sage)]/50"
                  }`}
                >
                  <span className="text-lg">{type.emoji}</span>
                  <span className="text-[10px] font-medium text-[var(--organic-forest)]">
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Default Priority */}
          <div>
            <label className="block text-sm font-medium text-[var(--organic-forest)] mb-3">
              Default Priority
            </label>
            <div className="grid grid-cols-4 gap-3">
              {PRIORITIES.map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => setDefaultPriority(priority.value)}
                  className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                    defaultPriority === priority.value
                      ? "border-[var(--organic-forest)] bg-[var(--organic-sage)]/20 ring-2 ring-[var(--organic-forest)]/20"
                      : "border-[var(--organic-sage)]/20 hover:border-[var(--organic-sage)]/50"
                  }`}
                >
                  <span className="text-lg">{priority.emoji}</span>
                  <span className="text-xs font-medium text-[var(--organic-forest)]">
                    {priority.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="organic-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🔔</span>
          <h2 className="display-font text-xl text-[var(--organic-forest)]">
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          {/* In-App Notifications Toggle */}
          <div className="flex items-center justify-between py-3 border-b border-[var(--organic-sage)]/10">
            <div>
              <label className="font-medium text-[var(--organic-forest)]">
                In-App Notifications
              </label>
              <p className="text-sm text-[var(--organic-earth)]">
                Show toast messages for actions
              </p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`w-14 h-7 rounded-full relative transition-all ${
                notifications
                  ? "bg-[var(--organic-forest)]"
                  : "bg-[var(--organic-sage)]/30"
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all shadow-sm ${
                  notifications ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>

          {/* Email Digest Toggle */}
          <div className="flex items-center justify-between py-3">
            <div>
              <label className="font-medium text-[var(--organic-forest)]">
                Weekly Email Digest
              </label>
              <p className="text-sm text-[var(--organic-earth)]">
                Receive a summary of your tasks
              </p>
            </div>
            <button
              onClick={() => setEmailDigest(!emailDigest)}
              className={`w-14 h-7 rounded-full relative transition-all ${
                emailDigest
                  ? "bg-[var(--organic-forest)]"
                  : "bg-[var(--organic-sage)]/30"
              }`}
            >
              <span
                className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-all shadow-sm ${
                  emailDigest ? "left-8" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="organic-card p-6 border-2 border-red-200/50">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">⚠️</span>
          <h2 className="display-font text-xl text-red-600">Danger Zone</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
            <div>
              <label className="font-medium text-red-700">
                Delete All Tasks
              </label>
              <p className="text-sm text-red-600">
                This will permanently delete all your tasks
              </p>
            </div>
            <button
              onClick={() =>
                toast.error(
                  "This would delete all tasks! (disabled for safety)",
                )
              }
              className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            >
              Delete All
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
            <div>
              <label className="font-medium text-red-700">Delete Account</label>
              <p className="text-sm text-red-600">
                Permanently delete your account and all data
              </p>
            </div>
            <button
              onClick={() =>
                toast.error(
                  "This would delete your account! (disabled for safety)",
                )
              }
              className="px-4 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent py-6 -mx-6 px-6">
        <button
          onClick={handleResetSettings}
          className="px-6 py-3 text-sm font-medium text-[var(--organic-earth)] bg-transparent hover:bg-[var(--organic-sage)]/10 rounded-full transition-colors"
        >
          Reset to Defaults
        </button>
        <button onClick={handleSaveSettings} className="organic-btn">
          Save Changes 🌸
        </button>
      </div>
    </div>
  );
}
