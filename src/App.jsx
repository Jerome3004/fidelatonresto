import { useState, useEffect } from "react";

const APP_NAME = "Fidel à ton Resto";
const APP_TAGLINE = "La fidélité digitale, simple comme bonjour";

const today = () => new Date().toISOString().split("T")[0];
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("fr-FR") : "—";
const daysBetween = (d) => Math.floor((new Date() - new Date(d)) / 86400000);

const DEMO_ACCOUNTS = [
  { id: 1, email: "marco@pizzadelsol.fr", password: "demo123", role: "restaurant", restoName: "Pizza Del Sol", owner: "Marco Rossi", plan: "Pro", since: "2024-03-01" },
  { id: 2, email: "sophie@lebonburger.fr", password: "demo123", role: "restaurant", restoName: "Le Bon Burger", owner: "Sophie Martin", plan: "Starter", since: "2024-06-15" },
  { id: 3, email: "admin@fideltonresto.fr", password: "admin123", role: "superadmin", restoName: "Super Admin", owner: "Vous", plan: "Admin", since: "2024-01-01" },
];

const INIT_CLIENTS = [
  { id: 1, restoId: 1, name: "Marie Dupont", phone: "0612345678", email: "marie@email.com", birthday: "1990-04-09", pizzas: 7, totalOrders: 17, joined: "2024-01-15", lastVisit: "2025-04-01", freeEarned: 1, smsOptIn: true, walletAdded: true },
  { id: 2, restoId: 1, name: "Thomas Martin", phone: "0798765432", email: "thomas@email.com", birthday: "1985-06-22", pizzas: 3, totalOrders: 23, joined: "2023-11-02", lastVisit: "2025-03-10", freeEarned: 2, smsOptIn: true, walletAdded: false },
  { id: 3, restoId: 1, name: "Lucie Bernard", phone: "0655443322", email: "lucie@email.com", birthday: "1995-09-14", pizzas: 9, totalOrders: 10, joined: "2025-02-10", lastVisit: "2025-04-05", freeEarned: 0, smsOptIn: false, walletAdded: true },
  { id: 4, restoId: 1, name: "Paul Lefebvre", phone: "0711223344", email: "paul@email.com", birthday: "1978-12-30", pizzas: 0, totalOrders: 31, joined: "2023-06-20", lastVisit: "2025-03-01", freeEarned: 3, smsOptIn: true, walletAdded: true },
  { id: 5, restoId: 1, name: "Sophie Moreau", phone: "0677889900", email: "sophie@email.com", birthday: "1992-04-09", pizzas: 5, totalOrders: 5, joined: "2025-03-01", lastVisit: "2025-04-02", freeEarned: 0, smsOptIn: true, walletAdded: false },
  { id: 6, restoId: 2, name: "Jean Durand", phone: "0623456789", email: "jean@email.com", birthday: "1988-07-11", pizzas: 4, totalOrders: 8, joined: "2024-07-01", lastVisit: "2025-04-03", freeEarned: 0, smsOptIn: true, walletAdded: false },
];

const INIT_SMS_LOG = [
  { id: 1, restoId: 1, to: "Tous les clients", count: 5, msg: "Ce soir chez Pizza Del Sol : 2 pizzas achetées = 1 boisson offerte ! 🍕", date: "2025-04-01", status: "envoyé" },
  { id: 2, restoId: 1, to: "Clients inactifs", count: 2, msg: "Vous nous manquez ! Revenez cette semaine 🍕", date: "2025-03-28", status: "envoyé" },
];

const INIT_PROMOS = [
  { id: 1, restoId: 1, title: "Happy Hour", desc: "−20% tous les lundis", active: true },
  { id: 2, restoId: 1, title: "Soirée Football", desc: "Pizza achetée = boisson offerte", active: true },
  { id: 3, restoId: 2, title: "Menu du Jour", desc: "Burger + frites + boisson à 12€", active: true },
];

const WEEKLY = [12, 18, 9, 22, 16, 27, 14];
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

// ── QR CODE ───────────────────────────────────────────────────────────────────
function QRCode({ value, size = 100 }) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) { hash = ((hash << 5) - hash) + value.charCodeAt(i); hash |= 0; }
  const s = 13, cs = size / s;
  const cells = Array.from({ length: s }, (_, r) => Array.from({ length: s }, (_, c) => {
    if ((r < 3 && c < 3) || (r < 3 && c >= s - 3) || (r >= s - 3 && c < 3)) return true;
    if ((r === 3 && c <= 3) || (r <= 3 && c === 3) || (r === 3 && c >= s - 4) || (r <= 3 && c === s - 4) || (r === s - 4 && c <= 3) || (r >= s - 4 && c === 3)) return false;
    return ((hash ^ (r * 31 + c * 17) ^ (r * c)) & 1) === 1;
  }));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      <rect width={size} height={size} fill="white" rx="3" />
      {cells.map((row, r) => row.map((f, c) => f ? <rect key={`${r}-${c}`} x={c * cs} y={r * cs} width={cs} height={cs} fill="#18181b" /> : null))}
    </svg>
  );
}

// ── UI PRIMITIVES ─────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #f0f0f0", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", ...style }}>{children}</div>
);

const Btn = ({ onClick, children, variant = "dark", style = {}, disabled = false }) => (
  <button onClick={onClick} disabled={disabled} style={{
    padding: "10px 18px", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit", fontWeight: 700, fontSize: 13, border: "none", transition: "opacity 0.15s",
    background: variant === "orange" ? "#FF4D00" : variant === "dark" ? "#18181b" : variant === "green" ? "#16a34a" : variant === "ghost" ? "#fff" : "#f4f4f5",
    color: ["orange", "dark", "green"].includes(variant) ? "#fff" : "#18181b",
    boxShadow: variant === "ghost" ? "inset 0 0 0 1.5px #e4e4e7" : "none",
    opacity: disabled ? 0.5 : 1, ...style,
  }} onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.82")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
    {children}
  </button>
);

