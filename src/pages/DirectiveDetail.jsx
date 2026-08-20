/* ============================================================================
   Panel detail arahan — Epik C (disposisi & kepemilikan), D (monitoring &
   penyelesaian), dan E (prioritisasi).
   ========================================================================== */

import { useRef, useState } from "react";
import {
  ArrowsClockwise, ArrowUpRight, Buildings, CalendarBlank, CalendarDots, ChartBar,
  ChatCenteredText, Check, CheckSquare, ClipboardText, Eye, FileText, Flag, Images,
  LinkSimple, PaperPlaneRight, Paperclip, ShieldCheck, SlidersHorizontal, Target,
  Trash, UploadSimple, UsersThree, WarningCircle, X,
} from "@phosphor-icons/react";
import {
  CLASSIFICATION_META, EFFORT_RUBRIC, IMPACT_RUBRIC, KENDALA_CATEGORIES, SLA,
  alignments, classifyPriority, hasPermission, priorities, units as seedUnits, usersByUnit,
} from "../data";
import {
  Avatar, EmptyInline, IconButton, LateBadge, Modal, NOW_LABEL, StatusBadge, TODAY_ISO,
  WORKABLE_STATUSES, daysUntil, deadlineUrgency, formatDate, isLate, lateDays, needsKendala,
  needsPic, sourceLabel,
} from "../ui";

/* --- Kerangka modal aksi --------------------------------------------------- */

