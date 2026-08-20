/* ============================================================================
   US-A1 / A2 / A3 — Pencatatan arahan satu pintu dari tiga jenis sumber.
   ========================================================================== */

import { useState } from "react";
import {
  ArrowRight, Check, CheckCircle, FileText, GlobeHemisphereWest, LinkSimple,
  Microphone, UploadSimple, WarningCircle,
} from "@phosphor-icons/react";
import { hasPermission, seedAgendas, units as seedUnits } from "../data";
import { Modal, NOW_LABEL, TODAY_ISO, sourceLabel } from "../ui";

const SOURCE_OPTIONS = [
  ["Tertulis", "Surat, nota dinas, atau dokumen resmi", FileText, "arahan.create.tertulis"],
  ["Lisan", "Arahan yang disampaikan dalam forum", Microphone, "arahan.create.verbal"],
  ["Publik", "Arahan yang disampaikan melalui kanal publik", GlobeHemisphereWest, "arahan.create.publik"],
];

export default function CreateDirectiveModal({ activeRole, activeUser, agendas = seedAgendas, nextNumber, prefill, onClose, onCreate }) {
  const allowedSources = SOURCE_OPTIONS.filter(([, , , permission]) => hasPermission(activeRole, permission));
  const [step, setStep] = useState(prefill ? 2 : 1);
  const [form, setForm] = useState({
    source: prefill?.source || allowedSources[0]?.[0] || "",
    title: prefill?.title || "",
    context: prefill?.context || "",
    agendaId: prefill?.agendaId || "",
    takeawayId: prefill?.takeawayId || "",
    date: prefill?.date || TODAY_ISO,
    deadline: "",
    targetUnits: prefill?.targetUnits || [],
    priority: "Reguler",
    attachment: "",
    attachmentSize: 0,
    sourceLink: "",
  });
  const [error, setError] = useState("");

  const toggleTargetUnit = (short) => {
    setForm((current) => ({
      ...current,
      targetUnits: current.targetUnits.includes(short)
        ? current.targetUnits.filter((item) => item !== short)
        : [...current.targetUnits, short],
    }));
  };

  const pickAgenda = (agendaId) => {
    const agenda = agendas.find((item) => item.id === agendaId);
    setForm((current) => ({
      ...current,
      agendaId,
      context: agenda ? agenda.title : current.context,
      date: agenda ? agenda.date : current.date,
    }));
  };

  const pickFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError("Ukuran berkas melebihi 10 MB. Pilih berkas yang lebih kecil.");
      return;
    }
    setError("");
    setForm((current) => ({ ...current, attachment: file.name, attachmentSize: file.size }));
  };

  const submit = () => {
    if (!form.title.trim()) return setError("Isi arahan wajib diisi.");
    if (!form.context.trim()) return setError("Nama forum wajib diisi.");
    if (!form.deadline) return setError("Deadline usulan wajib diisi agar arahan dapat dipantau.");
    if (!form.targetUnits.length) return setError("Pilih minimal satu unit yang dituju arahan ini.");
    if (form.source === "Publik" && !form.sourceLink.trim()) {
      return setError("Arahan dari kanal publik wajib menyertakan tautan atau tangkapan layar sumbernya.");
    }

    /* Tertulis langsung masuk kurasi; lisan dan publik dikonfirmasi dulu keabsahannya. */
    const status = form.source === "Tertulis" ? "Menunggu Kurasi" : "Menunggu Konfirmasi";
    const id = `SIGAP/2026/08/${String(nextNumber).padStart(4, "0")}`;

    onCreate({
      id,
      title: form.title.trim(),
      source: form.source,
      sourceLink: form.sourceLink.trim(),
      attachment: form.attachment,
      context: form.context.trim(),
      agendaId: form.agendaId || null,
      takeawayId: form.takeawayId || null,
      date: form.date,
      deadline: form.deadline,
      originalDeadline: form.deadline,
      deadlineChanges: [],
      targetUnits: form.targetUnits,
      unit: null,
      unitName: null,
      workUnits: [],
      supportUnits: [],
      pic: null,
      picColor: "#98A2B3",
      pmo: null,
      monitor: null,
      priority: form.priority,
      alignment: null,
      effort: null,
      impact: null,
      classification: null,
      status,
      kendala: null,
      pendingRequest: null,
      completion: null,
      completedAt: null,
      cancelReason: "",
      recordedBy: activeUser.name,
      evidence: [],
      comments: [],
      history: [{ label: `Arahan dicatat dari sumber ${form.source.toLowerCase()}`, by: activeUser.name, time: NOW_LABEL }],
    }, status);
  };

  const selectedAgenda = agendas.find((item) => item.id === form.agendaId);

  return (
    <Modal
      title="Catat arahan pimpinan"
      subtitle={step === 1 ? "Langkah 1 dari 2 · Pilih jenis sumber" : `Langkah 2 dari 2 · Sumber ${sourceLabel(form.source).toLowerCase()}`}
      onClose={onClose}
      wide
    >
      <div className="stepper"><i className="active" /><i className={step === 2 ? "active" : ""} /></div>

      {step === 1 ? (
        <div className="modal-body source-step">
          <div className="form-intro">
            <h3>Dari mana arahan ini berasal?</h3>
            <p>Jenis sumber menentukan langkah pemeriksaan berikutnya. Arahan lisan dan arahan dari kanal publik dikonfirmasi keabsahannya terlebih dahulu sebelum masuk tahap kurasi.</p>
          </div>
          <div className="source-options">
            {allowedSources.map(([source, description, Icon]) => (
              <button key={source} className={form.source === source ? "selected" : ""} onClick={() => setForm({ ...form, source })}>
                <span><Icon size={26} weight="duotone" /></span>
                <strong>{sourceLabel(source)}</strong>
                <small>{description}</small>
                {form.source === source && <CheckCircle size={19} weight="fill" />}
              </button>
            ))}
          </div>
          <div className="modal-actions">
            <button className="button secondary" onClick={onClose}>Batal</button>
            <button className="button primary" disabled={!form.source} onClick={() => setStep(2)}>Lanjut <ArrowRight size={17} /></button>
          </div>
        </div>
      ) : (
        <div className="modal-body form-grid">
          {form.source === "Lisan" && (
            <label className="field full">
              <span>Agenda asal</span>
              <select value={form.agendaId} onChange={(event) => pickAgenda(event.target.value)}>
                <option value="">Tanpa agenda tercatat</option>
                {agendas.map((agenda) => <option key={agenda.id} value={agenda.id}>{agenda.date} · {agenda.title}</option>)}
              </select>
              <small className="field-hint">Memilih agenda akan mengisi nama forum dan tanggal secara otomatis, sekaligus menautkan arahan ke rekap agenda.</small>
            </label>
          )}

          <label className="field full">
            <span>Isi arahan <b>*</b></span>
            <textarea rows="4" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Tuliskan arahan secara jelas dan dapat dikerjakan" />
          </label>

          <label className="field">
            <span>Nama forum <b>*</b></span>
            <input value={form.context} onChange={(event) => setForm({ ...form, context: event.target.value })} placeholder="Contoh: Rapat Pimpinan Mingguan BGN" />
          </label>

          <label className="field">
            <span>Tanggal arahan</span>
            <input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} />
          </label>

          <label className="field">
            <span>Deadline usulan <b>*</b></span>
            <input type="date" min={TODAY_ISO} value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
          </label>

          <div className="field full">
            <span>Unit yang dituju <b>*</b></span>
            <div className="chip-picker">
              {seedUnits.map((unit) => (
                <button
                  key={unit.id}
                  type="button"
                  className={form.targetUnits.includes(unit.short) ? "selected" : ""}
                  onClick={() => toggleTargetUnit(unit.short)}
                  title={unit.name}
                >
                  {form.targetUnits.includes(unit.short) && <Check size={13} weight="bold" />} {unit.short}
                </button>
              ))}
            </div>
            <small className="field-hint">Unit yang disebut pimpinan saat arahan disampaikan. Boleh lebih dari satu. Penetapan unit penanggung jawab dilakukan kemudian pada tahap disposisi.</small>
          </div>

          {form.source === "Publik" ? (
            <label className="field full">
              <span>Tautan atau tangkapan layar sumber <b>*</b></span>
              <div className="input-with-icon"><LinkSimple size={17} /><input value={form.sourceLink} onChange={(event) => setForm({ ...form, sourceLink: event.target.value })} placeholder="https://..." /></div>
              <small className="field-hint">Bukti asal wajib disertakan agar arahan dari kanal publik dapat dipertanggungjawabkan.</small>
            </label>
          ) : (
            <label className="field full">
              <span>Lampiran sumber</span>
              <div className="upload-zone-wrap">
                <input id="create-attachment" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" onChange={pickFile} />
                <label className="upload-zone" htmlFor="create-attachment">
                  <UploadSimple size={23} />
                  <span>
                    <strong>{form.attachment || "Pilih berkas dari perangkat Anda"}</strong>
                    <small>{form.attachment ? `${(form.attachmentSize / 1024).toFixed(0)} KB dipilih` : "PDF, DOCX, PNG, atau JPG hingga 10 MB"}</small>
                  </span>
                </label>
              </div>
            </label>
          )}

          {selectedAgenda && (
            <div className="form-note full">
              <CheckCircle size={17} weight="fill" />
              <span>Arahan akan tertaut ke agenda <strong>{selectedAgenda.title}</strong> dan muncul pada rekap agenda tersebut.</span>
            </div>
          )}

          <div className="form-note info full">
            <CheckCircle size={17} weight="fill" />
            <span>
              Status awal: <strong>{form.source === "Tertulis" ? "Menunggu Kurasi" : "Menunggu Konfirmasi"}</strong>.{" "}
              {form.source === "Tertulis"
                ? "Arahan belum tampil pada register aktif hingga lolos kurasi."
                : "Keabsahan arahan dikonfirmasi terlebih dahulu, kemudian masuk antrean kurasi."}
            </span>
          </div>

          {error && <div className="form-error full"><WarningCircle size={18} />{error}</div>}

          <div className="modal-actions full">
            <button className="button secondary" onClick={() => { setStep(1); setError(""); }}>Kembali</button>
            <button className="button primary" onClick={submit}><Check size={17} weight="bold" /> Simpan arahan</button>
          </div>
        </div>
      )}
    </Modal>
  );
}
