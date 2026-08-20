/* ============================================================================
   SIGAP BGN — Data prototipe
   Disusun mengikuti dokumen acuan: docs/SIGAP-BGN_User-Story_Acceptance-Criteria.md
   Struktur unit mengikuti bagan organisasi BGN sampai Eselon I.
   ========================================================================== */

/* --- Hak akses (US-G3) ---------------------------------------------------- */

export const permissionGroups = [
  {
    label: "Arahan",
    items: [
      ["arahan.create.tertulis", "Catat arahan tertulis"],
      ["arahan.create.verbal", "Catat arahan lisan"],
      ["arahan.create.publik", "Catat arahan dari kanal publik"],
      ["arahan.konfirmasi", "Konfirmasi keabsahan arahan lisan/publik"],
      ["arahan.kurasi", "Kurasi arahan sebelum tayang"],
      ["arahan.read.all", "Lihat arahan seluruh unit"],
      ["arahan.read.unit", "Lihat arahan unit sendiri"],
      ["arahan.read.assigned", "Lihat arahan yang ditugaskan"],
      ["arahan.edit", "Perbaiki data arahan"],
      ["arahan.disposisi", "Tetapkan unit penanggung jawab"],
      ["arahan.tetapkan_pic", "Tetapkan penanggung jawab pelaksana"],
      ["arahan.tetapkan_pemantau", "Tetapkan pemantau arahan"],
      ["arahan.ubah_status", "Perbarui status pekerjaan"],
      ["arahan.isi_kendala", "Catat kendala keterlambatan"],
      ["arahan.klaim_done", "Ajukan penyelesaian"],
      ["arahan.verifikasi", "Periksa hasil pekerjaan"],
      ["arahan.approve_done", "Setujui penyelesaian"],
      ["arahan.ajukan_realih", "Ajukan pindah unit"],
      ["arahan.approve_realih", "Setujui pindah unit"],
      ["arahan.usul_deadline", "Ajukan deadline baru"],
      ["arahan.approve_deadline", "Setujui perubahan deadline"],
      ["arahan.batalkan", "Batalkan arahan"],
    ],
  },
  {
    label: "Agenda dan rekap",
    items: [
      ["agenda.create", "Catat agenda dan key takeaways"],
      ["agenda.read", "Lihat rekap agenda"],
      ["agenda.edit", "Perbaiki agenda dan takeaways"],
    ],
  },
  {
    label: "Prioritisasi",
    items: [
      ["prioritas.nilai", "Nilai upaya dan dampak arahan"],
      ["prioritas.papan", "Buka papan prioritas"],
    ],
  },
  {
    label: "Tanggapan dan bukti",
    items: [
      ["tanggapan.create", "Tulis perkembangan atau tanggapan"],
      ["evidence.upload", "Unggah bukti pendukung"],
    ],
  },
  {
    label: "Beranda",
    items: [
      ["dashboard.eksekutif", "Beranda lintas unit"],
      ["dashboard.unit", "Beranda unit"],
    ],
  },
  {
    label: "Data dan pengaturan",
    items: [
      ["master.user", "Kelola pengguna"],
      ["master.unit", "Kelola struktur unit"],
      ["master.role", "Kelola peran dan hak akses"],
    ],
  },
  {
    label: "Laporan dan riwayat",
    items: [
      ["laporan.ekspor", "Unduh laporan"],
      ["audit.read", "Lihat log audit sistem"],
    ],
  },
];

const allPermissions = permissionGroups.flatMap((group) => group.items.map(([key]) => key));

/* --- Struktur organisasi (US-G2, bagan BGN sampai Eselon I) ---------------- */

export const DEWAN_PENGARAH = {
  name: "Dewan Pengarah",
  note: "Memberi arahan kebijakan strategis. Bukan pengguna operasional; dapat diberi akun baca-saja untuk beranda pimpinan.",
};