function ActionModal({ title, subtitle, onClose, onSubmit, submitLabel, submitIcon: Icon = Check, disabled, error, children, danger }) {
  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
      <div className="modal-body form-grid">
        {children}
        {error && <div className="form-error full"><WarningCircle size={18} />{error}</div>}
        <div className="modal-actions full">
          <button className="button secondary" onClick={onClose}>Batal</button>
          <button className={`button ${danger ? "danger" : "primary"}`} disabled={disabled} onClick={onSubmit}>
            <Icon size={17} weight="bold" /> {submitLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* --- US-C1 Disposisi -------------------------------------------------------- */

function DisposisiModal({ directive, onClose, onSave }) {
  /* Unit tujuan yang dicatat saat pencatatan menjadi usulan awal. */
  const [unitShort, setUnitShort] = useState(directive.targetUnits?.[0] || "");
  const [supportUnits, setSupportUnits] = useState((directive.targetUnits || []).slice(1));
  const [workUnits, setWorkUnits] = useState([]);
  const [deadline, setDeadline] = useState(directive.deadline || "");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const unit = seedUnits.find((item) => item.short === unitShort);

  const toggleSupport = (short) => {
    setSupportUnits((current) => current.includes(short) ? current.filter((item) => item !== short) : [...current, short]);
  };
  const toggleWorkUnit = (name) => {
    setWorkUnits((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  };

  return (
    <ActionModal
      title="Tetapkan unit penanggung jawab"
      subtitle="Satu arahan memiliki satu unit penanggung jawab utama. Unit pendukung memperoleh akses membaca dan menanggapi."
      onClose={onClose}
      disabled={!unitShort || !deadline}
      error={error}
      submitLabel="Simpan disposisi"
      onSubmit={() => {
        if (!unitShort) return setError("Pilih unit penanggung jawab utama.");
        if (!deadline) return setError("Deadline wajib ditetapkan agar arahan dapat dipantau.");
        onSave({ unitShort, supportUnits, workUnits, deadline, note });
      }}
    >
      {directive.targetUnits?.length > 0 && (
        <div className="form-note full">
          <Buildings size={17} weight="fill" />
          <span>Arahan ini disampaikan kepada <strong>{directive.targetUnits.join(", ")}</strong>. Pilihan di bawah sudah disesuaikan dan masih dapat diubah.</span>
        </div>
      )}

      <label className="field full">
        <span>Unit penanggung jawab utama <b>*</b></span>
        <select value={unitShort} onChange={(event) => { setUnitShort(event.target.value); setSupportUnits((current) => current.filter((item) => item !== event.target.value)); setWorkUnits([]); }}>
          <option value="">Pilih unit Eselon I</option>
          {seedUnits.map((item) => <option key={item.id} value={item.short}>{item.name}</option>)}
        </select>
      </label>

      {unit && (
        <div className="field full">
          <span>Unit kerja pelaksana</span>
          <div className="chip-picker column">
            {unit.workUnits.map((workUnit) => (
              <button key={workUnit.name} type="button" className={workUnits.includes(workUnit.name) ? "selected" : ""} onClick={() => toggleWorkUnit(workUnit.name)}>
                {workUnits.includes(workUnit.name) && <Check size={13} weight="bold" />} {workUnit.name}
              </button>
            ))}
          </div>
          <small className="field-hint">Boleh lebih dari satu, boleh juga dikosongkan. Unit kerja bersifat keterangan pelaksana dan tidak memengaruhi hak akses.</small>
        </div>
      )}

      <div className="field full">
        <span>Unit pendukung</span>
        <div className="chip-picker">
          {seedUnits.filter((item) => item.short !== unitShort).map((item) => (
            <button key={item.id} type="button" className={supportUnits.includes(item.short) ? "selected" : ""} onClick={() => toggleSupport(item.short)} title={item.name}>
              {supportUnits.includes(item.short) && <Check size={13} weight="bold" />} {item.short}
            </button>
          ))}
        </div>
        <small className="field-hint">Boleh dikosongkan. Unit pendukung dapat membaca dan menanggapi, tanpa kewajiban mengajukan penyelesaian.</small>
      </div>

      <label className="field">
        <span>Deadline <b>*</b></span>
        <input type="date" min={TODAY_ISO} value={deadline} onChange={(event) => setDeadline(event.target.value)} />
      </label>

      <label className="field full">
        <span>Catatan disposisi</span>
        <textarea rows="2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Hal yang perlu diperhatikan unit penerima" />
      </label>
    </ActionModal>
  );
}

/* --- US-C2 Penetapan PIC ---------------------------------------------------- */

function PicModal({ directive, onClose, onSave }) {
  const candidates = usersByUnit(directive.unit);
  const [name, setName] = useState(directive.pic || "");
  const [reason, setReason] = useState("");
  const changing = Boolean(directive.pic);

  return (
    <ActionModal
      title={changing ? "Ganti penanggung jawab" : "Tetapkan penanggung jawab"}
      subtitle={`Pilihan dibatasi pada pengguna aktif di ${directive.unitName}.`}
      onClose={onClose}
      disabled={!name || (changing && name !== directive.pic && !reason.trim())}
      submitLabel="Simpan penugasan"
      onSubmit={() => onSave({ name, reason })}
    >
      <div className="field full">
        <span>Penanggung jawab pelaksana <b>*</b></span>
        <div className="person-picker">
          {candidates.map((person) => (
            <button key={person.id} type="button" className={name === person.name ? "selected" : ""} onClick={() => setName(person.name)}>
              <Avatar name={person.name} color={person.color} size="sm" />
              <span><strong>{person.name}</strong><small>{person.role}</small></span>
              {name === person.name && <Check size={16} weight="bold" />}
            </button>
          ))}
          {!candidates.length && <EmptyInline icon={UsersThree} text="Belum ada pengguna aktif terdaftar pada unit ini." />}
        </div>
      </div>
      {changing && name !== directive.pic && (
        <label className="field full">
          <span>Alasan pergantian <b>*</b></span>
          <textarea rows="2" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Jelaskan alasan pergantian penanggung jawab" />
        </label>
      )}
    </ActionModal>
  );
}

/* --- US-C3 Pemantau arahan --------------------------------------------------- */

function MonitorModal({ directive, onClose, onSave }) {
  const candidates = seedUnits.flatMap((unit) => usersByUnit(unit.short));
  const [name, setName] = useState(directive.monitor || "");
  return (
    <ActionModal
      title="Tetapkan pemantau arahan"
      subtitle="Pemantau memperoleh akses membaca dan menanggapi lintas unit, tanpa kewenangan mengubah status."
      onClose={onClose}
      disabled={!name}
      submitLabel="Simpan pemantau"
      onSubmit={() => onSave({ name })}
    >
      <label className="field full">
        <span>Pemantau <b>*</b></span>
        <select value={name} onChange={(event) => setName(event.target.value)}>
          <option value="">Pilih pemantau</option>
          {candidates.map((person) => <option key={person.id} value={person.name}>{person.name} — {person.unit}</option>)}
        </select>
      </label>
      <div className="form-note full">
        <Eye size={17} weight="fill" />
        <span>Pemantau menerima notifikasi yang sama dengan penanggung jawab untuk arahan ini.</span>
      </div>
    </ActionModal>
  );
}

/* --- US-C4 Pengajuan pindah unit --------------------------------------------- */

function RealihModal({ directive, onClose, onSave }) {
  const [targetUnit, setTargetUnit] = useState("");
  const [reason, setReason] = useState("");
  return (
    <ActionModal
      title="Ajukan pemindahan unit"
      subtitle="Cantumkan unit tujuan beserta alasannya agar dapat dinilai oleh pemberi keputusan."
      onClose={onClose}
      disabled={!targetUnit || !reason.trim()}
      submitLabel="Ajukan pemindahan"
      onSubmit={() => onSave({ targetUnit, reason: reason.trim() })}
    >
      <label className="field full">
        <span>Unit tujuan yang diusulkan <b>*</b></span>
        <select value={targetUnit} onChange={(event) => setTargetUnit(event.target.value)}>
          <option value="">Pilih unit tujuan</option>
          {seedUnits.filter((item) => item.short !== directive.unit).map((item) => <option key={item.id} value={item.short}>{item.name}</option>)}
        </select>
      </label>
      <label className="field full">
        <span>Alasan pemindahan <b>*</b></span>
        <textarea rows="3" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Jelaskan mengapa arahan ini di luar cakupan unit Anda" />
      </label>
      <div className="form-note warning full">
        <WarningCircle size={17} weight="fill" />
        <span>Selama menunggu keputusan, pekerjaan pada arahan ini dikunci dan status menjadi <strong>Menunggu Keputusan</strong>.</span>
      </div>
    </ActionModal>
  );
}

/* --- US-D5 Pengajuan perubahan deadline --------------------------------------- */

function DeadlineModal({ directive, onClose, onSave }) {
  const [proposedDeadline, setProposedDeadline] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  return (
    <ActionModal
      title="Ajukan deadline baru"
      subtitle={`Deadline yang berlaku saat ini: ${formatDate(directive.deadline)}.`}
      onClose={onClose}
      disabled={!proposedDeadline || !reason.trim()}
      error={error}
      submitLabel="Ajukan perubahan"
      onSubmit={() => {
        if (daysUntil(proposedDeadline) <= 0) return setError("Deadline usulan harus setelah hari ini.");
        onSave({ proposedDeadline, reason: reason.trim() });
      }}
    >
      <label className="field">
        <span>Deadline usulan <b>*</b></span>
        <input type="date" min={TODAY_ISO} value={proposedDeadline} onChange={(event) => setProposedDeadline(event.target.value)} />
      </label>
      <div className="field">
        <span>Riwayat perpanjangan</span>
        <div className="static-value">
          {directive.deadlineChanges?.length
            ? `${directive.deadlineChanges.length} kali diperpanjang`
            : "Belum pernah diperpanjang"}
        </div>
      </div>
      <label className="field full">
        <span>Alasan perubahan <b>*</b></span>
        <textarea rows="3" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Jelaskan penyebab perubahan deadline" />
      </label>
    </ActionModal>
  );
}

/* --- US-D6 Kendala keterlambatan ---------------------------------------------- */

function KendalaModal({ directive, onClose, onSave }) {
  const [category, setCategory] = useState(directive.kendala?.category || "");
  const [note, setNote] = useState(directive.kendala?.note || "");
  const needsNote = category === "Lainnya";
  return (
    <ActionModal
      title={directive.kendala ? "Perbarui kendala" : "Catat kendala keterlambatan"}
      subtitle="Kategori baku membantu pimpinan mengenali pola penyebab keterlambatan secara menyeluruh."
      onClose={onClose}
      disabled={!category || (needsNote && !note.trim())}
      submitLabel="Simpan kendala"
      onSubmit={() => onSave({ category, note: note.trim() })}
    >
      <div className="field full">
        <span>Kategori kendala <b>*</b></span>
        <div className="chip-picker column">
          {KENDALA_CATEGORIES.map((item) => (
            <button key={item} type="button" className={category === item ? "selected" : ""} onClick={() => setCategory(item)}>
              {category === item && <Check size={13} weight="bold" />} {item}
            </button>
          ))}
        </div>
      </div>
      <label className="field full">
        <span>Keterangan {needsNote && <b>*</b>}</span>
        <textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Jelaskan situasinya dan langkah yang sedang ditempuh" />
      </label>
    </ActionModal>
  );
}

/* --- US-D4 Pengajuan penyelesaian ---------------------------------------------- */

function ClaimDoneModal({ directive, onClose, onSave }) {
  const [summary, setSummary] = useState("");
  return (
    <ActionModal
      title="Ajukan penyelesaian"
      subtitle="Setiap penyelesaian diperiksa terlebih dahulu. Ringkasan hasil menjadi bahan penilaian pemeriksa."
      onClose={onClose}
      disabled={!summary.trim()}
      submitLabel="Ajukan penyelesaian"
      submitIcon={CheckSquare}
      onSubmit={() => onSave({ summary: summary.trim() })}
    >
      <label className="field full">
        <span>Ringkasan hasil <b>*</b></span>
        <textarea rows="4" value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Apa yang telah dikerjakan dan apa hasilnya" />
      </label>
      <div className="form-note full">
        <FileText size={17} weight="fill" />
        <span><strong>{directive.evidence.length} bukti pendukung</strong> akan ikut dikirim ke pemeriksa.</span>
      </div>
    </ActionModal>
  );
}

/* --- US-D7 Pembatalan ----------------------------------------------------------- */

function CancelModal({ onClose, onSave }) {
  const [reason, setReason] = useState("");
  return (
    <ActionModal
      title="Batalkan arahan"
      subtitle="Arahan yang dibatalkan tetap dapat dibaca beserta riwayatnya, dan tidak dihitung dalam capaian kinerja."
      onClose={onClose}
      disabled={!reason.trim()}
      submitLabel="Batalkan arahan"
      submitIcon={Trash}
      danger
      onSubmit={() => onSave({ reason: reason.trim() })}
    >
      <label className="field full">
        <span>Alasan pembatalan <b>*</b></span>
        <textarea rows="3" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Jelaskan mengapa arahan ini tidak lagi relevan" />
      </label>
    </ActionModal>
  );
}

/* --- US-E1 / US-E2 Penilaian prioritas -------------------------------------------- */

function PriorityModal({ directive, onClose, onSave }) {
  const [effort, setEffort] = useState(directive.effort ?? 3);
  const [impact, setImpact] = useState(directive.impact ?? 3);
  const [priority, setPriority] = useState(directive.priority || "Reguler");
  const [alignment, setAlignment] = useState(directive.alignment || "");
  const [reason, setReason] = useState("");
  const scored = directive.effort != null;
  const classification = classifyPriority(Number(effort), Number(impact));
  const meta = CLASSIFICATION_META[classification];

  return (
    <ActionModal
      title={scored ? "Perbarui penilaian prioritas" : "Nilai prioritas arahan"}
      subtitle="Klasifikasi dihitung otomatis dari nilai upaya dan dampak."
      onClose={onClose}
      disabled={!alignment || (scored && !reason.trim())}
      submitLabel="Simpan penilaian"
      submitIcon={Target}
      onSubmit={() => onSave({ effort: Number(effort), impact: Number(impact), priority, alignment, reason: reason.trim() })}
    >
      <label className="field full">
        <span>Upaya (effort) — <b className="score-value">{Number(effort).toFixed(1)}</b></span>
        <input type="range" min="1" max="5" step="0.5" value={effort} onChange={(event) => setEffort(event.target.value)} />
        <small className="field-hint">{EFFORT_RUBRIC}</small>
      </label>

      <label className="field full">
        <span>Dampak (impact) — <b className="score-value">{Number(impact).toFixed(1)}</b></span>
        <input type="range" min="1" max="5" step="0.5" value={impact} onChange={(event) => setImpact(event.target.value)} />
        <small className="field-hint">{IMPACT_RUBRIC}</small>
      </label>

      <div className={`classification-preview full tone-${meta?.tone}`}>
        <span><Target size={20} weight="duotone" /></span>
        <div><small>Klasifikasi otomatis</small><strong>{classification}</strong><p>{meta?.hint}</p></div>
      </div>

      <label className="field">
        <span>Level prioritas</span>
        <select value={priority} onChange={(event) => setPriority(event.target.value)}>
          {priorities.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>

      <label className="field">
        <span>Kesesuaian prioritas Badan <b>*</b></span>
        <select value={alignment} onChange={(event) => setAlignment(event.target.value)}>
          <option value="">Belum ditandai</option>
          {alignments.map((item) => <option key={item}>{item}</option>)}
        </select>
      </label>

      <div className="form-note full">
        <Flag size={17} weight="fill" />
        <span>Kesesuaian dicatat terpisah dari level prioritas, sehingga arahan berprioritas tinggi yang berada di luar arah strategis Badan tetap dapat dikenali.</span>
      </div>

      {scored && (
        <label className="field full">
          <span>Alasan revisi <b>*</b></span>
          <textarea rows="2" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Jelaskan alasan perubahan skor" />
        </label>
      )}
    </ActionModal>
  );
}

/* --- Panel detail ------------------------------------------------------------------ */

export default function DirectiveDetail({
  directive, role, actorName, agendas, initialTab = "comments",
  onClose, updateDirective, logAudit, showToast, onOpenAgenda,
}) {
  const [tab, setTab] = useState(initialTab);
  const [comment, setComment] = useState("");
  const [modal, setModal] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const fileInput = useRef(null);

  const closed = ["Selesai", "Dibatalkan"].includes(directive.status);
  const awaitingDecision = directive.status === "Menunggu Keputusan";
  const kendalaBlocked = needsKendala(directive);
  const agenda = agendas.find((item) => item.id === directive.agendaId);
  const classificationMeta = CLASSIFICATION_META[directive.classification];

  /** Satu pintu perubahan: patch data, catat riwayat, catat audit, beri umpan balik. */
  const apply = ({ patch, historyLabel, audit, toastTitle, toastMessage }) => {
    updateDirective(directive.id, (item) => ({
      ...patch,
      history: historyLabel ? [...item.history, { label: historyLabel, by: actorName, time: NOW_LABEL }] : item.history,
    }));
    if (audit) logAudit(audit.action, "Arahan", directive.id, audit.detail);
    if (toastTitle) showToast(toastTitle, toastMessage);
    setModal(null);
    setMoreOpen(false);
  };

  const addComment = () => {
    if (!comment.trim()) return;
    updateDirective(directive.id, (item) => ({
      comments: [...item.comments, { id: `c-${item.comments.length + 1}-${item.id}`, author: actorName, text: comment.trim(), time: NOW_LABEL }],
    }));
    logAudit("Menulis tanggapan", "Arahan", directive.id, comment.trim().slice(0, 60));
    setComment("");
    showToast("Tanggapan terkirim", "Perkembangan tercatat sebagai entri baru dan tidak menimpa tanggapan lain.");
  };

  const addEvidence = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast("Berkas terlalu besar", "Ukuran maksimal bukti pendukung adalah 10 MB.", "error");
      return;
    }
    const extension = (file.name.split(".").pop() || "FILE").toUpperCase();
    updateDirective(directive.id, (item) => ({
      evidence: [...item.evidence, {
        id: `e-${item.evidence.length + 1}-${item.id}`,
        name: file.name,
        type: extension,
        note: `${(file.size / 1024).toFixed(0)} KB · diunggah oleh ${actorName}`,
        by: actorName,
        at: TODAY_ISO,
      }],
    }));
    logAudit("Mengunggah bukti", "Arahan", directive.id, file.name);
    showToast("Bukti pendukung ditambahkan", `${file.name} siap dipakai untuk mengajukan penyelesaian.`);
    event.target.value = "";
  };

  const changeStatus = (nextStatus) => {
    if (!nextStatus || nextStatus === directive.status) return;
    apply({
      patch: { status: nextStatus },
      historyLabel: `Status diubah: ${directive.status} → ${nextStatus}`,
      audit: { action: "Mengubah status", detail: `${directive.status} → ${nextStatus}` },
      toastTitle: "Status diperbarui",
      toastMessage: `${directive.id} sekarang berstatus ${nextStatus}.`,
    });
  };

  const can = (permission) => hasPermission(role, permission);
  const canChangeStatus = can("arahan.ubah_status") && WORKABLE_STATUSES.includes(directive.status) && !closed && !awaitingDecision && !kendalaBlocked;
  const canClaimDone = can("arahan.klaim_done") && ["Belum Mulai", "Sedang Berjalan"].includes(directive.status) && !awaitingDecision && !kendalaBlocked;
  const canDisposisi = can("arahan.disposisi") && directive.status === "Belum Ditugaskan";
  const canSetPic = can("arahan.tetapkan_pic") && Boolean(directive.unit) && !closed;
  const canPropose = !closed && !awaitingDecision && !kendalaBlocked;

  return (
    <div className="drawer-layer" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="detail-dialog" role="dialog" aria-modal="true" aria-label={`Detail ${directive.id}`}>
        <header className="drawer-header">
          <div>
            <span>Arahan · {directive.id}</span>
            <h2>{directive.title}</h2>
            <div className="drawer-badges">
              <StatusBadge status={directive.status} />
              <LateBadge item={directive} />
              <span className={`priority ${directive.priority === "Prioritas Nasional" ? "national" : "agency"}`}><Flag size={13} />{directive.priority}</span>
              {directive.alignment === "Di Luar Prioritas" && <span className="priority outside"><WarningCircle size={13} />Di luar prioritas</span>}
              {directive.classification && <span className={`classification-chip tone-${classificationMeta?.tone}`}><Target size={13} />{directive.classification}</span>}
            </div>
          </div>
          <IconButton label="Tutup" onClick={onClose}><X size={21} /></IconButton>
        </header>

        <div className="drawer-scroll">
          {/* --- Peringatan yang menuntut tindakan --- */}
          {kendalaBlocked && (
            <div className="detail-alert danger">
              <span><WarningCircle size={21} weight="fill" /></span>
              <div>
                <strong>Catat kendala sebelum melanjutkan</strong>
                <p>Arahan ini terlambat {lateDays(directive)} hari, melewati ambang {SLA.kendalaAfterLateDays} hari kerja. Perubahan status dan pengajuan lainnya dikunci hingga kendala dicatat.</p>
              </div>
              {can("arahan.isi_kendala") && <button className="button primary" onClick={() => setModal("kendala")}>Catat kendala</button>}
            </div>
          )}

          {awaitingDecision && directive.pendingRequest && (
            <div className="detail-alert warning">
              <span><Flag size={21} weight="fill" /></span>
              <div>
                <strong>{directive.pendingRequest.type === "deadline" ? "Perubahan deadline menunggu keputusan" : "Pemindahan unit menunggu keputusan"}</strong>
                <p>
                  {directive.pendingRequest.type === "deadline"
                    ? `Usulan: ${formatDate(directive.deadline)} → ${formatDate(directive.pendingRequest.proposedDeadline)}.`
                    : `Usulan: ${directive.unit} → ${directive.pendingRequest.targetUnit}.`}
                  {" "}{directive.pendingRequest.reason}
                </p>
                <small>Diajukan {directive.pendingRequest.by} · {formatDate(directive.pendingRequest.at)}</small>
              </div>
            </div>
          )}

          {needsPic(directive) && !kendalaBlocked && (
            <div className="detail-alert info">
              <span><UsersThree size={21} weight="fill" /></span>
              <div>
                <strong>Belum ada penanggung jawab</strong>
                <p>Arahan telah didisposisikan lebih dari {SLA.picMaxDays} hari kerja tanpa penanggung jawab pelaksana.</p>
              </div>
              {canSetPic && <button className="button primary" onClick={() => setModal("pic")}>Tetapkan PIC</button>}
            </div>
          )}

          {directive.status === "Belum Ditugaskan" && (
            <div className="detail-alert info">
              <span><Buildings size={21} weight="fill" /></span>
              <div>
                <strong>Belum didisposisikan</strong>
                <p>Arahan telah lolos kurasi, namun belum memiliki unit penanggung jawab.</p>
              </div>
              {canDisposisi && <button className="button primary" onClick={() => setModal("disposisi")}>Tetapkan unit</button>}
            </div>
          )}

          {/* --- Informasi utama --- */}
          <section className="detail-key-facts" aria-label="Informasi utama arahan">
            <div className={isLate(directive) ? "critical" : ""}>
              <span><CalendarBlank size={20} weight="duotone" /></span>
              <span><small>Deadline</small><strong>{formatDate(directive.deadline)}</strong><b>{deadlineUrgency(directive)}</b></span>
            </div>
            <div>
              <span><Buildings size={20} weight="duotone" /></span>
              <span>
                <small>Unit penanggung jawab</small>
                <strong>{directive.unitName || "Belum ditentukan"}</strong>
                {directive.workUnits?.length > 0 && <b>{directive.workUnits.join(" · ")}</b>}
              </span>
            </div>
            <div>
              {directive.pic ? <Avatar name={directive.pic} color={directive.picColor} size="sm" /> : <span><UsersThree size={20} weight="duotone" /></span>}
              <span><small>Penanggung jawab</small><strong>{directive.pic || "Belum ditetapkan"}</strong>{directive.monitor && <b>Pemantau: {directive.monitor}</b>}</span>
            </div>
          </section>

          {/* Kepada siapa arahan ini disampaikan, terpisah dari siapa yang akhirnya ditugasi. */}
          <section className="recipient-panel">
            <span><Buildings size={19} weight="duotone" /></span>
            <div>
              <small>Disampaikan kepada</small>
              <div className="recipient-chips">
                {(directive.targetUnits?.length ? directive.targetUnits : ["Belum dicatat"]).map((short) => {
                  const target = seedUnits.find((item) => item.short === short);
                  return <span key={short} className={short === directive.unit ? "is-owner" : ""} title={target?.name || ""}>{short}</span>;
                })}
              </div>
              {directive.supportUnits?.length > 0 && <p>Unit pendukung: {directive.supportUnits.join(", ")}</p>}
            </div>
          </section>

          {directive.kendala && (
            <section className="kendala-panel">
              <span><WarningCircle size={19} weight="duotone" /></span>
              <div>
                <small>Kendala tercatat · {formatDate(directive.kendala.at)}</small>
                <strong>{directive.kendala.category}</strong>
                {directive.kendala.note && <p>{directive.kendala.note}</p>}
              </div>
              {can("arahan.isi_kendala") && !closed && <button className="simple-link" onClick={() => setModal("kendala")}>Perbarui</button>}
            </section>
          )}

          {directive.completion && (
            <section className="completion-panel">
              <span><CheckSquare size={19} weight="duotone" /></span>
              <div>
                <small>Ringkasan hasil · diajukan {directive.completion.by}</small>
                <p>{directive.completion.summary}</p>
              </div>
            </section>
          )}

          {directive.cancelReason && (
            <section className="kendala-panel muted">
              <span><X size={19} weight="duotone" /></span>
              <div><small>Alasan pembatalan</small><p>{directive.cancelReason}</p></div>
            </section>
          )}

          {/* --- Kendali status --- */}
          {canChangeStatus && (
            <section className="simple-status-control" aria-label="Ubah status pekerjaan">
              <div>
                <span><ArrowsClockwise size={20} weight="duotone" /></span>
                <span><strong>Status pekerjaan</strong><small>Hanya status pelaksanaan yang dapat diubah langsung. Penyelesaian ditetapkan melalui pemeriksaan.</small></span>
              </div>
              <label>
                <select value={directive.status} onChange={(event) => changeStatus(event.target.value)}>
                  {WORKABLE_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </section>
          )}

          {/* --- Penilaian prioritas (US-E1/E2) --- */}
          <section className="priority-panel">
            <header>
              <span><Target size={19} weight="duotone" /></span>
              <div><strong>Penilaian prioritas</strong><small>Klasifikasi dihitung otomatis dari nilai upaya dan dampak.</small></div>
              {can("prioritas.nilai") && !closed && (
                <button className="simple-link" onClick={() => setModal("priority")}>{directive.effort != null ? "Perbarui" : "Nilai sekarang"}</button>
              )}
            </header>
            {directive.effort != null ? (
              <div className="score-row">
                <div><small>Upaya</small><strong>{directive.effort.toFixed(1)}</strong></div>
                <div><small>Dampak</small><strong>{directive.impact.toFixed(1)}</strong></div>
                <div className="score-classification"><small>Klasifikasi</small><strong>{directive.classification}</strong></div>
                <div><small>Kesesuaian</small><strong>{directive.alignment || "Belum ditandai"}</strong></div>
              </div>
            ) : (
              <EmptyInline icon={Target} text="Belum dinilai. Arahan tanpa nilai upaya dan dampak tidak muncul pada papan prioritas." />
            )}
          </section>

          {/* --- Informasi lainnya --- */}
          <details className="detail-more-info">
            <summary><span><SlidersHorizontal size={18} /> Informasi lainnya</span></summary>
            <div className="detail-overview">
              <div><small>Konteks</small><strong>{directive.context}</strong></div>
              <div><small>Sumber</small><strong>{sourceLabel(directive.source)}</strong></div>
              <div><small>Dicatat oleh</small><strong>{directive.recordedBy}</strong></div>
              <div><small>Tanggal arahan</small><strong>{formatDate(directive.date)}</strong></div>
              <div><small>Koordinator unit</small><strong>{directive.pmo || "—"}</strong></div>
              {directive.workUnits?.length > 0 && <div><small>Unit kerja pelaksana</small><strong>{directive.workUnits.join(", ")}</strong></div>}
              {directive.deadlineChanges?.length > 0 && (
                <div><small>Perpanjangan deadline</small><strong>{directive.deadlineChanges.length} kali</strong><b>{formatDate(directive.originalDeadline)} → {formatDate(directive.deadline)}</b></div>
              )}
            </div>
            {directive.sourceLink && (
              <a className="source-link" href={directive.sourceLink} target="_blank" rel="noreferrer"><LinkSimple size={16} /> {directive.sourceLink}</a>
            )}
            {agenda && (
              <button className="agenda-link" onClick={() => onOpenAgenda(agenda.id)}>
                <ClipboardText size={18} weight="duotone" />
                <span><small>Lahir dari agenda</small><strong>{agenda.title}</strong></span>
                <ArrowUpRight size={16} />
              </button>
            )}
          </details>

          {/* --- Tab --- */}
          <div className="detail-tabs">
            <button className={tab === "comments" ? "active" : ""} onClick={() => setTab("comments")}><ChatCenteredText size={17} /> Perkembangan <span>{directive.comments.length}</span></button>
            <button className={tab === "evidence" ? "active" : ""} onClick={() => setTab("evidence")}><Images size={17} /> Bukti <span>{directive.evidence.length}</span></button>
            <button className={tab === "history" ? "active" : ""} onClick={() => setTab("history")}><ChartBar size={17} /> Riwayat <span>{directive.history.length}</span></button>
          </div>

          {tab === "comments" && (
            <section className="comment-feed">
              {directive.comments.length
                ? directive.comments.map((item) => (
                  <article key={item.id}>
                    <Avatar name={item.author} color="#0070FF" size="xs" />
                    <div><header><strong>{item.author}</strong><time>{item.time}</time></header><p>{item.text}</p></div>
                  </article>
                ))
                : <EmptyInline icon={ChatCenteredText} text="Belum ada perkembangan tercatat. Mulai koordinasi di sini." />}
              {hasPermission(role, "tanggapan.create") && !closed && (
                <div className="comment-composer">
                  <textarea rows="3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Tulis perkembangan pekerjaan" />
                  <div>
                    <button aria-label="Lampirkan bukti pendukung" title="Lampirkan bukti pendukung" onClick={() => fileInput.current?.click()}><Paperclip size={17} /></button>
                    <button className="send-button" disabled={!comment.trim()} onClick={addComment}>Kirim <PaperPlaneRight size={16} weight="fill" /></button>
                  </div>
                </div>
              )}
            </section>
          )}

          {tab === "evidence" && (
            <section className="evidence-grid">
              {directive.evidence.map((item) => (
                <article key={item.id}>
                  <span><FileText size={24} /></span>
                  <div><strong>{item.name}</strong><small>{item.note}</small></div>
                  <IconButton label="Buka bukti" onClick={() => showToast("Pratinjau bukti", `${item.name} dibuka untuk diperiksa.`)}><ArrowUpRight size={16} /></IconButton>
                </article>
              ))}
              {hasPermission(role, "evidence.upload") && !closed && directive.status !== "Menunggu Verifikasi" && (
                <button className="evidence-add" onClick={() => fileInput.current?.click()}>
                  <UploadSimple size={23} />
                  <strong>Unggah bukti</strong>
                  <small>PDF, DOCX, XLSX, PNG, atau JPG hingga 10 MB</small>
                </button>
              )}
              {!directive.evidence.length && !hasPermission(role, "evidence.upload") && <EmptyInline icon={Images} text="Belum ada bukti pendukung untuk arahan ini." />}
              {["Menunggu Verifikasi", "Selesai"].includes(directive.status) && (
                <p className="evidence-lock"><ShieldCheck size={15} /> Bukti dikunci karena arahan sedang atau telah diperiksa.</p>
              )}
            </section>
          )}

          {tab === "history" && (
            <section className="history-timeline">
              {directive.history.map((item, index) => (
                <article key={`${item.label}-${index}`}>
                  <i />
                  <div><strong>{item.label}</strong><p>{item.by}</p><time>{item.time}</time></div>
                </article>
              ))}
            </section>
          )}
        </div>

        <footer className="drawer-actions">
          <div className="detail-more-actions">
            {canPropose && (can("arahan.ajukan_realih") || can("arahan.usul_deadline") || can("arahan.batalkan") || can("arahan.tetapkan_pemantau") || canSetPic) && (
              <button className="button secondary" onClick={() => setMoreOpen((value) => !value)} aria-expanded={moreOpen}>
                Opsi lainnya <CalendarDots size={16} />
              </button>
            )}
            {moreOpen && (
              <div className="detail-action-menu">
                {canSetPic && (
                  <button onClick={() => { setMoreOpen(false); setModal("pic"); }}>
                    <UsersThree size={18} /><span><strong>{directive.pic ? "Ganti penanggung jawab" : "Tetapkan penanggung jawab"}</strong><small>Pilih pelaksana dari anggota unit</small></span>
                  </button>
                )}
                {can("arahan.tetapkan_pemantau") && (
                  <button onClick={() => { setMoreOpen(false); setModal("monitor"); }}>
                    <Eye size={18} /><span><strong>{directive.monitor ? "Ganti pemantau" : "Tetapkan pemantau"}</strong><small>Pengawas tambahan lintas unit untuk arahan penting</small></span>
                  </button>
                )}
                {can("arahan.ajukan_realih") && directive.unit && (
                  <button onClick={() => { setMoreOpen(false); setModal("realih"); }}>
                    <ArrowsClockwise size={18} /><span><strong>Ajukan pindah unit</strong><small>Sebutkan unit tujuan dan alasannya</small></span>
                  </button>
                )}
                {can("arahan.usul_deadline") && (
                  <button onClick={() => { setMoreOpen(false); setModal("deadline"); }}>
                    <CalendarDots size={18} /><span><strong>Ajukan deadline baru</strong><small>Sertakan tanggal usulan dan alasan</small></span>
                  </button>
                )}
                {can("arahan.isi_kendala") && isLate(directive) && (
                  <button onClick={() => { setMoreOpen(false); setModal("kendala"); }}>
                    <WarningCircle size={18} /><span><strong>{directive.kendala ? "Perbarui kendala" : "Catat kendala"}</strong><small>Pilih kategori baku keterlambatan</small></span>
                  </button>
                )}
                {can("arahan.batalkan") && directive.status !== "Selesai" && (
                  <button className="danger" onClick={() => { setMoreOpen(false); setModal("cancel"); }}>
                    <Trash size={18} /><span><strong>Batalkan arahan</strong><small>Alasan wajib dan tercatat di riwayat</small></span>
                  </button>
                )}
              </div>
            )}
          </div>

          {canClaimDone && (
            <div className="detail-primary-action">
              <button
                className="button primary"
                disabled={!directive.evidence.length}
                onClick={() => setModal("claim")}
                title={!directive.evidence.length ? "Lampirkan minimal satu bukti sebelum mengajukan penyelesaian" : ""}
              >
                <CheckSquare size={18} /> Ajukan selesai
              </button>
              {!directive.evidence.length && <small>Unggah bukti terlebih dahulu</small>}
            </div>
          )}
        </footer>
      </section>

      <input ref={fileInput} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg" hidden onChange={addEvidence} />

      {modal === "disposisi" && (
        <DisposisiModal
          directive={directive}
          onClose={() => setModal(null)}
          onSave={({ unitShort, supportUnits, workUnits, deadline, note }) => {
            const unit = seedUnits.find((item) => item.short === unitShort);
            apply({
              patch: {
                unit: unitShort, unitName: unit.name, pmo: unit.pmo, supportUnits, workUnits,
                deadline, status: "Belum Mulai",
              },
              historyLabel: `Didisposisikan ke ${unit.name}${supportUnits.length ? `, didukung ${supportUnits.join(", ")}` : ""}${note ? ` · ${note}` : ""}`,
              audit: { action: "Mendisposisikan arahan", detail: `→ ${unit.name}` },
              toastTitle: "Disposisi tersimpan",
              toastMessage: `${unit.short} menerima arahan ini dengan deadline ${formatDate(deadline)}.`,
            });
          }}
        />
      )}

      {modal === "pic" && (
        <PicModal
          directive={directive}
          onClose={() => setModal(null)}
          onSave={({ name, reason }) => {
            const person = usersByUnit(directive.unit).find((item) => item.name === name);
            apply({
              patch: { pic: name, picColor: person?.color || "#98A2B3" },
              historyLabel: directive.pic
                ? `Penanggung jawab diganti: ${directive.pic} → ${name}${reason ? ` · ${reason}` : ""}`
                : `Penanggung jawab ditetapkan: ${name}`,
              audit: { action: "Menetapkan penanggung jawab", detail: `${directive.pic || "—"} → ${name}` },
              toastTitle: "Penanggung jawab tersimpan",
              toastMessage: `${name} menerima notifikasi penugasan arahan ini.`,
            });
          }}
        />
      )}

      {modal === "monitor" && (
        <MonitorModal
          directive={directive}
          onClose={() => setModal(null)}
          onSave={({ name }) => apply({
            patch: { monitor: name },
            historyLabel: `Pemantau arahan ditetapkan: ${name}`,
            audit: { action: "Menetapkan pemantau", detail: name },
            toastTitle: "Pemantau tersimpan",
            toastMessage: `${name} kini memantau arahan ini.`,
          })}
        />
      )}

      {modal === "realih" && (
        <RealihModal
          directive={directive}
          onClose={() => setModal(null)}
          onSave={({ targetUnit, reason }) => apply({
            patch: {
              status: "Menunggu Keputusan",
              pendingRequest: { type: "realih", targetUnit, reason, by: actorName, at: TODAY_ISO, previousStatus: directive.status },
            },
            historyLabel: `Pemindahan unit diajukan ke ${targetUnit} · ${reason}`,
            audit: { action: "Mengajukan pemindahan unit", detail: `${directive.unit} → ${targetUnit}` },
            toastTitle: "Pengajuan terkirim",
            toastMessage: "Koordinator Sistem akan memutuskan permintaan pemindahan ini.",
          })}
        />
      )}

      {modal === "deadline" && (
        <DeadlineModal
          directive={directive}
          onClose={() => setModal(null)}
          onSave={({ proposedDeadline, reason }) => apply({
            patch: {
              status: "Menunggu Keputusan",
              pendingRequest: { type: "deadline", proposedDeadline, reason, by: actorName, at: TODAY_ISO, previousStatus: directive.status },
            },
            historyLabel: `Deadline baru diajukan: ${formatDate(directive.deadline)} → ${formatDate(proposedDeadline)} · ${reason}`,
            audit: { action: "Mengajukan perubahan deadline", detail: `${directive.deadline} → ${proposedDeadline}` },
            toastTitle: "Pengajuan terkirim",
            toastMessage: "Koordinator Sistem akan memutuskan perubahan deadline ini.",
          })}
        />
      )}

      {modal === "kendala" && (
        <KendalaModal
          directive={directive}
          onClose={() => setModal(null)}
          onSave={({ category, note }) => apply({
            patch: { kendala: { category, note, at: TODAY_ISO } },
            historyLabel: `${directive.kendala ? "Kendala diperbarui" : "Kendala dicatat"}: ${category}`,
            audit: { action: "Mencatat kendala", detail: category },
            toastTitle: "Kendala tersimpan",
            toastMessage: "Kendala ini masuk ke rekap penyebab keterlambatan pada beranda.",
          })}
        />
      )}

      {modal === "claim" && (
        <ClaimDoneModal
          directive={directive}
          onClose={() => setModal(null)}
          onSave={({ summary }) => apply({
            patch: { status: "Menunggu Verifikasi", completion: { summary, by: actorName, at: TODAY_ISO } },
            historyLabel: "Penyelesaian diajukan beserta bukti",
            audit: { action: "Mengajukan penyelesaian", detail: `${directive.status} → Menunggu Verifikasi` },
            toastTitle: "Penyelesaian diajukan",
            toastMessage: "Pemeriksa akan menilai bukti dan ringkasan hasil Anda.",
          })}
        />
      )}

      {modal === "cancel" && (
        <CancelModal
          onClose={() => setModal(null)}
          onSave={({ reason }) => apply({
            patch: { status: "Dibatalkan", cancelReason: reason },
            historyLabel: `Arahan dibatalkan · ${reason}`,
            audit: { action: "Membatalkan arahan", detail: reason.slice(0, 60) },
            toastTitle: "Arahan dibatalkan",
            toastMessage: "Riwayat tetap tersimpan dan arahan dikecualikan dari hitungan kinerja.",
          })}
        />
      )}

      {modal === "priority" && (
        <PriorityModal
          directive={directive}
          onClose={() => setModal(null)}
          onSave={({ effort, impact, priority, alignment, reason }) => {
            const classification = classifyPriority(effort, impact);
            apply({
              patch: { effort, impact, priority, alignment, classification },
              historyLabel: `Penilaian prioritas ${directive.effort != null ? "diperbarui" : "ditetapkan"}: upaya ${effort} · dampak ${impact} → ${classification}${reason ? ` · ${reason}` : ""}`,
              audit: { action: "Menilai prioritas", detail: `upaya ${effort}, dampak ${impact} → ${classification}` },
              toastTitle: "Penilaian tersimpan",
              toastMessage: `Arahan diklasifikasikan sebagai ${classification}.`,
            });
          }}
        />
      )}
    </div>
  );
}
