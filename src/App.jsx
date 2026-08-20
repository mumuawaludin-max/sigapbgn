/* ============================================================================
   SIGAP BGN — Prototipe
   Kerangka aplikasi: navigasi, hak akses, dan status bersama antar halaman.
   Acuan: docs/SIGAP-BGN_User-Story_Acceptance-Criteria.md
   ========================================================================== */

import { useCallback, useMemo, useState } from "react";
import {
  ArrowRight, Bell, Buildings, CalendarBlank, CaretDown, CaretRight, Check, ClipboardText,
  Database, GearSix, House, ListChecks, MagnifyingGlass, SealCheck, ShieldCheck, Target, X,
} from "@phosphor-icons/react";
import {
  hasPermission, seedAgendas, seedAuditLog, seedDirectives, seedNotifications, seedRoles,
  users as seedUsers,
} from "./data";
import { PRESETS } from "./presets";
import {
  Avatar, IconButton, StatusBadge, Toast, deadlineUrgency, formatDate, isLate, sourceLabel,
} from "./ui";
import DashboardPage from "./pages/DashboardPage";
import DirectiveList from "./pages/DirectiveList";
import DirectiveDetail from "./pages/DirectiveDetail";
import CreateDirectiveModal from "./pages/CreateDirective";
import AgendaPage from "./pages/AgendaPage";
import ReviewPage from "./pages/ReviewPage";
import PriorityPage from "./pages/PriorityPage";
import AuditPage from "./pages/AuditPage";
import MasterPage from "./pages/MasterPage";

const NAV_ITEMS = [
  { id: "dashboard", label: "Beranda", icon: House },
  { id: "arahan", label: "Arahan", icon: ListChecks },
  { id: "agenda", label: "Agenda", icon: ClipboardText, permission: ["agenda.read", "agenda.create"] },
  { id: "prioritas", label: "Prioritas", short: "Prioritas", icon: Target, permission: ["prioritas.papan"] },
  { id: "pemeriksaan", label: "Pemeriksaan", short: "Periksa", icon: SealCheck, permission: ["arahan.kurasi", "arahan.konfirmasi", "arahan.approve_done", "arahan.approve_deadline", "arahan.approve_realih"] },
  { id: "audit", label: "Log audit", short: "Audit", icon: ShieldCheck, permission: ["audit.read"] },
  { id: "master", label: "Pengaturan", short: "Atur", icon: Database, permission: ["master.role", "master.user", "master.unit"] },
];

/* --- Pencarian global -------------------------------------------------------- */