export const units = [
  {
    id: "settama",
    short: "Settama",
    name: "Sekretariat Utama",
    echelon: "Eselon I",
    kind: "Sekretariat",
    pmo: "Lili Khamiliyah",
    color: "#2E7D32",
    mandate:
      "Mengoordinasikan pelaksanaan tugas serta memberikan dukungan administrasi, organisasi, hukum, komunikasi, keuangan, aset, pengadaan, dan layanan data kepada seluruh unsur BGN.",
    accessSummary:
      "Mengoordinasikan arahan lintas unit melalui kurasi, disposisi, dan persetujuan. Akses lintas unit melekat pada fungsi koordinasi Sestama.",
    workUnits: [
      { name: "Biro Manajemen Kinerja", provinces: ["Banten"] },
      { name: "Biro Umum dan Keuangan", provinces: ["Jawa Barat"] },
      { name: "Biro Sumber Daya Manusia dan Organisasi", short: "Biro SDMO", provinces: ["DKI Jakarta"] },
      { name: "Biro Hukum dan Hubungan Masyarakat", short: "Biro Hukum dan Humas", provinces: ["Jawa Tengah"] },
      { name: "Biro Pengelolaan BMN dan Pengadaan Barang dan Jasa", short: "Biro BMN dan PBJ", provinces: ["Papua Barat Daya"] },
    ],
  },
  {
    id: "irtama",
    short: "Irtama",
    name: "Inspektorat Utama",
    echelon: "Eselon I",
    kind: "Pengawasan intern",
    pmo: "Jimmy Alexander Adirman",
    color: "#1565C0",
    mandate:
      "Menyelenggarakan pengawasan intern melalui audit, reviu, evaluasi, pemantauan, dan kegiatan pengawasan lainnya atas kinerja serta keuangan BGN.",
    accessSummary: "Membaca arahan lintas unit beserta riwayat, bukti, laporan, dan log audit. Tidak mengubah pekerjaan operasional.",
    workUnits: [
      { name: "Sekretariat Inspektorat Utama", provinces: ["Riau"] },
      { name: "Inspektorat I", provinces: ["Sumatera Utara", "Sumatera Barat"] },
      { name: "Inspektorat II", provinces: ["Kepulauan Riau"] },
      { name: "Inspektorat III", provinces: ["Aceh", "Papua Barat"] },
    ],
  },
  {
    id: "sistakol",
    short: "Sistakol",
    name: "Deputi Bidang Sistem dan Tata Kelola",
    echelon: "Eselon I",
    kind: "Deputi teknis",
    pmo: "Prima Yosephine Berliana Tumiur Hutapea",
    color: "#00838F",
    mandate:
      "Merumuskan dan melaksanakan kebijakan teknis sistem dan tata kelola pemenuhan gizi nasional, termasuk manajemen risiko, evaluasi, dan pelaporan.",
    accessSummary: "Mengelola arahan kebijakan, standar, tata kelola, integrasi sistem, dan manajemen risiko pada unit Sistakol.",
    workUnits: [
      { name: "Sekretariat Deputi Bidang Sistem dan Tata Kelola", short: "Sekretariat Deputi", provinces: ["Kalimantan Tengah", "Kalimantan Utara"] },
      { name: "Direktorat Sistem Pemenuhan Gizi", short: "Sistem Pemenuhan Gizi", provinces: ["Kalimantan Timur"] },
      { name: "Direktorat Tata Kelola Pemenuhan Gizi", short: "Tata Kelola Pemenuhan Gizi", provinces: ["Kalimantan Selatan"] },
      { name: "Direktorat Manajemen Risiko Pemenuhan Gizi", short: "Manajemen Risiko", provinces: ["Kalimantan Barat", "Papua Pegunungan"] },
    ],
  },
  {
    id: "dialur",
    short: "Dialur",
    name: "Deputi Bidang Penyediaan dan Penyaluran",
    echelon: "Eselon I",
    kind: "Deputi teknis",
    pmo: "Zainuri",
    color: "#EF6C00",
    mandate:
      "Merumuskan dan melaksanakan kebijakan teknis penyediaan serta penyaluran pemenuhan gizi nasional, termasuk pemantauan, evaluasi, dan pelaporannya.",
    accessSummary: "Mengelola arahan penyediaan, pasokan, produksi, distribusi, dan penyaluran pada unit Dialur.",
    workUnits: [
      { name: "Sekretariat Deputi Bidang Penyediaan dan Penyaluran", short: "Sekretariat Deputi", provinces: ["Lampung"] },
      { name: "Direktorat Penyediaan dan Penyaluran Makanan Bergizi Wilayah I", short: "Dialur Wilayah I", provinces: ["Jambi", "Papua Tengah"] },
      { name: "Direktorat Penyediaan dan Penyaluran Makanan Bergizi Wilayah II", short: "Dialur Wilayah II", provinces: ["Bengkulu", "Sumatera Selatan"] },
      { name: "Direktorat Penyediaan dan Penyaluran Makanan Bergizi Wilayah III", short: "Dialur Wilayah III", provinces: ["Kepulauan Bangka Belitung"] },
    ],
  },
  {
    id: "prokerma",
    short: "Prokerma",
    name: "Deputi Bidang Promosi dan Kerja Sama",
    echelon: "Eselon I",
    kind: "Deputi teknis",
    pmo: "Mariman Darto",
    color: "#5E35B1",
    mandate:
      "Merumuskan dan melaksanakan kebijakan teknis promosi, edukasi gizi, kerja sama, kemitraan, pemberdayaan, dan partisipasi masyarakat.",
    accessSummary: "Mengelola arahan promosi, edukasi, kemitraan, dan partisipasi masyarakat.",
    workUnits: [
      { name: "Sekretariat Deputi Bidang Promosi dan Kerja Sama", short: "Sekretariat Deputi", provinces: ["Sulawesi Utara"] },
      { name: "Direktorat Promosi dan Edukasi Gizi", short: "Promosi dan Edukasi Gizi", provinces: ["Sulawesi Tengah", "Gorontalo"] },
      { name: "Direktorat Kerja Sama dan Kemitraan", short: "Kerja Sama dan Kemitraan", provinces: ["Sulawesi Tenggara", "Sulawesi Barat"] },
      { name: "Direktorat Pemberdayaan dan Partisipasi Masyarakat", short: "Pemberdayaan dan Partisipasi Masyarakat", provinces: ["Sulawesi Selatan", "Papua"] },
    ],
  },
  {
    id: "tauwas",
    short: "Tauwas",
    name: "Deputi Bidang Pemantauan dan Pengawasan",
    echelon: "Eselon I",
    kind: "Deputi teknis",
    pmo: "Ketut Sumedana",
    color: "#D81B60",
    mandate:
      "Merumuskan dan melaksanakan kebijakan teknis pemantauan serta pengawasan pemenuhan gizi nasional, termasuk evaluasi dan pelaporan hasil pengawasan program.",
    accessSummary: "Memantau arahan lintas unit dan memeriksa hasil program. Tidak mengelola data induk organisasi.",
    workUnits: [
      { name: "Sekretariat Deputi Bidang Pemantauan dan Pengawasan", short: "Sekretariat Deputi", provinces: ["Nusa Tenggara Barat", "Bali"] },
      { name: "Direktorat Pemantauan dan Pengawasan Wilayah I", short: "Tauwas Wilayah I", provinces: ["Papua Selatan", "Maluku"] },
      { name: "Direktorat Pemantauan dan Pengawasan Wilayah II", short: "Tauwas Wilayah II", provinces: ["Nusa Tenggara Timur", "Maluku Utara"] },
      { name: "Direktorat Pemantauan dan Pengawasan Wilayah III", short: "Tauwas Wilayah III", provinces: ["Jawa Timur"] },
    ],
  },
  {
    id: "pusdatin",
    short: "Pusdatin",
    name: "Pusat Data dan Sistem Informasi",
    echelon: "Eselon I",
    kind: "Unit pendukung",
    pmo: "Dimas Prakoso",
    color: "#0070FF",
    mandate:
      "Menyelenggarakan pengelolaan data, sistem informasi, dan layanan teknologi informasi untuk mendukung pelaksanaan tugas seluruh unsur BGN.",
    accessSummary:
      "Pengelola teknis sistem yang menangani akun, struktur unit, peran, dan hak akses. Tidak mengambil keputusan operasional atas arahan.",
    workUnits: [
      { name: "Bidang Pengelolaan Data", short: "Pengelolaan Data", provinces: ["DI Yogyakarta"] },
      { name: "Bidang Pengembangan Sistem Informasi", short: "Pengembangan Sistem", provinces: [] },
      { name: "Bidang Infrastruktur dan Keamanan Informasi", short: "Infrastruktur dan Keamanan", provinces: [] },
    ],
  },
].map((unit) => ({
  ...unit,
  provinces: [...new Set(unit.workUnits.flatMap((workUnit) => workUnit.provinces))],
}));

export const unitByShort = Object.fromEntries(units.map((unit) => [unit.short, unit]));

/* --- Peran (US-G3, US-G6) -------------------------------------------------- */

const unitCoordinatorPermissions = [
  "arahan.create.tertulis",
  "arahan.read.unit",
  "arahan.edit",
  "arahan.tetapkan_pic",
  "arahan.ubah_status",
  "arahan.isi_kendala",
  "arahan.klaim_done",
  "arahan.ajukan_realih",
  "arahan.usul_deadline",
  "agenda.read",
  "tanggapan.create",
  "evidence.upload",
  "dashboard.unit",
  "laporan.ekspor",
];

