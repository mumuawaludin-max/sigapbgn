/* ============================================================================
   US-E3 — Papan prioritas: sebaran arahan pada matriks upaya x dampak,
   berikut daftar peringkat yang dapat diunduh.
   ========================================================================== */

import { useMemo, useState } from "react";
import { DownloadSimple, Target, WarningCircle } from "@phosphor-icons/react";
import {
  CLASSIFICATION_META, PRIORITY_THRESHOLD, classifyPriority, hasPermission,
  units as seedUnits,
} from "../data";
import { PRESETS } from "../presets";
import {
  EmptyInline, EmptyState, PageHeading, StatusBadge, downloadFile, formatDate, toCsv,
} from "../ui";

const QUADRANTS = [
  { name: "Hasil Cepat", position: "top-left", note: "Dampak besar dengan upaya kecil. Sebaiknya didahulukan." },
  { name: "Inisiatif Strategis", position: "top-right", note: "Dampak besar dengan upaya besar. Memerlukan perencanaan." },
  { name: "Mudah Dikerjakan", position: "bottom-left", note: "Dampak kecil dengan upaya kecil. Dikerjakan bila kapasitas memungkinkan." },
  { name: "Perlu Ditinjau Ulang", position: "bottom-right", note: "Dampak kecil dengan upaya besar. Kelayakannya perlu ditinjau." },
];

