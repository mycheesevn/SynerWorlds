# SynerWorlds

Cổng chung (portal) của các trò chơi trí tuệ SynerWork — Cờ Tướng (PacClone),
Cờ Vua (Chess), Cờ Chiếu Tướng, Cờ Gánh — và là nơi đặt **hồ sơ kỳ thủ công
khai** xuyên mọi game.

- `/` — trang chủ portal: danh mục game + cao thủ đa game + tìm kỳ thủ.
- `/u/<handle>` — hồ sơ công khai của một kỳ thủ ở tất cả các game.
- `/api/og/<handle>` — ảnh xem trước (OG) tự sinh cho link chia sẻ.
- Tương lai (đã giữ chỗ route): `/games` (danh mục sâu), `/lounge` (cộng đồng).

Dữ liệu đọc trực tiếp từ Supabase dùng chung của cả gia đình game qua các
RPC SECURITY DEFINER trong `supabase/migrations/` (chỉ-đọc, không đồng bộ,
không sao chép). Game mới xuất hiện trên mọi hồ sơ bằng 1 dòng đăng ký
trong bảng `game_registry` + bảng `<prefix>_stats` theo khuôn chuẩn.

Thiết kế đầy đủ: xem tài liệu thiết kế SynerWorlds (public profile hub).