export const seedRoles = [
  {
    id: "role-pimpinan", name: "Kepala BGN", profileUserId: "u1",
    description: "Memberikan arahan, memantau seluruh unit, dan mengambil keputusan strategis.",
    mandate: "Penanggung jawab tertinggi pelaksanaan pemenuhan gizi nasional.",
    scope: "Semua unit", active: true, users: 1,
    permissions: [
      "arahan.create.tertulis", "arahan.create.verbal", "arahan.create.publik", "arahan.read.all", "arahan.edit",
      "arahan.approve_realih", "arahan.approve_deadline", "arahan.batalkan",
      "agenda.read", "prioritas.papan", "dashboard.eksekutif", "audit.read", "laporan.ekspor",
    ],
  },
  {
    id: "role-wakil-pimpinan", name: "Wakil Kepala BGN", profileUserId: "u15",
    description: "Mendukung keputusan Kepala dan memantau pelaksanaan lintas unit.",
    mandate: "Membantu Kepala dalam pelaksanaan tugas dan fungsi BGN.",
    scope: "Semua unit", active: true, users: 2,
    permissions: [
      "arahan.read.all", "arahan.approve_realih", "arahan.approve_deadline",
      "agenda.read", "prioritas.papan", "dashboard.eksekutif", "audit.read", "laporan.ekspor",
    ],
  },
  {
    id: "role-sestama", name: "Sestama (Koordinator Sistem)", profileUserId: "u2",
    description: "Mengoordinasikan seluruh arahan melalui kurasi, disposisi, persetujuan, dan penilaian prioritas.",
    mandate: "Koordinasi pelaksanaan tugas dan dukungan administrasi kepada seluruh unsur BGN.",
    scope: "Semua unit", active: true, users: 1, permissions: allPermissions,
  },
  {
    id: "role-notulis", name: "Sekretariat Pimpinan", profileUserId: "u13",
    description: "Mencatat agenda, key takeaways, serta arahan tertulis dan lisan dari forum pimpinan.",
    mandate: "Dukungan pencatatan, administrasi, dan manajemen kinerja di lingkungan Settama.",
    scope: "Settama", active: true, users: 2,
    permissions: [
      "arahan.create.tertulis", "arahan.create.verbal", "arahan.read.unit", "arahan.edit",
      "agenda.create", "agenda.read", "agenda.edit", "tanggapan.create", "evidence.upload",
    ],
  },
  {
    id: "role-komunikasi", name: "Tim Hukum dan Humas", profileUserId: "u11",
    description: "Mencatat arahan dari kanal publik dan menyiapkan konteks komunikasi kelembagaan.",
    mandate: "Dukungan hukum, hubungan masyarakat, dan komunikasi publik BGN.",
    scope: "Settama", active: true, users: 2,
    permissions: ["arahan.create.publik", "arahan.read.unit", "arahan.edit", "agenda.read", "tanggapan.create", "evidence.upload"],
  },
  {
    id: "role-pmo-sistakol", name: "Koordinator Sistakol", profileUserId: "u5",
    description: "Mengelola arahan sistem, standar, tata kelola, integrasi, dan manajemen risiko.",
    mandate: units[2].mandate, scope: "Sistakol", active: true, users: 4, permissions: unitCoordinatorPermissions,
  },
  {
    id: "role-pmo-dialur", name: "Koordinator Dialur", profileUserId: "u3",
    description: "Mengelola arahan penyediaan, produksi, distribusi, dan penyaluran pemenuhan gizi.",
    mandate: units[3].mandate, scope: "Dialur", active: true, users: 4, permissions: unitCoordinatorPermissions,
  },
  {
    id: "role-pmo-prokerma", name: "Koordinator Prokerma", profileUserId: "u6",
    description: "Mengelola promosi, edukasi gizi, kerja sama, kemitraan, dan partisipasi masyarakat.",
    mandate: units[4].mandate, scope: "Prokerma", active: true, users: 4, permissions: unitCoordinatorPermissions,
  },
  {
    id: "role-pmo-tauwas", name: "Koordinator Tauwas", profileUserId: "u4",
    description: "Memantau pelaksanaan lintas unit dan menindaklanjuti hasil pengawasan program.",
    mandate: units[5].mandate, scope: "Semua unit", active: true, users: 4,
    permissions: [
      "arahan.create.tertulis", "arahan.read.all", "arahan.verifikasi", "arahan.approve_done",
      "agenda.read", "tanggapan.create", "dashboard.eksekutif", "laporan.ekspor", "audit.read",
    ],
  },
  {
    id: "role-pic", name: "Penanggung Jawab Pelaksana", profileUserId: "u8",
    description: "Mengerjakan dan melaporkan arahan yang secara langsung ditugaskan kepadanya.",
    mandate: "Pelaksana tugas pada unit kerja masing-masing.",
    scope: "Sesuai penugasan", active: true, users: 12,
    permissions: [
      "arahan.read.assigned", "arahan.ubah_status", "arahan.isi_kendala", "arahan.klaim_done",
      "arahan.ajukan_realih", "arahan.usul_deadline", "tanggapan.create", "evidence.upload", "dashboard.unit",
    ],
  },
  {
    id: "role-pemantau", name: "Pemantau Arahan", profileUserId: "u12",
    description: "Memantau administratif arahan prioritas lintas unit tanpa hak mengubah status.",
    mandate: "Dukungan pemantauan arahan pimpinan (padanan Monitor of Directive).",
    scope: "Sesuai penugasan", active: true, users: 5,
    permissions: ["arahan.read.assigned", "tanggapan.create", "agenda.read", "dashboard.unit"],
  },
  {
    id: "role-verifikator", name: "Verifikator Tauwas", profileUserId: "u9",
    description: "Memeriksa bukti pendukung dan menilai pengajuan penyelesaian lintas unit.",
    mandate: "Pemantauan dan pengawasan hasil pemenuhan gizi nasional.",
    scope: "Semua unit", active: true, users: 3,
    permissions: ["arahan.read.all", "arahan.approve_done", "arahan.verifikasi", "audit.read", "laporan.ekspor"],
  },
  {
    id: "role-auditor", name: "Auditor Irtama", profileUserId: "u7",
    description: "Membaca seluruh arahan, bukti, riwayat, dan log audit untuk pengawasan intern.",
    mandate: units[1].mandate, scope: "Semua unit", active: true, users: 4,
    permissions: ["arahan.read.all", "agenda.read", "audit.read", "laporan.ekspor"],
  },
  {
    id: "role-admin-pusdatin", name: "Admin Pusdatin", profileUserId: "u17",
    description: "Mengelola akun, struktur unit, peran, dan konfigurasi hak akses sistem.",
    mandate: units[6].mandate, scope: "Pusdatin", active: true, users: 3,
    permissions: ["master.user", "master.unit", "master.role", "audit.read"],
  },
  {
    id: "role-pengarah", name: "Dewan Pengarah (baca-saja)", profileUserId: "u19",
    description: "Membaca beranda pimpinan dan seluruh arahan, tanpa kewenangan mengubah data.",
    mandate: DEWAN_PENGARAH.note,
    scope: "Semua unit", active: true, users: 5,
    permissions: ["arahan.read.all", "dashboard.eksekutif"],
  },
];

/* --- Pengguna -------------------------------------------------------------- */

export const users = [
  { id: "u1", name: "Sudaryono", role: "Kepala BGN", unit: "Settama", color: "#071E49", active: true },
  { id: "u2", name: "Lili Khamiliyah", role: "Sekretaris Utama", unit: "Settama", color: "#B8833E", active: true },
  { id: "u3", name: "Zainuri", role: "Deputi Penyediaan dan Penyaluran", unit: "Dialur", color: "#EF6C00", active: true },
  { id: "u4", name: "Ketut Sumedana", role: "Deputi Pemantauan dan Pengawasan", unit: "Tauwas", color: "#D81B60", active: true },
  { id: "u5", name: "Prima Yosephine Berliana Tumiur Hutapea", role: "Deputi Sistem dan Tata Kelola", unit: "Sistakol", color: "#00838F", active: true },
  { id: "u6", name: "Mariman Darto", role: "Deputi Promosi dan Kerja Sama", unit: "Prokerma", color: "#5E35B1", active: true },
  { id: "u7", name: "Jimmy Alexander Adirman", role: "Inspektur Utama", unit: "Irtama", color: "#1565C0", active: true },
  { id: "u8", name: "Bagas Mahendra", role: "Penanggung Jawab Pelaksana", unit: "Dialur", color: "#0048CF", active: true },
  { id: "u9", name: "Sinta Lestari", role: "Verifikator Tauwas", unit: "Tauwas", color: "#12B76A", active: true },
  { id: "u10", name: "Yusuf Ramadhan", role: "Penanggung Jawab Pelaksana", unit: "Sistakol", color: "#DC6803", active: true },
  { id: "u11", name: "Kirana Dewi", role: "Tim Hukum dan Humas", unit: "Settama", color: "#C5974A", active: true },
  { id: "u12", name: "Arif Nugroho", role: "Pemantau Arahan", unit: "Settama", color: "#155EEF", active: true },
  { id: "u13", name: "Laras Permata", role: "Sekretariat Pimpinan", unit: "Settama", color: "#7B5431", active: true },
  { id: "u14", name: "Bima Santoso", role: "Penanggung Jawab Pelaksana", unit: "Prokerma", color: "#0040C1", active: true },
  { id: "u15", name: "Agustina Arumsari", role: "Wakil Kepala BGN", unit: "Settama", color: "#175CD3", active: true },
  { id: "u16", name: "Trenggono", role: "Wakil Kepala BGN", unit: "Settama", color: "#7B5431", active: true },
  { id: "u17", name: "Dimas Prakoso", role: "Admin Pusdatin", unit: "Pusdatin", color: "#0070FF", active: true },
  { id: "u18", name: "Nadia Rahma", role: "Penanggung Jawab Pelaksana", unit: "Irtama", color: "#5B6B82", active: true },
  { id: "u19", name: "Hartarto Wibowo", role: "Dewan Pengarah", unit: "Settama", color: "#475467", active: true },
  { id: "u20", name: "Rani Kusumawati", role: "Penanggung Jawab Pelaksana", unit: "Tauwas", color: "#9E5A00", active: true },
  { id: "u21", name: "Fajar Ardiansyah", role: "Penanggung Jawab Pelaksana", unit: "Sistakol", color: "#026AA2", active: true },
  { id: "u22", name: "Melati Anggraini", role: "Penanggung Jawab Pelaksana", unit: "Prokerma", color: "#7A3E9D", active: true },
  { id: "u23", name: "Gilang Pratama", role: "Penanggung Jawab Pelaksana", unit: "Dialur", color: "#B54708", active: true },
  { id: "u24", name: "Sekar Ayu", role: "Pemantau Arahan", unit: "Settama", color: "#0E7490", active: true },
];

