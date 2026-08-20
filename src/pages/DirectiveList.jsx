/* ============================================================================
   US-A5 — Register arahan dengan pencarian dan filter gabungan.
   US-F4 — Ekspor laporan berupa berkas CSV sungguhan.
   ========================================================================== */

import { useMemo, useState } from "react";
import {
  Buildings, CalendarBlank, CaretRight, DownloadSimple, MagnifyingGlass, Plus,
  SlidersHorizontal, Target, WarningCircle, X,
} from "@phosphor-icons/react";
import {
  ALL_STATUSES, CLASSIFICATION_META, PRE_REGISTER_STATUSES, alignments, hasPermission,
  priorities, sources, units as seedUnits,
} from "../data";
import {
  Avatar, EmptyState, IconButton, LateBadge, PageHeading, StatusBadge, downloadFile,
  daysUntil, deadlineUrgency, formatDate, isLate, needsKendala, needsPic, sourceLabel, toCsv,
} from "../ui";

const PAGE_SIZE = 10;

const BLANK_FILTERS = {
  status: "", unit: "", priority: "", classification: "", source: "", alignment: "",
  dueFrom: "", dueTo: "",
};

export default function DirectiveList({
  directives, activeRole, preset, onClearPreset, canCreate, onCreate, onSelect, showToast, logAudit,
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(BLANK_FILTERS);
  const [page, setPage] = useState(1);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const canFilterUnits = hasPermission(activeRole, "arahan.read.all");
  const setFilter = (key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); };

  const filtered = useMemo(() => directives.filter((item) => {
    if (!preset.matches(item)) return false;
    const haystack = `${item.title} ${item.id} ${item.pic || ""} ${item.context}`.toLowerCase();
    if (search.trim() && !haystack.includes(search.trim().toLowerCase())) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (canFilterUnits && filters.unit && item.unit !== filters.unit) return false;
    if (filters.priority && item.priority !== filters.priority) return false;
    if (filters.classification && item.classification !== filters.classification) return false;
    if (filters.source && item.source !== filters.source) return false;
    if (filters.alignment && item.alignment !== filters.alignment) return false;
    if (filters.dueFrom && item.deadline < filters.dueFrom) return false;
    if (filters.dueTo && item.deadline > filters.dueTo) return false;
    return true;
  }), [directives, preset, search, filters, canFilterUnits]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => value && (key !== "unit" || canFilterUnits)).length;

  const resetAll = () => {
    setSearch("");
    setFilters(BLANK_FILTERS);
    setPage(1);
    onClearPreset();
  };

  /* Ekspor mengikuti filter aktif dan hak akses pengekspor. */
  const exportReport = () => {
    const header = [
      "Nomor", "Isi arahan", "Sumber", "Agenda asal", "Disampaikan kepada",
      "Unit penanggung jawab", "Unit pendukung", "Unit kerja pelaksana",
      "Penanggung jawab", "Pemantau", "Level prioritas", "Kesesuaian", "Upaya", "Dampak",
      "Klasifikasi", "Tanggal arahan", "Deadline", "Status", "Terlambat (hari)",
      "Kategori kendala", "Tanggal selesai",
    ];
    const rows = filtered.map((item) => [
      item.id, item.title, sourceLabel(item.source), item.agendaId || "",
      (item.targetUnits || []).join(", "), item.unit || "",
      (item.supportUnits || []).join(", "), (item.workUnits || []).join(", "),
      item.pic || "", item.monitor || "", item.priority,
      item.alignment || "", item.effort ?? "", item.impact ?? "", item.classification || "",
      item.date, item.deadline, item.status, isLate(item) ? Math.abs(daysUntil(item.deadline)) : 0,
      item.kendala?.category || "", item.completedAt || "",
    ]);
    downloadFile(`laporan-arahan-${new Date().toISOString().slice(0, 10)}.csv`, toCsv([header, ...rows]));
    logAudit("Mengunduh laporan", "Laporan", "laporan-arahan.csv", `${filtered.length} baris · filter aktif: ${activeFilterCount || "tidak ada"}`);
    showToast("Laporan terunduh", `${filtered.length} arahan tersimpan dalam berkas CSV.`);
  };

  return (
    <div className="page-container list-page">
      <PageHeading
        eyebrow="Pengelolaan arahan"
        title="Register arahan"
        description={`${filtered.length} arahan terlihat dengan peran ${activeRole.name}.`}
      >
        {hasPermission(activeRole, "laporan.ekspor") && (
          <button className="button secondary" onClick={exportReport}><DownloadSimple size={18} /> Unduh laporan</button>
        )}
        {canCreate && <button className="button primary" onClick={onCreate}><Plus size={18} weight="bold" /> Catat arahan</button>}
      </PageHeading>

      <section className="card table-card">
        <div className="table-toolbar">
          {preset.id !== "all" && (
            <div className="active-list-preset">
              <span><SlidersHorizontal size={17} /><span><strong>{preset.label}</strong><small>{preset.description}</small></span></span>
              <button onClick={resetAll}>Tampilkan semua <X size={15} /></button>
            </div>
          )}

          <div className="search-row">
            <div className="search-field directive-search">
              <MagnifyingGlass size={20} />
              <input
                aria-label="Cari arahan"
                type="search"
                value={search}
                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                placeholder="Cari nomor, isi arahan, penanggung jawab, atau nama forum"
              />
              {search && <button aria-label="Hapus pencarian" onClick={() => setSearch("")}><X size={16} /></button>}
            </div>
            <span className="search-result-count"><strong>{filtered.length}</strong> hasil</span>
            {(search || activeFilterCount > 0 || preset.id !== "all") && (
              <button className="reset-filter" onClick={resetAll}><X size={15} /> Hapus filter {activeFilterCount > 0 ? `(${activeFilterCount})` : ""}</button>
            )}
          </div>

          <div className="filter-row easy-filter-row">
            <span className="filter-label"><SlidersHorizontal size={17} /> Filter</span>
            <label className="select-pill">
              <span>Status</span>
              <select value={filters.status} onChange={(event) => setFilter("status", event.target.value)}>
                <option value="">Semua status</option>
                {ALL_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            {canFilterUnits && (
              <label className="select-pill">
                <span>Unit</span>
                <select value={filters.unit} onChange={(event) => setFilter("unit", event.target.value)}>
                  <option value="">Semua unit</option>
                  {seedUnits.map((unit) => <option key={unit.id} value={unit.short}>{unit.short}</option>)}
                </select>
              </label>
            )}
            <label className="select-pill">
              <span>Prioritas</span>
              <select value={filters.priority} onChange={(event) => setFilter("priority", event.target.value)}>
                <option value="">Semua prioritas</option>
                {priorities.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="select-pill">
              <span>Sumber</span>
              <select value={filters.source} onChange={(event) => setFilter("source", event.target.value)}>
                <option value="">Semua sumber</option>
                {sources.map((item) => <option key={item} value={item}>{sourceLabel(item)}</option>)}
              </select>
            </label>
            <button className={`filter-toggle ${advancedOpen ? "open" : ""}`} onClick={() => setAdvancedOpen((value) => !value)} aria-expanded={advancedOpen}>
              Filter lanjutan
            </button>
          </div>

          {advancedOpen && (
            <div className="filter-row advanced-filter-row">
              <label className="select-pill">
                <span>Klasifikasi</span>
                <select value={filters.classification} onChange={(event) => setFilter("classification", event.target.value)}>
                  <option value="">Semua klasifikasi</option>
                  {Object.keys(CLASSIFICATION_META).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="select-pill">
                <span>Kesesuaian</span>
                <select value={filters.alignment} onChange={(event) => setFilter("alignment", event.target.value)}>
                  <option value="">Semua</option>
                  {alignments.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <label className="select-pill date">
                <span>Deadline dari</span>
                <input type="date" value={filters.dueFrom} onChange={(event) => setFilter("dueFrom", event.target.value)} />
              </label>
              <label className="select-pill date">
                <span>Deadline sampai</span>
                <input type="date" value={filters.dueTo} onChange={(event) => setFilter("dueTo", event.target.value)} />
              </label>
            </div>
          )}
        </div>

        <div className="table-scroll">
          <table className="directive-table">
            <thead>
              <tr>
                <th>Arahan</th>
                <th>Unit dan penanggung jawab</th>
                <th>Prioritas</th>
                <th>Deadline</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {paged.map((item) => <DirectiveRow key={item.id} item={item} onSelect={onSelect} />)}
            </tbody>
          </table>
        </div>

        <div className="mobile-directive-list">
          {paged.map((item) => <MobileDirectiveCard key={item.id} item={item} onSelect={onSelect} />)}
        </div>

        {!paged.length && (
          <EmptyState
            title="Arahan tidak ditemukan"
            body="Ubah kata kunci pencarian atau hapus filter yang sedang aktif."
            action={resetAll}
          />
        )}

        {filtered.length > 0 && (
          <footer className="table-footer">
            <span>Menampilkan {paged.length} dari {filtered.length} arahan</span>
            <div>
              <button disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Sebelumnya</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((number) => number === 1 || number === totalPages || Math.abs(number - safePage) <= 1)
                .map((number, index, list) => (
                  <span key={number} className="page-slot">
                    {index > 0 && number - list[index - 1] > 1 && <em>…</em>}
                    <button className={safePage === number ? "active" : ""} onClick={() => setPage(number)}>{number}</button>
                  </span>
                ))}
              <button disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>Berikutnya</button>
            </div>
          </footer>
        )}
      </section>
    </div>
  );
}

function RowFlags({ item }) {
  return (
    <>
      {needsKendala(item) && <span className="row-flag danger" title="Terlambat dan belum ada catatan kendala"><WarningCircle size={12} weight="fill" /> Kendala belum dicatat</span>}
      {needsPic(item) && <span className="row-flag warning" title="Telah didisposisikan, namun belum ada penanggung jawab pelaksana">Belum ada penanggung jawab</span>}
      {PRE_REGISTER_STATUSES.includes(item.status) && <span className="row-flag guide" title="Belum tayang pada register aktif">Belum tayang</span>}
    </>
  );
}

function DirectiveRow({ item, onSelect }) {
  return (
    <tr onClick={() => onSelect(item.id)}>
      <td>
        <strong className="registration">{item.id.replace("SIGAP/2026/08/", "#")}</strong>
        <span className="directive-title">{item.title}</span>
        <small>{item.context} · {sourceLabel(item.source)}</small>
        <div className="row-flag-line"><RowFlags item={item} /></div>
      </td>
      <td>
        {item.unit ? (
          <span className="directive-owner">
            <span className="unit-chip" title={item.unitName}>{item.unit}</span>
            {item.pic
              ? <span className="person-cell"><Avatar name={item.pic} color={item.picColor} size="xs" /><span>{item.pic}</span></span>
              : <span className="person-cell muted">Belum ditetapkan</span>}
          </span>
        ) : (
          <span className="directive-owner">
            <span className="target-units" title="Unit yang dituju arahan, sebelum disposisi">
              {(item.targetUnits || []).map((short) => <span key={short}>{short}</span>)}
              {!item.targetUnits?.length && "—"}
            </span>
            <span className="person-cell muted">Belum didisposisikan</span>
          </span>
        )}
      </td>
      <td>
        <span className="priority-cell">
          <strong>{item.priority}</strong>
          {item.classification
            ? <small className={`classification-chip tone-${CLASSIFICATION_META[item.classification]?.tone}`}><Target size={11} />{item.classification}</small>
            : <small className="muted">Belum dinilai</small>}
        </span>
      </td>
      <td>
        <span className={`deadline ${isLate(item) ? "late" : daysUntil(item.deadline) <= 3 ? "soon" : ""}`}>
          <strong>{formatDate(item.deadline)}</strong>
          <small>{deadlineUrgency(item)}</small>
        </span>
      </td>
      <td><StatusBadge status={item.status} compact /><LateBadge item={item} compact /></td>
      <td><IconButton label="Buka detail"><CaretRight size={16} /></IconButton></td>
    </tr>
  );
}

function MobileDirectiveCard({ item, onSelect }) {
  return (
    <button className="mobile-directive-card" onClick={() => onSelect(item.id)}>
      <span className="mobile-card-top">
        <strong>{item.id.replace("SIGAP/2026/08/", "#")}</strong>
        <StatusBadge status={item.status} compact />
      </span>
      <span className="mobile-card-title">{item.title}</span>
      <span className="mobile-card-meta">
        <span className="unit-chip"><Buildings size={12} /> {item.unit || "—"}</span>
        {item.pic && <span><Avatar name={item.pic} color={item.picColor} size="xs" />{item.pic}</span>}
      </span>
      <span className="row-flag-line"><RowFlags item={item} /></span>
      <span className={`mobile-card-deadline ${isLate(item) ? "late" : daysUntil(item.deadline) <= 3 ? "soon" : ""}`}>
        <CalendarBlank size={15} />
        <span><small>Deadline</small><strong>{formatDate(item.deadline)}</strong></span>
        <b>{deadlineUrgency(item)}</b>
      </span>
    </button>
  );
}
