/* ============================================================================
   Pratetap daftar arahan. Dipakai bersama oleh beranda (drill-down US-F1/F2),
   notifikasi, dan register agar angka di kartu selalu sama dengan isi daftar.
   ========================================================================== */

import { CLOSED_STATUSES, PRE_REGISTER_STATUSES } from "./data";
import { daysUntil, isLate, needsKendala, needsPic, wasCompletedLate } from "./ui";

const isActive = (item) => !CLOSED_STATUSES.includes(item.status) && !PRE_REGISTER_STATUSES.includes(item.status);

export const PRESETS = {
  all: {
    id: "all", label: "Semua arahan",
    description: "Seluruh arahan yang dapat Anda akses",
    matches: () => true,
  },
  active: {
    id: "active", label: "Arahan aktif",
    description: "Telah tayang pada register dan belum selesai",
    matches: isActive,
  },
  done: {
    id: "done", label: "Selesai",
    description: "Arahan yang telah disetujui penyelesaiannya",
    matches: (item) => item.status === "Selesai",
  },
  late: {
    id: "late", label: "Terlambat",
    description: "Telah melewati deadline dan belum selesai",
    matches: isLate,
  },
  doneLate: {
    id: "doneLate", label: "Selesai (terlambat)",
    description: "Disetujui selesai setelah melewati deadline yang ditetapkan semula",
    matches: wasCompletedLate,
  },
  inProgress: {
    id: "inProgress", label: "Dalam proses",
    description: "Sedang berjalan dan belum melewati deadline",
    matches: (item) => isActive(item) && !isLate(item),
  },
  dueSoon: {
    id: "dueSoon", label: "Deadline dekat",
    description: "Jatuh tempo dalam 7 hari ke depan",
    matches: (item) => isActive(item) && daysUntil(item.deadline) >= 0 && daysUntil(item.deadline) <= 7,
  },
  attention: {
    id: "attention", label: "Perlu tindakan",
    description: "Terlambat, menunggu keputusan, atau menunggu pemeriksaan",
    matches: (item) => isActive(item) && (isLate(item) || ["Menunggu Keputusan", "Menunggu Verifikasi"].includes(item.status)),
  },
  needsKendala: {
    id: "needsKendala", label: "Kendala belum dicatat",
    description: "Terlambat melewati ambang waktu tanpa catatan kendala",
    matches: needsKendala,
  },
  needsPic: {
    id: "needsPic", label: "Belum ada penanggung jawab",
    description: "Telah didisposisikan namun belum memiliki penanggung jawab pelaksana",
    matches: needsPic,
  },
  unassigned: {
    id: "unassigned", label: "Belum didisposisikan",
    description: "Telah lolos kurasi namun belum memiliki unit penanggung jawab",
    matches: (item) => item.status === "Belum Ditugaskan",
  },
  preRegister: {
    id: "preRegister", label: "Belum tayang",
    description: "Masih dalam antrean konfirmasi atau kurasi",
    matches: (item) => PRE_REGISTER_STATUSES.includes(item.status),
  },
  awaitingDecision: {
    id: "awaitingDecision", label: "Menunggu keputusan",
    description: "Pengajuan perubahan deadline atau pemindahan unit yang belum diputuskan",
    matches: (item) => item.status === "Menunggu Keputusan",
  },
  awaitingReview: {
    id: "awaitingReview", label: "Menunggu pemeriksaan",
    description: "Penyelesaian telah diajukan dan menunggu pemeriksaan",
    matches: (item) => item.status === "Menunggu Verifikasi",
  },
  outsidePriority: {
    id: "outsidePriority", label: "Di luar prioritas Badan",
    description: "Ditandai tidak sejalan dengan arah strategis Badan",
    matches: (item) => item.alignment === "Di Luar Prioritas",
  },
  unscored: {
    id: "unscored", label: "Belum dinilai prioritasnya",
    description: "Belum memiliki nilai upaya dan dampak",
    matches: (item) => isActive(item) && item.effort == null,
  },
};

/** Pratetap dinamis untuk drill-down yang bergantung nilai kolom. */
export function presetByField(field, value, label, description) {
  return { id: `${field}:${value}`, label, description, matches: (item) => item[field] === value };
}

export function presetByKendala(category) {
  return {
    id: `kendala:${category}`,
    label: `Kendala: ${category}`,
    description: "Arahan terlambat dengan kategori kendala ini",
    matches: (item) => item.kendala?.category === category,
  };
}

export function presetByUnit(short) {
  return {
    id: `unit:${short}`,
    label: `Unit ${short}`,
    description: "Seluruh arahan pada unit ini",
    matches: (item) => item.unit === short,
  };
}

export function presetByPic(name) {
  return {
    id: `pic:${name || "-"}`,
    label: name ? `Penanggung jawab: ${name}` : "Belum ada penanggung jawab",
    description: name ? "Seluruh arahan yang ditugaskan kepada orang ini" : "Arahan yang belum memiliki penanggung jawab pelaksana",
    matches: (item) => (item.pic || null) === (name || null),
  };
}