export const usersByUnit = (short) => users.filter((user) => user.unit === short && user.active);

/* --- Referensi status, prioritas, kendala ---------------------------------- */

/** Siklus status baku (US-D1). `terlambat` adalah penanda turunan, bukan status. */
export const STATUS_FLOW = [
  "Menunggu Konfirmasi",
  "Menunggu Kurasi",
  "Belum Ditugaskan",
  "Belum Mulai",
  "Sedang Berjalan",
  "Menunggu Verifikasi",
  "Selesai",
];
export const STATUS_SPECIAL = ["Menunggu Keputusan", "Dibatalkan"];
export const ALL_STATUSES = [...STATUS_FLOW, ...STATUS_SPECIAL];

/** Status yang belum tayang di register aktif (US-A4). */
export const PRE_REGISTER_STATUSES = ["Menunggu Konfirmasi", "Menunggu Kurasi"];
export const CLOSED_STATUSES = ["Selesai", "Dibatalkan"];

export const priorities = ["Prioritas Nasional", "Prioritas Badan", "Reguler"];
export const alignments = ["Sesuai Prioritas Badan", "Di Luar Prioritas"];
export const sources = ["Tertulis", "Lisan", "Publik"];

/** Taksonomi kendala keterlambatan (US-D6, dari temuan tracker Kemenkes). */
export const KENDALA_CATEGORIES = [
  "Kendala unit/direktorat",
  "Skala prioritas",
  "Kendala sumber daya",
  "Menunggu pihak eksternal",
  "Lainnya",
];

export const AGENDA_TYPES = [
  "Rapat Pimpinan",
  "Rapat Koordinasi",
  "Kunjungan Kerja",
  "Audiensi",
  "Vicon",
  "Lainnya",
];

export const TAKEAWAY_TAGS = ["Informasi", "Keputusan", "Kandidat Arahan"];

/** Ambang klasifikasi prioritas (US-E1) — dapat diatur Admin. */
export const PRIORITY_THRESHOLD = { effort: 3, impact: 3 };

/** Ambang peringatan operasional (US-C2, US-D6). */
export const SLA = { picMaxDays: 3, kendalaAfterLateDays: 5 };

export function classifyPriority(effort, impact) {
  if (effort == null || impact == null) return null;
  const highEffort = effort >= PRIORITY_THRESHOLD.effort;
  const highImpact = impact >= PRIORITY_THRESHOLD.impact;
  if (highImpact && highEffort) return "Inisiatif Strategis";
  if (highImpact && !highEffort) return "Hasil Cepat";
  if (!highImpact && !highEffort) return "Mudah Dikerjakan";
  return "Perlu Ditinjau Ulang";
}

export const CLASSIFICATION_META = {
  "Inisiatif Strategis": { hint: "Dampak besar dengan upaya besar. Memerlukan perencanaan dan sumber daya khusus.", tone: "strategic" },
  "Hasil Cepat": { hint: "Dampak besar dengan upaya kecil. Sebaiknya didahulukan.", tone: "quick" },
  "Mudah Dikerjakan": { hint: "Dampak kecil dengan upaya kecil. Dikerjakan bila kapasitas unit memungkinkan.", tone: "low" },
  "Perlu Ditinjau Ulang": { hint: "Dampak kecil dengan upaya besar. Kelayakannya perlu ditinjau kembali.", tone: "recheck" },
};

export const EFFORT_RUBRIC = "1 = dapat diselesaikan satu unit dalam hitungan hari · 3 = memerlukan koordinasi beberapa unit · 5 = memerlukan anggaran, regulasi, atau pihak di luar BGN";
export const IMPACT_RUBRIC = "1 = pengaruhnya terbatas pada satu unit · 3 = memengaruhi pelaksanaan kegiatan yang sedang berjalan · 5 = menentukan capaian pemenuhan gizi tingkat nasional";

/* --- Seed agenda (Epik B) --------------------------------------------------- */

