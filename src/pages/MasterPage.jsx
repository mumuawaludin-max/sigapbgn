/* ============================================================================
   Epik G — Administrasi: pengguna, struktur unit, serta peran dan hak akses.
   Aturan "siapa boleh apa" dijaga sistem, bukan lewat imbauan.
   ========================================================================== */

import { useState } from "react";
import {
  Buildings, CaretDown, Check, Copy, GlobeHemisphereWest, LockKey, PencilSimple, Plus,
  ShieldCheck, TreeStructure, UsersThree, WarningCircle,
} from "@phosphor-icons/react";
import {
  DEWAN_PENGARAH, permissionGroups, seedRoles, units as seedUnits, users as seedUsers,
} from "../data";
import { Avatar, EmptyInline, IconButton, Modal, PageHeading } from "../ui";

/* --- Peta struktur organisasi ------------------------------------------------- */

function OrgChart({ units }) {
  const secretariats = units.filter((unit) => ["Sekretariat", "Pengawasan intern"].includes(unit.kind));
  const deputies = units.filter((unit) => unit.kind === "Deputi teknis");
  const support = units.filter((unit) => unit.kind === "Unit pendukung");

  return (
    <div className="org-chart">
      <div className="org-top">
        <div className="org-node advisory"><small>Pengarah</small><strong>{DEWAN_PENGARAH.name}</strong><em>{DEWAN_PENGARAH.note}</em></div>
        <div className="org-node leader"><small>Pimpinan</small><strong>Kepala BGN</strong><em>Wakil Kepala BGN</em></div>
      </div>

      <div className="org-row">
        {secretariats.map((unit) => (
          <div key={unit.id} className="org-node" style={{ "--unit-color": unit.color }}>
            <small>{unit.kind}</small>
            <strong>{unit.name}</strong>
            <em>{unit.workUnits.length} unit kerja</em>
          </div>
        ))}
      </div>

      <div className="org-row deputies">
        {deputies.map((unit) => (
          <div key={unit.id} className="org-node" style={{ "--unit-color": unit.color }}>
            <small>Deputi</small>
            <strong>{unit.name.replace("Deputi Bidang ", "")}</strong>
            <em>{unit.workUnits.length} unit kerja</em>
          </div>
        ))}
      </div>

      <div className="org-row">
        {support.map((unit) => (
          <div key={unit.id} className="org-node" style={{ "--unit-color": unit.color }}>
            <small>{unit.kind}</small>
            <strong>{unit.name}</strong>
            <em>{unit.workUnits.length} bidang</em>
          </div>
        ))}
      </div>

      <p className="org-note">
        Struktur disposisi berhenti di Eselon I. Unit kerja di bawahnya dicatat sebagai label pelaksana pada arahan,
        bukan sebagai target disposisi tersendiri.
      </p>
    </div>
  );
}

/* --- Modal peran --------------------------------------------------------------- */

