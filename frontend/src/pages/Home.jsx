import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useRef, useState } from 'react';

// ── Animated counter hook ─────────────────────────────────────────────────
const useCounter = (target, duration = 1800, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const isFloat = String(target).includes('.');
    const num = parseFloat(target);
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const prog = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      setCount(isFloat ? (eased * num).toFixed(1) : Math.floor(eased * num));
      if (prog < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
};

// ── Particle canvas ───────────────────────────────────────────────────────
const Particles = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.15,
      color: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#059669'][Math.floor(Math.random() * 5)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });
      // draw connector lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = '#10b981';
            ctx.globalAlpha = (1 - dist / 100) * 0.12;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

// ── Scroll reveal hook ────────────────────────────────────────────────────
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

// ── Typewriter ────────────────────────────────────────────────────────────
const Typewriter = ({ words, speed = 90, pause = 1800 }) => {
  const [text, setText] = useState('');
  const [wi, setWi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wi % words.length];
    let timeout;
    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && text === '') {
      timeout = setTimeout(() => { setDeleting(false); setWi(w => (w + 1) % words.length); }, 300);
    } else {
      timeout = setTimeout(() => {
        setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
      }, deleting ? speed / 2 : speed);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, wi, words, speed, pause]);
  return (
    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
      {text}<span className="animate-pulse text-emerald-400">|</span>
    </span>
  );
};

