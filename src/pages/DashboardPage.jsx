/* ============================================================================
   US-F1 Dashboard eksekutif · US-F2 Dashboard unit.
   Setiap angka dapat diklik menuju daftar arahan yang membentuknya (drill-down),
   sehingga kartu dan register tidak pernah menyajikan dua versi kebenaran.
   ========================================================================== */

import { useMemo, useState } from "react";
import {
  ArrowRight, ArrowsClockwise, Buildings, CalendarBlank, CalendarCheck, CaretDown, CaretLeft,
  CaretRight, ChartBar, CheckCircle, ClipboardText, ClockCountdown, Funnel, Plus,
  Siren, Target, TrendUp, UsersThree, WarningCircle, X,
} from "@phosphor-icons/react";
import { CLASSIFICATION_META, KENDALA_CATEGORIES, hasPermission, units as seedUnits } from "../data";
import { PRESETS, presetByKendala, presetByPic, presetByUnit } from "../presets";
import {
  EmptyInline, LateBadge, PageHeading, StatusBadge, TODAY_LABEL,
  daysUntil, deadlineUrgency, formatDate, isLate, needsKendala, needsPic, wasCompletedLate,
} from "../ui";

const MONTHS = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

export default function DashboardPage({
  directives, activeRole, activeUser, canCreate, onCreate, onSelect, onViewAll,
}) {
  const [expanded, setExpanded] = useState(null);

  const executive = hasPermission(activeRole, "dashboard.eksekutif");
  const activeUnit = seedUnits.find((unit) => unit.short === activeRole.scope);

  const stats = useMemo(() => {
    const active = directives.filter(PRESETS.active.matches);
    return {
      active,
      done: directives.filter(PRESETS.done.matches),
      late: directives.filter(PRESETS.late.matches),
      dueSoon: directives.filter(PRESETS.dueSoon.matches),
      attention: directives.filter(PRESETS.attention.matches),
      needsKendala: directives.filter(PRESETS.needsKendala.matches),
      needsPic: directives.filter(PRESETS.needsPic.matches),
      unassigned: directives.filter(PRESETS.unassigned.matches),
      preRegister: directives.filter(PRESETS.preRegister.matches),
      awaitingDecision: directives.filter(PRESETS.awaitingDecision.matches),
      awaitingReview: directives.filter(PRESETS.awaitingReview.matches),
      unscored: directives.filter(PRESETS.unscored.matches),
    };
  }, [directives]);

  /* Urutan kerja: terlambat dulu, lalu menunggu keputusan, lalu deadline terdekat. */
  const focusItems = useMemo(() => {
    const weight = (item) => {
      if (needsKendala(item)) return 0;
      if (isLate(item)) return 1;
      if (item.status === "Menunggu Keputusan") return 2;
      if (needsPic(item)) return 3;
      return 4;
    };
    return [...stats.active].sort((a, b) => weight(a) - weight(b) || a.deadline.localeCompare(b.deadline));
  }, [stats.active]);

  return (
    <div className="page-container dashboard-page">
      <PageHeading
        title={executive ? "Beranda pimpinan" : (activeUnit?.name || "Tugas saya")}
        description={executive
          ? "Pemantauan pelaksanaan arahan pimpinan pada seluruh unit."
          : "Pemantauan arahan yang menjadi tanggung jawab Anda."}
      >
        {canCreate && <button className="button primary" onClick={onCreate}><Plus size={18} weight="bold" /> Catat arahan</button>}
      </PageHeading>
      <p className="dashboard-date">{TODAY_LABEL}</p>

      <TrackerSummary directives={directives} executive={executive} onViewAll={onViewAll} />

      {/* --- Daftar kerja hari ini --- */}
      <section className="worklist-panel">
        <header className="focus-panel-heading">
          <div>
            <span className="focus-kicker"><ClipboardText size={17} weight="duotone" /> Daftar kerja hari ini</span>
            <h2>Arahan yang perlu Anda tindak lanjuti</h2>
            <p>Diurutkan dari kendala yang belum dicatat, keterlambatan, keputusan yang tertunda, lalu deadline terdekat.</p>
          </div>
          <button className="simple-link" onClick={() => onViewAll(PRESETS.active)}>Buka register lengkap <ArrowRight size={17} /></button>
        </header>

        <div className="worklist-alerts">
          <WorkAlert
            tone="danger" count={stats.needsKendala.length} icon={WarningCircle}
            title="Kendala belum dicatat"
            body="Terlambat melewati ambang waktu, namun penyebabnya belum dijelaskan."
            onClick={() => onViewAll(PRESETS.needsKendala)}
          />
          <WorkAlert
            tone="warning" count={stats.needsPic.length} icon={UsersThree}
            title="Belum ada penanggung jawab"
            body="Telah didisposisikan, namun pelaksananya belum ditetapkan."
            onClick={() => onViewAll(PRESETS.needsPic)}
          />
          {executive && (
            <WorkAlert
              tone="info" count={stats.unassigned.length} icon={Buildings}
              title="Belum didisposisikan"
              body="Telah lolos kurasi, namun unit penanggung jawabnya belum ditetapkan."
              onClick={() => onViewAll(PRESETS.unassigned)}
            />
          )}
          <WorkAlert
            tone="guide" count={stats.awaitingDecision.length} icon={ArrowsClockwise}
            title="Menunggu keputusan"
            body="Pengajuan perubahan deadline atau pemindahan unit yang belum diputuskan."
            onClick={() => onViewAll(PRESETS.awaitingDecision)}
          />
          {executive && (
            <WorkAlert
              tone="neutral" count={stats.preRegister.length} icon={ClipboardText}
              title="Menunggu konfirmasi dan kurasi"
              body="Arahan baru yang belum tayang pada register aktif."
              onClick={() => onViewAll(PRESETS.preRegister)}
            />
          )}
        </div>

        <div className="focus-list">
          {focusItems.slice(0, 6).map((item) => <FocusItem key={item.id} item={item} onSelect={onSelect} />)}
          {!focusItems.length && <EmptyInline text="Tidak ada arahan aktif yang perlu ditindaklanjuti." />}
        </div>
      </section>

      {/* --- Panel lipat --- */}
      <section className="dashboard-tools" aria-label="Alat bantu beranda">
        <button className={expanded === "calendar" ? "active" : ""} onClick={() => setExpanded((current) => current === "calendar" ? null : "calendar")}>
          <span><CalendarCheck size={23} weight="duotone" /></span>
          <span><strong>Kalender deadline</strong><small>Jadwal jatuh tempo per tanggal</small></span>
          <CaretDown size={19} className={expanded === "calendar" ? "rotated" : ""} />
        </button>
        <button className={expanded === "analytics" ? "active" : ""} onClick={() => setExpanded((current) => current === "analytics" ? null : "analytics")}>
          <span><ChartBar size={23} weight="duotone" /></span>
          <span><strong>Analisis lanjutan</strong><small>Penyebab keterlambatan, tren, dan klasifikasi</small></span>
          <CaretDown size={19} className={expanded === "analytics" ? "rotated" : ""} />
        </button>
      </section>

      {expanded === "calendar" && <DeadlineCalendar directives={directives} onSelect={onSelect} />}
      {expanded === "analytics" && <Analytics directives={directives} stats={stats} onViewAll={onViewAll} />}
    </div>
  );
}

