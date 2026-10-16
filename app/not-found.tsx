import Link from "next/link";

export default function NotFound() {
  return (
    <div className="notice">
      <span className="big-emoji">🔍</span>
      Không tìm thấy trang này. / This page could not be found.
      <div style={{ marginTop: 12 }}>
        <Link href="/">← Về trang chủ SynerWorlds</Link>
      </div>
    </div>
  );
}