function RoleModal({ role, onClose, onSave }) {
  const [form, setForm] = useState({ ...role });
  const togglePermission = (permission) => setForm((current) => ({
    ...current,
    permissions: current.permissions.includes(permission)
      ? current.permissions.filter((item) => item !== permission)
      : [...current.permissions, permission],
  }));
  const toggleGroup = (items) => {
    const keys = items.map(([key]) => key);
    const allSelected = keys.every((key) => form.permissions.includes(key));
    setForm((current) => ({
      ...current,
      permissions: allSelected
        ? current.permissions.filter((key) => !keys.includes(key))
        : [...new Set([...current.permissions, ...keys])],
    }));
  };

  return (
    <Modal
      title={role.name ? "Perbarui peran" : "Buat peran baru"}
      subtitle="Selaraskan cakupan dan hak akses dengan tugas utama peran."
      onClose={onClose}
      wide
    >
      <div className="modal-body role-form">
        <div className="form-grid role-fields">
          <label className="field">
            <span>Nama peran <b>*</b></span>
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Koordinator Tauwas" />
          </label>
          <label className="field">
            <span>Cakupan unit</span>
            <select value={form.scope} onChange={(event) => setForm({ ...form, scope: event.target.value })}>
              <option>Semua unit</option>
              <option>Sesuai penugasan</option>
              {seedUnits.map((unit) => <option key={unit.id}>{unit.short}</option>)}
            </select>
          </label>
          <label className="field full">
            <span>Deskripsi</span>
            <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Jelaskan tanggung jawab utama peran" />
          </label>
          <label className="field full">
            <span>Dasar tupoksi</span>
            <textarea rows="2" value={form.mandate || ""} onChange={(event) => setForm({ ...form, mandate: event.target.value })} placeholder="Mandat organisasi yang menjadi dasar pemberian akses" />
          </label>
        </div>

        <div className="permission-heading">
          <div><h3>Daftar hak akses</h3><p>{form.permissions.length} hak akses dipilih</p></div>
          <ShieldCheck size={22} color="#0070FF" />
        </div>

        <div className="permission-groups">
          {permissionGroups.map((group) => {
            const allSelected = group.items.every(([key]) => form.permissions.includes(key));
            return (
              <section key={group.label}>
                <header>
                  <strong>{group.label}</strong>
                  <label><input type="checkbox" checked={allSelected} onChange={() => toggleGroup(group.items)} /> Pilih semua</label>
                </header>
                <div>
                  {group.items.map(([key, label]) => (
                    <label key={key} className={form.permissions.includes(key) ? "checked" : ""}>
                      <input type="checkbox" checked={form.permissions.includes(key)} onChange={() => togglePermission(key)} />
                      <span><Check size={13} weight="bold" /></span>
                      {label}
                    </label>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="modal-actions">
          <button className="button secondary" onClick={onClose}>Batal</button>
          <button className="button primary" disabled={!form.name.trim()} onClick={() => onSave(form)}>
            <Check size={17} weight="bold" /> Simpan peran
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* --- Modal pengguna ------------------------------------------------------------- */

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user || {
    id: `u-${Date.now()}`, name: "", email: "", role: "Penanggung Jawab Pelaksana",
    unit: "Dialur", color: "#0070FF", active: true,
  });
  return (
    <Modal title={user ? "Perbarui pengguna" : "Tambah pengguna"} onClose={onClose}>
      <div className="modal-body form-grid">
        <label className="field full">
          <span>Nama lengkap <b>*</b></span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="field full">
          <span>Email</span>
          <input type="email" value={form.email || ""} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="nama@bgn.go.id" />
        </label>
        <label className="field">
          <span>Peran</span>
          <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
            {seedRoles.map((role) => <option key={role.id}>{role.name}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Unit Eselon I</span>
          <select value={form.unit} onChange={(event) => setForm({ ...form, unit: event.target.value })}>
            {seedUnits.map((unit) => <option key={unit.id}>{unit.short}</option>)}
          </select>
        </label>
        <div className="modal-actions full">
          <button className="button secondary" onClick={onClose}>Batal</button>
          <button className="button primary" disabled={!form.name.trim()} onClick={() => onSave(form)}>
            <Check size={17} /> Simpan
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* --- Modal unit ------------------------------------------------------------------ */

function UnitModal({ unit, onClose, onSave }) {
  const [form, setForm] = useState(unit || {
    id: `unit-${Date.now()}`, name: "", short: "", echelon: "Eselon I", kind: "Unit pendukung",
    pmo: "", mandate: "", accessSummary: "", color: "#0070FF", workUnits: [], provinces: [],
  });
  const [workUnitName, setWorkUnitName] = useState("");

  return (
    <Modal title={unit ? "Perbarui unit" : "Tambah unit Eselon I"} onClose={onClose} wide>
      <div className="modal-body form-grid">
        <label className="field full">
          <span>Nama unit <b>*</b></span>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        </label>
        <label className="field">
          <span>Singkatan <b>*</b></span>
          <input value={form.short} onChange={(event) => setForm({ ...form, short: event.target.value })} />
        </label>
        <label className="field">
          <span>Koordinator unit</span>
          <input value={form.pmo || ""} onChange={(event) => setForm({ ...form, pmo: event.target.value })} />
        </label>
        <label className="field full">
          <span>Tugas utama</span>
          <textarea rows="2" value={form.mandate || ""} onChange={(event) => setForm({ ...form, mandate: event.target.value })} />
        </label>
        <label className="field full">
          <span>Implikasi hak akses</span>
          <textarea rows="2" value={form.accessSummary || ""} onChange={(event) => setForm({ ...form, accessSummary: event.target.value })} />
        </label>

        <div className="field full">
          <span>Unit kerja pelaksana (Eselon II)</span>
          <div className="work-unit-editor">
            {(form.workUnits || []).map((workUnit, index) => (
              <div key={`${workUnit.name}-${index}`}>
                <span>{workUnit.name}</span>
                <IconButton
                  label={`Hapus ${workUnit.name}`}
                  onClick={() => setForm({ ...form, workUnits: form.workUnits.filter((_, i) => i !== index) })}
                ><Check size={14} /></IconButton>
              </div>
            ))}
            <div className="work-unit-add">
              <input value={workUnitName} onChange={(event) => setWorkUnitName(event.target.value)} placeholder="Nama unit kerja" />
              <button
                type="button"
                disabled={!workUnitName.trim()}
                onClick={() => {
                  setForm({ ...form, workUnits: [...(form.workUnits || []), { name: workUnitName.trim(), provinces: [] }] });
                  setWorkUnitName("");
                }}
              ><Plus size={15} /></button>
            </div>
          </div>
          <small className="field-hint">Keterangan pelaksana pada arahan. Tidak menjadi tujuan disposisi dan tidak memengaruhi hak akses.</small>
        </div>

        <div className="modal-actions full">
          <button className="button secondary" onClick={onClose}>Batal</button>
          <button className="button primary" disabled={!form.name.trim() || !form.short.trim()} onClick={() => onSave(form)}>
            <Check size={17} /> Simpan
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* --- Halaman ---------------------------------------------------------------------- */

export default function MasterPage({ roles, setRoles, directives, showToast, logAudit }) {
  const [tab, setTab] = useState("struktur");
  const [users, setUsers] = useState(seedUsers);
  const [unitData, setUnitData] = useState(seedUnits);
  const [roleModal, setRoleModal] = useState(null);
  const [userModal, setUserModal] = useState(null);
  const [unitModal, setUnitModal] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(seedUnits[0]?.id || null);

  const saveRole = (role) => {
    const existing = roles.find((item) => item.id === role.id);
    setRoles((current) => existing ? current.map((item) => item.id === role.id ? role : item) : [...current, role]);
    logAudit(
      existing ? "Mengubah hak akses peran" : "Membuat peran",
      "Peran", role.id,
      existing ? `${existing.permissions.length} → ${role.permissions.length} hak akses` : `${role.permissions.length} hak akses`,
    );
    setRoleModal(null);
    showToast("Peran disimpan", `${role.name} tersedia dalam pilihan peran.`);
  };

  const toggleRole = (id) => {
    const role = roles.find((item) => item.id === id);
    setRoles((current) => current.map((item) => item.id === id ? { ...item, active: !item.active } : item));
    logAudit("Mengubah status peran", "Peran", id, role.active ? "Aktif → Nonaktif" : "Nonaktif → Aktif");
    showToast("Status peran diperbarui", "Perubahan langsung berlaku tanpa perlu memuat ulang sistem.");
  };

  /* Pengguna yang pernah tercatat di riwayat hanya boleh dinonaktifkan (US-G1). */
  const hasFootprint = (name) => directives.some((item) =>
    item.pic === name || item.monitor === name || item.recordedBy === name
    || item.history.some((entry) => entry.by === name)
    || item.comments.some((entry) => entry.author === name));

  const toggleUser = (user) => {
    setUsers((current) => current.map((item) => item.id === user.id ? { ...item, active: !item.active } : item));
    logAudit("Mengubah status pengguna", "Pengguna", user.id, user.active ? "Aktif → Nonaktif" : "Nonaktif → Aktif");
    showToast(
      user.active ? "Pengguna dinonaktifkan" : "Pengguna diaktifkan",
      user.active ? "Akun tidak dapat digunakan untuk masuk, namun seluruh riwayatnya tetap tersimpan." : "Akun dapat kembali digunakan.",
    );
  };

  const deleteUser = (user) => {
    if (hasFootprint(user.name)) {
      showToast("Pengguna tidak dapat dihapus", "Akun ini pernah tercatat pada riwayat arahan. Nonaktifkan saja agar riwayatnya tetap tersimpan.", "error");
      return;
    }
    setUsers((current) => current.filter((item) => item.id !== user.id));
    logAudit("Menghapus pengguna", "Pengguna", user.id, user.name);
    showToast("Pengguna dihapus", "Akun belum pernah digunakan sehingga aman dihapus.");
  };

  const activeDirectivesOf = (short) => directives.filter((item) =>
    item.unit === short && !["Selesai", "Dibatalkan"].includes(item.status)).length;

  const deleteUnit = (unit) => {
    const count = activeDirectivesOf(unit.short);
    if (count > 0) {
      showToast("Unit tidak dapat dinonaktifkan", `${unit.short} masih menangani ${count} arahan aktif. Pindahkan lebih dulu.`, "error");
      return;
    }
    setUnitData((current) => current.filter((item) => item.id !== unit.id));
    logAudit("Menghapus unit", "Unit", unit.id, unit.name);
    showToast("Unit dihapus", "Struktur unit dan pilihan disposisi diperbarui.");
  };

  const workUnitCount = unitData.reduce((total, unit) => total + (unit.workUnits?.length || 0), 0);
  const provinceCount = new Set(unitData.flatMap((unit) => unit.provinces || [])).size;

  return (
    <div className="page-container master-page">
      <PageHeading
        eyebrow="Pengaturan sistem"
        title="Struktur organisasi dan hak akses"
        description="Kelola struktur unit sesuai bagan organisasi, akun pengguna, serta peran dan hak aksesnya."
      />

      <div className="master-layout">
        <aside className="master-nav">
          <button className={tab === "struktur" ? "active" : ""} onClick={() => setTab("struktur")}>
            <TreeStructure size={19} /><span><strong>Peta struktur</strong><small>Bagan sampai Eselon I</small></span>
          </button>
          <button className={tab === "roles" ? "active" : ""} onClick={() => setTab("roles")}>
            <ShieldCheck size={19} /><span><strong>Peran dan hak akses</strong><small>{roles.length} peran</small></span>
          </button>
          <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>
            <UsersThree size={19} /><span><strong>Pengguna</strong><small>{users.filter((user) => user.active).length} aktif dari {users.length}</small></span>
          </button>
          <button className={tab === "units" ? "active" : ""} onClick={() => setTab("units")}>
            <Buildings size={19} /><span><strong>Unit kerja</strong><small>{unitData.length} Eselon I · {workUnitCount} unit kerja</small></span>
          </button>
        </aside>

        <section className="card master-content">
          {tab === "struktur" && (
            <>
              <div className="master-heading">
                <div><h2>Peta struktur organisasi BGN</h2><p>Acuan unit tujuan disposisi dalam sistem, mengikuti bagan organisasi resmi BGN.</p></div>
              </div>
              <OrgChart units={unitData} />
            </>
          )}

          {tab === "roles" && (
            <>
              <div className="master-heading">
                <div><h2>Peran dan hak akses</h2><p>Hak akses disusun menurut tugas dan fungsi masing-masing peran. Setiap perubahan tercatat pada log audit.</p></div>
                <button
                  className="button primary"
                  onClick={() => setRoleModal({ id: `role-${Date.now()}`, name: "", description: "", mandate: "", scope: "Semua unit", active: true, users: 0, permissions: [] })}
                ><Plus size={17} /> Buat peran</button>
              </div>
              <div className="role-table">
                {roles.map((role) => (
                  <article key={role.id}>
                    <span className="role-mark"><LockKey size={19} /></span>
                    <div><strong>{role.name}</strong><small>{role.description}</small></div>
                    <span className="scope-chip">{role.scope}</span>
                    <span className="role-metric"><strong>{role.permissions.length}</strong><small>hak akses</small></span>
                    <span className={`active-badge ${role.active ? "on" : "off"}`}>{role.active ? "Aktif" : "Nonaktif"}</span>
                    <div className="row-actions">
                      <IconButton label="Buat salinan" onClick={() => setRoleModal({ ...role, id: `role-${Date.now()}`, name: `${role.name} Salinan`, users: 0 })}><Copy size={17} /></IconButton>
                      <IconButton label="Perbarui peran" onClick={() => setRoleModal(role)}><PencilSimple size={17} /></IconButton>
                      <button className={`toggle ${role.active ? "on" : ""}`} aria-label={role.active ? "Nonaktifkan peran" : "Aktifkan peran"} onClick={() => toggleRole(role.id)}><i /></button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {tab === "users" && (
            <>
              <div className="master-heading">
                <div><h2>Pengguna</h2><p>Akun yang pernah tercatat pada riwayat arahan hanya dapat dinonaktifkan, tidak dapat dihapus.</p></div>
                <button className="button primary" onClick={() => setUserModal({})}><Plus size={17} /> Tambah pengguna</button>
              </div>
              <div className="simple-master-list">
                {users.map((user) => {
                  const locked = hasFootprint(user.name);
                  return (
                    <article key={user.id} className={user.active ? "" : "inactive"}>
                      <Avatar name={user.name} color={user.color} size="sm" />
                      <div>
                        <strong>{user.name}</strong>
                        <small>{user.role} · {user.unit}{locked && " · memiliki jejak riwayat"}</small>
                      </div>
                      <span className={`active-badge ${user.active ? "on" : "off"}`}>{user.active ? "Aktif" : "Nonaktif"}</span>
                      <div className="row-actions">
                        <IconButton label="Perbarui pengguna" onClick={() => setUserModal({ item: user })}><PencilSimple size={17} /></IconButton>
                        <button className={`toggle ${user.active ? "on" : ""}`} aria-label={user.active ? "Nonaktifkan" : "Aktifkan"} onClick={() => toggleUser(user)}><i /></button>
                        {!locked && <IconButton label="Hapus pengguna" onClick={() => deleteUser(user)}><WarningCircle size={17} /></IconButton>}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {tab === "units" && (
            <>
              <div className="master-heading">
                <div><h2>Unit kerja BGN</h2><p>Struktur Eselon I, unit kerja pelaksana, tugas utama, dan cakupan wilayah.</p></div>
                <button className="button primary" onClick={() => setUnitModal({})}><Plus size={17} /> Tambah unit</button>
              </div>
              <div className="unit-map-summary">
                <span><strong>{unitData.length}</strong><small>unit Eselon I</small></span>
                <span><strong>{workUnitCount}</strong><small>unit kerja</small></span>
                <span><strong>{provinceCount}</strong><small>provinsi tercakup</small></span>
              </div>
              <div className="unit-master-list">
                {unitData.map((unit) => {
                  const expanded = expandedUnit === unit.id;
                  const activeCount = activeDirectivesOf(unit.short);
                  return (
                    <article key={unit.id} className={expanded ? "expanded" : ""} style={{ "--unit-color": unit.color || "#0070FF" }}>
                      <div className="unit-master-row">
                        <button className="unit-card-toggle" onClick={() => setExpandedUnit(expanded ? null : unit.id)} aria-expanded={expanded}>
                          <span className="unit-color-mark"><Buildings size={20} weight="duotone" /></span>
                          <span className="unit-main-copy">
                            <small>{unit.short} · {unit.kind}</small>
                            <strong>{unit.name}</strong>
                            <em>{unit.mandate}</em>
                          </span>
                          <span className="unit-stat"><strong>{unit.workUnits?.length || 0}</strong><small>unit kerja</small></span>
                          <span className="unit-stat"><strong>{activeCount}</strong><small>arahan aktif</small></span>
                          <CaretDown size={18} className={expanded ? "rotated" : ""} />
                        </button>
                        <div className="row-actions">
                          <IconButton label={`Perbarui ${unit.name}`} onClick={() => setUnitModal({ item: unit })}><PencilSimple size={17} /></IconButton>
                          <IconButton label={`Hapus ${unit.name}`} onClick={() => deleteUnit(unit)}><WarningCircle size={17} /></IconButton>
                        </div>
                      </div>
                      {expanded && (
                        <div className="unit-master-detail">
                          <section className="unit-access-note">
                            <ShieldCheck size={19} weight="duotone" />
                            <div><strong>Implikasi hak akses</strong><p>{unit.accessSummary}</p></div>
                          </section>
                          <div className="work-unit-grid">
                            {(unit.workUnits || []).map((workUnit, index) => (
                              <div key={`${unit.id}-${index}`}>
                                <span>{String(index + 1).padStart(2, "0")}</span>
                                <div>
                                  <strong>{workUnit.short || workUnit.name}</strong>
                                  {workUnit.short && <small>{workUnit.name}</small>}
                                  {workUnit.provinces?.length > 0 && <p><GlobeHemisphereWest size={13} /> {workUnit.provinces.join(", ")}</p>}
                                </div>
                              </div>
                            ))}
                            {!unit.workUnits?.length && <EmptyInline icon={Buildings} text="Belum ada unit kerja tercatat." />}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </div>

      {roleModal && <RoleModal role={roleModal} onClose={() => setRoleModal(null)} onSave={saveRole} />}
      {userModal && (
        <UserModal
          user={userModal.item}
          onClose={() => setUserModal(null)}
          onSave={(value) => {
            const existing = users.find((item) => item.id === value.id);
            setUsers((current) => existing ? current.map((item) => item.id === value.id ? value : item) : [...current, value]);
            logAudit(existing ? "Memperbarui pengguna" : "Menambah pengguna", "Pengguna", value.id, value.name);
            setUserModal(null);
            showToast("Data pengguna disimpan", "Perubahan langsung berlaku di seluruh sistem.");
          }}
        />
      )}
      {unitModal && (
        <UnitModal
          unit={unitModal.item}
          onClose={() => setUnitModal(null)}
          onSave={(value) => {
            const existing = unitData.find((item) => item.id === value.id);
            setUnitData((current) => existing ? current.map((item) => item.id === value.id ? value : item) : [...current, value]);
            logAudit(existing ? "Memperbarui unit" : "Menambah unit", "Unit", value.id, value.name);
            setUnitModal(null);
            showToast("Data unit disimpan", "Struktur unit dan pilihan disposisi diperbarui.");
          }}
        />
      )}
    </div>
  );
}