export const seedAgendas = [
  {
    id: "AG-2026-0007",
    pimpinan: "Sudaryono",
    place: "Ruang Rapat Utama BGN, Jakarta",
    title: "Rapat Pimpinan Mingguan BGN",
    type: "Rapat Pimpinan",
    date: "2026-08-10",
    units: ["Settama", "Dialur", "Sistakol"],
    summary: "Evaluasi capaian penyaluran MBG minggu kedua Agustus dan kesiapan dapur SPPG tahap kedua.",
    attachment: "Notulensi-Rapim-10Agu2026.pdf",
    createdBy: "Laras Permata",
    takeaways: [
      { id: "tk-7-1", text: "Capaian penyaluran MBG minggu kedua mencapai 84% dari target.", tag: "Informasi", directiveId: null },
      { id: "tk-7-2", text: "Disepakati dapur SPPG tahap kedua diprioritaskan pada wilayah 3T.", tag: "Keputusan", directiveId: null },
      { id: "tk-7-3", text: "Percepat pembangunan dapur SPPG pada wilayah prioritas tahap kedua.", tag: "Kandidat Arahan", directiveId: "SIGAP/2026/08/0001" },
      { id: "tk-7-4", text: "Satukan data penerima manfaat dengan Dukcapil sebelum peluncuran.", tag: "Kandidat Arahan", directiveId: "SIGAP/2026/08/0004" },
    ],
  },
  {
    id: "AG-2026-0008",
    pimpinan: "Agustina Arumsari",
    place: "Ruang Rapat Deputi Dialur, Jakarta",
    title: "Rapat Koordinasi Penyediaan dan Pasokan",
    type: "Rapat Koordinasi",
    date: "2026-08-11",
    units: ["Dialur", "Tauwas"],
    summary: "Pembahasan keterlambatan pasokan bahan pangan pada tiga wilayah dan mitigasinya.",
    attachment: "Materi-Rakor-Pasokan.pdf",
    createdBy: "Laras Permata",
    takeaways: [
      { id: "tk-8-1", text: "Tiga wilayah melaporkan keterlambatan pasokan lebih dari 48 jam.", tag: "Informasi", directiveId: null },
      { id: "tk-8-2", text: "Periksa kembali mitra penyedia bahan pangan lokal untuk program MBG.", tag: "Kandidat Arahan", directiveId: "SIGAP/2026/08/0002" },
      { id: "tk-8-3", text: "Susun cara mengatasi keterlambatan pasokan bahan pangan.", tag: "Kandidat Arahan", directiveId: "SIGAP/2026/08/0008" },
    ],
  },
  {
    id: "AG-2026-0009",
    pimpinan: "Sudaryono",
    place: "Dapur SPPG Surabaya, Jawa Timur",
    title: "Kunjungan Kerja Dapur SPPG Jawa Timur",
    type: "Kunjungan Kerja",
    date: "2026-08-12",
    units: ["Tauwas", "Dialur"],
    summary: "Peninjauan langsung kapasitas produksi dan kebersihan fasilitas penyimpanan.",
    attachment: "",
    createdBy: "Laras Permata",
    takeaways: [
      { id: "tk-9-1", text: "Kapasitas produksi pada jam sibuk baru 70% dari kapasitas terpasang.", tag: "Informasi", directiveId: null },
      { id: "tk-9-2", text: "Tindak lanjuti temuan kebersihan fasilitas penyimpanan.", tag: "Kandidat Arahan", directiveId: "SIGAP/2026/08/0010" },
      { id: "tk-9-3", text: "Susun jadwal pemeliharaan rutin peralatan dapur SPPG wilayah Jawa Timur.", tag: "Kandidat Arahan", directiveId: null },
    ],
  },
  {
    id: "AG-2026-0010",
    pimpinan: "Agustina Arumsari",
    place: "Ruang Audiensi BGN, Jakarta",
    title: "Audiensi Mitra Kerja Sama Gizi Nasional",
    type: "Audiensi",
    date: "2026-08-12",
    units: ["Prokerma"],
    summary: "Penjajakan kemitraan edukasi gizi bagi keluarga penerima manfaat.",
    attachment: "",
    createdBy: "Kirana Dewi",
    takeaways: [
      { id: "tk-10-1", text: "Mitra bersedia mendukung kampanye edukasi gizi tanpa biaya lisensi.", tag: "Informasi", directiveId: null },
      { id: "tk-10-2", text: "Susun kampanye edukasi gizi bagi keluarga penerima manfaat.", tag: "Kandidat Arahan", directiveId: "SIGAP/2026/08/0011" },
    ],
  },
];

/* --- Seed arahan (Epik A, C, D, E) ------------------------------------------ */

