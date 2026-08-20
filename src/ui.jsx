/* ============================================================================
   Primitif UI dan helper yang dipakai bersama seluruh halaman.
   ========================================================================== */

import {
  ArrowRight, ArrowsClockwise, CalendarDots, CheckCircle, CircleDashed, ClipboardText,
  Flag, MagnifyingGlass, ShieldCheck, WarningCircle, X,
} from "@phosphor-icons/react";
import { getInitials, CLOSED_STATUSES, PRE_REGISTER_STATUSES, SLA } from "./data";

/** Tanggal acuan prototipe. */
export const TODAY = new Date("2026-08-13T00:00:00+07:00");
export const TODAY_ISO = "2026-08-13";
export const TODAY_LABEL = "Kamis, 13 Agustus 2026";
export const NOW_LABEL = "13 Agu 2026, baru saja";

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export function daysUntil(dateString) {
  if (!dateString) return 0;
  const target = new Date(`${dateString}T00:00:00+07:00`);
  return Math.round((target.getTime() - TODAY.getTime()) / 86400000);
}

/** Format `2026-08-20` menjadi `20 Agu 2026`. */
export function formatDate(iso) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS_SHORT[Number(month) - 1]} ${year}`;
}

export function formatDateLong(iso) {
  if (!iso) return "—";
  const [year, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

/** Terlambat adalah penanda turunan, bukan status (US-D1). */
export function isLate(item) {
  return !CLOSED_STATUSES.includes(item.status)
    && !PRE_REGISTER_STATUSES.includes(item.status)
    && daysUntil(item.deadline) < 0;
}

export function lateDays(item) {
  return isLate(item) ? Math.abs(daysUntil(item.deadline)) : 0;
}

/** Terlambat lewat ambang dan belum ada catatan kendala (US-D6). */
export function needsKendala(item) {
  return isLate(item) && lateDays(item) >= SLA.kendalaAfterLateDays && !item.kendala;
}

/** Sudah didisposisikan tapi belum ada PIC melewati ambang (US-C2). */
export function needsPic(item) {
  return Boolean(item.unit) && !item.pic
    && !CLOSED_STATUSES.includes(item.status)
    && daysUntil(item.date) <= -SLA.picMaxDays;
}

/** Selesai, tapi baru disetujui setelah melewati deadline aslinya (US-F1). */
export function wasCompletedLate(item) {
  return item.status === "Selesai" && Boolean(item.completedAt) && Boolean(item.originalDeadline)
    && item.completedAt > item.originalDeadline;
}

export function deadlineUrgency(item) {
  if (item.status === "Selesai") return "Selesai";
  if (item.status === "Dibatalkan") return "Dibatalkan";
  const days = daysUntil(item.deadline);
  if (days < 0) return `Terlambat ${Math.abs(days)} hari`;
  if (days === 0) return "Deadline hari ini";
  if (days === 1) return "Deadline besok";
  return `${days} hari lagi`;
}

export const STATUS_META = {
  "Menunggu Konfirmasi": { label: "Menunggu konfirmasi", className: "warning", icon: CalendarDots },
  "Menunggu Kurasi": { label: "Menunggu kurasi", className: "guide", icon: ClipboardText },
  "Belum Ditugaskan": { label: "Belum ditugaskan", className: "neutral", icon: CircleDashed },
  "Belum Mulai": { label: "Belum mulai", className: "neutral", icon: CircleDashed },
  "Sedang Berjalan": { label: "Sedang berjalan", className: "info", icon: ArrowsClockwise },
  "Menunggu Verifikasi": { label: "Menunggu pemeriksaan", className: "guide", icon: ShieldCheck },
  "Menunggu Keputusan": { label: "Menunggu keputusan", className: "warning", icon: Flag },
  Selesai: { label: "Selesai", className: "success", icon: CheckCircle },
  Dibatalkan: { label: "Dibatalkan", className: "muted", icon: X },
};

/** Status yang boleh dipilih langsung oleh pemilik pekerjaan (US-D1). */
export const WORKABLE_STATUSES = ["Belum Mulai", "Sedang Berjalan"];

export const SOURCE_META = {
  Tertulis: { label: "Tertulis", className: "written" },
  Lisan: { label: "Lisan", className: "verbal" },
  Publik: { label: "Publik", className: "public" },
};

export function sourceLabel(source) {
  return SOURCE_META[source]?.label || source;
}

export function Avatar({ name, color = "#071E49", size = "md", title }) {
  return (
    <span className={`avatar avatar-${size}`} style={{ "--avatar": color }} title={title || name}>
      {getInitials(name)}
    </span>
  );
}

export function StatusBadge({ status, compact = false }) {
  const meta = STATUS_META[status] || STATUS_META["Belum Mulai"];
  const Icon = meta.icon;
  return (
    <span className={`status-badge ${meta.className} ${compact ? "compact" : ""}`}>
      <Icon size={13} weight="bold" />
      {meta.label}
    </span>
  );
}

/** Penanda terlambat, ditempel di samping status (US-D1). */
export function LateBadge({ item, compact = false }) {
  if (!isLate(item)) return null;
  return (
    <span className={`status-badge danger ${compact ? "compact" : ""}`} title={`Melewati deadline ${formatDate(item.deadline)}`}>
      <WarningCircle size={13} weight="bold" />
      Terlambat {lateDays(item)} hari
    </span>
  );
}

export function IconButton({ label, children, className = "", ...props }) {
  return (
    <button className={`icon-button ${className}`} aria-label={label} title={label} {...props}>
      {children}
    </button>
  );
}

export function Modal({ title, subtitle, onClose, children, wide = false }) {
  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className={`modal-card ${wide ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-label={title}>
        <header className="modal-header">
          <div>
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <IconButton label="Tutup" onClick={onClose}><X size={20} /></IconButton>
        </header>
        {children}
      </section>
    </div>
  );
}

export function EmptyState({ title, body, actionLabel = "Hapus filter", action }) {
  return (
    <div className="empty-state">
      <span><MagnifyingGlass size={30} /></span>
      <h3>{title}</h3>
      <p>{body}</p>
      {action && <button onClick={action}>{actionLabel}</button>}
    </div>
  );
}

export function EmptyInline({ icon: Icon = CheckCircle, text }) {
  return <div className="empty-inline"><span><Icon size={24} /></span><p>{text}</p></div>;
}

export function PageHeading({ eyebrow, title, description, children }) {
  return (
    <section className="page-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {children && <div className="heading-actions">{children}</div>}
    </section>
  );
}

export function Toast({ toast, onClose }) {
  if (!toast) return null;
  return (
    <button className={`toast ${toast.type || "success"}`} onClick={onClose}>
      {toast.type === "error" ? <WarningCircle size={20} weight="fill" /> : <CheckCircle size={20} weight="fill" />}
      <span><strong>{toast.title}</strong><small>{toast.message}</small></span>
      <X size={16} />
    </button>
  );
}

/** Panel penjelas yang menautkan tampilan ke butir dokumen US/AC. */
export function SpecNote({ code, children }) {
  return (
    <p className="spec-note"><span>{code}</span>{children}</p>
  );
}

export function InlineLink({ children, ...props }) {
  return <button className="simple-link" {...props}>{children} <ArrowRight size={16} /></button>;
}

/** Unduh berkas sungguhan dari sisi peramban (US-F4). */
export function downloadFile(filename, content, mime = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function toCsv(rows) {
  return rows
    .map((row) => row.map((cell) => {
      const value = cell == null ? "" : String(cell);
      return /[",\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
    }).join(";"))
    .join("\n");
}
