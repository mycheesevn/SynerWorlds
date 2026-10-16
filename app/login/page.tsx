"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { s, type Lang } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const lang: Lang = "vi";
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const google = async () => {
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) setError(`${s("loginError", lang)}: ${error.message}`);
  };

  const facebook = async () => {
    setError("");
    const { error } = await supabaseBrowser().auth.signInWithOAuth({
      provider: "facebook",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) setError(`${s("loginError", lang)}: ${error.message}`);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    const sb = supabaseBrowser();
    try {
      if (mode === "in") {
        const { error } = await sb.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else {
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setNotice(s("checkEmail", lang));
        }
      }
    } catch (err) {
      setError(
        `${s("loginError", lang)}: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <h1 style={{ fontSize: 26, margin: "6px 0 4px" }}>
        {s("loginTitle", lang)}
      </h1>
      <p style={{ color: "var(--muted)", margin: "0 0 18px" }}>
        {s("loginSub", lang)}
      </p>

      <button type="button" className="btn google" onClick={google}>
        <b>G</b> {s("googleBtn", lang)}
      </button>
      <button
        type="button"
        className="btn google"
        style={{ marginTop: 10 }}
        onClick={facebook}
      >
        <b style={{ color: "#1877f2" }}>f</b> {s("facebookBtn", lang)}
      </button>
      <div className="or-row">
        <span>{s("orDivider", lang)}</span>
      </div>

      <form onSubmit={submit} className="login-form">
        <label>
          {s("email", lang)}
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          {s("password", lang)}
          <input
            type="password"
            required
            autoComplete={mode === "in" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <div className="form-error">{error}</div>}
        {notice && <div className="form-notice">{notice}</div>}
        <button type="submit" className="btn" disabled={busy}>
          {mode === "in" ? s("signInBtn", lang) : s("signUpBtn", lang)}
        </button>
      </form>

      <button
        type="button"
        className="linklike"
        onClick={() => {
          setMode(mode === "in" ? "up" : "in");
          setError("");
          setNotice("");
        }}
      >
        {mode === "in" ? s("noAccount", lang) : s("haveAccount", lang)}
      </button>
    </div>
  );
}