const p = (name) => users.find((user) => user.name === name);

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** `2026-08-04` + `09.30` → `4 Agu 2026, 09.30`. */
const stamp = (iso, time) => {
  const [year, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS_SHORT[Number(month) - 1]} ${year}, ${time}`;
};

/**
 * Setiap entri sengaja dibuat mewakili satu keadaan berbeda pada siklus status
 * agar seluruh alur pada dokumen US/AC dapat diperagakan tanpa menyiapkan data.
 */
const directiveSeeds = [
  {
    title: "Percepat pembangunan dapur SPPG pada wilayah prioritas tahap kedua",
    context: "Rapat Pimpinan Mingguan BGN", agendaId: "AG-2026-0007", takeawayId: "tk-7-3",
    source: "Lisan", unit: "Dialur", pic: "Bagas Mahendra", monitor: "Arif Nugroho",
    date: "2026-08-10", deadline: "2026-08-20", status: "Sedang Berjalan",
    priority: "Prioritas Nasional", alignment: "Sesuai Prioritas Badan", effort: 4.5, impact: 5,
    workUnits: ["Direktorat Penyediaan dan Penyaluran Makanan Bergizi Wilayah I"],
    supportUnits: ["Sistakol"], evidenceCount: 1, commentCount: 2,
  },
  {
    title: "Periksa kembali mitra penyedia bahan pangan lokal untuk program MBG",
    context: "Rapat Koordinasi Penyediaan dan Pasokan", agendaId: "AG-2026-0008", takeawayId: "tk-8-2",
    source: "Lisan", unit: "Dialur", pic: "Gilang Pratama",
    date: "2026-08-11", deadline: "2026-08-08", status: "Sedang Berjalan",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 3, impact: 4,
    kendala: { category: "Menunggu pihak eksternal", note: "Menunggu konfirmasi kelengkapan dokumen dari tiga calon penyedia.", at: "2026-08-12" },
    evidenceCount: 1, commentCount: 1,
  },
  {
    title: "Siapkan tanggapan bersama atas isu keamanan pangan MBG di media",
    context: "Pemantauan Media Nasional",
    source: "Publik", unit: "Prokerma", pic: "Melati Anggraini",
    date: "2026-08-09", deadline: "2026-08-11", status: "Sedang Berjalan",
    priority: "Prioritas Nasional", alignment: "Sesuai Prioritas Badan", effort: 2, impact: 5,
    sourceLink: "https://media.example.id/berita-keamanan-pangan-mbg",
    evidenceCount: 0, commentCount: 2,
  },
  {
    title: "Satukan data penerima manfaat dengan Dukcapil sebelum peluncuran",
    context: "Rapat Pimpinan Mingguan BGN", agendaId: "AG-2026-0007", takeawayId: "tk-7-4",
    source: "Lisan", unit: "Sistakol", pic: "Yusuf Ramadhan", monitor: "Sekar Ayu",
    date: "2026-08-10", deadline: "2026-08-25", status: "Sedang Berjalan",
    priority: "Prioritas Nasional", alignment: "Sesuai Prioritas Badan", effort: 5, impact: 5,
    workUnits: ["Direktorat Sistem Pemenuhan Gizi"],
    supportUnits: ["Pusdatin"], evidenceCount: 2, commentCount: 3,
  },
  {
    title: "Bangun ringkasan pemantauan distribusi pangan harian per kabupaten",
    context: "Rapat Pemantauan Program",
    source: "Tertulis", unit: "Tauwas", pic: "Rani Kusumawati",
    date: "2026-08-05", deadline: "2026-08-14", status: "Menunggu Verifikasi",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 3, impact: 4,
    completion: { summary: "Ringkasan harian per kabupaten telah tersedia dan diuji pada 12 kabupaten percontohan.", by: "Rani Kusumawati", at: "2026-08-12" },
    evidenceCount: 2, commentCount: 2,
  },
  {
    title: "Selesaikan SOP uji sampel makanan di seluruh dapur SPPG",
    context: "Penyusunan Standar Tata Kelola",
    source: "Tertulis", unit: "Sistakol", pic: "Fajar Ardiansyah",
    date: "2026-08-04", deadline: "2026-08-07", status: "Sedang Berjalan",
    priority: "Prioritas Nasional", alignment: "Sesuai Prioritas Badan", effort: 3.5, impact: 5,
    evidenceCount: 0, commentCount: 1,
    /* sengaja tanpa kendala walau sudah terlambat > 5 hari → memicu kewajiban isi kendala (US-D6) */
  },
  {
    title: "Petakan ketersediaan ahli gizi untuk penempatan wilayah 3T",
    context: "Rapat SDMO",
    source: "Tertulis", unit: "Settama", pic: "Laras Permata",
    date: "2026-08-06", deadline: "2026-08-28", status: "Belum Mulai",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 2.5, impact: 3,
    workUnits: ["Biro Sumber Daya Manusia dan Organisasi"],
    evidenceCount: 0, commentCount: 0,
  },
  {
    title: "Susun cara mengatasi keterlambatan pasokan bahan pangan",
    context: "Rapat Koordinasi Penyediaan dan Pasokan", agendaId: "AG-2026-0008", takeawayId: "tk-8-3",
    source: "Lisan", unit: "Dialur", pic: null,
    date: "2026-08-11", deadline: "2026-08-24", status: "Belum Mulai",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 3, impact: 4,
    evidenceCount: 0, commentCount: 0,
    /* sengaja tanpa PIC → memicu peringatan "belum ada penanggung jawab" (US-C2) */
  },
  {
    title: "Tinjau kapasitas produksi dapur SPPG pada jam sibuk",
    context: "Kunjungan Kerja Dapur SPPG Jawa Timur", agendaId: "AG-2026-0009",
    source: "Lisan", unit: "Dialur", pic: "Bagas Mahendra",
    date: "2026-08-12", deadline: "2026-09-02", status: "Sedang Berjalan",
    priority: "Reguler", alignment: "Sesuai Prioritas Badan", effort: 2, impact: 2,
    evidenceCount: 1, commentCount: 1,
  },
  {
    title: "Tindak lanjuti temuan kebersihan fasilitas penyimpanan",
    context: "Kunjungan Kerja Dapur SPPG Jawa Timur", agendaId: "AG-2026-0009", takeawayId: "tk-9-2",
    source: "Lisan", unit: "Tauwas", pic: "Rani Kusumawati", monitor: "Arif Nugroho",
    date: "2026-08-12", deadline: "2026-08-18", status: "Sedang Berjalan",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 2, impact: 4,
    evidenceCount: 1, commentCount: 2,
  },
  {
    title: "Susun kampanye edukasi gizi bagi keluarga penerima manfaat",
    context: "Audiensi Mitra Kerja Sama Gizi Nasional", agendaId: "AG-2026-0010", takeawayId: "tk-10-2",
    source: "Lisan", unit: "Prokerma", pic: "Bima Santoso",
    date: "2026-08-12", deadline: "2026-09-05", status: "Belum Mulai",
    priority: "Reguler", alignment: "Sesuai Prioritas Badan", effort: 2, impact: 3,
    workUnits: ["Direktorat Promosi dan Edukasi Gizi"],
    evidenceCount: 0, commentCount: 0,
  },
  {
    title: "Tindak lanjuti rekomendasi audit pengadaan bahan pangan",
    context: "Rapat Tindak Lanjut Pengawasan",
    source: "Tertulis", unit: "Irtama", pic: "Nadia Rahma",
    date: "2026-08-01", deadline: "2026-08-06", status: "Sedang Berjalan",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 3, impact: 3,
    kendala: { category: "Kendala sumber daya", note: "Tim audit sedang menyelesaikan penugasan wilayah; personel baru tersedia pekan depan.", at: "2026-08-11" },
    evidenceCount: 1, commentCount: 1,
  },
  {
    title: "Perkuat pengawasan mutu gizi pada dapur mitra wilayah timur",
    context: "Rapat Pemantauan Program",
    source: "Tertulis", unit: "Tauwas", pic: "Sinta Lestari",
    date: "2026-07-28", deadline: "2026-08-05", status: "Menunggu Keputusan",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 4, impact: 4,
    pendingRequest: {
      type: "deadline", proposedDeadline: "2026-08-29",
      reason: "Jadwal pemeriksaan lapangan bergeser karena cuaca ekstrem di wilayah Maluku dan Papua Selatan.",
      by: "Sinta Lestari", at: "2026-08-11",
    },
    evidenceCount: 1, commentCount: 2,
  },
  {
    title: "Siapkan integrasi data logistik dapur dengan sistem pusat",
    context: "Forum Integrasi Sistem",
    source: "Tertulis", unit: "Sistakol", pic: "Yusuf Ramadhan",
    date: "2026-08-02", deadline: "2026-08-21", status: "Menunggu Keputusan",
    priority: "Prioritas Nasional", alignment: "Sesuai Prioritas Badan", effort: 5, impact: 4,
    pendingRequest: {
      type: "realih", targetUnit: "Pusdatin",
      reason: "Pekerjaan bersifat teknis infrastruktur data; Sistakol menyusun kebijakannya, pelaksanaan teknis pada Pusdatin.",
      by: "Prima Yosephine Berliana Tumiur Hutapea", at: "2026-08-12",
    },
    evidenceCount: 0, commentCount: 1,
  },
  {
    title: "Susun laporan capaian pemenuhan gizi semester pertama",
    context: "Rapat Pimpinan Mingguan BGN",
    source: "Tertulis", unit: "Settama", pic: "Laras Permata",
    date: "2026-07-20", deadline: "2026-08-01", status: "Selesai",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 3, impact: 4,
    completion: { summary: "Laporan capaian semester pertama telah disahkan dan dikirimkan ke pimpinan.", by: "Laras Permata", at: "2026-07-31" },
    completedAt: "2026-07-31",
    workUnits: ["Biro Manajemen Kinerja"],
    evidenceCount: 2, commentCount: 2,
  },
  {
    title: "Bakukan format serah terima dapur SPPG dari mitra pembangunan",
    context: "Penyusunan Standar Tata Kelola",
    source: "Tertulis", unit: "Sistakol", pic: "Fajar Ardiansyah",
    date: "2026-07-22", deadline: "2026-08-04", status: "Selesai",
    priority: "Reguler", alignment: "Sesuai Prioritas Badan", effort: 2, impact: 3,
    completion: { summary: "Format serah terima dibakukan dan telah dipakai pada 18 dapur.", by: "Fajar Ardiansyah", at: "2026-08-06" },
    completedAt: "2026-08-06",
    evidenceCount: 1, commentCount: 1,
  },
  {
    title: "Perbarui basis data mitra penyedia bahan pangan nasional",
    context: "Evaluasi Penyedia dan Pasokan",
    source: "Tertulis", unit: "Dialur", pic: "Gilang Pratama",
    date: "2026-07-25", deadline: "2026-08-08", status: "Selesai",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 2.5, impact: 3,
    completion: { summary: "Basis data mitra diperbarui untuk 34 provinsi dan tersambung ke modul pengadaan.", by: "Gilang Pratama", at: "2026-08-07" },
    completedAt: "2026-08-07",
    evidenceCount: 2, commentCount: 1,
  },
  {
    title: "Terbitkan panduan komunikasi krisis program MBG",
    context: "Rencana Promosi dan Edukasi",
    source: "Tertulis", unit: "Prokerma", pic: "Melati Anggraini",
    date: "2026-07-18", deadline: "2026-07-30", status: "Selesai",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 2, impact: 4,
    completion: { summary: "Panduan komunikasi krisis terbit dan disosialisasikan ke seluruh unit.", by: "Melati Anggraini", at: "2026-08-01" },
    completedAt: "2026-08-01",
    evidenceCount: 1, commentCount: 2,
  },
  {
    title: "Tinjau ulang skema insentif juru masak dapur SPPG",
    context: "Rapat SDMO",
    source: "Tertulis", unit: "Settama", pic: null,
    date: "2026-08-03", deadline: "2026-08-30", status: "Dibatalkan",
    priority: "Reguler", alignment: "Di Luar Prioritas", effort: 3, impact: 2,
    cancelReason: "Digabungkan ke dalam kajian remunerasi menyeluruh yang sedang berjalan di Biro SDMO.",
    evidenceCount: 0, commentCount: 1,
  },
  {
    title: "Bentuk forum konsultasi gizi bersama perguruan tinggi",
    context: "Audiensi Mitra Kerja Sama Gizi Nasional",
    source: "Lisan", unit: "Prokerma", pic: "Bima Santoso",
    date: "2026-08-08", deadline: "2026-09-12", status: "Sedang Berjalan",
    priority: "Reguler", alignment: "Di Luar Prioritas", effort: 4, impact: 2,
    evidenceCount: 0, commentCount: 1,
  },
  {
    title: "Susun peta risiko rantai pasok pangan menjelang akhir tahun",
    context: "Forum Manajemen Risiko",
    source: "Tertulis", unit: "Sistakol", pic: "Fajar Ardiansyah",
    date: "2026-08-07", deadline: "2026-09-10", status: "Sedang Berjalan",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 4, impact: 4,
    workUnits: ["Direktorat Manajemen Risiko Pemenuhan Gizi"],
    evidenceCount: 1, commentCount: 1,
  },
  {
    title: "Siapkan dasbor pemantauan mutu gizi untuk pimpinan",
    context: "Forum Integrasi Sistem",
    source: "Tertulis", unit: "Pusdatin", pic: "Dimas Prakoso",
    date: "2026-08-05", deadline: "2026-08-26", status: "Sedang Berjalan",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 3.5, impact: 4,
    workUnits: ["Bidang Pengembangan Sistem Informasi"],
    evidenceCount: 0, commentCount: 1,
  },
  {
    title: "Evaluasi efektivitas penyaluran MBG di wilayah kepulauan",
    context: "Rapat Pemantauan Program",
    source: "Tertulis", unit: "Tauwas", pic: "Rani Kusumawati",
    date: "2026-08-01", deadline: "2026-08-09", status: "Sedang Berjalan",
    priority: "Prioritas Badan", alignment: "Sesuai Prioritas Badan", effort: 3, impact: 4,
    kendala: { category: "Kendala unit/direktorat", note: "Data dari dua direktorat wilayah belum lengkap; sudah diingatkan dua kali.", at: "2026-08-12" },
    evidenceCount: 1, commentCount: 2,
  },
  {
    title: "Perkuat koordinasi distribusi dengan pemerintah daerah",
    targetUnits: ["Dialur", "Prokerma"],
    context: "Rapat Koordinasi Penyediaan dan Pasokan",
    source: "Tertulis", unit: null, pic: null,
    date: "2026-08-12", deadline: "2026-08-27", status: "Belum Ditugaskan",
    priority: "Prioritas Badan", alignment: null, effort: null, impact: null,
    evidenceCount: 0, commentCount: 0,
  },
  {
    title: "Petakan kebutuhan pelatihan mutu pangan bagi pengelola dapur",
    targetUnits: ["Settama", "Sistakol"],
    context: "Rapat SDMO",
    source: "Tertulis", unit: null, pic: null,
    date: "2026-08-12", deadline: "2026-09-01", status: "Belum Ditugaskan",
    priority: "Reguler", alignment: null, effort: null, impact: null,
    evidenceCount: 0, commentCount: 0,
  },
  {
    title: "Percepat penyelesaian tunggakan pembayaran mitra dapur triwulan kedua",
    targetUnits: ["Settama"],
    context: "Rapat Pimpinan Mingguan BGN", agendaId: "AG-2026-0007",
    source: "Lisan", unit: null, pic: null,
    date: "2026-08-13", deadline: "2026-08-22", status: "Menunggu Kurasi",
    priority: "Prioritas Nasional", alignment: null, effort: null, impact: null,
    evidenceCount: 0, commentCount: 0,
  },
  {
    title: "Siapkan rencana perluasan program Makan Bergizi Gratis ke jenjang PAUD",
    targetUnits: ["Sistakol", "Dialur"],
    context: "Rapat Pimpinan Mingguan BGN",
    source: "Tertulis", unit: null, pic: null,
    date: "2026-08-13", deadline: "2026-09-15", status: "Menunggu Kurasi",
    priority: "Prioritas Nasional", alignment: null, effort: null, impact: null,
    evidenceCount: 0, commentCount: 0,
  },
  {
    title: "Tinjau kembali standar porsi makanan bergizi untuk siswa SMA",
    targetUnits: ["Sistakol"],
    context: "Rapat Koordinasi Penyediaan dan Pasokan",
    source: "Tertulis", unit: null, pic: null,
    date: "2026-08-13", deadline: "2026-09-08", status: "Menunggu Kurasi",
    priority: "Reguler", alignment: null, effort: null, impact: null,
    evidenceCount: 0, commentCount: 0,
  },
  {
    title: "Tanggapi keluhan masyarakat soal keterlambatan distribusi di media sosial",
    targetUnits: ["Prokerma", "Dialur"],
    context: "Pemantauan Media Nasional",
    source: "Publik", unit: null, pic: null,
    date: "2026-08-13", deadline: "2026-08-19", status: "Menunggu Konfirmasi",
    priority: "Prioritas Badan", alignment: null, effort: null, impact: null,
    sourceLink: "https://media.example.id/keluhan-distribusi-mbg",
    evidenceCount: 0, commentCount: 0,
  },
  {
    title: "Tindak lanjuti masukan komunitas gizi pada forum daring nasional",
    targetUnits: ["Prokerma"],
    context: "Pemantauan Media Nasional",
    source: "Publik", unit: null, pic: null,
    date: "2026-08-13", deadline: "2026-09-03", status: "Menunggu Konfirmasi",
    priority: "Reguler", alignment: null, effort: null, impact: null,
    sourceLink: "https://forum.example.id/masukan-komunitas-gizi",
    evidenceCount: 0, commentCount: 0,
  },
  {
    title: "Pastikan ketersediaan bahan pangan lokal menjelang libur panjang",
    targetUnits: ["Dialur"],
    context: "Rapat Koordinasi Penyediaan dan Pasokan",
    source: "Lisan", unit: null, pic: null,
    date: "2026-08-13", deadline: "2026-08-23", status: "Menunggu Konfirmasi",
    priority: "Prioritas Badan", alignment: null, effort: null, impact: null,
    evidenceCount: 0, commentCount: 0,
  },
];

const sampleComments = [
  "Koordinasi awal telah dilakukan. Tim menyiapkan perkembangan terbaru hari ini.",
  "Data lapangan sudah diterima dan sedang kami periksa sebelum diunggah.",
  "Rapat teknis dijadwalkan lusa bersama unit pendukung.",
];

const sampleEvidence = [
  { name: "Laporan-kemajuan.pdf", type: "PDF", note: "Rekap pelaksanaan terbaru" },
  { name: "Dokumentasi-lapangan.jpg", type: "JPG", note: "Foto kegiatan di lokasi" },
];

export const seedDirectives = directiveSeeds.map((seed, index) => {
  const unit = seed.unit ? unitByShort[seed.unit] : null;
  const person = seed.pic ? p(seed.pic) : null;
  const number = String(index + 1).padStart(4, "0");
  const id = `SIGAP/2026/08/${number}`;
  const recorder = seed.source === "Publik" ? "Kirana Dewi" : "Laras Permata";

  const history = [{ label: `Arahan dicatat dari sumber ${seed.source.toLowerCase()}`, by: recorder, time: stamp(seed.date, "08.45") }];
  if (!PRE_REGISTER_STATUSES.includes(seed.status)) {
    history.push({ label: "Lolos kurasi dan masuk register aktif", by: "Lili Khamiliyah", time: stamp(seed.date, "10.05") });
  }
  if (unit) history.push({ label: `Didisposisikan ke ${unit.name}`, by: "Lili Khamiliyah", time: stamp(seed.date, "10.20") });
  if (person) history.push({ label: `Penanggung jawab ditetapkan: ${person.name}`, by: unit?.pmo || "Lili Khamiliyah", time: stamp(seed.date, "11.00") });
  if (seed.monitor) history.push({ label: `Pemantau arahan ditetapkan: ${seed.monitor}`, by: "Lili Khamiliyah", time: stamp(seed.date, "11.10") });
  if (seed.kendala) history.push({ label: `Kendala dicatat: ${seed.kendala.category}`, by: unit?.pmo || "Lili Khamiliyah", time: stamp(seed.kendala.at, "09.30") });
  if (seed.pendingRequest) {
    history.push({
      label: seed.pendingRequest.type === "deadline"
        ? `Perubahan deadline diajukan ke ${seed.pendingRequest.proposedDeadline}`
        : `Pemindahan unit diajukan ke ${seed.pendingRequest.targetUnit}`,
      by: seed.pendingRequest.by, time: stamp(seed.pendingRequest.at, "13.15"),
    });
  }
  if (seed.completion) history.push({ label: "Penyelesaian diajukan beserta bukti", by: seed.completion.by, time: stamp(seed.completion.at, "15.40") });
  if (seed.status === "Selesai") history.push({ label: "Penyelesaian disetujui verifikator", by: "Sinta Lestari", time: stamp(seed.completedAt, "16.20") });
  if (seed.status === "Dibatalkan") history.push({ label: "Arahan dibatalkan", by: "Lili Khamiliyah", time: stamp(seed.date, "14.00") });

  return {
    id,
    title: seed.title,
    source: seed.source,
    sourceLink: seed.sourceLink || "",
    attachment: seed.source === "Tertulis" ? "Surat-arahan-pimpinan.pdf" : "",
    context: seed.context,
    agendaId: seed.agendaId || null,
    takeawayId: seed.takeawayId || null,
    date: seed.date,
    deadline: seed.deadline,
    originalDeadline: seed.deadline,
    deadlineChanges: [],
    /* Unit tujuan yang disebut pimpinan saat arahan disampaikan, sebelum disposisi resmi. */
    targetUnits: seed.targetUnits || [seed.unit, ...(seed.supportUnits || [])].filter(Boolean),
    unit: seed.unit || null,
    unitName: unit?.name || null,
    workUnits: seed.workUnits || [],
    supportUnits: seed.supportUnits || [],
    pic: person?.name || null,
    picColor: person?.color || "#98A2B3",
    pmo: unit?.pmo || null,
    monitor: seed.monitor || null,
    priority: seed.priority,
    alignment: seed.alignment || null,
    effort: seed.effort ?? null,
    impact: seed.impact ?? null,
    classification: classifyPriority(seed.effort ?? null, seed.impact ?? null),
    status: seed.status,
    kendala: seed.kendala || null,
    pendingRequest: seed.pendingRequest || null,
    completion: seed.completion || null,
    completedAt: seed.completedAt || null,
    cancelReason: seed.cancelReason || "",
    recordedBy: recorder,
    evidence: Array.from({ length: seed.evidenceCount || 0 }, (_, i) => ({
      id: `${id}-e${i}`,
      ...sampleEvidence[i % sampleEvidence.length],
      by: person?.name || recorder,
      at: seed.date,
    })),
    comments: Array.from({ length: seed.commentCount || 0 }, (_, i) => ({
      id: `${id}-c${i}`,
      author: i === 0 ? (unit?.pmo || recorder) : (person?.name || recorder),
      text: sampleComments[i % sampleComments.length],
      time: stamp(seed.date, `${String(9 + i * 3).padStart(2, "0")}.30`),
    })),
    history,
  };
});

/* --- Log audit (US-F5) ------------------------------------------------------ */

export const seedAuditLog = [
  { id: "au-12", at: "2026-08-13 08.02", actor: "Lili Khamiliyah", action: "Masuk sistem", object: "Sesi", objectId: "-", detail: "Autentikasi berhasil" },
  { id: "au-11", at: "2026-08-12 16.20", actor: "Sinta Lestari", action: "Menyetujui penyelesaian", object: "Arahan", objectId: "SIGAP/2026/08/0018", detail: "Menunggu Verifikasi → Selesai" },
  { id: "au-10", at: "2026-08-12 15.40", actor: "Rani Kusumawati", action: "Mengajukan penyelesaian", object: "Arahan", objectId: "SIGAP/2026/08/0005", detail: "Sedang Berjalan → Menunggu Verifikasi" },
  { id: "au-9", at: "2026-08-12 13.15", actor: "Prima Yosephine Berliana Tumiur Hutapea", action: "Mengajukan pemindahan unit", object: "Arahan", objectId: "SIGAP/2026/08/0014", detail: "Sistakol → Pusdatin" },
  { id: "au-8", at: "2026-08-12 11.05", actor: "Dimas Prakoso", action: "Mengubah hak akses peran", object: "Peran", objectId: "role-pemantau", detail: "Menambah izin tanggapan.create" },
  { id: "au-7", at: "2026-08-12 10.30", actor: "Ketut Sumedana", action: "Mengunduh laporan", object: "Laporan", objectId: "arahan-aktif.csv", detail: "Filter: status aktif, semua unit" },
  { id: "au-6", at: "2026-08-12 09.30", actor: "Zainuri", action: "Mencatat kendala", object: "Arahan", objectId: "SIGAP/2026/08/0002", detail: "Menunggu pihak eksternal" },
  { id: "au-5", at: "2026-08-11 13.15", actor: "Sinta Lestari", action: "Mengajukan perubahan deadline", object: "Arahan", objectId: "SIGAP/2026/08/0013", detail: "2026-08-05 → 2026-08-29" },
  { id: "au-4", at: "2026-08-11 10.20", actor: "Lili Khamiliyah", action: "Mendisposisikan arahan", object: "Arahan", objectId: "SIGAP/2026/08/0008", detail: "→ Deputi Bidang Penyediaan dan Penyaluran" },
  { id: "au-3", at: "2026-08-11 08.45", actor: "Laras Permata", action: "Mencatat arahan", object: "Arahan", objectId: "SIGAP/2026/08/0008", detail: "Sumber lisan dari agenda AG-2026-0008" },
  { id: "au-2", at: "2026-08-10 10.05", actor: "Lili Khamiliyah", action: "Menyetujui kurasi", object: "Arahan", objectId: "SIGAP/2026/08/0001", detail: "Menunggu Kurasi → Belum Ditugaskan" },
  { id: "au-1", at: "2026-08-10 08.45", actor: "Laras Permata", action: "Mencatat agenda", object: "Agenda", objectId: "AG-2026-0007", detail: "Rapat Pimpinan Mingguan BGN" },
];

/* --- Notifikasi (US-D8) ----------------------------------------------------- */

export const seedNotifications = [
  { id: 1, title: "Arahan terlambat tanpa kendala", body: "SOP uji sampel makanan sudah terlambat 6 hari dan belum ada catatan kendala.", time: "8 menit", targetId: "SIGAP/2026/08/0006", unread: true },
  { id: 2, title: "Arahan belum memiliki penanggung jawab", body: "Cara mengatasi keterlambatan pasokan bahan pangan menunggu penetapan PIC.", time: "34 menit", targetId: "SIGAP/2026/08/0008", unread: true },
  { id: 3, title: "Penyelesaian menunggu pemeriksaan", body: "Ringkasan pemantauan distribusi harian diajukan selesai.", time: "1 jam", targetId: "SIGAP/2026/08/0005", unread: true },
  { id: 4, title: "Permintaan menunggu keputusan", body: "Dua pengajuan (deadline dan pindah unit) menunggu keputusan Anda.", time: "2 jam", targetId: "SIGAP/2026/08/0013", unread: false },
];

/* --- Utilitas -------------------------------------------------------------- */

export function hasPermission(role, permission) {
  return Boolean(role?.permissions?.includes(permission));
}

export function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}