const Field = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <div style={{ fontSize: 12, color: "#71717a", marginBottom: 5, fontWeight: 600 }}>{label}</div>}
    <input {...props} style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", ...(props.style || {}) }} />
  </div>
);

const Toggle = ({ checked, onChange }) => (
  <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 99, cursor: "pointer", transition: "background 0.2s", background: checked ? "#FF4D00" : "#e4e4e7", position: "relative", flexShrink: 0 }}>
    <div style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 16, height: 16, borderRadius: 99, background: "#fff", transition: "left 0.2s" }} />
  </div>
);

function Modal({ show, onClose, title, children, width = 400 }) {
  if (!show) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, backdropFilter: "blur(6px)", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: 32, width, maxWidth: "100%", boxShadow: "0 32px 80px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        {title && <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#71717a" }}>✕</button>
        </div>}
        {children}
      </div>
    </div>
  );
}

// ── PAGE ACCUEIL ──────────────────────────────────────────────────────────────
function HomePage({ onClientAccess, onProAccess }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0800 0%, #2d1200 50%, #1a0800 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'DM Sans', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Syne:wght@700;800&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes scan { 0%,100%{top:20%} 50%{top:75%} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 99px; }
      `}</style>

      {/* Cercles décoratifs */}
      <div style={{ position: "absolute", top: "-10%", right: "-10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,77,0,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,77,0,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 48, animation: "fadeUp 0.6s ease both" }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: "float 3s ease-in-out infinite" }}>🍕</div>
        <h1 style={{ fontFamily: "Syne, serif", fontSize: "clamp(32px, 8vw, 48px)", fontWeight: 800, color: "#fff", margin: 0, letterSpacing: -1.5 }}>
          {APP_NAME}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, marginTop: 8, letterSpacing: 0.3 }}>
          {APP_TAGLINE}
        </p>
      </div>

      {/* Deux boutons principaux */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", maxWidth: 500, animation: "fadeUp 0.8s ease both" }}>

        {/* Bouton CLIENT */}
        <button onClick={onClientAccess} style={{
          background: "rgba(255,255,255,0.05)",
          border: "1.5px solid rgba(255,255,255,0.15)",
          borderRadius: 20, padding: "32px 20px",
          cursor: "pointer", textAlign: "center",
          transition: "all 0.25s", color: "#fff",
          backdropFilter: "blur(10px)",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.transform = "translateY(0)"; }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📱</div>
          <div style={{ fontFamily: "Syne, serif", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
            Ma carte fidélité
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
            Accédez à votre carte et suivez vos pizzas
          </div>
        </button>

        {/* Bouton RESTAURATEUR */}
        <button onClick={onProAccess} style={{
          background: "#FF4D00",
          border: "1.5px solid #FF4D00",
          borderRadius: 20, padding: "32px 20px",
          cursor: "pointer", textAlign: "center",
          transition: "all 0.25s", color: "#fff",
          boxShadow: "0 8px 32px rgba(255,77,0,0.4)",
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,77,0,0.5)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,77,0,0.4)"; }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>🖥️</div>
          <div style={{ fontFamily: "Syne, serif", fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
            Espace Pro
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", lineHeight: 1.5 }}>
            Gérez votre programme de fidélité
          </div>
        </button>
      </div>

      {/* Badges */}
      <div style={{ display: "flex", gap: 12, marginTop: 32, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 1s ease both" }}>
        {["✅ Sans app à télécharger", "🔒 Données sécurisées", "⚡ Accès instantané"].map(b => (
          <div key={b} style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 99, padding: "6px 14px", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            {b}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
        © 2025 {APP_NAME} · Tous droits réservés
      </div>
    </div>
  );
}

// ── PAGE CLIENT ───────────────────────────────────────────────────────────────
function ClientAccessPage({ clients, setClients, promos, onBack }) {
  const [phone, setPhone] = useState("");
  const [client, setClient] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (client) { const u = clients.find(c => c.id === client.id); if (u) setClient(u); }
  }, [clients]);

  const isBday = (c) => { if (!c?.birthday) return false; const b = new Date(c.birthday), n = new Date(); return b.getMonth() === n.getMonth() && b.getDate() === n.getDate(); };

  const lookup = () => {
    const f = clients.find(c => c.phone === phone.replace(/\s/g, ""));
    f ? (setClient(f), setErr(false)) : setErr(true);
  };

  if (!client) return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0800 0%, #2d1200 50%, #1a0800 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", marginBottom: 32, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
          ← Retour
        </button>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>📱</div>
          <h2 style={{ fontFamily: "Syne, serif", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Ma carte fidélité</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Entrez votre numéro pour accéder à votre carte</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", borderRadius: 20, padding: 28, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600 }}>Votre numéro de téléphone</div>
            <input value={phone} onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === "Enter" && lookup()}
              placeholder="0612345678" type="tel"
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1.5px solid ${err ? "rgba(252,165,165,0.5)" : "rgba(255,255,255,0.15)"}`, background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 16, textAlign: "center", fontFamily: "inherit", outline: "none", boxSizing: "border-box", letterSpacing: 2 }} />
          </div>

          {err && (
            <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#fca5a5", marginBottom: 14 }}>
              ⚠️ Numéro non trouvé. Inscrivez-vous en caisse chez votre restaurateur.
            </div>
          )}

          <button onClick={lookup} style={{ width: "100%", background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
            Accéder à ma carte →
          </button>

          {/* Comptes demo */}
          <div style={{ marginTop: 20, padding: 14, background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Démo — cliquez pour tester</div>
            {[
              { name: "Marie Dupont", phone: "0612345678" },
              { name: "Thomas Martin", phone: "0798765432" },
              { name: "Lucie Bernard", phone: "0655443322" },
            ].map(d => (
              <div key={d.phone} onClick={() => { setPhone(d.phone); setErr(false); }} style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: "rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>📱 {d.name}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{d.phone}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Trouver le restaurant du client
  const resto = DEMO_ACCOUNTS.find(a => a.id === client.restoId);
  const myPromos = promos.filter(p => p.restoId === client.restoId && p.active);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f8", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20 }}>🍕</span>
          <span style={{ fontFamily: "Syne, serif", fontWeight: 800, fontSize: 15 }}>{APP_NAME}</span>
        </div>
        <button onClick={() => { setClient(null); setPhone(""); }} style={{ background: "#f4f4f5", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#71717a", fontFamily: "inherit" }}>
          Déconnexion
        </button>
      </div>

      <div style={{ maxWidth: 440, margin: "0 auto", padding: "20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* Anniversaire */}
        {isBday(client) && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "16px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>🎂</div>
            <div style={{ fontWeight: 800, color: "#92400e", fontSize: 15 }}>Joyeux anniversaire {client.name.split(" ")[0]} !</div>
            <div style={{ fontSize: 13, color: "#92400e", marginTop: 4 }}>Toute l'équipe de {resto?.restoName} vous offre une pizza aujourd'hui ! 🍕</div>
          </div>
        )}

        {/* Bienvenue */}
        <Card style={{ textAlign: "center", padding: "24px" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
          <div style={{ fontFamily: "Syne, serif", fontSize: 20, fontWeight: 800 }}>Bonjour, {client.name.split(" ")[0]} !</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#FF4D00", marginTop: 4 }}>{resto?.restoName}</div>
          <div style={{ fontSize: 12, color: "#a1a1aa", marginTop: 2 }}>Dernière visite : {fmtDate(client.lastVisit)}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 28, margin: "16px 0 0" }}>
            {[["Pizzas", client.totalOrders], ["Offertes", client.freeEarned]].map(([l, v]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#FF4D00" }}>{v}</div>
                <div style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* QR Code */}
        <Card style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>📱 Mon QR code</div>
          <div style={{ fontSize: 12, color: "#71717a", marginBottom: 14 }}>Présentez-le à chaque visite</div>
          <div style={{ display: "inline-block", padding: 16, background: "#fff", borderRadius: 16, border: "2px solid #f0f0f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
            <QRCode value={`fidelresto:${client.id}:${client.phone}`} size={150} />
          </div>
          <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 10 }}>Code unique · {client.name}</div>
        </Card>

        {/* Progression */}
        <Card>
          <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>Ma progression</div>
          <div style={{ fontSize: 13, color: "#71717a", marginBottom: 14 }}>
            {client.pizzas < 10
              ? `Plus que ${10 - client.pizzas} pizza${10 - client.pizzas > 1 ? "s" : ""} pour une récompense 🎁`
              : "🎉 Pizza offerte disponible !"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 7 }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: 10, background: i < client.pizzas ? "#FF4D00" : "#f4f4f5", border: `1.5px solid ${i < client.pizzas ? "#FF4D00" : "#e4e4e7"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {i < client.pizzas ? "🍕" : ""}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, height: 6, background: "#f4f4f5", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: 99, background: "#FF4D00", width: `${(client.pizzas / 10) * 100}%`, transition: "width 0.5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#a1a1aa", marginTop: 6 }}>
            <span>0</span>
            <span style={{ color: "#FF4D00", fontWeight: 700 }}>{client.pizzas} pizzas</span>
            <span>10 → 🎁</span>
          </div>
        </Card>

        {/* Promos */}
        {myPromos.length > 0 && (
          <Card>
            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 12 }}>Offres du moment ✨</div>
            {myPromos.map(p => (
              <div key={p.id} style={{ padding: "12px 16px", borderRadius: 12, background: "#fafafa", border: "1px solid #e4e4e7", marginBottom: 8 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>{p.desc}</div>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

// ── PAGE LOGIN PRO ────────────────────────────────────────────────────────────
function ProLoginPage({ onLogin, onBack }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const account = DEMO_ACCOUNTS.find(a => a.email === email && a.password === password);
      if (account) { onLogin(account); }
      else { setErr("Email ou mot de passe incorrect"); setLoading(false); }
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a0800 0%, #2d1200 50%, #1a0800 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 24, fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", marginBottom: 32, display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
          ← Retour
        </button>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 12 }}>🖥️</div>
          <h2 style={{ fontFamily: "Syne, serif", fontSize: 28, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Espace Restaurateur</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>Connectez-vous à votre tableau de bord</p>
        </div>

        <div style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", borderRadius: 20, padding: 28, border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600 }}>Email</div>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="votre@email.fr"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 6, fontWeight: 600 }}>Mot de passe</div>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="••••••••"
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{ width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)", color: "#fff", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }} />
          </div>

          {err && <div style={{ color: "#fca5a5", fontSize: 12, marginBottom: 12 }}>⚠️ {err}</div>}

          <button onClick={handleLogin} disabled={loading} style={{ width: "100%", background: "#FF4D00", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 16, fontFamily: "inherit", opacity: loading ? 0.7 : 1 }}>
            {loading ? "Connexion..." : "Se connecter →"}
          </button>

          {/* Comptes demo */}
          <div style={{ marginTop: 20, padding: 14, background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Comptes de démonstration</div>
            {[
              { label: "🍕 Pizza Del Sol", email: "marco@pizzadelsol.fr", pwd: "demo123" },
              { label: "🔧 Super Admin", email: "admin@fideltonresto.fr", pwd: "admin123" },
            ].map(d => (
              <div key={d.email} onClick={() => { setEmail(d.email); setPassword(d.pwd); setErr(""); }}
                style={{ padding: "8px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 4, background: "rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{d.label}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{d.email}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ account, clients, smsLog, promos }) {
  const myClients = clients.filter(c => c.restoId === account.id);
  const bdayClients = myClients.filter(c => { if (!c.birthday) return false; const b = new Date(c.birthday), n = new Date(); return b.getMonth() === n.getMonth() && b.getDate() === n.getDate(); });
  const sleeping = myClients.filter(c => daysBetween(c.lastVisit) > 21);
  const closeToReward = myClients.filter(c => c.pizzas >= 8);
  const max = Math.max(...WEEKLY);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg, #FF4D00 0%, #ff8c42 100%)", borderRadius: 20, padding: "24px 28px", color: "#fff" }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>Bonjour 👋</div>
        <div style={{ fontFamily: "Syne, serif", fontSize: 24, fontWeight: 900, marginBottom: 4 }}>{account.owner}</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>{account.restoName} · Abonnement {account.plan}</div>
        <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
      </div>

      {(bdayClients.length > 0 || sleeping.length > 0 || closeToReward.length > 0) && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bdayClients.map(c => (
            <div key={c.id} style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#92400e", fontWeight: 600 }}>
              🎂 <strong>{c.name}</strong> fête son anniversaire aujourd'hui !
            </div>
          ))}
          {sleeping.length > 0 && (
            <div style={{ background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#9a3412", fontWeight: 600 }}>
              😴 <strong>{sleeping.length} client{sleeping.length > 1 ? "s" : ""}</strong> inactif{sleeping.length > 1 ? "s" : ""} depuis +21 jours
            </div>
          )}
          {closeToReward.length > 0 && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#166534", fontWeight: 600 }}>
              🎯 <strong>{closeToReward.length} client{closeToReward.length > 1 ? "s" : ""}</strong> à 8-9 pizzas — relancez-les !
            </div>
          )}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[["👥", "Clients", myClients.length], ["🍕", "Pizzas", myClients.reduce((s, c) => s + c.totalOrders, 0)], ["💳", "Wallets", myClients.filter(c => c.walletAdded).length], ["💬", "SMS", smsLog.filter(s => s.restoId === account.id).length]].map(([icon, l, v]) => (
          <Card key={l} style={{ textAlign: "center", padding: "16px 10px" }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#FF4D00" }}>{v}</div>
            <div style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>📊 Activité cette semaine</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100 }}>
          {WEEKLY.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 10, color: "#71717a", fontWeight: 700 }}>{v}</div>
              <div style={{ width: "100%", borderRadius: "5px 5px 0 0", background: i === 5 ? "#FF4D00" : "#e4e4e7", height: `${(v / max) * 100}%`, minHeight: 4 }} />
              <div style={{ fontSize: 10, color: "#a1a1aa" }}>{DAYS[i]}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>🏆 Meilleurs clients</div>
        {[...myClients].sort((a, b) => b.totalOrders - a.totalOrders).slice(0, 4).map((c, i) => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 99, background: i === 0 ? "#FF4D00" : "#f4f4f5", color: i === 0 ? "#fff" : "#71717a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "#a1a1aa" }}>{c.totalOrders} pizzas · {fmtDate(c.lastVisit)}</div>
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, background: "#fff5f2", color: "#FF4D00", borderRadius: 8, padding: "3px 8px", border: "1px solid #ffd0c0" }}>{c.pizzas}/10</div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── CAISSE ────────────────────────────────────────────────────────────────────
function CaisseView({ account, clients, setClients, promos, setSmsLog }) {
  const myClients = clients.filter(c => c.restoId === account.id);
  const [search, setSearch] = useState("");
  const [sid, setSid] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showFree, setShowFree] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [nc, setNc] = useState({ name: "", phone: "", email: "", birthday: "", smsOptIn: true });
  const [flash, setFlash] = useState(false);

  const filtered = myClients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search.replace(/\s/g, "")));
  const client = clients.find(c => c.id === sid);
  const isBday = (c) => { if (!c?.birthday) return false; const b = new Date(c.birthday), n = new Date(); return b.getMonth() === n.getMonth() && b.getDate() === n.getDate(); };

  const addPizza = () => {
    setClients(prev => prev.map(c => {
      if (c.id !== sid) return c;
      const np = c.pizzas + 1;
      if (np >= 10) { setTimeout(() => setShowFree(true), 300); return { ...c, pizzas: 0, totalOrders: c.totalOrders + 1, freeEarned: c.freeEarned + 1, lastVisit: today() }; }
      setFlash(true); setTimeout(() => setFlash(false), 1500);
      return { ...c, pizzas: np, totalOrders: c.totalOrders + 1, lastVisit: today() };
    }));
  };

  const createClient = () => {
    if (!nc.name.trim() || !nc.phone.trim()) return;
    const newC = { id: Date.now(), restoId: account.id, ...nc, pizzas: 0, totalOrders: 0, joined: today(), lastVisit: today(), freeEarned: 0, walletAdded: false };
    if (nc.birthday && nc.smsOptIn) {
      const b = new Date(nc.birthday), n = new Date();
      if (b.getMonth() === n.getMonth() && b.getDate() === n.getDate()) {
        setSmsLog(l => [{ id: Date.now(), restoId: account.id, to: nc.name, count: 1, msg: `Joyeux anniversaire ${nc.name.split(" ")[0]} ! 🎂 ${account.restoName} vous offre une pizza aujourd'hui !`, date: today(), status: "envoyé auto" }, ...l]);
      }
    }
    setClients(prev => [newC, ...prev]);
    setSid(newC.id); setShowAdd(false);
    setNc({ name: "", phone: "", email: "", birthday: "", smsOptIn: true });
  };

  return (
    <div style={{ display: "flex", gap: 20, height: "100%" }}>
      <div style={{ width: 268, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {myClients.filter(isBday).length > 0 && (
          <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "#92400e", fontWeight: 600 }}>
            🎂 Anniversaire : {myClients.filter(isBday).map(c => c.name.split(" ")[0]).join(", ")}
          </div>
        )}
        <Btn variant="orange" onClick={() => setShowScanner(true)} style={{ width: "100%", padding: "12px 0" }}>📷 Scanner QR code</Btn>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nom ou téléphone…"
            style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7", fontSize: 13, fontFamily: "inherit", outline: "none" }} />
          <Btn onClick={() => setShowAdd(true)} style={{ padding: "0 14px", fontSize: 20 }}>+</Btn>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 5 }}>
          {filtered.map(c => (
            <div key={c.id} onClick={() => setSid(c.id)} style={{ padding: "12px 14px", borderRadius: 12, cursor: "pointer", background: sid === c.id ? "#18181b" : "#fff", color: sid === c.id ? "#fff" : "#18181b", border: `1.5px solid ${sid === c.id ? "#18181b" : "#f0f0f0"}`, transition: "all 0.18s" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name} {isBday(c) ? "🎂" : ""} {c.walletAdded ? "💳" : ""}</div>
              <div style={{ fontSize: 11, opacity: 0.6, marginTop: 1 }}>{c.phone}</div>
              <div style={{ marginTop: 7, display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ height: 4, flex: 1, borderRadius: 99, background: sid === c.id ? "rgba(255,255,255,0.2)" : "#f0f0f0" }}>
                  <div style={{ height: "100%", borderRadius: 99, width: `${(c.pizzas / 10) * 100}%`, background: "#FF4D00" }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700 }}>{c.pizzas}/10</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {!client ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, color: "#a1a1aa" }}>
            <div style={{ fontSize: 52 }}>📷</div>
            <div style={{ fontSize: 14 }}>Scannez un QR code ou sélectionnez un client</div>
          </div>
        ) : (
          <>
            {isBday(client) && (
              <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 14, padding: "14px 20px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "#92400e" }}>
                🎂 Anniversaire de {client.name.split(" ")[0]} ! Offrez-lui une pizza !
              </div>
            )}
            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 900 }}>{client.name}</div>
                  <div style={{ fontSize: 13, color: "#71717a", marginTop: 3 }}>📞 {client.phone}</div>
                  {client.birthday && <div style={{ fontSize: 12, color: "#FF4D00", marginTop: 3 }}>🎂 {fmtDate(client.birthday).slice(0, 5)}</div>}
                </div>
                <div style={{ display: "flex", gap: 14 }}>
                  {[["Pizzas", client.totalOrders], ["Offertes", client.freeEarned]].map(([l, v]) => (
                    <div key={l} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 900, color: "#FF4D00" }}>{v}</div>
                      <div style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Btn variant="light" onClick={() => setShowQR(true)}>📱 QR code</Btn>
              </div>
            </Card>

            <Card>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>Carte de fidélité</div>
                <div style={{ background: "#fff5f2", color: "#FF4D00", borderRadius: 99, padding: "3px 12px", fontSize: 12, fontWeight: 700, border: "1px solid #ffd0c0" }}>{client.pizzas}/10</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 7 }}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: "1", borderRadius: 10, background: i < client.pizzas ? "#FF4D00" : "#f4f4f5", border: `1.5px solid ${i < client.pizzas ? "#FF4D00" : "#e4e4e7"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                    {i < client.pizzas ? "🍕" : ""}
                  </div>
                ))}
              </div>
            </Card>

            <button onClick={addPizza} style={{ background: flash ? "#16a34a" : client.pizzas === 9 ? "#FF4D00" : "#18181b", color: "#fff", border: "none", borderRadius: 14, padding: "18px 0", fontSize: 16, fontWeight: 800, cursor: "pointer", transition: "background 0.3s" }}>
              {flash ? "✓ Pizza enregistrée !" : client.pizzas === 9 ? "🎉 Valider → Pizza offerte !" : "+ Valider une pizza"}
            </button>
          </>
        )}
      </div>

      <Modal show={showFree} onClose={() => setShowFree(false)} title="">
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Pizza offerte !</div>
          <div style={{ fontSize: 14, color: "#71717a", marginBottom: 24 }}>{client?.name} a atteint 10 pizzas !</div>
          <Btn variant="orange" onClick={() => setShowFree(false)} style={{ width: "100%", padding: 14 }}>Récompense remise ✓</Btn>
        </div>
      </Modal>

      <Modal show={showAdd} onClose={() => setShowAdd(false)} title="➕ Nouveau client">
        <div style={{ background: "#fff5f2", border: "1px solid #ffd0c0", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#c2410c", marginBottom: 16 }}>
          💡 QR code unique + SMS anniversaire automatique générés à la création
        </div>
        <Field label="Nom complet *" value={nc.name} onChange={e => setNc(p => ({ ...p, name: e.target.value }))} />
        <Field label="Téléphone *" type="tel" value={nc.phone} onChange={e => setNc(p => ({ ...p, phone: e.target.value }))} />
        <Field label="Email" type="email" value={nc.email} onChange={e => setNc(p => ({ ...p, email: e.target.value }))} />
        <Field label="🎂 Date d'anniversaire" type="date" value={nc.birthday} onChange={e => setNc(p => ({ ...p, birthday: e.target.value }))} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Accepte les SMS</div>
          <Toggle checked={nc.smsOptIn} onChange={() => setNc(p => ({ ...p, smsOptIn: !p.smsOptIn }))} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={() => setShowAdd(false)} style={{ flex: 1, padding: 12 }}>Annuler</Btn>
          <Btn variant="orange" onClick={createClient} style={{ flex: 1, padding: 12 }}>Créer 🎉</Btn>
        </div>
      </Modal>

      <Modal show={showQR && !!client} onClose={() => setShowQR(false)} title="📱 QR code" width={320}>
        {client && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 2 }}>{client.name}</div>
            <div style={{ fontSize: 13, color: "#71717a", marginBottom: 16 }}>{client.phone}</div>
            <div style={{ display: "inline-block", padding: 16, background: "#fff", borderRadius: 16, border: "2px solid #f0f0f0", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", marginBottom: 14 }}>
              <QRCode value={`fidelresto:${client.id}:${client.phone}`} size={150} />
            </div>
            <Btn variant="ghost" onClick={() => setShowQR(false)} style={{ width: "100%", padding: 12 }}>Fermer</Btn>
          </div>
        )}
      </Modal>

      <Modal show={showScanner} onClose={() => setShowScanner(false)} title="📷 Scanner" width={320}>
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ position: "relative", width: 180, height: 180, margin: "0 auto 16px", borderRadius: 16, background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <div style={{ fontSize: 40 }}>📷</div>
            <div style={{ position: "absolute", left: 12, right: 12, height: 2, background: "#FF4D00", animation: "scan 1.5s ease-in-out infinite" }} />
          </div>
          <div style={{ fontSize: 13, color: "#71717a" }}>En production, la vraie caméra s'active ici</div>
        </div>
      </Modal>
    </div>
  );
}

// ── SMS CAMPAGNES ─────────────────────────────────────────────────────────────
function SMSCampagnes({ account, clients, smsLog, setSmsLog }) {
  const myClients = clients.filter(c => c.restoId === account.id);
  const [showNew, setShowNew] = useState(false);
  const [msg, setMsg] = useState("");
  const [target, setTarget] = useState("all");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const targets = {
    all: myClients.filter(c => c.smsOptIn),
    sleeping: myClients.filter(c => c.smsOptIn && daysBetween(c.lastVisit) > 21),
    close: myClients.filter(c => c.smsOptIn && c.pizzas >= 8),
    birthday: myClients.filter(c => { if (!c.birthday || !c.smsOptIn) return false; const b = new Date(c.birthday), n = new Date(); return b.getMonth() === n.getMonth() && b.getDate() === n.getDate(); }),
  };

  const templates = [
    { label: "🎉 Promo flash", text: `Offre spéciale ce soir chez ${account.restoName} ! 🍕 Venez profiter de nos offres exclusives !` },
    { label: "😴 Relance", text: `${account.restoName} vous manque ! Revenez cette semaine et profitez d'une surprise 🎁` },
    { label: "🎯 Proche récompense", text: `Plus que quelques visites pour votre pizza offerte chez ${account.restoName} ! On vous attend 🍕` },
    { label: "🎂 Anniversaire", text: `Joyeux anniversaire ! 🎂 Toute l'équipe de ${account.restoName} vous offre une pizza aujourd'hui !` },
  ];

  const sendCampaign = () => {
    if (!msg.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSmsLog(l => [{ id: Date.now(), restoId: account.id, to: target === "all" ? "Tous les clients" : target === "sleeping" ? "Clients inactifs" : target === "close" ? "Proches récompense" : "Anniversaires", count: targets[target].length, msg, date: today(), status: "envoyé" }, ...l]);
      setSending(false); setSent(true);
      setTimeout(() => { setSent(false); setShowNew(false); setMsg(""); }, 2000);
    }, 1500);
  };

  const mySMS = smsLog.filter(s => s.restoId === account.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>💬 Campagnes SMS</div>
          <div style={{ fontSize: 12, color: "#71717a", marginTop: 2 }}>{myClients.filter(c => c.smsOptIn).length} clients abonnés</div>
        </div>
        <Btn variant="orange" onClick={() => setShowNew(true)}>📢 Nouvelle campagne</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
        {[["Tous", targets.all.length], ["Inactifs", targets.sleeping.length], ["Proches", targets.close.length], ["Anniv.", targets.birthday.length]].map(([l, v]) => (
          <Card key={l} style={{ textAlign: "center", padding: "14px 10px" }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#FF4D00" }}>{v}</div>
            <div style={{ fontSize: 11, fontWeight: 700 }}>{l}</div>
          </Card>
        ))}
      </div>

      <Card>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 14 }}>Historique</div>
        {!mySMS.length ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "#a1a1aa" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
            Aucune campagne — lancez votre première !
          </div>
        ) : mySMS.map(s => (
          <div key={s.id} style={{ padding: "14px 16px", borderRadius: 12, background: "#fafafa", border: "1px solid #f0f0f0", marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{s.to} · {s.count} destinataire{s.count > 1 ? "s" : ""}</span>
              <span style={{ fontSize: 11, color: "#a1a1aa" }}>{fmtDate(s.date)}</span>
            </div>
            <div style={{ fontSize: 13, color: "#374151" }}>{s.msg}</div>
            <div style={{ fontSize: 11, color: "#16a34a", marginTop: 6, fontWeight: 600 }}>✓ {s.status}</div>
          </div>
        ))}
      </Card>

      <Modal show={showNew} onClose={() => setShowNew(false)} title="📢 Nouvelle campagne SMS" width={480}>
        {sent ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#16a34a", marginBottom: 8 }}>Envoyée !</div>
            <div style={{ fontSize: 14, color: "#71717a" }}>{targets[target].length} client{targets[target].length > 1 ? "s" : ""} ont reçu votre message</div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#71717a", marginBottom: 8, fontWeight: 600 }}>1. DESTINATAIRES</div>
              {[["all", `📱 Tous (${targets.all.length})`], ["sleeping", `😴 Inactifs +21j (${targets.sleeping.length})`], ["close", `🎯 Proches récompense (${targets.close.length})`], ["birthday", `🎂 Anniversaires du jour (${targets.birthday.length})`]].map(([v, l]) => (
                <label key={v} onClick={() => setTarget(v)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, cursor: "pointer", background: target === v ? "#fff5f2" : "#fafafa", border: `1.5px solid ${target === v ? "#FF4D00" : "#f0f0f0"}`, fontSize: 13, fontWeight: target === v ? 700 : 400, marginBottom: 6 }}>
                  <div style={{ width: 16, height: 16, borderRadius: 99, border: `2px solid ${target === v ? "#FF4D00" : "#e4e4e7"}`, background: target === v ? "#FF4D00" : "#fff", flexShrink: 0 }} />{l}
                </label>
              ))}
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#71717a", marginBottom: 8, fontWeight: 600 }}>2. MESSAGE</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {templates.map((t, i) => (
                  <button key={i} onClick={() => setMsg(t.text)} style={{ padding: "6px 12px", fontSize: 11, borderRadius: 8, cursor: "pointer", border: "1px solid #e4e4e7", background: "#fafafa", fontFamily: "inherit", fontWeight: 600 }}>{t.label}</button>
                ))}
              </div>
              <textarea value={msg} onChange={e => setMsg(e.target.value)} placeholder="Écrivez votre message SMS..." rows={4}
                style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e4e4e7", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 4 }}>{msg.length}/160 · {targets[target].length} destinataire{targets[target].length > 1 ? "s" : ""}</div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="ghost" onClick={() => setShowNew(false)} style={{ flex: 1, padding: 13 }}>Annuler</Btn>
              <Btn variant="orange" onClick={sendCampaign} disabled={!msg.trim() || sending} style={{ flex: 2, padding: 13 }}>
                {sending ? "Envoi..." : `📢 Envoyer à ${targets[target].length} client${targets[target].length > 1 ? "s" : ""}`}
              </Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// ── STATS ─────────────────────────────────────────────────────────────────────
function StatsView({ account, clients }) {
  const myClients = clients.filter(c => c.restoId === account.id);
  const max = Math.max(...WEEKLY);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[["👥", myClients.length, "Clients"], ["🍕", myClients.reduce((s, c) => s + c.totalOrders, 0), "Pizzas"], ["🎁", myClients.reduce((s, c) => s + c.freeEarned, 0), "Offertes"], ["💳", myClients.filter(c => c.walletAdded).length, "Wallets"]].map(([icon, v, l]) => (
          <Card key={l} style={{ textAlign: "center", padding: "18px 10px" }}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: "#FF4D00" }}>{v}</div>
            <div style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 16 }}>Pizzas cette semaine</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {WEEKLY.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ fontSize: 10, color: "#71717a", fontWeight: 700 }}>{v}</div>
              <div style={{ width: "100%", borderRadius: "5px 5px 0 0", background: i === 5 ? "#FF4D00" : "#e4e4e7", height: `${(v / max) * 100}%`, minHeight: 4 }} />
              <div style={{ fontSize: 10, color: "#a1a1aa" }}>{DAYS[i]}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── SUPER ADMIN ───────────────────────────────────────────────────────────────
function SuperAdminView({ clients, smsLog }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: "linear-gradient(135deg, #18181b 0%, #374151 100%)", borderRadius: 20, padding: "24px 28px", color: "#fff" }}>
        <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 4 }}>🔧 Super Admin</div>
        <div style={{ fontFamily: "Syne, serif", fontSize: 24, fontWeight: 900 }}>Vue globale</div>
        <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4 }}>{APP_NAME}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[["🏪", DEMO_ACCOUNTS.filter(a => a.role === "restaurant").length, "Restaurants"], ["👥", clients.length, "Clients"], ["💬", smsLog.length, "SMS"], ["💳", clients.filter(c => c.walletAdded).length, "Wallets"]].map(([icon, v, l]) => (
          <Card key={l} style={{ textAlign: "center", padding: "16px 10px" }}>
            <div style={{ fontSize: 22 }}>{icon}</div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{v}</div>
            <div style={{ fontSize: 10, color: "#71717a", textTransform: "uppercase", letterSpacing: 1 }}>{l}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 14 }}>🏪 Restaurants clients</div>
        {DEMO_ACCOUNTS.filter(a => a.role === "restaurant").map(a => {
          const aClients = clients.filter(c => c.restoId === a.id);
          return (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "#fff5f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🍕</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{a.restoName}</div>
                <div style={{ fontSize: 12, color: "#71717a" }}>{a.owner} · {a.plan}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#FF4D00" }}>{aClients.length}</div>
                <div style={{ fontSize: 10, color: "#71717a" }}>clients</div>
              </div>
            </div>
          );
        })}
      </Card>
      <Card>
        <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8 }}>💰 Revenus mensuels</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#FF4D00" }}>{(DEMO_ACCOUNTS.filter(a => a.role === "restaurant").length * 24.90).toFixed(2)}€</div>
        <div style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>{DEMO_ACCOUNTS.filter(a => a.role === "restaurant").length} restaurants × 24,90€/mois</div>
      </Card>
    </div>
  );
}

