import React, { useState } from "react";
import { Factory } from "lucide-react";
import { supabase } from "../supabaseClient";
import { Button, Field, inputStyle } from "../components/ui.jsx";
import { FALLBACK_THEME, SIGNUP_NICHES } from "../theme";

export default function Login() {
  const theme = FALLBACK_THEME;
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [nicheSlug, setNicheSlug] = useState("bolsas");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // niche_slug e full_name viram raw_user_meta_data e são lidos pelo
        // trigger handle_new_user() no banco para já criar o profile certo.
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, niche_slug: nicheSlug } },
        });
        if (error) throw error;
        setInfo("Conta criada! Verifique seu e-mail para confirmar o acesso.");
      }
    } catch (err) {
      setError(err.message || "Algo deu errado.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.bg, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: 16, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Factory size={19} />
          </div>
          <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700 }}>Precifica</div>
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 18, background: theme.surfaceAlt, borderRadius: 10, padding: 4 }}>
          {["login", "signup"].map((m) => (
            <button key={m} onClick={() => setMode(m)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 13, background: mode === m ? theme.surface : "transparent",
              }}>
              {m === "login" ? "Entrar" : "Criar conta"}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {mode === "signup" && (
            <>
              <Field label="Seu nome">
                <input style={inputStyle(theme)} value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </Field>
              <Field label="Tipo de negócio" hint="Isso define o tema e os campos do seu app">
                <select style={inputStyle(theme)} value={nicheSlug} onChange={(e) => setNicheSlug(e.target.value)}>
                  {SIGNUP_NICHES.map((n) => <option key={n.slug} value={n.slug}>{n.name}</option>)}
                </select>
              </Field>
            </>
          )}
          <Field label="E-mail">
            <input type="email" style={inputStyle(theme)} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Senha">
            <input type="password" style={inputStyle(theme)} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </Field>
          {error && <div style={{ color: theme.danger, fontSize: 12.5, marginBottom: 10 }}>{error}</div>}
          {info && <div style={{ color: theme.good, fontSize: 12.5, marginBottom: 10 }}>{info}</div>}
          <Button theme={theme} type="submit" style={{ width: "100%", justifyContent: "center" }} disabled={loading}>
            {loading ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </form>
      </div>
    </div>
  );
}
