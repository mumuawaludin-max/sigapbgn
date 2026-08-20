/* ============================================================================
   Halaman pemeriksaan — empat antrean yang menjaga register tetap sahih:
   US-A2/A3 konfirmasi · US-A4 kurasi · US-D4 verifikasi · US-C4/D5 keputusan.
   ========================================================================== */

import { useState } from "react";
import {
  ArrowsClockwise, ArrowUpRight, CalendarDots, Check, CheckSquare, ClipboardText,
  Copy, FileText, Flag, LinkSimple, PencilSimple, ShieldCheck, X,
} from "@phosphor-icons/react";
import { hasPermission, units as seedUnits } from "../data";
import {
  Avatar, EmptyInline, IconButton, Modal, NOW_LABEL, PageHeading, TODAY_ISO,
  formatDate, sourceLabel,
} from "../ui";

/* --- Modal catatan pengembalian ---------------------------------------------- */

function NoteModal({ title, subtitle, label, submitLabel, danger, onClose, onSave }) {
  const [note, setNote] = useState("");
  return (
    <Modal title={title} subtitle={subtitle} onClose={onClose}>
      <div className="modal-body form-grid">
        <label className="field full">
          <span>{label} <b>*</b></span>
          <textarea rows="3" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Jelaskan bagian yang perlu diperbaiki" />
        </label>
        <div className="modal-actions full">
          <button className="button secondary" onClick={onClose}>Batal</button>
          <button className={`button ${danger ? "danger" : "primary"}`} disabled={!note.trim()} onClick={() => onSave(note.trim())}>
            <Check size={17} weight="bold" /> {submitLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* --- Modal perbaikan redaksi (US-A4) ------------------------------------------ */

function ReviseModal({ directive, onClose, onSave }) {
  const [title, setTitle] = useState(directive.title);
  return (
    <Modal title="Perbaiki redaksi arahan" subtitle="Redaksi sebelum dan sesudah perbaikan tercatat pada riwayat." onClose={onClose} wide>
      <div className="modal-body form-grid">
        <div className="field full">
          <span>Redaksi saat ini</span>
          <div className="static-value block">{directive.title}</div>
        </div>
        <label className="field full">
          <span>Redaksi perbaikan <b>*</b></span>
          <textarea rows="4" value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        <div className="modal-actions full">
          <button className="button secondary" onClick={onClose}>Batal</button>
          <button className="button primary" disabled={!title.trim() || title.trim() === directive.title} onClick={() => onSave(title.trim())}>
            <Check size={17} weight="bold" /> Simpan perbaikan
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* --- Modal penandaan duplikat (US-A4) ------------------------------------------ */

function DuplicateModal({ directive, candidates, onClose, onSave }) {
  const [originalId, setOriginalId] = useState("");
  return (
    <Modal title="Tandai sebagai duplikat" subtitle="Pilih arahan asli yang telah lebih dahulu tercatat pada register." onClose={onClose} wide>
      <div className="modal-body form-grid">
        <div className="field full">
          <span>Arahan yang sedang dikurasi</span>
          <div className="static-value block">{directive.title}</div>
        </div>
        <div className="field full">
          <span>Arahan asli <b>*</b></span>
          <div className="duplicate-picker">
            {candidates.slice(0, 30).map((item) => (
              <button key={item.id} type="button" className={originalId === item.id ? "selected" : ""} onClick={() => setOriginalId(item.id)}>
                <span><small>{item.id}</small><strong>{item.title}</strong><em>{item.unit || "Belum didisposisikan"} · {formatDate(item.deadline)}</em></span>
                {originalId === item.id && <Check size={16} weight="bold" />}
              </button>
            ))}
            {!candidates.length && <EmptyInline icon={Copy} text="Belum ada arahan lain pada register aktif." />}
          </div>
        </div>
        <div className="modal-actions full">
          <button className="button secondary" onClick={onClose}>Batal</button>
          <button className="button danger" disabled={!originalId} onClick={() => onSave(originalId)}>
            <Copy size={17} weight="bold" /> Tandai duplikat
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* --- Halaman -------------------------------------------------------------------- */

/** Orang yang paling relevan ditampilkan pada tiap antrean, agar nama dan avatar selalu cocok. */
function personLabel(item, tab) {
  if (tab === "verifikasi" && item.completion) {
    return { role: "Diajukan oleh", name: item.completion.by, color: item.picColor };
  }
  if (tab === "keputusan" && item.pendingRequest) {
    return { role: "Diajukan oleh", name: item.pendingRequest.by, color: "#B54708" };
  }
  return { role: "Dicatat oleh", name: item.recordedBy, color: "#0641A2" };
}

const TABS = [
  { id: "konfirmasi", label: "Konfirmasi sumber", icon: ShieldCheck, status: "Menunggu Konfirmasi", permission: "arahan.konfirmasi" },
  { id: "kurasi", label: "Kurasi", icon: ClipboardText, status: "Menunggu Kurasi", permission: "arahan.kurasi" },
  { id: "verifikasi", label: "Verifikasi penyelesaian", icon: CheckSquare, status: "Menunggu Verifikasi", permission: "arahan.approve_done" },
  { id: "keputusan", label: "Keputusan", icon: Flag, status: "Menunggu Keputusan", permission: "arahan.approve_deadline" },
];

export default function ReviewPage({
  directives, allDirectives, activeRole, actorName, updateDirective, logAudit, showToast, onSelect,
}) {
  const available = TABS.filter((tab) => hasPermission(activeRole, tab.permission)
    || (tab.id === "keputusan" && hasPermission(activeRole, "arahan.approve_realih")));
  const [tab, setTab] = useState(available[0]?.id || "kurasi");
  const [modal, setModal] = useState(null);

  const activeTab = available.find((item) => item.id === tab) || available[0];
  const items = activeTab ? directives.filter((item) => item.status === activeTab.status) : [];

  const apply = (directive, { patch, historyLabel, audit, toastTitle, toastMessage }) => {
    updateDirective(directive.id, (item) => ({
      ...patch,
      history: [...item.history, { label: historyLabel, by: actorName, time: NOW_LABEL }],
    }));
    logAudit(audit.action, "Arahan", directive.id, audit.detail);
    showToast(toastTitle, toastMessage);
    setModal(null);
  };

  /* --- Aksi per antrean --- */

  const confirmSource = (directive) => apply(directive, {
    patch: { status: "Menunggu Kurasi" },
    historyLabel: "Keabsahan sumber dikonfirmasi",
    audit: { action: "Mengonfirmasi sumber arahan", detail: "Menunggu Konfirmasi → Menunggu Kurasi" },
    toastTitle: "Sumber terkonfirmasi",
    toastMessage: `${directive.id} masuk antrean kurasi.`,
  });

  const approveCuration = (directive) => apply(directive, {
    patch: { status: "Belum Ditugaskan" },
    historyLabel: "Lolos kurasi dan masuk register aktif",
    audit: { action: "Menyetujui kurasi", detail: "Menunggu Kurasi → Belum Ditugaskan" },
    toastTitle: "Arahan masuk register",
    toastMessage: `${directive.id} siap didisposisikan kepada unit.`,
  });

  const approveCompletion = (directive) => apply(directive, {
    patch: { status: "Selesai", completedAt: TODAY_ISO },
    historyLabel: "Penyelesaian disetujui",
    audit: { action: "Menyetujui penyelesaian", detail: "Menunggu Verifikasi → Selesai" },
    toastTitle: "Penyelesaian disetujui",
    toastMessage: `${directive.id} dinyatakan selesai pada hari ini.`,
  });

  const decideRequest = (directive, approved) => {
    const request = directive.pendingRequest;
    if (!request) return;
    const restoreStatus = request.previousStatus || "Sedang Berjalan";

    if (request.type === "deadline") {
      if (approved) {
        apply(directive, {
          patch: {
            status: restoreStatus,
            deadline: request.proposedDeadline,
            pendingRequest: null,
            deadlineChanges: [...(directive.deadlineChanges || []), { from: directive.deadline, to: request.proposedDeadline, reason: request.reason, by: request.by, at: TODAY_ISO }],
          },
          historyLabel: `Perubahan deadline disetujui: ${formatDate(directive.deadline)} → ${formatDate(request.proposedDeadline)}`,
          audit: { action: "Menyetujui perubahan deadline", detail: `${directive.deadline} → ${request.proposedDeadline}` },
          toastTitle: "Deadline diperbarui",
          toastMessage: `Deadline ${directive.id} kini ${formatDate(request.proposedDeadline)}.`,
        });
      } else {
        setModal({ type: "reject", directive });
      }
      return;
    }

    if (approved) {
      const unit = seedUnits.find((item) => item.short === request.targetUnit);
      apply(directive, {
        patch: {
          status: "Belum Mulai", unit: unit.short, unitName: unit.name, pmo: unit.pmo,
          pic: null, picColor: "#98A2B3", workUnits: [], pendingRequest: null,
        },
        historyLabel: `Pemindahan unit disetujui: ${directive.unit} → ${unit.short}. Penanggung jawab dikosongkan.`,
        audit: { action: "Menyetujui pemindahan unit", detail: `${directive.unit} → ${unit.short}` },
        toastTitle: "Arahan dipindahkan",
        toastMessage: `${unit.short} menerima arahan ini dan perlu menetapkan penanggung jawab.`,
      });
    } else {
      setModal({ type: "reject", directive });
    }
  };

  if (!activeTab) {
    return (
      <div className="page-container verification-page">
        <PageHeading eyebrow="Pemeriksaan" title="Tidak ada antrean" description="Peran yang Anda gunakan tidak memiliki kewenangan pemeriksaan." />
      </div>
    );
  }

  const registerCandidates = allDirectives.filter((item) => !["Menunggu Kurasi", "Menunggu Konfirmasi", "Dibatalkan"].includes(item.status));

  return (
    <div className="page-container verification-page">
      <PageHeading
        eyebrow="Pemeriksaan arahan"
        title="Antrean pemeriksaan"
        description="Pemeriksaan bertahap agar register hanya memuat arahan yang sah, tidak ganda, dan tuntas penyelesaiannya."
      >
        <div className="queue-count"><span>{items.length}</span><small>menunggu di antrean ini</small></div>
      </PageHeading>

      <div className="segment-tabs">
        {available.map((item) => {
          const Icon = item.icon;
          const count = directives.filter((directive) => directive.status === item.status).length;
          return (
            <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
              <Icon size={17} /> {item.label} {count > 0 && <span className="tab-count">{count}</span>}
            </button>
          );
        })}
      </div>

      <p className="queue-hint">
        {tab === "konfirmasi" && "Pastikan arahan lisan dan arahan dari kanal publik benar berasal dari pimpinan sebelum masuk tahap kurasi."}
        {tab === "kurasi" && "Setujui, kembalikan, perbaiki redaksi, atau tandai sebagai duplikat. Arahan baru tayang pada register setelah lolos kurasi."}
        {tab === "verifikasi" && "Periksa ringkasan hasil beserta bukti pendukung sebelum menyatakan arahan selesai."}
        {tab === "keputusan" && "Putuskan pengajuan perubahan deadline dan pemindahan unit yang diajukan koordinator unit."}
      </p>

      <div className="verification-grid">
        {items.map((item) => (
          <article className="card verification-card" key={item.id}>
            <header>
              <span className={`source-badge source-${item.source.toLowerCase()}`}>{sourceLabel(item.source)}</span>
              <small>{item.id}</small>
              <IconButton label="Buka detail" onClick={() => onSelect(item.id)}><ArrowUpRight size={17} /></IconButton>
            </header>

            <h2>{item.title}</h2>
            <p>{item.context} · {formatDate(item.date)}</p>

            {item.sourceLink && (
              <a className="source-link" href={item.sourceLink} target="_blank" rel="noreferrer"><LinkSimple size={15} /> {item.sourceLink}</a>
            )}

            <div className="verification-owner">
              <Avatar name={personLabel(item, tab).name} color={personLabel(item, tab).color} size="sm" />
              <span><small>{personLabel(item, tab).role}</small><strong>{personLabel(item, tab).name}</strong></span>
              {item.unit && <span className="unit-chip">{item.unit}</span>}
            </div>

            {tab === "verifikasi" && item.completion && (
              <div className="verification-summary">
                <small>Ringkasan hasil</small>
                <p>{item.completion.summary}</p>
              </div>
            )}

            {tab === "verifikasi" && (
              <button className="evidence-summary" onClick={() => onSelect(item.id, "evidence")}>
                <FileText size={19} />
                <span><strong>{item.evidence.length} bukti pendukung</strong><small>Buka dan periksa bukti</small></span>
                <ArrowUpRight size={15} />
              </button>
            )}

            {tab === "keputusan" && item.pendingRequest && (
              <div className={`request-panel ${item.pendingRequest.type}`}>
                <span>{item.pendingRequest.type === "deadline" ? <CalendarDots size={19} weight="duotone" /> : <ArrowsClockwise size={19} weight="duotone" />}</span>
                <div>
                  <small>{item.pendingRequest.type === "deadline" ? "Usulan deadline baru" : "Usulan pemindahan unit"}</small>
                  <strong>
                    {item.pendingRequest.type === "deadline"
                      ? `${formatDate(item.deadline)} → ${formatDate(item.pendingRequest.proposedDeadline)}`
                      : `${item.unit} → ${item.pendingRequest.targetUnit}`}
                  </strong>
                  <p>{item.pendingRequest.reason}</p>
                  <em>
                    Diajukan {item.pendingRequest.by} · {formatDate(item.pendingRequest.at)}
                    {item.pendingRequest.type === "deadline" && ` · sudah ${item.deadlineChanges?.length || 0} kali diperpanjang`}
                  </em>
                </div>
              </div>
            )}

            <footer>
              {tab === "kurasi" && (
                <>
                  <IconButton label="Perbaiki redaksi" onClick={() => setModal({ type: "revise", directive: item })}><PencilSimple size={17} /></IconButton>
                  <IconButton label="Tandai duplikat" onClick={() => setModal({ type: "duplicate", directive: item })}><Copy size={17} /></IconButton>
                </>
              )}
              <button className="button secondary" onClick={() => setModal({ type: "return", directive: item })}>
                <X size={17} /> Kembalikan
              </button>
              <button
                className="button approve"
                onClick={() => {
                  if (tab === "konfirmasi") confirmSource(item);
                  else if (tab === "kurasi") approveCuration(item);
                  else if (tab === "verifikasi") approveCompletion(item);
                  else decideRequest(item, true);
                }}
              >
                <Check size={17} weight="bold" /> {tab === "keputusan" ? "Setujui usulan" : "Setujui"}
              </button>
            </footer>
          </article>
        ))}
      </div>

      {!items.length && (
        <div className="card queue-empty">
          <span><CheckSquare size={34} weight="duotone" /></span>
          <h2>Antrean kosong</h2>
          <p>Tidak ada arahan yang menunggu pada antrean ini.</p>
        </div>
      )}

      {modal?.type === "return" && (
        <NoteModal
          title="Kembalikan dengan catatan"
          subtitle="Catatan wajib diisi agar pengaju mengetahui bagian yang perlu diperbaiki."
          label="Catatan perbaikan"
          submitLabel="Kembalikan"
          onClose={() => setModal(null)}
          onSave={(note) => {
            const directive = modal.directive;
            const target = tab === "verifikasi" ? "Sedang Berjalan"
              : tab === "kurasi" ? "Menunggu Konfirmasi"
                : tab === "keputusan" ? (directive.pendingRequest?.previousStatus || "Sedang Berjalan")
                  : "Menunggu Konfirmasi";
            apply(directive, {
              patch: { status: target, ...(tab === "keputusan" ? { pendingRequest: null } : {}) },
              historyLabel: `Dikembalikan dengan catatan · ${note}`,
              audit: { action: "Mengembalikan arahan", detail: note.slice(0, 60) },
              toastTitle: "Arahan dikembalikan",
              toastMessage: "Catatan perbaikan telah dikirimkan kepada pengaju.",
            });
          }}
        />
      )}

      {modal?.type === "reject" && (
        <NoteModal
          title="Tolak usulan"
          subtitle="Alasan penolakan dikirimkan kepada pengusul dan tercatat pada riwayat."
          label="Alasan penolakan"
          submitLabel="Tolak usulan"
          danger
          onClose={() => setModal(null)}
          onSave={(note) => {
            const directive = modal.directive;
            apply(directive, {
              patch: { status: directive.pendingRequest?.previousStatus || "Sedang Berjalan", pendingRequest: null },
              historyLabel: `Usulan ditolak · ${note}`,
              audit: { action: "Menolak usulan", detail: note.slice(0, 60) },
              toastTitle: "Usulan ditolak",
              toastMessage: "Alasan penolakan telah dikirim ke pengusul.",
            });
          }}
        />
      )}

      {modal?.type === "revise" && (
        <ReviseModal
          directive={modal.directive}
          onClose={() => setModal(null)}
          onSave={(title) => apply(modal.directive, {
            patch: { title },
            historyLabel: `Redaksi diperbaiki saat kurasi. Sebelum: "${modal.directive.title}" · Sesudah: "${title}"`,
            audit: { action: "Memperbaiki redaksi arahan", detail: title.slice(0, 60) },
            toastTitle: "Redaksi diperbarui",
            toastMessage: "Versi sebelum dan sesudah tercatat di riwayat.",
          })}
        />
      )}

      {modal?.type === "duplicate" && (
        <DuplicateModal
          directive={modal.directive}
          candidates={registerCandidates}
          onClose={() => setModal(null)}
          onSave={(originalId) => apply(modal.directive, {
            patch: { status: "Dibatalkan", cancelReason: `Duplikat dari ${originalId}.`, duplicateOf: originalId },
            historyLabel: `Ditandai sebagai duplikat dari ${originalId}`,
            audit: { action: "Menandai duplikat", detail: `Duplikat dari ${originalId}` },
            toastTitle: "Duplikat ditutup",
            toastMessage: `Arahan ini ditautkan ke ${originalId} dan tidak masuk register.`,
          })}
        />
      )}
    </div>
  );
}