// ── ESPACE PRO ────────────────────────────────────────────────────────────────
function ProSpace({ clients, setClients, smsLog, setSmsLog, promos, onLogout }) {
  const [account, setAccount] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  if (!account) return <ProLoginPage onLogin={setAccount} onBack={onLogout} />;

  const isAdmin = account.role === "superadmin";
  const TABS = isAdmin
    ? [{ id: "dashboard", label: "Vue globale", icon: "🔧" }]
    : [
        { id: "dashboard", label: "Accueil", icon: "🏠" },
        { id: "caisse", label: "Caisse", icon: "🖥️" },
        { id: "sms", label: "SMS", icon: "💬" },
        { id: "stats", label: "Stats", icon: "📊" },
      ];

  const currentTab = TABS.find(t => t.id === tab);

  const handleTabChange = (id) => {
    setTab(id);
    setMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f8f8f8", minHeight: "100vh" }}>

      {/* Overlay menu mobile */}
      {menuOpen && (
        <div
          onClick={() => setMenuOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 150, backdropFilter: "blur(2px)" }}
        />
      )}

      {/* Topbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "0 16px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200 }}>

        {/* Bouton hamburger + titre */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{ background: menuOpen ? "#FF4D00" : "#f4f4f5", border: "none", borderRadius: 10, width: 38, height: 38, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
            {menuOpen ? (
              <span style={{ fontSize: 18, color: "#fff", lineHeight: 1 }}>✕</span>
            ) : (
              <>
                <div style={{ width: 18, height: 2, background: "#18181b", borderRadius: 99 }} />
                <div style={{ width: 18, height: 2, background: "#18181b", borderRadius: 99 }} />
                <div style={{ width: 18, height: 2, background: "#18181b", borderRadius: 99 }} />
              </>
            )}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18 }}>🍕</span>
            <span style={{ fontFamily: "Syne, serif", fontWeight: 800, fontSize: 15 }}>{APP_NAME}</span>
            {isAdmin && <span style={{ fontSize: 9, background: "#18181b", color: "#fff", padding: "2px 6px", borderRadius: 99, fontWeight: 700 }}>ADMIN</span>}
          </div>
        </div>

        {/* Section courante + déconnexion */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ background: "#fff5f2", border: "1px solid #ffd0c0", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: "#FF4D00" }}>
            {currentTab?.icon} {currentTab?.label}
          </div>
          <button onClick={() => { setAccount(null); onLogout(); }} style={{ background: "#f4f4f5", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, cursor: "pointer", color: "#71717a", fontFamily: "inherit" }}>
            Quitter
          </button>
        </div>
      </div>

      {/* Menu latéral coulissant */}
      <div style={{
        position: "fixed", top: 58, left: 0, bottom: 0,
        width: 220, background: "#fff",
        borderRight: "1px solid #f0f0f0",
        padding: "16px 10px",
        display: "flex", flexDirection: "column", gap: 3,
        transform: menuOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        zIndex: 160,
        boxShadow: menuOpen ? "4px 0 24px rgba(0,0,0,0.12)" : "none",
      }}>

        {/* Info restaurant */}
        <div style={{ padding: "12px 14px", borderRadius: 12, background: "linear-gradient(135deg, #FF4D00 0%, #ff8c42 100%)", marginBottom: 12 }}>
          <div style={{ fontWeight: 800, color: "#fff", fontSize: 14 }}>{isAdmin ? APP_NAME : account.restoName}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{account.owner}</div>
          {!isAdmin && <div style={{ marginTop: 6, fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{clients.filter(c => c.restoId === account.id).length} clients · Plan {account.plan}</div>}
        </div>

        {/* Onglets */}
        {TABS.map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "12px 14px", borderRadius: 10, border: "none",
            background: tab === t.id ? "#FF4D00" : "transparent",
            color: tab === t.id ? "#fff" : "#71717a",
            fontWeight: tab === t.id ? 700 : 500,
            fontSize: 14, cursor: "pointer", fontFamily: "inherit", textAlign: "left",
            transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>{t.label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        {/* Déconnexion */}
        <button onClick={() => { setAccount(null); onLogout(); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 10, border: "1.5px solid #f0f0f0", background: "#fff", color: "#71717a", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600, width: "100%" }}>
          🚪 Déconnexion
        </button>
      </div>

      {/* Barre de navigation mobile en bas (alternative rapide) */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #f0f0f0",
        display: "flex", zIndex: 140,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => handleTabChange(t.id)} style={{
            flex: 1, padding: "10px 4px 8px", border: "none",
            background: "transparent", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            fontFamily: "inherit",
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === t.id ? 800 : 500, color: tab === t.id ? "#FF4D00" : "#a1a1aa" }}>{t.label}</span>
            {tab === t.id && <div style={{ width: 20, height: 3, background: "#FF4D00", borderRadius: 99 }} />}
          </button>
        ))}
      </div>

      {/* Contenu principal */}
      <div style={{ padding: "16px 16px 100px 16px", overflowY: "auto", minHeight: "calc(100vh - 58px)" }}>
        {tab === "dashboard" && !isAdmin && <Dashboard account={account} clients={clients} smsLog={smsLog} promos={promos} />}
        {tab === "dashboard" && isAdmin && <SuperAdminView clients={clients} smsLog={smsLog} />}
        {tab === "caisse" && <CaisseView account={account} clients={clients} setClients={setClients} promos={promos} setSmsLog={setSmsLog} />}
        {tab === "sms" && <SMSCampagnes account={account} clients={clients} smsLog={smsLog} setSmsLog={setSmsLog} />}
        {tab === "stats" && <StatsView account={account} clients={clients} />}
      </div>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home"); // home | client | pro
  const [clients, setClients] = useState(INIT_CLIENTS);
  const [smsLog, setSmsLog] = useState(INIT_SMS_LOG);
  const [promos] = useState(INIT_PROMOS);

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Syne:wght@700;800&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 99px; } @keyframes scan { 0%,100%{top:20%} 50%{top:75%} }`}</style>

      {page === "home" && (
        <HomePage
          onClientAccess={() => setPage("client")}
          onProAccess={() => setPage("pro")}
        />
      )}

      {page === "client" && (
        <ClientAccessPage
          clients={clients}
          setClients={setClients}
          promos={promos}
          onBack={() => setPage("home")}
        />
      )}

      {page === "pro" && (
        <ProSpace
          clients={clients}
          setClients={setClients}
          smsLog={smsLog}
          setSmsLog={setSmsLog}
          promos={promos}
          onLogout={() => setPage("home")}
        />
      )}
    </>
  );
}