// ── Floating badge ────────────────────────────────────────────────────────
const FloatingBadge = ({ icon, label, style }) => (
  <div
    className="absolute bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-white/50 px-4 py-3 flex items-center gap-2.5 text-sm font-black text-black"
    style={{ animation: 'float 3s ease-in-out infinite', ...style }}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-[#050e0a]">{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────
const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [statsRef, statsVisible] = useReveal();
  const [featuresRef, featuresVisible] = useReveal();
  const [rolesRef, rolesVisible] = useReveal();

  const c1 = useCounter('90', 1600, statsVisible);
  const c2 = useCounter('5', 1200, statsVisible);
  const c3 = useCounter('3', 1000, statsVisible);
  const c4 = useCounter('24', 1400, statsVisible);

  const roles = [
    {
      role: 'farmer',
      emoji: '👨‍🌾',
      title: 'Farmer',
      description: 'Detect crop diseases, manage your crops, check live market prices and get expert advice from local agronomists.',
      gradient: 'from-emerald-500 via-green-500 to-teal-600',
      glow: 'hover:shadow-emerald-300/60',
      badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      link: '/register',
      features: ['Disease Detection', 'Crop Management', 'Market Prices'],
    },
    {
      role: 'agronomist',
      emoji: '🔬',
      title: 'Agronomist',
      description: 'Help farmers with expert guidance, view their crops, and provide professional agricultural consultations.',
      gradient: 'from-cyan-500 via-teal-500 to-blue-600',
      glow: 'hover:shadow-cyan-300/60',
      badge: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      link: '/register',
      features: ['Farmer Connect', 'Crop Analysis', 'District View'],
    },
    {
      role: 'admin',
      emoji: '🛡️',
      title: 'Admin',
      description: 'Manage the platform, verify agronomist accounts, and oversee all system operations from a control panel.',
      gradient: 'from-slate-600 via-gray-700 to-slate-800',
      glow: 'hover:shadow-gray-400/50',
      badge: 'bg-gray-100 text-gray-700 border-gray-200',
      link: '/login',
      features: ['User Management', 'Verification', 'Analytics'],
    },
  ];

  const features = [
    { icon: '🔍', title: 'AI Disease Detection', desc: 'Upload a photo — YOLO AI identifies crop diseases with 90%+ accuracy in seconds.', from: 'from-orange-400', to: 'to-red-500', delay: 0 },
    { icon: '🌾', title: 'Crop Management', desc: 'Get a complete sowing-to-harvest AI-generated guide tailored to your crop and area.', from: 'from-emerald-400', to: 'to-green-600', delay: 80 },
    { icon: '☁️', title: 'Weather Forecast', desc: '7-day AI-powered forecast with crop-specific impact analysis for your farm.', from: 'from-blue-400', to: 'to-cyan-600', delay: 160 },
    { icon: '📊', title: 'Market Prices', desc: 'Live mandi prices for your city and major markets across India — updated in real time.', from: 'from-violet-400', to: 'to-purple-600', delay: 240 },
    { icon: '👨‍🔬', title: 'Expert Connect', desc: 'Find verified agronomists in your district for personalised farm advice instantly.', from: 'from-teal-400', to: 'to-cyan-600', delay: 320 },
    { icon: '🤖', title: 'AI Chatbot', desc: 'Page-aware farming AI that answers any question — in your language, 24/7.', from: 'from-pink-400', to: 'to-rose-600', delay: 400 },
  ];

  return (
    <div className={`home-root min-h-screen overflow-x-hidden ${isDark ? 'bg-[#0a0f1e]' : 'bg-gradient-to-br from-[#f0f4ff] via-[#ede9fe] to-[#e0f2fe]'}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Inter', sans-serif; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes float2 { 0%,100%{transform:translateY(-6px)} 50%{transform:translateY(6px)} }
        @keyframes revealUp { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes revealLeft { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes revealRight { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }
        @keyframes glow { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
        @keyframes spin-slow { to{transform:rotate(360deg)} }
        @keyframes gradient-shift {
          0%{background-position:0% 50%}
          50%{background-position:100% 50%}
          100%{background-position:0% 50%}
        }
        .reveal { opacity:0; }
        .reveal.visible { animation: revealUp 0.65s ease forwards; }
        .reveal-l { opacity:0; }
        .reveal-l.visible { animation: revealLeft 0.6s ease forwards; }
        .reveal-r { opacity:0; }
        .reveal-r.visible { animation: revealRight 0.6s ease forwards; }
        .card-3d { transition: transform 0.3s ease, box-shadow 0.3s ease; transform-style: preserve-3d; }
        .card-3d:hover { transform: translateY(-10px) rotateX(3deg); }
        .animated-gradient {
          background: linear-gradient(270deg, #10b981, #06b6d4, #8b5cf6, #10b981);
          background-size: 400% 400%;
          animation: gradient-shift 6s ease infinite;
        }
        .glass { background: rgba(255,255,255,0.04); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.08); }
        .feature-card { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .feature-card:hover { transform: translateY(-8px) scale(1.02); }
        .orbit { animation: spin-slow 20s linear infinite; }
        .glow-ring { animation: glow 3s ease-in-out infinite; }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Particle background */}
        <div className="absolute inset-0">
          <Particles />
        </div>

        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] glow-ring" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-teal-500/15 rounded-full blur-[100px] glow-ring" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px]" />

        {/* Floating badges */}
        <div className="absolute inset-0 hidden lg:block pointer-events-none">
          <FloatingBadge icon="🌾" label="90%+ Accuracy" style={{ top: '18%', left: '6%', animationDuration: '3.2s' }} />
          <FloatingBadge icon="☁️" label="Live Weather" style={{ top: '35%', right: '7%', animationDuration: '2.8s', animationDelay: '0.5s' }} />
          <FloatingBadge icon="📊" label="Market Prices" style={{ bottom: '30%', left: '5%', animationDuration: '3.5s', animationDelay: '1s' }} />
          <FloatingBadge icon="🔬" label="AI Detection" style={{ bottom: '22%', right: '6%', animationDuration: '3s', animationDelay: '0.8s' }} />
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/8 glass border border-emerald-500/30 text-emerald-400 px-5 py-2.5 rounded-full text-sm font-semibold mb-8 mx-auto"
            style={{ animation: 'revealUp 0.5s ease both' }}>
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            India's AI-Powered Agricultural Platform
          </div>

          {/* Main heading */}
          <div style={{ animation: 'revealUp 0.6s 0.1s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            <div className="text-7xl sm:text-8xl md:text-9xl mb-4 select-none" style={{ animation: 'float 4s ease-in-out infinite' }}>
              🌾
            </div>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-white leading-tight mb-4">
              Krishi{' '}
              <span style={{
                background: 'linear-gradient(270deg,#10b981,#06b6d4,#8b5cf6,#10b981)',
                backgroundSize: '400% 400%',
                animation: 'gradient-shift 6s ease infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
              }}>
                Kavach
              </span>
            </h1>
            <p className="text-xl sm:text-2xl font-bold text-gray-300 mb-2">
              Crop Shield — Protecting Every Farmer
            </p>
          </div>

          {/* Typewriter */}
          <div
            className="flex flex-wrap justify-center items-center gap-x-2 text-lg sm:text-xl text-gray-400 mb-10"
            style={{ animation: 'revealUp 0.6s 0.25s ease both', opacity: 0, animationFillMode: 'forwards', minHeight: '2rem' }}
          >
            <span className="whitespace-nowrap">Helping farmers with</span>
            <span className="whitespace-nowrap font-semibold">
              <Typewriter words={[
                'AI Disease Detection',
                'Live Market Prices',
                'Weather Forecasts',
                'Expert Agronomists',
                'Crop Management',
              ]} />
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center" style={{ animation: 'revealUp 0.6s 0.4s ease both', opacity: 0, animationFillMode: 'forwards' }}>
            {!isAuthenticated ? (
              <>
                <Link to="/register"
                  className="group relative overflow-hidden inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-base rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-400/60 transition-all duration-300 hover:-translate-y-1">
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-3">
                    👨‍🌾 Register as Farmer
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </span>
                </Link>
                <Link to="/login"
                  className="inline-flex items-center gap-3 px-8 py-4 glass text-white font-bold text-base rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 border border-white/20">
                  Sign In →
                </Link>
              </>
            ) : (
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'farmer' ? '/farmer' : '/agronomist'}
                className="inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-lg rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-400/60 transition-all duration-300 hover:-translate-y-1">
                Go to Dashboard →
              </Link>
            )}
          </div>

          {/* Scroll indicator */}
          <div className="mt-16 flex flex-col items-center gap-2 opacity-40" style={{ animation: 'float2 2s ease-in-out infinite' }}>
            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Scroll to explore</span>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 relative overflow-hidden" style={isDark ? {} : { background: 'transparent' }}>
        {isDark && <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-emerald-950/30 to-[#0a0f1e]" />}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-2 lg:grid-cols-4 gap-6 ${statsVisible ? 'visible' : ''}`}>
            {[
              { num: c1, suffix: '%+', label: 'Disease Detection Accuracy', icon: '🎯', color: isDark ? 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30' : 'from-emerald-50 to-teal-50 border-emerald-200' },
              { num: c2, suffix: '', label: 'AI-Powered Features', icon: '🤖', color: isDark ? 'from-violet-500/20 to-purple-500/10 border-violet-500/30' : 'from-violet-50 to-purple-50 border-violet-200' },
              { num: c3, suffix: '', label: 'Languages Supported', icon: '🌐', color: isDark ? 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30' : 'from-cyan-50 to-blue-50 border-cyan-200' },
              { num: c4, suffix: '/7', label: 'Hours AI Available', icon: '⚡', color: isDark ? 'from-amber-500/20 to-orange-500/10 border-amber-500/30' : 'from-amber-50 to-orange-50 border-amber-200' },
            ].map((s, i) => (
              <div key={i}
                className={`glass rounded-3xl p-6 text-center bg-gradient-to-br ${s.color} transition-all duration-300 reveal ${statsVisible ? 'visible' : ''}`}
                style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className={`text-4xl font-black mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {s.num}{s.suffix}
                </p>
                <p className={`text-xs font-semibold leading-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <section className="py-24 relative" ref={featuresRef}>
        {isDark && <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] to-[#060a14]" />}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className={`text-center mb-16 reveal ${featuresVisible ? 'visible' : ''}`} style={isDark ? {} : { position: 'relative', zIndex: 1 }}>
            <span className="inline-block text-emerald-400 text-sm font-bold uppercase tracking-[0.2em] mb-4 px-4 py-2 glass rounded-full border border-emerald-500/30">
              ✦ Platform Features
            </span>
            <h2 className={`text-4xl sm:text-5xl font-black mt-4 mb-4 ${isDark ? 'text-white' : 'text-[#1e1b4b]'}`}>
              Everything a Farmer<br />
              <span style={{
                background: 'linear-gradient(90deg, #34d399, #2dd4bf)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
              }}>
                Could Ever Need
              </span>
            </h2>
            <p className={`text-lg max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Powerful AI tools designed specifically for Indian agriculture
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i}
                className={`feature-card glass rounded-3xl p-6 group cursor-default reveal ${featuresVisible ? 'visible' : ''} ${isDark ? '' : 'bg-white/40 border-gray-200 shadow-sm'}`}
                style={{ animationDelay: `${f.delay}ms` }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.from} ${f.to} flex items-center justify-center text-3xl mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className={`text-lg font-extrabold mb-2 ${isDark ? 'text-white' : 'text-[#1e1b4b]'}`}>{f.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{f.desc}</p>
                <div className={`mt-4 h-0.5 w-0 bg-gradient-to-r ${f.from} ${f.to} rounded-full group-hover:w-full transition-all duration-500`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        {isDark && <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-[#060a14] to-teal-950/20" />}
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className={`inline-block text-sm font-bold uppercase tracking-[0.2em] mb-4 px-4 py-2 glass rounded-full border ${isDark ? 'text-teal-400 border-teal-500/30' : 'text-teal-600 border-teal-400/40'}`}>
              ✦ How It Works
            </span>
            <h2 className={`text-4xl sm:text-5xl font-black mt-4 ${isDark ? 'text-white' : 'text-[#1e1b4b]'}`}>
              Get Started in{' '}
              <span style={{
                background: 'linear-gradient(90deg, #2dd4bf, #22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
              }}>3 Steps</span>
            </h2>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[16.5%] right-[16.5%] h-0.5 bg-gradient-to-r from-emerald-500/0 via-emerald-500/40 to-emerald-500/0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: '01', icon: '📝', title: 'Register', desc: 'Create your free account as a Farmer, Agronomist, or Admin. Set your location for personalised results.', color: 'from-emerald-400 to-teal-500' },
                { step: '02', icon: '📸', title: 'Detect & Explore', desc: 'Upload crop photos for AI disease detection, browse market prices, and check weather forecasts.', color: 'from-teal-400 to-cyan-500' },
                { step: '03', icon: '💡', title: 'Get Expert Help', desc: 'Connect with verified agronomists in your district and ask our AI chatbot anything, anytime.', color: 'from-cyan-400 to-blue-500' },
              ].map((s, i) => (
                <div key={i} className="relative text-center group">
                  {/* Step circle */}
                  <div className={`relative w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-4xl shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                    {s.icon}
                    <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br ${s.color} flex items-center justify-center text-white text-xs font-black shadow-lg border-2 border-[#060a14]`}>
                      {s.step}
                    </div>
                  </div>
                  <h3 className={`text-xl font-extrabold mb-3 ${isDark ? 'text-white' : 'text-[#1e1b4b]'}`}>{s.title}</h3>
                  <p className={`text-sm leading-relaxed max-w-xs mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ROLE CARDS ────────────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-24 relative" ref={rolesRef}>
          {isDark && <div className="absolute inset-0 bg-[#060a14]" />}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`text-center mb-16 reveal ${rolesVisible ? 'visible' : ''}`}>
              <span className={`inline-block text-sm font-bold uppercase tracking-[0.2em] mb-4 px-4 py-2 glass rounded-full border ${isDark ? 'text-violet-400 border-violet-500/30' : 'text-violet-600 border-violet-400/40'}`}>
                ✦ Get Started
              </span>
              <h2 className={`text-4xl sm:text-5xl font-black mt-4 mb-4 ${isDark ? 'text-white' : 'text-[#1e1b4b]'}`}>
                Choose Your Role
              </h2>
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Join thousands of farmers already using Krishi Kavach</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {roles.map((r, i) => (
                <Link key={r.role} to={r.link}
                  className={`card-3d group relative overflow-hidden glass rounded-3xl border border-white/10 hover:border-white/20 hover:shadow-2xl ${r.glow} transition-all duration-300 reveal ${rolesVisible ? 'visible' : ''}`}
                  style={{ animationDelay: `${i * 120}ms` }}>
                  {/* Top gradient strip */}
                  <div className={`h-1 bg-gradient-to-r ${r.gradient}`} />
                  {/* Glow on hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${r.gradient} opacity-0`} style={{ opacity: 0 }} />

                  <div className={`relative p-8 ${isDark ? '' : 'bg-white'}`}>
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${r.gradient} flex items-center justify-center text-5xl mb-6 shadow-2xl group-hover:scale-110 transition-transform duration-300`}>
                      {r.emoji}
                    </div>

                    {/* Badge & title */}
                    <span className={`inline-block text-xs font-extraBold uppercase tracking-wider px-3 py-1 rounded-full border mb-3 ${r.badge}`}>
                      {r.title}
                    </span>
                    <h3 className={`text-2xl font-black mb-3 ${isDark ? 'text-white' : 'text-[#1e1b4b]'}`}>{r.title}</h3>
                    <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{r.description}</p>

                    {/* Feature pills */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {r.features.map((f) => (
                        <span key={f} className={`text-xs px-3 py-1 rounded-full border font-medium ${isDark ? 'bg-white/8 text-gray-300 border-white/10' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-400 group-hover:gap-3 transition-all">
                      Get Started
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── LANGUAGES STRIP ───────────────────────────────────────────────── */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(270deg,#10b981,#06b6d4,#8b5cf6,#10b981)',
          backgroundSize: '400% 400%',
          animation: 'gradient-shift 6s ease infinite',
          opacity: 0.1,
        }} />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-emerald-950/80" />
        <div className="relative text-center max-w-2xl mx-auto px-4">
          <div className="text-4xl mb-4">🗣️</div>
          <h2 className="text-3xl font-extrabold text-white mb-2">Available in 3 Languages</h2>
          <p className="text-emerald-300 mb-8">Krishi Kavach speaks your language</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {[
              { flag: '🇬🇧', lang: 'English', sub: 'English' },
              { flag: '🇮🇳', lang: 'हिंदी', sub: 'Hindi' },
              { flag: '🌸', lang: 'मराठी', sub: 'Marathi' },
            ].map((l, i) => (
              <div key={i} className="glass border border-white/20 rounded-2xl px-6 py-4 text-white hover:border-white/40 hover:-translate-y-1 transition-all duration-200 cursor-default">
                <div className="text-3xl mb-1">{l.flag}</div>
                <p className="font-extrabold text-lg">{l.lang}</p>
                <p className="text-xs text-gray-400">{l.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER BANNER ─────────────────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-24 relative overflow-hidden">
          {isDark && <div className="absolute inset-0 bg-[#060a14]" />}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[80px] glow-ring" />
          <div className="relative text-center max-w-3xl mx-auto px-4">
            <div className="text-7xl mb-6 float" style={{ animation: 'float 3.5s ease-in-out infinite' }}>🌾</div>
            <h2 className={`text-4xl sm:text-5xl font-black mb-4 ${isDark ? 'text-white' : 'text-[#1e1b4b]'}`}>
              Ready to Transform<br />
              <span style={{
                background: 'linear-gradient(270deg,#10b981,#06b6d4,#8b5cf6,#10b981)',
                backgroundSize: '400% 400%',
                animation: 'gradient-shift 6s ease infinite',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                display: 'inline-block',
              }}>Your Farm?</span>
            </h2>
            <p className={`text-lg mb-10 max-w-lg mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Join farmers across India who use Krishi Kavach to protect their crops, access market data, and get expert guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register"
                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-extrabold text-lg rounded-2xl shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-400/60 transition-all duration-300 hover:-translate-y-1">
                Start for Free — It's Easy
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
              <Link to="/login"
                className="inline-flex items-center gap-3 px-10 py-5 glass border border-white/20 text-white font-bold text-lg rounded-2xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                Already a member? Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className={`border-t py-8 text-center ${isDark ? 'border-white/5' : 'border-indigo-200/40'}`}>
        <p className="text-gray-600 text-sm">
          🌾 <span className="text-emerald-500 font-bold">Krishi Kavach</span> — Crop Shield for India's Farmers · Built with ❤️
        </p>
      </footer>
    </div>
  );
};

export default Home;
