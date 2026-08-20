/* ============================================================================
   US-F5 — Log audit sistem. Catatan hanya dapat bertambah; tidak tersedia
   antarmuka untuk menyunting maupun menghapus entri.
   ========================================================================== */

import { useMemo, useState } from "react";
import { DownloadSimple, LockKey, MagnifyingGlass, ShieldCheck, X } from "@phosphor-icons/react";
import { hasPermission } from "../data";
import { EmptyState, PageHeading, downloadFile, toCsv } from "../ui";

const OBJECT_TYPES = ["Arahan", "Agenda", "Peran", "Pengguna", "Unit", "Laporan", "Sesi"];

export default function AuditPage({ auditLog, activeRole, showToast, logAudit }) {
  const [search, setSearch] = useState("");
  const [actor, setActor] = useState("");
  const [objectType, setObjectType] = useState("");
  const [range, setRange] = useState({ from: "", to: "" });

  const actors = useMemo(() => [...new Set(auditLog.map((entry) => entry.actor))].sort(), [auditLog]);

  const filtered = useMemo(() => auditLog.filter((entry) => {
    const day = entry.at.slice(0, 10);
    if (search.trim() && !`${entry.action} ${entry.objectId} ${entry.detail} ${entry.actor}`.toLowerCase().includes(search.trim().toLowerCase())) return false;
    if (actor && entry.actor !== actor) return false;
    if (objectType && entry.object !== objectType) return false;
    if (range.from && day < range.from) return false;
    if (range.to && day > range.to) return false;
    return true;
  }), [auditLog, search, actor, objectType, range]);

  const exportLog = () => {
    const header = ["Waktu", "Pelaku", "Aksi", "Jenis objek", "Objek", "Keterangan"];
    const rows = filtered.map((entry) => [entry.at, entry.actor, entry.action, entry.object, entry.objectId, entry.detail]);
    downloadFile(`log-audit-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([header, ...rows]));
    logAudit("Mengunduh log audit", "Laporan", "log-audit.csv", `${filtered.length} entri`);
    showToast("Log audit terunduh", `${filtered.length} entri tersimpan dalam berkas CSV.`);
  };

  const reset = () => { setSearch(""); setActor(""); setObjectType(""); setRange({ from: "", to: "" }); };
  const filterCount = [actor, objectType, range.from, range.to].filter(Boolean).length;

  return (
    <div className="page-container audit-page">
      <PageHeading
        eyebrow="Pengawasan"
        title="Log audit sistem"
        description="Setiap perubahan data, upaya masuk sistem, dan pengunduhan laporan tercatat beserta pelaku dan waktunya."
      >
        {hasPermission(activeRole, "laporan.ekspor") && (
          <button className="button secondary" onClick={exportLog}><DownloadSimple size={18} /> Unduh log</button>
        )}
      </PageHeading>

      <div className="audit-notice">
        <LockKey size={19} weight="duotone" />
        <p>Catatan pada log <strong>hanya dapat bertambah</strong>. Tidak tersedia cara untuk mengubah atau menghapus entri melalui antarmuka mana pun, termasuk oleh Admin.</p>
      </div>

      <section className="card table-card">
        <div className="table-toolbar">
          <div className="search-row">
            <div className="search-field">
              <MagnifyingGlass size={20} />
              <input
                type="search"
                aria-label="Cari log audit"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari tindakan, objek, pelaku, atau keterangan"
              />
              {search && <button aria-label="Hapus pencarian" onClick={() => setSearch("")}><X size={16} /></button>}
            </div>
            <span className="search-result-count"><strong>{filtered.length}</strong> entri</span>
            {(search || filterCount > 0) && (
              <button className="reset-filter" onClick={reset}><X size={15} /> Hapus filter {filterCount > 0 ? `(${filterCount})` : ""}</button>
            )}
          </div>

          <div className="filter-row easy-filter-row">
            <label className="select-pill">
              <span>Pelaku</span>
              <select value={actor} onChange={(event) => setActor(event.target.value)}>
                <option value="">Semua pelaku</option>
                {actors.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label className="select-pill">
              <span>Jenis objek</span>
              <select value={objectType} onChange={(event) => setObjectType(event.target.value)}>
                <option value="">Semua objek</option>
                {OBJECT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="select-pill date">
              <span>Dari</span>
              <input type="date" value={range.from} onChange={(event) => setRange({ ...range, from: event.target.value })} />
            </label>
            <label className="select-pill date">
              <span>Sampai</span>
              <input type="date" value={range.to} onChange={(event) => setRange({ ...range, to: event.target.value })} />
            </label>
          </div>
        </div>

        <div className="table-scroll">
          <table className="audit-table">
            <thead>
              <tr><th>Waktu</th><th>Pelaku</th><th>Aksi</th><th>Objek</th><th>Keterangan</th></tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td className="mono">{entry.at}</td>
                  <td>{entry.actor}</td>
                  <td><span className="audit-action"><ShieldCheck size={13} /> {entry.action}</span></td>
                  <td><small className="audit-object">{entry.object}</small><strong className="mono">{entry.objectId}</strong></td>
                  <td className="audit-detail">{entry.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!filtered.length && <EmptyState title="Tidak ada entri" body="Ubah kata kunci pencarian atau hapus filter yang sedang aktif." action={reset} />}
      </section>
    </div>
  );
}
