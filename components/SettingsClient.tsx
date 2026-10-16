"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  fetchMyProfile,
  updateMyProfile,
  uploadAvatar,
  type MyProfile,
} from "@/lib/profile";
import { s, type Lang } from "@/lib/i18n";

type Phase = "loading" | "anon" | "ready";

export default function SettingsClient({ lang }: { lang: Lang }) {
  const [phase, setPhase] = useState<Phase>("loading");
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [msg, setMsg] = useState("");
  const [msgOk, setMsgOk] = useState("");
  const [avatarMsg, setAvatarMsg] = useState("");
  const [privacyMsg, setPrivacyMsg] = useState("");
  const [newHandle, setNewHandle] = useState("");
  const [handleConfirming, setHandleConfirming] = useState(false);
  const [handleBusy, setHandleBusy] = useState(false);
  const [handleMsg, setHandleMsg] = useState("");
  const [handleOk, setHandleOk] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [pwOk, setPwOk] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const p = await fetchMyProfile();
      if (cancelled) return;
      if (!p) {
        setPhase("anon");
        return;
      }
      setProfile(p);
      setFullName(p.full_name ?? "");
      setBirthDate(p.birth_date ?? "");
      setCity(p.city ?? "");
      setCountry(p.country ?? "");
      setPhase("ready");
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (phase === "loading") return null;

  if (phase === "anon" || !profile) {
    return (
      <div className="notice" style={{ marginTop: 18 }}>
        <p style={{ margin: "0 0 12px" }}>{s("settingsLoginPrompt", lang)}</p>
        <Link className="btn" href="/login">
          {s("login", lang)}
        </Link>
      </div>
    );
  }

  const displayName =
    profile.full_name || profile.username || profile.email?.split("@")[0] || "Player";
  const profileUrl = profile.handle
    ? `${window.location.origin}/u/${profile.handle}`
    : "";

  const onAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setAvatarMsg("");
    const { url, error } = await uploadAvatar(file);
    if (error || !url) {
      setAvatarMsg(`${s("avatarError", lang)}${error ? `: ${error}` : ""}`);
      return;
    }
    const err = await updateMyProfile({ avatar_url: url });
    if (err) {
      setAvatarMsg(`${s("avatarError", lang)}: ${err}`);
      return;
    }
    setProfile({ ...profile, avatar_url: url });
  };

  const save = async () => {
    setBusy(true);
    setMsg("");
    setMsgOk("");
    const err = await updateMyProfile({
      full_name: fullName.trim() || null,
      birth_date: birthDate || null,
      city: city.trim() || null,
      country: country.trim() || null,
    });
    setBusy(false);
    if (err) {
      setMsg(`${s("saveError", lang)}: ${err}`);
      return;
    }
    setMsgOk(s("savedOk", lang));
  };

  const share = async () => {
    setMsg("");
    setMsgOk("");
    try {
      await navigator.clipboard.writeText(profileUrl);
      setMsgOk(s("linkCopied", lang));
    } catch {
      setMsg(profileUrl);
    }
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(profile.referral_code ?? "");
      setMsgOk(s("copied", lang));
    } catch {
      /* clipboard unavailable — the code stays visible to copy manually */
    }
  };

  const HANDLE_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const handleNextChange = profile?.handle_changed_at
    ? new Date(
        new Date(profile.handle_changed_at).getTime() + 30 * 24 * 3600 * 1000,
      )
    : null;
  const handleCooling =
    !!handleNextChange && handleNextChange.getTime() > Date.now();

  const handleErrorText = (message: string): string => {
    if (message.includes("invalid handle")) return s("handleErrInvalid", lang);
    if (message.includes("handle taken")) return s("handleErrTaken", lang);
    if (message.includes("handle is reserved"))
      return s("handleErrReserved", lang);
    if (message.includes("handle change too soon"))
      return s("handleErrSoon", lang);
    return `${s("saveError", lang)}: ${message}`;
  };

  const submitHandle = async () => {
    if (!profile) return;
    const value = newHandle.trim().toLowerCase();
    setHandleMsg("");
    setHandleOk("");
    if (value.length < 3 || value.length > 24 || !HANDLE_RE.test(value)) {
      setHandleMsg(s("handleErrInvalid", lang));
      return;
    }
    setHandleBusy(true);
    const { data, error } = await supabaseBrowser().rpc("hub_set_handle", {
      p_handle: value,
    });
    setHandleBusy(false);
    if (error) {
      setHandleMsg(handleErrorText(error.message));
      return;
    }
    const out = data as { handle?: string } | null;
    setProfile({
      ...profile,
      handle: out?.handle ?? value,
      handle_changed_at: new Date().toISOString(),
    });
    setNewHandle("");
    setHandleConfirming(false);
    setHandleOk(s("handleChangedOk", lang));
  };

  const togglePrivacy = async (next: boolean) => {
    setPrivacyMsg("");
    const prev = profile.profile_public;
    setProfile({ ...profile, profile_public: next });
    const err = await updateMyProfile({ profile_public: next });
    if (err) {
      setProfile({ ...profile, profile_public: prev });
      setPrivacyMsg(`${s("saveError", lang)}: ${err}`);
    }
  };

  const changePassword = async () => {
    setPwMsg("");
    setPwOk("");
    if (pw.length < 6) {
      setPwMsg(s("pwTooShort", lang));
      return;
    }
    if (pw !== pw2) {
      setPwMsg(s("pwMismatch", lang));
      return;
    }
    const { error } = await supabaseBrowser().auth.updateUser({ password: pw });
    if (error) {
      setPwMsg(`${s("pwError", lang)}: ${error.message}`);
      return;
    }
    setPw("");
    setPw2("");
    setPwOk(s("pwChanged", lang));
  };

  const logout = async () => {
    await supabaseBrowser().auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="settings-wrap">
      <h1 style={{ fontSize: 26, margin: "6px 0 18px" }}>
        {s("settingsTitle", lang)}
      </h1>

      {/* avatar row */}
      <div className="set-avatar-row">
        <span className="avatar lg" aria-hidden>
          {profile.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" />
          ) : (
            displayName.charAt(0).toUpperCase()
          )}
        </span>
        <div>
          <button
            type="button"
            className="btn ghost"
            onClick={() => fileRef.current?.click()}
          >
            {s("changeAvatar", lang)}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={onAvatarFile}
          />
          {avatarMsg && (
            <p className="set-error" role="alert">
              {avatarMsg}
            </p>
          )}
        </div>
      </div>

      {/* editable fields */}
      <div className="hub-form">
        <label>
          {s("fullName", lang)}
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </label>
        <label>
          {s("birthDate", lang)}
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
          />
        </label>
        <label>
          {s("city", lang)}
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </label>
        <label>
          {s("country", lang)}
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
        </label>
      </div>

      {/* read-only block */}
      <dl className="readonly-grid">
        <div>
          <dt>{s("usernameL", lang)}</dt>
          <dd>{profile.username ?? "—"}</dd>
        </div>
        <div>
          <dt>{s("emailL", lang)}</dt>
          <dd>{profile.email ?? "—"}</dd>
        </div>
        {profile.handle && (
          <div>
            <dt>{s("publicProfile", lang)}</dt>
            <dd>
              <Link href={`/u/${profile.handle}`}>/u/{profile.handle}</Link>
            </dd>
          </div>
        )}
      </dl>

      {msg && (
        <p className="set-error" role="alert">
          {msg}
        </p>
      )}
      {msgOk && <p className="set-ok">{msgOk}</p>}
      <div className="btn-row">
        <button type="button" className="btn" onClick={save} disabled={busy}>
          {s("saveBtn", lang)}
        </button>
        {profile.handle && (
          <>
            <button type="button" className="btn ghost" onClick={share}>
              {s("shareProfileBtn", lang)}
            </button>
            <a
              className="btn ghost"
              href={`/api/og/${profile.handle}`}
              download={`synerworlds-${profile.handle}.png`}
            >
              {s("downloadCard", lang)}
            </a>
          </>
        )}
      </div>

      {/* referral */}
      {profile.referral_code && (
        <section className="set-section">
          <h2>{s("referralTitle", lang)}</h2>
          <p style={{ color: "var(--muted)", margin: "0 0 10px" }}>
            {s("referralText", lang)}
          </p>
          <div className="ref-row">
            <span>
              {s("referralCode", lang)}: <b>{profile.referral_code}</b>
            </span>
            <button type="button" className="btn ghost" onClick={copyCode}>
              {s("copyBtn", lang)}
            </button>
          </div>
        </section>
      )}

      {/* public handle */}
      <section className="set-section">
        <h2>{s("handleTitle", lang)}</h2>
        <p style={{ margin: "0 0 10px" }}>
          <b>@{profile.handle}</b>
          {profile.handle && (
            <>
              {" · "}
              <Link href={`/u/${profile.handle}`}>/u/{profile.handle}</Link>
            </>
          )}
        </p>
        {handleCooling && handleNextChange ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {s("handleCooldownNote", lang)}{" "}
            {handleNextChange.toLocaleDateString(
              lang === "vi" ? "vi-VN" : "en-US",
            )}
          </p>
        ) : handleConfirming ? (
          <>
            <p style={{ margin: "0 0 8px", fontSize: 17 }}>
              <b>@{profile.handle}</b> →{" "}
              <b>@{newHandle.trim().toLowerCase()}</b>
            </p>
            <p style={{ color: "var(--muted)", margin: "0 0 4px" }}>
              {s("handleWarn", lang).replace("{old}", profile.handle ?? "")}
            </p>
            <div className="btn-row">
              <button
                type="button"
                className="btn"
                disabled={handleBusy}
                onClick={submitHandle}
              >
                {s("handleConfirmBtn", lang)}
              </button>
              <button
                type="button"
                className="btn ghost"
                disabled={handleBusy}
                onClick={() => setHandleConfirming(false)}
              >
                {s("handleCancelBtn", lang)}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="hub-form">
              <label>
                {s("handleNewLabel", lang)}
                <input
                  type="text"
                  value={newHandle}
                  maxLength={24}
                  placeholder={profile.handle ?? ""}
                  onChange={(e) => setNewHandle(e.target.value.toLowerCase())}
                />
              </label>
            </div>
            <p style={{ color: "var(--muted)", margin: "8px 0 0" }}>
              {s("handleRules", lang)}
            </p>
            <div className="btn-row">
              <button
                type="button"
                className="btn"
                disabled={
                  !newHandle.trim() ||
                  newHandle.trim().toLowerCase() === profile.handle
                }
                onClick={() => {
                  setHandleMsg("");
                  setHandleOk("");
                  setHandleConfirming(true);
                }}
              >
                {s("handleChangeBtn", lang)}
              </button>
            </div>
          </>
        )}
        {handleMsg && (
          <p className="set-error" role="alert">
            {handleMsg}
          </p>
        )}
        {handleOk && <p className="set-ok">{handleOk}</p>}
      </section>

      {/* privacy */}
      <section className="set-section">
        <h2>{s("privacyTitle", lang)}</h2>
        <label className="switch-row">
          <span>{s("privacyPublic", lang)}</span>
          <input
            type="checkbox"
            checked={profile.profile_public}
            onChange={(e) => togglePrivacy(e.target.checked)}
          />
        </label>
        <p style={{ color: "var(--muted)", margin: "8px 0 0" }}>
          {s("privacyText", lang)}
        </p>
        {privacyMsg && (
          <p className="set-error" role="alert">
            {privacyMsg}
          </p>
        )}
      </section>

      {/* password */}
      <section className="set-section">
        <h2>{s("passwordTitle", lang)}</h2>
        <div className="hub-form">
          <label>
            {s("newPassword", lang)}
            <input
              type="password"
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </label>
          <label>
            {s("confirmPassword", lang)}
            <input
              type="password"
              autoComplete="new-password"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
            />
          </label>
        </div>
        {pwMsg && (
          <p className="set-error" role="alert">
            {pwMsg}
          </p>
        )}
        {pwOk && <p className="set-ok">{pwOk}</p>}
        <div className="btn-row">
          <button type="button" className="btn" onClick={changePassword}>
            {s("changePwBtn", lang)}
          </button>
        </div>
      </section>

      <div className="btn-row" style={{ marginTop: 26 }}>
        <button type="button" className="btn danger" onClick={logout}>
          {s("logout", lang)}
        </button>
      </div>
    </div>
  );
}