export default function PriorityPage({ directives, activeRole, onSelect, showToast, logAudit }) {
  const [unitFilter, setUnitFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("aktif");

  const filtered = useMemo(() => directives.filter((item) => {
    if (unitFilter && item.unit !== unitFilter) return false;
    if (statusFilter === "aktif" && !PRESETS.active.matches(item)) return false;
    if (statusFilter === "selesai" && item.status !== "Selesai") return false;
    return true;
  }), [directives, unitFilter, statusFilter]);

  const scored = filtered.filter((item) => item.effort != null && item.impact != null);
  const unscored = filtered.filter((item) => item.effort == null);

  /* Peringkat: dampak tertinggi lebih dulu, lalu upaya terendah. */
  const ranking = useMemo(
    () => [...scored].sort((a, b) => b.impact - a.impact || a.effort - b.effort),
    [scored],
  );

  const exportRanking = () => {
    const header = ["Peringkat", "Nomor", "Isi arahan", "Unit", "Upaya", "Dampak", "Klasifikasi", "Level prioritas", "Kesesuaian", "Deadline", "Status"];
    const rows = ranking.map((item, index) => [
      index + 1, item.id, item.title, item.unit || "", item.effort, item.impact,
      item.classification, item.priority, item.alignment || "", item.deadline, item.status,
    ]);
    downloadFile(`peringkat-prioritas-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([header, ...rows]));
    logAudit("Mengunduh laporan", "Laporan", "peringkat-prioritas.csv", `${ranking.length} arahan`);
    showToast("Peringkat terunduh", `${ranking.length} arahan tersimpan dalam berkas CSV.`);
  };

  const inQuadrant = (name) => scored.filter((item) => classifyPriority(item.effort, item.impact) === name);

  return (
    <div className="page-container priority-page">
      <PageHeading
        eyebrow="Prioritisasi strategis"
        title="Papan prioritas"
        description="Sebaran arahan menurut upaya dan dampaknya, sebagai dasar menentukan pekerjaan yang perlu didahulukan."
      >
        {hasPermission(activeRole, "laporan.ekspor") && (
          <button className="button secondary" onClick={exportRanking}><DownloadSimple size={18} /> Unduh peringkat</button>
        )}
      </PageHeading>

      <div className="filter-row easy-filter-row standalone">
        <label className="select-pill">
          <span>Unit</span>
          <select value={unitFilter} onChange={(event) => setUnitFilter(event.target.value)}>
            <option value="">Semua unit</option>
            {seedUnits.map((unit) => <option key={unit.id} value={unit.short}>{unit.short}</option>)}
          </select>
        </label>
        <label className="select-pill">
          <span>Status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="aktif">Arahan aktif</option>
            <option value="selesai">Sudah selesai</option>
            <option value="semua">Semua</option>
          </select>
        </label>
        <span className="filter-summary">{scored.length} arahan dinilai · {unscored.length} belum dinilai</span>
      </div>

      {unscored.length > 0 && (
        <div className="detail-alert info standalone">
          <span><Target size={21} weight="fill" /></span>
          <div>
            <strong>{unscored.length} arahan belum dinilai</strong>
            <p>Arahan tanpa nilai upaya dan dampak tidak muncul pada matriks. Penilaian dilakukan melalui panel detail masing-masing arahan.</p>
          </div>
        </div>
      )}

      {scored.length ? (
        <>
          <section className="priority-matrix" aria-label="Matriks upaya dan dampak">
            <span className="axis-label axis-y">Dampak &rarr;</span>
            <span className="axis-label axis-x">Upaya &rarr;</span>
            <div className="matrix-grid">
              {QUADRANTS.map((quadrant) => {
                const items = inQuadrant(quadrant.name);
                const tone = CLASSIFICATION_META[quadrant.name].tone;
                return (
                  <section key={quadrant.name} className={`matrix-cell ${quadrant.position} tone-${tone}`}>
                    <header>
                      <div><strong>{quadrant.name}</strong><small>{quadrant.note}</small></div>
                      <span className="matrix-count">{items.length}</span>
                    </header>
                    <div className="matrix-items">
                      {items.map((item) => (
                        <button key={item.id} onClick={() => onSelect(item.id)} title={item.title}>
                          <span className="matrix-score">{item.effort.toFixed(1)}/{item.impact.toFixed(1)}</span>
                          <span className="matrix-title">{item.title}</span>
                          <span className="matrix-unit">{item.unit || "—"}</span>
                        </button>
                      ))}
                      {!items.length && <EmptyInline icon={Target} text="Tidak ada arahan pada kuadran ini." />}
                    </div>
                  </section>
                );
              })}
            </div>
            <p className="matrix-legend">
              Ambang pemisah kuadran: upaya {PRIORITY_THRESHOLD.effort} dan dampak {PRIORITY_THRESHOLD.impact} dari skala 1&ndash;5. Ambang ini dapat disesuaikan oleh Admin.
            </p>
          </section>

          <section className="card ranking-card">
            <div className="master-heading">
              <div><h2>Peringkat prioritas</h2><p>Diurutkan dari dampak tertinggi, kemudian upaya terendah.</p></div>
            </div>
            <div className="table-scroll">
              <table className="ranking-table">
                <thead>
                  <tr><th>#</th><th>Arahan</th><th>Unit</th><th>Upaya</th><th>Dampak</th><th>Klasifikasi</th><th>Deadline</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {ranking.map((item, index) => (
                    <tr key={item.id} onClick={() => onSelect(item.id)}>
                      <td className="num rank">{index + 1}</td>
                      <td>
                        <strong>{item.title}</strong>
                        <small>{item.id}{item.alignment === "Di Luar Prioritas" && <em className="outside-flag"><WarningCircle size={11} /> di luar prioritas</em>}</small>
                      </td>
                      <td>{item.unit || "—"}</td>
                      <td className="num">{item.effort.toFixed(1)}</td>
                      <td className="num">{item.impact.toFixed(1)}</td>
                      <td><span className={`classification-chip tone-${CLASSIFICATION_META[item.classification]?.tone}`}>{item.classification}</span></td>
                      <td>{formatDate(item.deadline)}</td>
                      <td><StatusBadge status={item.status} compact /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <EmptyState
          title="Belum ada arahan yang dinilai"
          body="Papan prioritas terisi setelah arahan diberi nilai upaya dan dampak melalui panel detail."
        />
      )}
    </div>
  );
}