function TaskSearchModal({ directives, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? directives.filter((item) =>
      `${item.title} ${item.id} ${item.pic || ""} ${item.unit || ""} ${item.context} ${(item.targetUnits || []).join(" ")}`
        .toLowerCase().includes(normalized)).slice(0, 12)
    : [...directives].filter(PRESETS.active.matches).sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 8);

  return (
    <div className="modal-layer task-search-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="task-search-dialog" role="dialog" aria-modal="true" aria-label="Cari arahan">
        <header className="task-search-input">
          <MagnifyingGlass size={22} />
          <input autoFocus type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari isi arahan, nomor, penanggung jawab, unit, atau nama forum" aria-label="Kata kunci pencarian arahan" />
          {query && <button aria-label="Hapus pencarian" onClick={() => setQuery("")}><X size={17} /></button>}
          <IconButton label="Tutup pencarian" onClick={onClose}><X size={20} /></IconButton>
        </header>
        <div className="task-search-summary">
          <span>{normalized ? <><strong>{results.length}</strong> hasil ditemukan</> : "Arahan aktif dengan deadline terdekat"}</span>
          <small>{directives.length} arahan dapat Anda akses</small>
        </div>
        <div className="task-search-results">
          {results.map((item) => (
            <button key={item.id} onClick={() => onSelect(item.id)}>
              <span className="task-result-icon"><ListChecks size={19} weight="duotone" /></span>
              <span className="task-result-copy">
                <span><b>{item.id}</b><StatusBadge status={item.status} compact /></span>
                <strong>{item.title}</strong>
                <small><Buildings size={14} /> {item.unit || "Belum didisposisikan"} · {item.pic || "Belum ada PIC"} · {sourceLabel(item.source)}</small>
              </span>
              <span className={`task-result-deadline ${isLate(item) ? "late" : ""}`}>
                <CalendarBlank size={16} />
                <span><small>{formatDate(item.deadline)}</small><strong>{deadlineUrgency(item)}</strong></span>
              </span>
              <CaretRight size={17} />
            </button>
          ))}
          {!results.length && (
            <div className="task-search-empty">
              <span><MagnifyingGlass size={27} /></span>
              <strong>Arahan tidak ditemukan</strong>
              <small>Periksa ejaan atau gunakan kata kunci yang lebih singkat.</small>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

/* --- Aplikasi ---------------------------------------------------------------- */

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [listPreset, setListPreset] = useState(PRESETS.all);
  const [roles, setRoles] = useState(seedRoles);
  const [activeRoleId, setActiveRoleId] = useState("role-sestama");
  const [directives, setDirectives] = useState(seedDirectives);
  const [agendas, setAgendas] = useState(seedAgendas);
  const [auditLog, setAuditLog] = useState(seedAuditLog);
  const [notifications, setNotifications] = useState(seedNotifications);
  const [selectedId, setSelectedId] = useState(null);
  const [detailTab, setDetailTab] = useState("comments");
  const [createOpen, setCreateOpen] = useState(false);
  const [createPrefill, setCreatePrefill] = useState(null);
  const [focusAgendaId, setFocusAgendaId] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const activeRole = roles.find((role) => role.id === activeRoleId) || roles[0];
  const activeUser = seedUsers.find((user) => user.id === activeRole.profileUserId) || seedUsers[1];
  const selectedDirective = directives.find((item) => item.id === selectedId);

  /* Cakupan baris mengikuti izin baca peran (US-A5, US-G3). */
  const visibleDirectives = useMemo(() => {
    if (hasPermission(activeRole, "arahan.read.all")) return directives;
    if (hasPermission(activeRole, "arahan.read.unit")) {
      return directives.filter((item) => item.unit === activeRole.scope || item.supportUnits?.includes(activeRole.scope));
    }
    if (hasPermission(activeRole, "arahan.read.assigned")) {
      return directives.filter((item) => item.pic === activeUser.name || item.monitor === activeUser.name);
    }
    return [];
  }, [activeRole, activeUser.name, directives]);

  const showToast = useCallback((title, message, type = "success") => {
    setToast({ title, message, type });
    window.setTimeout(() => setToast(null), 3600);
  }, []);

  /* Semua operasi tulis melewati sini agar log audit tidak pernah terlewat (US-F5). */
  const logAudit = useCallback((action, object, objectId, detail) => {
    setAuditLog((current) => [{
      id: `au-${current.length + 1}-${objectId}`,
      at: "2026-08-13 " + new Date().toTimeString().slice(0, 5).replace(":", "."),
      actor: activeUser.name,
      action, object, objectId, detail: detail || "—",
    }, ...current]);
  }, [activeUser.name]);

  const updateDirective = useCallback((id, patcher) => {
    setDirectives((current) => current.map((item) =>
      item.id === id ? { ...item, ...(typeof patcher === "function" ? patcher(item) : patcher) } : item));
  }, []);

  const openDirective = useCallback((id, tab = "comments") => {
    setDetailTab(tab);
    setSelectedId(id);
  }, []);

  const openList = useCallback((preset = PRESETS.all) => {
    setListPreset(preset);
    setPage("arahan");
  }, []);

  const canCreate = ["tertulis", "verbal", "publik"].some((source) => hasPermission(activeRole, `arahan.create.${source}`));
  const accessibleNav = NAV_ITEMS.filter((item) => !item.permission || item.permission.some((permission) => hasPermission(activeRole, permission)));
  const unreadCount = notifications.filter((item) => item.unread).length;

  /* Nomor registrasi berurutan dan tidak pernah dipakai ulang (US-A1). */
  const nextNumber = directives.length + 1;

  /* US-B3 — arahan lahir dari butir takeaway, dengan tautan dua arah. */
  const createFromTakeaway = (agenda, takeaway) => {
    setCreatePrefill({
      source: "Lisan",
      title: takeaway.text,
      context: agenda.title,
      agendaId: agenda.id,
      takeawayId: takeaway.id,
      date: agenda.date,
    });
    setCreateOpen(true);
  };

  const handleCreate = (directive, status) => {
    setDirectives((current) => [directive, ...current]);
    if (directive.takeawayId) {
      setAgendas((current) => current.map((agenda) => agenda.id === directive.agendaId
        ? { ...agenda, takeaways: agenda.takeaways.map((item) => item.id === directive.takeawayId ? { ...item, directiveId: directive.id } : item) }
        : agenda));
    }
    logAudit("Mencatat arahan", "Arahan", directive.id, `Sumber ${directive.source.toLowerCase()}${directive.agendaId ? ` dari agenda ${directive.agendaId}` : ""}`);
    setCreateOpen(false);
    setCreatePrefill(null);
    showToast("Arahan tercatat", `${directive.id} masuk antrean ${status.toLowerCase()}.`);
    openList(PRESETS.preRegister);
  };

  const goTo = (id) => {
    if (id === "arahan") openList(PRESETS.all);
    else setPage(id);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Lewati ke konten utama</a>

      <header className="topbar">
        <button className="brand-lockup" onClick={() => setPage("dashboard")}>
          <img src="/bgn-logo.png" alt="Logo Badan Gizi Nasional" />
          <span><strong>SIGAP</strong><small>BGN</small></span>
        </button>

        <nav className="topnav" aria-label="Navigasi utama">
          {accessibleNav.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => goTo(item.id)}>
                <Icon size={17} weight={page === item.id ? "fill" : "regular"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="top-actions">
          <button className="global-task-search" onClick={() => setSearchOpen(true)} aria-label="Cari arahan">
            <MagnifyingGlass size={18} /><span>Cari arahan</span>
          </button>

          <div className="notification-wrap">
            <IconButton label="Notifikasi" onClick={() => setNotificationOpen((value) => !value)}>
              <Bell size={20} />
              {unreadCount > 0 && <span className="unread-indicator" />}
            </IconButton>
            {notificationOpen && (
              <div className="popover notification-panel">
                <div className="popover-title">
                  <div><strong>Notifikasi</strong><small>{unreadCount} belum dibaca</small></div>
                  <button onClick={() => setNotifications((current) => current.map((item) => ({ ...item, unread: false })))}>Tandai dibaca</button>
                </div>
                {notifications.map((item) => (
                  <button
                    className="notification-item"
                    key={item.id}
                    onClick={() => {
                      setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, unread: false } : entry));
                      setNotificationOpen(false);
                      if (item.targetId) openDirective(item.targetId);
                    }}
                  >
                    <span className={`notification-icon ${item.unread ? "unread" : ""}`}><Bell size={16} /></span>
                    <span><strong>{item.title}</strong><small>{item.body}</small><em>{item.time} lalu</em></span>
                  </button>
                ))}
                <button className="popover-footer" onClick={() => { setNotificationOpen(false); openList(PRESETS.attention); }}>
                  Lihat arahan yang perlu ditindaklanjuti <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>

          <IconButton
            label="Pengaturan"
            onClick={() => accessibleNav.some((item) => item.id === "master")
              ? setPage("master")
              : showToast("Akses terbatas", "Peran yang Anda gunakan tidak memiliki akses ke halaman pengaturan.", "error")}
          ><GearSix size={20} /></IconButton>

          <div className="role-wrap">
            <button className="profile-button" onClick={() => setRoleOpen((value) => !value)}>
              <Avatar name={activeUser.name} color={activeUser.color} size="sm" />
              <span><strong>{activeUser.name}</strong><small>{activeRole.name}</small></span>
              <CaretDown size={14} />
            </button>
            {roleOpen && (
              <div className="popover role-panel">
                <div className="popover-title">
                  <div><strong>Ganti peran</strong><small>Hak akses dan isi halaman akan menyesuaikan</small></div>
                </div>
                <div className="role-list">
                  {roles.filter((role) => role.active).map((role) => (
                    <button
                      key={role.id}
                      className={role.id === activeRoleId ? "selected" : ""}
                      onClick={() => {
                        setActiveRoleId(role.id);
                        setRoleOpen(false);
                        setPage("dashboard");
                        setListPreset(PRESETS.all);
                        showToast("Peran berhasil diganti", `Anda sekarang menggunakan peran ${role.name}.`);
                      }}
                    >
                      <span className="role-icon"><ShieldCheck size={17} /></span>
                      <span><strong>{role.name}</strong><small>{role.scope} · {role.permissions.length} hak akses</small></span>
                      {role.id === activeRoleId && <Check size={16} weight="bold" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="main-content">
        {page === "dashboard" && (
          <DashboardPage
            directives={visibleDirectives}
            activeRole={activeRole}
            activeUser={activeUser}
            canCreate={canCreate}
            onCreate={() => setCreateOpen(true)}
            onSelect={openDirective}
            onViewAll={openList}
          />
        )}

        {page === "arahan" && (
          <DirectiveList
            directives={visibleDirectives}
            activeRole={activeRole}
            preset={listPreset}
            onClearPreset={() => setListPreset(PRESETS.all)}
            canCreate={canCreate}
            onCreate={() => setCreateOpen(true)}
            onSelect={openDirective}
            showToast={showToast}
            logAudit={logAudit}
          />
        )}

        {page === "agenda" && (
          <AgendaPage
            agendas={agendas}
            setAgendas={setAgendas}
            directives={directives}
            activeRole={activeRole}
            actorName={activeUser.name}
            showToast={showToast}
            logAudit={logAudit}
            onSelectDirective={openDirective}
            onCreateFromTakeaway={createFromTakeaway}
            focusAgendaId={focusAgendaId}
            onFocusHandled={() => setFocusAgendaId(null)}
          />
        )}

        {page === "prioritas" && (
          <PriorityPage
            directives={visibleDirectives}
            activeRole={activeRole}
            onSelect={openDirective}
            showToast={showToast}
            logAudit={logAudit}
          />
        )}

        {page === "pemeriksaan" && (
          <ReviewPage
            directives={visibleDirectives}
            allDirectives={directives}
            activeRole={activeRole}
            actorName={activeUser.name}
            updateDirective={updateDirective}
            logAudit={logAudit}
            showToast={showToast}
            onSelect={openDirective}
          />
        )}

        {page === "audit" && (
          <AuditPage auditLog={auditLog} activeRole={activeRole} showToast={showToast} logAudit={logAudit} />
        )}

        {page === "master" && (
          <MasterPage roles={roles} setRoles={setRoles} directives={directives} showToast={showToast} logAudit={logAudit} />
        )}
      </main>

      <nav className="bottom-nav" aria-label="Navigasi mobile">
        <button onClick={() => setSearchOpen(true)}><MagnifyingGlass size={20} /><span>Cari</span></button>
        {accessibleNav.slice(0, 4).map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.id} className={page === item.id ? "active" : ""} onClick={() => goTo(item.id)}>
              <Icon size={20} weight={page === item.id ? "fill" : "regular"} />
              <span>{item.short || item.label}</span>
            </button>
          );
        })}
      </nav>

      {createOpen && (
        <CreateDirectiveModal
          activeRole={activeRole}
          activeUser={activeUser}
          agendas={agendas}
          nextNumber={nextNumber}
          prefill={createPrefill}
          onClose={() => { setCreateOpen(false); setCreatePrefill(null); }}
          onCreate={handleCreate}
        />
      )}

      {searchOpen && (
        <TaskSearchModal
          directives={visibleDirectives}
          onClose={() => setSearchOpen(false)}
          onSelect={(id) => { setSearchOpen(false); openDirective(id); }}
        />
      )}

      {selectedDirective && (
        <DirectiveDetail
          directive={selectedDirective}
          role={activeRole}
          actorName={activeUser.name}
          agendas={agendas}
          initialTab={detailTab}
          onClose={() => setSelectedId(null)}
          updateDirective={updateDirective}
          logAudit={logAudit}
          showToast={showToast}
          onOpenAgenda={(agendaId) => { setSelectedId(null); setFocusAgendaId(agendaId); setPage("agenda"); }}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