function WorkAlert({ tone, count, icon: Icon, title, body, onClick }) {
  if (!count) return null;
  return (
    <button className={`work-alert ${tone}`} onClick={onClick}>
      <span className="work-alert-icon"><Icon size={20} weight="fill" /></span>
      <span className="work-alert-copy"><strong>{count} · {title}</strong><small>{body}</small></span>
      <CaretRight size={17} />
    </button>
  );
}

/* ============================================================================
   Panel pelacakan capaian di bagian teratas beranda. Memuat empat angka pokok,
   filter periode dan unit, serta komposisi capaian tiap unit Eselon I.
   ========================================================================== */

function TrackerSummary({ directives, executive, onViewAll }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [compositionOpen, setCompositionOpen] = useState(true);

  const filtered = useMemo(() => directives.filter((item) => {
    if (dateFrom && item.date < dateFrom) return false;
    if (dateTo && item.date > dateTo) return false;
    if (unitFilter && item.unit !== unitFilter) return false;
    return true;
  }), [directives, dateFrom, dateTo, unitFilter]);

  const totals = useMemo(() => {
    const selesai = filtered.filter((item) => item.status === "Selesai");
    const selesaiTerlambat = selesai.filter(wasCompletedLate);
    const active = filtered.filter(PRESETS.active.matches);
    const overdue = active.filter(isLate);
    const dalamProses = active.filter((item) => !isLate(item));
    return { selesai, selesaiTerlambat, active, overdue, dalamProses };
  }, [filtered]);

  const cards = [
    { id: "selesai", label: "Selesai", count: totals.selesai.length, icon: CheckCircle, tone: "success", preset: PRESETS.done },
    { id: "selesaiTerlambat", label: "Selesai (terlambat)", count: totals.selesaiTerlambat.length, icon: ClockCountdown, tone: "amber", preset: PRESETS.doneLate },
    { id: "dalamProses", label: "Dalam proses", count: totals.dalamProses.length, icon: ArrowsClockwise, tone: "info", preset: PRESETS.inProgress },
    { id: "overdue", label: "Overdue", count: totals.overdue.length, icon: Siren, tone: "danger", preset: PRESETS.late },
  ];

  /*
   * Komposisi per baris: empat segmen yang tidak saling tumpang tindih.
   * Peran eksekutif melihat komposisi per unit Eselon I; peran lain melihat
   * komposisi per penanggung jawab pelaksana pada arahan yang dapat mereka akses.
   */
  const composeRow = (label, items, preset) => {
    const selesaiTerlambat = items.filter(wasCompletedLate).length;
    const selesaiTepat = items.filter((item) => item.status === "Selesai").length - selesaiTerlambat;
    const active = items.filter(PRESETS.active.matches);
    const overdue = active.filter(isLate).length;
    const dalamProses = active.length - overdue;
    return { key: label, label, total: items.length, selesaiTepat, selesaiTerlambat, dalamProses, overdue, preset };
  };

  const compositionRows = useMemo(() => {
    if (executive) {
      return seedUnits
        .map((unit) => composeRow(unit.short, filtered.filter((item) => item.unit === unit.short), presetByUnit(unit.short)))
        .filter((row) => row.total > 0)
        .sort((a, b) => b.total - a.total);
    }
    const byPic = new Map();
    filtered.forEach((item) => {
      const key = item.pic || "";
      if (!byPic.has(key)) byPic.set(key, []);
      byPic.get(key).push(item);
    });
    return [...byPic.entries()]
      .map(([name, items]) => composeRow(name || "Belum ditetapkan", items, presetByPic(name)))
      .sort((a, b) => b.total - a.total);
  }, [filtered, executive]);

  const compositionTitle = executive ? "Komposisi per unit" : "Komposisi per penanggung jawab";

  const resetFilters = () => { setDateFrom(""); setDateTo(""); setUnitFilter(""); };
  const filterActive = dateFrom || dateTo || unitFilter;

  return (
    <section className="tracker-summary" aria-label="Ringkasan capaian arahan">
      <header className="tracker-summary-head">
        <div>
          <span className="tracker-kicker"><Funnel size={15} weight="bold" /> Pelacakan capaian</span>
          <h2>Jumlah arahan</h2>
          <p>Perkembangan seluruh arahan yang dapat Anda akses. Pilih kartu atau salah satu baris untuk membuka daftar arahannya.</p>
        </div>
        <div className="tracker-filters">
          <label className="select-pill date"><span>Dari</span><input type="date" value={dateFrom} onChange={(event) => setDateFrom(event.target.value)} /></label>
          <label className="select-pill date"><span>Sampai</span><input type="date" value={dateTo} onChange={(event) => setDateTo(event.target.value)} /></label>
          {executive && (
            <label className="select-pill">
              <span>Unit</span>
              <select value={unitFilter} onChange={(event) => setUnitFilter(event.target.value)}>
                <option value="">Semua unit</option>
                {seedUnits.map((unit) => <option key={unit.id} value={unit.short}>{unit.short}</option>)}
              </select>
            </label>
          )}
          {filterActive && <button className="reset-filter" onClick={resetFilters}><X size={15} /> Hapus filter</button>}
        </div>
      </header>

      <div className="tracker-stat-grid">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button key={card.id} className={`tracker-stat-card tone-${card.tone}`} onClick={() => onViewAll(card.preset)}>
              <span className="tracker-stat-icon"><Icon size={22} weight="duotone" /></span>
              <strong>{card.count.toLocaleString("id-ID")}</strong>
              <span>{card.label}</span>
            </button>
          );
        })}
      </div>

      <div className="tracker-bar-section">
        <button className="tracker-bar-toggle" onClick={() => setCompositionOpen((value) => !value)} aria-expanded={compositionOpen}>
          <span>{compositionTitle}</span>
          <CaretDown size={16} className={compositionOpen ? "rotated" : ""} />
        </button>

        {compositionOpen && (
          <>
            <div className="tracker-bar-legend">
              <span className="tone-success">Selesai</span>
              <span className="tone-amber">Selesai (terlambat)</span>
              <span className="tone-info">Dalam proses</span>
              <span className="tone-danger">Overdue</span>
            </div>
            <div className="tracker-bar-list">
              {compositionRows.map((row) => (
                <button key={row.key} className="tracker-bar-row" onClick={() => onViewAll(row.preset)}>
                  <span className="tracker-bar-label" title={row.label}>{row.label}</span>
                  <span className="tracker-bar-track">
                    {row.selesaiTepat > 0 && <i className="seg-success" style={{ width: `${(row.selesaiTepat / row.total) * 100}%` }} />}
                    {row.selesaiTerlambat > 0 && <i className="seg-amber" style={{ width: `${(row.selesaiTerlambat / row.total) * 100}%` }} />}
                    {row.dalamProses > 0 && <i className="seg-info" style={{ width: `${(row.dalamProses / row.total) * 100}%` }} />}
                    {row.overdue > 0 && <i className="seg-danger" style={{ width: `${(row.overdue / row.total) * 100}%` }} />}
                  </span>
                  <span className="tracker-bar-total">{row.total}</span>
                </button>
              ))}
              {!compositionRows.length && <EmptyInline icon={ChartBar} text="Tidak ada arahan pada filter yang dipilih." />}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function FocusItem({ item, onSelect }) {
  const urgent = needsKendala(item) || isLate(item) || item.status === "Menunggu Keputusan";
  return (
    <button className="focus-item" onClick={() => onSelect(item.id)} aria-label={`Buka ${item.title}, ${deadlineUrgency(item)}`}>
      <span className={`focus-item-icon ${urgent ? "urgent" : ""}`}>
        {urgent ? <WarningCircle size={20} weight="duotone" /> : <ArrowsClockwise size={20} weight="duotone" />}
      </span>
      <span className="focus-item-copy">
        <strong>{item.title}</strong>
        <small>{item.unit || "Belum didisposisikan"} · {item.pic || "Belum ada PIC"}</small>
      </span>
      <span className="focus-item-status"><StatusBadge status={item.status} compact /><LateBadge item={item} compact /></span>
      <span className={`focus-item-deadline ${isLate(item) ? "late" : daysUntil(item.deadline) <= 3 ? "soon" : ""}`}>
        <small>Deadline</small><strong>{formatDate(item.deadline)}</strong>
      </span>
      <CaretRight size={18} />
    </button>
  );
}

/* --- Kalender deadline ------------------------------------------------------- */

function DeadlineCalendar({ directives, onSelect }) {
  const [selectedDay, setSelectedDay] = useState(13);
  const [monthOffset, setMonthOffset] = useState(0);
  const shownMonth = 7 + monthOffset;
  const shownYear = 2026 + Math.floor(shownMonth / 12);
  const month = ((shownMonth % 12) + 12) % 12;
  const daysInMonth = new Date(shownYear, month + 1, 0).getDate();
  const startDay = (new Date(shownYear, month, 1).getDay() + 6) % 7;
  const monthKey = `${shownYear}-${String(month + 1).padStart(2, "0")}`;

  const eventsByDay = directives.reduce((map, item) => {
    if (!item.deadline.startsWith(monthKey)) return map;
    const day = Number(item.deadline.slice(8));
    map[day] = [...(map[day] || []), item];
    return map;
  }, {});
  const selectedItems = eventsByDay[selectedDay] || [];

  return (
    <section className="deadline-calendar">
      <header className="calendar-section-heading">
        <div className="panel-title">
          <span><CalendarCheck size={20} /></span>
          <div><h2>Kalender deadline</h2><p>Jadwal deadline seluruh arahan yang dapat Anda akses.</p></div>
        </div>
        <button onClick={() => { setMonthOffset(0); setSelectedDay(13); }}>Hari ini</button>
      </header>
      <div className="calendar-layout">
        <div className="month-calendar">
          <div className="month-control">
            <button aria-label="Bulan sebelumnya" onClick={() => { setMonthOffset((value) => value - 1); setSelectedDay(1); }}><CaretLeft size={17} /></button>
            <strong>{MONTHS[month]} {shownYear}</strong>
            <button aria-label="Bulan berikutnya" onClick={() => { setMonthOffset((value) => value + 1); setSelectedDay(1); }}><CaretRight size={17} /></button>
          </div>
          <div className="month-grid">
            {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => <span className="weekday" key={day}>{day}</span>)}
            {Array.from({ length: startDay }, (_, index) => <span key={`blank-${index}`} />)}
            {Array.from({ length: daysInMonth }, (_, index) => {
              const day = index + 1;
              const items = eventsByDay[day] || [];
              const hasLate = items.some(isLate);
              return (
                <button
                  key={day}
                  aria-label={`${day} ${MONTHS[month]} ${shownYear}, ${items.length} deadline`}
                  className={`${selectedDay === day ? "selected" : ""} ${day === 13 && monthOffset === 0 ? "today" : ""}`}
                  onClick={() => setSelectedDay(day)}
                >
                  <span>{day}</span>
                  {items.length > 0 && <i className={hasLate ? "overdue" : ""}>{items.length}</i>}
                </button>
              );
            })}
          </div>
        </div>
        <aside className="calendar-agenda">
          <header>
            <div><span>{selectedDay} {MONTHS[month]}</span><strong>{selectedItems.length} deadline</strong></div>
            <CalendarBlank size={21} />
          </header>
          <div>
            {selectedItems.map((item) => (
              <button key={item.id} onClick={() => onSelect(item.id)} aria-label={`Buka ${item.title}`}>
                <span className={`agenda-indicator ${isLate(item) ? "overdue" : daysUntil(item.deadline) <= 3 ? "urgent" : ""}`} />
                <span><strong>{item.title}</strong><small>{item.unit || "—"} · {deadlineUrgency(item)}</small></span>
                <CaretRight size={16} />
              </button>
            ))}
            {!selectedItems.length && (
              <div className="agenda-empty">
                <CheckCircle size={25} weight="duotone" />
                <strong>Tidak ada deadline</strong>
                <small>Tidak ada arahan yang jatuh tempo pada tanggal ini.</small>
              </div>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}

/* --- Ringkasan data ---------------------------------------------------------- */

/**
 * Analisis lanjutan. Sengaja tidak mengulang angka pada panel "Jumlah arahan"
 * di atas: bagian ini hanya memuat penyebab keterlambatan, tren, dan klasifikasi.
 */
function Analytics({ directives, stats, onViewAll }) {
  /* Penyebab keterlambatan per kategori kendala (US-D6 → US-F1). */
  const kendalaGroups = KENDALA_CATEGORIES.map((category) => ({
    category,
    count: directives.filter((item) => item.kendala?.category === category).length,
  })).filter((group) => group.count > 0);
  const uncategorised = stats.late.filter((item) => !item.kendala).length;
  const kendalaMax = Math.max(...kendalaGroups.map((group) => group.count), uncategorised, 1);

  /* Tren penyelesaian per bulan. */
  const trend = ["2026-06", "2026-07", "2026-08"].map((key) => ({
    label: MONTHS[Number(key.slice(5)) - 1].slice(0, 3),
    count: directives.filter((item) => item.completedAt?.startsWith(key)).length,
  }));
  const trendMax = Math.max(...trend.map((point) => point.count), 1);

  const classificationGroups = Object.keys(CLASSIFICATION_META).map((name) => ({
    name,
    count: directives.filter((item) => item.classification === name).length,
  })).filter((group) => group.count > 0);

  return (
    <section className="dashboard-analytics">
      <header>
        <div><h2>Analisis lanjutan</h2><p>Melengkapi panel di atas: penyebab keterlambatan, tren penyelesaian, dan sebaran klasifikasi.</p></div>
        <span>Diperbarui hari ini</span>
      </header>

      <div className="analytics-grid">
        <div className="analytics-card kendala-chart-card">
          <div className="analytics-card-heading">
            <span><WarningCircle size={19} /></span>
            <div><h3>Penyebab keterlambatan</h3><small>{stats.late.length} arahan terlambat</small></div>
          </div>
          <div className="kendala-chart">
            {kendalaGroups.map((group) => (
              <button key={group.category} onClick={() => onViewAll(presetByKendala(group.category))}>
                <span>{group.category}</span>
                <div><i style={{ width: `${(group.count / kendalaMax) * 100}%` }} /></div>
                <strong>{group.count}</strong>
              </button>
            ))}
            {uncategorised > 0 && (
              <button className="uncategorised" onClick={() => onViewAll(PRESETS.needsKendala)}>
                <span>Belum dikategorikan</span>
                <div><i style={{ width: `${(uncategorised / kendalaMax) * 100}%` }} /></div>
                <strong>{uncategorised}</strong>
              </button>
            )}
            {!kendalaGroups.length && !uncategorised && <EmptyInline text="Tidak ada arahan terlambat." />}
          </div>
        </div>

        <div className="analytics-card trend-chart-card">
          <div className="analytics-card-heading">
            <span><TrendUp size={19} /></span>
            <div><h3>Tren penyelesaian</h3><small>Arahan disetujui selesai per bulan</small></div>
          </div>
          <div className="source-chart">
            {trend.map((point) => (
              <div key={point.label}>
                <strong>{point.count}</strong>
                <span><i style={{ height: `${Math.max(8, (point.count / trendMax) * 100)}%` }} /></span>
                <small>{point.label}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="analytics-card classification-card">
          <div className="analytics-card-heading">
            <span><Target size={19} /></span>
            <div><h3>Sebaran klasifikasi</h3><small>{stats.unscored.length} arahan aktif belum dinilai</small></div>
          </div>
          <div className="classification-list">
            {classificationGroups.map((group) => (
              <div key={group.name} className={`tone-${CLASSIFICATION_META[group.name].tone}`}>
                <span>{group.name}</span>
                <strong>{group.count}</strong>
              </div>
            ))}
            {stats.unscored.length > 0 && (
              <button className="classification-unscored" onClick={() => onViewAll(PRESETS.unscored)}>
                Belum dinilai <strong>{stats.unscored.length}</strong>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
