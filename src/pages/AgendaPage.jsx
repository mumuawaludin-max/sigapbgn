/* ============================================================================
   Epik B — Rekap Agenda & Key Takeaways.
   Menjawab masalah "belum ada pencatatan agenda dan key takeaways terstruktur",
   sekaligus menjadi asal-usul arahan lisan agar konteksnya tidak terputus.
   ========================================================================== */

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight, CalendarBlank, CaretDown, CaretUp, Check, ChatCenteredText, ClipboardText,
  DownloadSimple, FileText, Lightning, ListChecks, MapPin, Paperclip, PencilSimple, Plus,
  Trash, UploadSimple, UserCircle, UsersThree, WarningCircle,
} from "@phosphor-icons/react";
import { AGENDA_TYPES, TAKEAWAY_TAGS, hasPermission, units as seedUnits, users } from "../data";
import {
  EmptyInline, EmptyState, IconButton, Modal, PageHeading, StatusBadge, TODAY_ISO,
  downloadFile, formatDate, formatDateLong, toCsv,
} from "../ui";

/** Pejabat yang berwenang memberi arahan pada forum. */
const leaders = users.filter((person) => ["Kepala BGN", "Wakil Kepala BGN"].includes(person.role));

const TAG_META = {
  Informasi: { tone: "info", icon: ChatCenteredText, hint: "Keterangan keadaan, tidak memerlukan tindak lanjut." },
  Keputusan: { tone: "decision", icon: Check, hint: "Kesepakatan forum yang bersifat mengikat." },
  "Kandidat Arahan": { tone: "candidate", icon: Lightning, hint: "Dapat ditetapkan menjadi arahan resmi." },
};

/* --- Modal agenda ----------------------------------------------------------- */

function AgendaModal({ agenda, actorName, onClose, onSave }) {
  const [form, setForm] = useState(agenda || {
    id: "", title: "", type: "Rapat Pimpinan", date: TODAY_ISO, pimpinan: "", place: "",
    units: [], summary: "", attachment: "", createdBy: actorName, takeaways: [],
  });
  const [error, setError] = useState("");

  const toggleUnit = (short) => {
    setForm((current) => ({
      ...current,
      units: current.units.includes(short) ? current.units.filter((item) => item !== short) : [...current.units, short],
    }));
  };

  const pickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setForm((current) => ({ ...current, attachment: file.name }));
  };

  return (
    <Modal
      title={agenda ? "Perbarui agenda" : "Catat agenda baru"}
      subtitle="Agenda memuat butir hasil forum sekaligus menjadi asal-usul arahan lisan."
      onClose={onClose}
      wide
    >
      <div className="modal-body form-grid">
        <label className="field full">
          <span>Nama forum <b>*</b></span>
          <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Contoh: Rapat Pimpinan Mingguan BGN" />
        </label>

        <label className="field">
          <span>Jenis forum</span>
          <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
            {AGENDA_TYPES.map((type) => <option key={type}>{type}</option>)}
          </select>
        </label>

        <label className="field">
          <span>Tanggal <b>*</b></span>
          <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
        </label>

        <label className="field">
          <span>Pimpinan yang memberi arahan <b>*</b></span>
          <select value={form.pimpinan} onChange={(event) => setForm({ ...form, pimpinan: event.target.value })}>
            <option value="">Pilih pimpinan</option>
            {leaders.map((person) => <option key={person.id} value={person.name}>{person.name} — {person.role}</option>)}
          </select>
        </label>

        <label className="field">
          <span>Tempat</span>
          <input value={form.place || ""} onChange={(event) => setForm({ ...form, place: event.target.value })} placeholder="Contoh: Ruang Rapat Utama BGN, Jakarta" />
        </label>

        <div className="field full">
          <span>Unit yang hadir</span>
          <div className="chip-picker">
            {seedUnits.map((unit) => (
              <button key={unit.id} type="button" className={form.units.includes(unit.short) ? "selected" : ""} onClick={() => toggleUnit(unit.short)} title={unit.name}>
                {form.units.includes(unit.short) && <Check size={13} weight="bold" />} {unit.short}
              </button>
            ))}
          </div>
          <small className="field-hint">Unit Eselon I yang mengikuti forum. Boleh lebih dari satu.</small>
        </div>

        <label className="field full">
          <span>Ringkasan</span>
          <textarea rows="3" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} placeholder="Pokok bahasan forum secara singkat" />
        </label>

        <label className="field full">
          <span>Lampiran notulensi atau materi</span>
          <div className="upload-zone-wrap">
            <input id="agenda-attachment" type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" onChange={pickFile} />
            <label className="upload-zone" htmlFor="agenda-attachment">
              <UploadSimple size={23} />
              <span><strong>{form.attachment || "Pilih berkas notulensi"}</strong><small>PDF, DOCX, atau PPTX</small></span>
            </label>
          </div>
        </label>

        {error && <div className="form-error full"><WarningCircle size={18} />{error}</div>}

        <div className="modal-actions full">
          <button className="button secondary" onClick={onClose}>Batal</button>
          <button
            className="button primary"
            onClick={() => {
              if (!form.title.trim()) return setError("Nama forum wajib diisi.");
              if (!form.date) return setError("Tanggal agenda wajib diisi.");
              if (!form.pimpinan) return setError("Pilih pimpinan yang memberi arahan pada forum ini.");
              onSave(form);
            }}
          >
            <Check size={17} weight="bold" /> Simpan agenda
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* --- Modal takeaway ---------------------------------------------------------- */

function TakeawayModal({ takeaway, onClose, onSave }) {
  const [text, setText] = useState(takeaway?.text || "");
  const [tag, setTag] = useState(takeaway?.tag || "Informasi");
  return (
    <Modal title={takeaway ? "Perbarui butir takeaway" : "Tambah butir takeaway"} onClose={onClose}>
      <div className="modal-body form-grid">
        <label className="field full">
          <span>Isi butir <b>*</b></span>
          <textarea rows="3" value={text} onChange={(event) => setText(event.target.value)} placeholder="Tuliskan satu butir hasil forum secara ringkas" />
        </label>
        <div className="field full">
          <span>Penandaan</span>
          <div className="chip-picker column">
            {TAKEAWAY_TAGS.map((item) => (
              <button key={item} type="button" className={tag === item ? "selected" : ""} onClick={() => setTag(item)}>
                {tag === item && <Check size={13} weight="bold" />} {item}
                <em>{TAG_META[item].hint}</em>
              </button>
            ))}
          </div>
        </div>
        <div className="modal-actions full">
          <button className="button secondary" onClick={onClose}>Batal</button>
          <button className="button primary" disabled={!text.trim()} onClick={() => onSave({ text: text.trim(), tag })}>
            <Check size={17} weight="bold" /> Simpan butir
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* --- Halaman ----------------------------------------------------------------- */

export default function AgendaPage({
  agendas, setAgendas, directives, activeRole, actorName,
  showToast, logAudit, onSelectDirective, onCreateFromTakeaway, focusAgendaId, onFocusHandled,
}) {
  const [view, setView] = useState("daftar");
  const [selectedId, setSelectedId] = useState(focusAgendaId || agendas[0]?.id || null);
  const [agendaModal, setAgendaModal] = useState(null);
  const [takeawayModal, setTakeawayModal] = useState(null);
  const [period, setPeriod] = useState({ from: "2026-08-01", to: "2026-08-31" });

  const canEdit = hasPermission(activeRole, "agenda.edit");
  const canCreate = hasPermission(activeRole, "agenda.create");

  /* Fokus dari tautan pada detail arahan. */
  useEffect(() => {
    if (!focusAgendaId) return;
    setSelectedId(focusAgendaId);
    setView("daftar");
    onFocusHandled();
  }, [focusAgendaId, onFocusHandled]);

  const selected = agendas.find((item) => item.id === selectedId) || null;
  const directivesOf = (agendaId) => directives.filter((item) => item.agendaId === agendaId);

  const saveAgenda = (form) => {
    if (form.id) {
      setAgendas((current) => current.map((item) => item.id === form.id ? { ...item, ...form } : item));
      logAudit("Memperbarui agenda", "Agenda", form.id, form.title);
      showToast("Agenda diperbarui", `${form.title} tersimpan.`);
    } else {
      const id = `AG-2026-${String(agendas.length + 11).padStart(4, "0")}`;
      setAgendas((current) => [{ ...form, id, createdBy: actorName, takeaways: [] }, ...current]);
      logAudit("Mencatat agenda", "Agenda", id, form.title);
      showToast("Agenda tercatat", `${form.title} siap diisi key takeaways.`);
      setSelectedId(id);
    }
    setAgendaModal(null);
  };

  const saveTakeaway = ({ text, tag }) => {
    const editing = takeawayModal?.item;
    setAgendas((current) => current.map((agenda) => {
      if (agenda.id !== selectedId) return agenda;
      if (editing) {
        return { ...agenda, takeaways: agenda.takeaways.map((item) => item.id === editing.id ? { ...item, text, tag } : item) };
      }
      const id = `tk-${agenda.id}-${agenda.takeaways.length + 1}`;
      return { ...agenda, takeaways: [...agenda.takeaways, { id, text, tag, directiveId: null }] };
    }));
    logAudit(editing ? "Memperbarui takeaway" : "Menambah takeaway", "Agenda", selectedId, text.slice(0, 60));
    showToast(editing ? "Butir diperbarui" : "Butir ditambahkan", "Rekap agenda diperbarui.");
    setTakeawayModal(null);
  };

  const removeTakeaway = (takeaway) => {
    if (takeaway.directiveId) {
      showToast("Butir tidak dapat dihapus", "Butir ini telah menjadi arahan resmi. Batalkan arahannya terlebih dahulu bila memang perlu dihapus.", "error");
      return;
    }
    setAgendas((current) => current.map((agenda) => agenda.id === selectedId
      ? { ...agenda, takeaways: agenda.takeaways.filter((item) => item.id !== takeaway.id) }
      : agenda));
    logAudit("Menghapus takeaway", "Agenda", selectedId, takeaway.text.slice(0, 60));
    showToast("Butir dihapus", "Rekap agenda diperbarui.");
  };

  const moveTakeaway = (index, direction) => {
    setAgendas((current) => current.map((agenda) => {
      if (agenda.id !== selectedId) return agenda;
      const next = [...agenda.takeaways];
      const target = index + direction;
      if (target < 0 || target >= next.length) return agenda;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...agenda, takeaways: next };
    }));
  };

  /* --- US-B4 Rekap per periode --- */
  const recap = useMemo(() => {
    const inPeriod = agendas.filter((agenda) => agenda.date >= period.from && agenda.date <= period.to);
    return inPeriod.map((agenda) => {
      const linked = directivesOf(agenda.id);
      return {
        agenda,
        takeawayCount: agenda.takeaways.length,
        candidateCount: agenda.takeaways.filter((item) => item.tag === "Kandidat Arahan").length,
        directiveCount: linked.length,
        doneCount: linked.filter((item) => item.status === "Selesai").length,
      };
    });
  }, [agendas, directives, period]);

  const exportRecap = () => {
    const header = ["Kode agenda", "Tanggal", "Nama forum", "Jenis", "Unit terkait", "Jumlah takeaway", "Kandidat arahan", "Arahan lahir", "Arahan selesai"];
    const rows = recap.map((row) => [
      row.agenda.id, row.agenda.date, row.agenda.title, row.agenda.type, row.agenda.units.join(", "),
      row.takeawayCount, row.candidateCount, row.directiveCount, row.doneCount,
    ]);
    downloadFile(`rekap-agenda-${period.from}-sd-${period.to}.csv`, toCsv([header, ...rows]));
    logAudit("Mengunduh laporan", "Laporan", "rekap-agenda.csv", `Periode ${period.from} s.d. ${period.to}`);
    showToast("Rekap terunduh", `${recap.length} agenda tersimpan dalam berkas CSV.`);
  };

  return (
    <div className="page-container agenda-page">
      <PageHeading
        eyebrow="Rekap agenda"
        title="Agenda dan key takeaways"
        description="Setiap forum pimpinan dicatat agendanya. Butir hasil forum dapat langsung ditetapkan menjadi arahan resmi."
      >
        {canCreate && <button className="button primary" onClick={() => setAgendaModal({})}><Plus size={18} weight="bold" /> Catat agenda</button>}
      </PageHeading>

      <div className="segment-tabs">
        <button className={view === "daftar" ? "active" : ""} onClick={() => setView("daftar")}><ClipboardText size={17} /> Daftar agenda</button>
        <button className={view === "rekap" ? "active" : ""} onClick={() => setView("rekap")}><ListChecks size={17} /> Rekap periode</button>
      </div>

      {view === "daftar" ? (
        <div className="agenda-layout">
          <aside className="agenda-list" aria-label="Daftar agenda">
            {agendas.map((agenda) => {
              const linked = directivesOf(agenda.id);
              return (
                <button key={agenda.id} className={agenda.id === selectedId ? "selected" : ""} onClick={() => setSelectedId(agenda.id)}>
                  <span className="agenda-date"><strong>{agenda.date.slice(8)}</strong><small>{formatDate(agenda.date).split(" ")[1]}</small></span>
                  <span className="agenda-list-copy">
                    <strong>{agenda.title}</strong>
                    <small>{agenda.type} · {agenda.units.join(", ") || "Lintas unit"}</small>
                    <em>{agenda.takeaways.length} takeaway · {linked.length} arahan</em>
                  </span>
                </button>
              );
            })}
            {!agendas.length && <EmptyInline icon={ClipboardText} text="Belum ada agenda tercatat." />}
          </aside>

          {selected ? (
            <section className="card agenda-detail">
              <header className="agenda-detail-head">
                <div>
                  <span className="eyebrow">{selected.id} · {selected.type}</span>
                  <h2>{selected.title}</h2>
                  <p className="agenda-meta">
                    <CalendarBlank size={15} /> {formatDateLong(selected.date)}
                    {selected.place && <><span className="dot-sep">·</span><MapPin size={15} /> {selected.place}</>}
                    <span className="dot-sep">·</span>
                    <UsersThree size={15} /> {selected.units.length ? selected.units.join(", ") : "Belum dicatat"}
                    <span className="dot-sep">·</span>
                    Dicatat oleh {selected.createdBy}
                  </p>
                  {selected.pimpinan && (
                    <p className="agenda-leader">
                      <UserCircle size={16} weight="duotone" />
                      <span>Arahan disampaikan oleh <strong>{selected.pimpinan}</strong></span>
                    </p>
                  )}
                </div>
                {canEdit && <IconButton label="Perbarui agenda" onClick={() => setAgendaModal(selected)}><PencilSimple size={18} /></IconButton>}
              </header>

              {selected.summary && <p className="agenda-summary">{selected.summary}</p>}
              {selected.attachment && (
                <p className="agenda-attachment"><Paperclip size={15} /> {selected.attachment}</p>
              )}

              <div className="agenda-section-head">
                <div><h3>Key takeaways</h3><p>Butir bertanda <strong>Kandidat Arahan</strong> dapat langsung dijadikan arahan resmi.</p></div>
                {canEdit && <button className="button secondary" onClick={() => setTakeawayModal({})}><Plus size={16} /> Tambah butir</button>}
              </div>

              <ol className="takeaway-list">
                {selected.takeaways.map((takeaway, index) => {
                  const meta = TAG_META[takeaway.tag];
                  const TagIcon = meta.icon;
                  const linkedDirective = directives.find((item) => item.id === takeaway.directiveId);
                  return (
                    <li key={takeaway.id} className={`tone-${meta.tone}`}>
                      <span className="takeaway-index">{index + 1}</span>
                      <div className="takeaway-body">
                        <span className={`takeaway-tag tone-${meta.tone}`}><TagIcon size={12} weight="bold" /> {takeaway.tag}</span>
                        <p>{takeaway.text}</p>

                        {linkedDirective ? (
                          <button className="takeaway-linked" onClick={() => onSelectDirective(linkedDirective.id)}>
                            <FileText size={16} />
                            <span><small>Sudah menjadi arahan {linkedDirective.id}</small><strong>{linkedDirective.title}</strong></span>
                            <StatusBadge status={linkedDirective.status} compact />
                            <ArrowUpRight size={15} />
                          </button>
                        ) : takeaway.tag === "Kandidat Arahan" && hasPermission(activeRole, "arahan.create.verbal") ? (
                          <button className="button secondary small" onClick={() => onCreateFromTakeaway(selected, takeaway)}>
                            <Lightning size={15} weight="fill" /> Jadikan arahan
                          </button>
                        ) : null}
                      </div>
                      {canEdit && (
                        <div className="takeaway-actions">
                          <IconButton label="Naikkan urutan" onClick={() => moveTakeaway(index, -1)} disabled={index === 0}><CaretUp size={15} /></IconButton>
                          <IconButton label="Turunkan urutan" onClick={() => moveTakeaway(index, 1)} disabled={index === selected.takeaways.length - 1}><CaretDown size={15} /></IconButton>
                          <IconButton label="Perbarui butir" onClick={() => setTakeawayModal({ item: takeaway })}><PencilSimple size={15} /></IconButton>
                          <IconButton label="Hapus butir" onClick={() => removeTakeaway(takeaway)}><Trash size={15} /></IconButton>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>

              {!selected.takeaways.length && <EmptyInline icon={ListChecks} text="Belum ada butir takeaway pada agenda ini." />}

              <div className="agenda-section-head">
                <div><h3>Arahan yang lahir dari agenda ini</h3><p>Tertaut dua arah dengan register arahan.</p></div>
              </div>
              <div className="agenda-directives">
                {directivesOf(selected.id).map((item) => (
                  <button key={item.id} onClick={() => onSelectDirective(item.id)}>
                    <span><FileText size={18} weight="duotone" /></span>
                    <span className="agenda-directive-copy"><small>{item.id}</small><strong>{item.title}</strong></span>
                    <StatusBadge status={item.status} compact />
                    <ArrowUpRight size={15} />
                  </button>
                ))}
                {!directivesOf(selected.id).length && <EmptyInline icon={FileText} text="Belum ada arahan yang diturunkan dari agenda ini." />}
              </div>
            </section>
          ) : (
            <EmptyState title="Belum ada agenda dipilih" body="Pilih salah satu agenda di daftar sebelah kiri." />
          )}
        </div>
      ) : (
        <section className="card recap-card">
          <div className="recap-controls">
            <label className="select-pill date"><span>Periode dari</span><input type="date" value={period.from} onChange={(event) => setPeriod({ ...period, from: event.target.value })} /></label>
            <label className="select-pill date"><span>sampai</span><input type="date" value={period.to} onChange={(event) => setPeriod({ ...period, to: event.target.value })} /></label>
            <button className="button secondary" onClick={exportRecap}><DownloadSimple size={17} /> Unduh rekap</button>
          </div>

          <div className="recap-summary">
            <div><strong>{recap.length}</strong><small>agenda</small></div>
            <div><strong>{recap.reduce((total, row) => total + row.takeawayCount, 0)}</strong><small>butir takeaway</small></div>
            <div><strong>{recap.reduce((total, row) => total + row.directiveCount, 0)}</strong><small>arahan lahir</small></div>
            <div><strong>{recap.reduce((total, row) => total + row.doneCount, 0)}</strong><small>arahan selesai</small></div>
          </div>

          <div className="table-scroll">
            <table className="recap-table">
              <thead>
                <tr><th>Agenda</th><th>Tanggal</th><th>Takeaway</th><th>Kandidat</th><th>Arahan lahir</th><th>Selesai</th></tr>
              </thead>
              <tbody>
                {recap.map((row) => (
                  <tr key={row.agenda.id} onClick={() => { setSelectedId(row.agenda.id); setView("daftar"); }}>
                    <td><strong>{row.agenda.title}</strong><small>{row.agenda.type}</small></td>
                    <td>{formatDate(row.agenda.date)}</td>
                    <td className="num">{row.takeawayCount}</td>
                    <td className="num">{row.candidateCount}</td>
                    <td className="num">{row.directiveCount}</td>
                    <td className="num">{row.doneCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!recap.length && <EmptyState title="Tidak ada agenda pada periode ini" body="Ubah rentang tanggal untuk melihat agenda lain." />}
        </section>
      )}

      {agendaModal && (
        <AgendaModal
          agenda={agendaModal.id ? agendaModal : null}
          actorName={actorName}
          onClose={() => setAgendaModal(null)}
          onSave={saveAgenda}
        />
      )}
      {takeawayModal && (
        <TakeawayModal
          takeaway={takeawayModal.item}
          onClose={() => setTakeawayModal(null)}
          onSave={saveTakeaway}
        />
      )}
    </div>
  );
}
