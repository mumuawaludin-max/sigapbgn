# SIGAP BGN — Rekomendasi Pengembangan Sistem
## User Story & Acceptance Criteria

**Versi:** 1.0 · 20 Agustus 2026
**Status:** Draf acuan pengembangan — untuk divalidasi pada Fase 1 (Finalisasi Proses Bisnis)
**Cakupan:** Prototipe → sistem fungsional penuh. **Di luar cakupan:** migrasi ke infrastruktur BGN, SSO BGN, pengadaan formal.

---

## 1. Latar Belakang & Masalah yang Diselesaikan

Dokumen ini menjadi acuan tunggal pengembangan SIGAP BGN. Setiap User Story (US) tertelusur ke salah satu dari **empat masalah inti** (iceberg) dan/atau **temuan analisis tracker arahan Kemenkes** (file "REKAP ARAHAN SIAP Staf Ahli Teknologi Kesehatan 2024" — sistem sejenis yang selama ini dijalankan manual di Google Sheets).

### 1.1 Empat masalah inti (iceberg)

| Kode | Masalah | Kondisi saat ini |
|------|---------|------------------|
| **P1** | Pencatatan Arahan Pimpinan | Arahan masih dalam bentuk surat |
| **P2** | Arahan Pimpinan satu pintu | Belum ada pencatatan satu pintu untuk seluruh arahan pimpinan |
| **P3** | Monitoring Capaian Arahan | Belum ada tracker untuk mengecek apakah arahan telah dilaksanakan atau diselesaikan |
| **P4** | Rekap Agenda | Belum ada pencatatan agenda dan key takeaways terstruktur |

### 1.2 Pelajaran dari tracker Kemenkes (temuan analisis)

| Kode | Temuan | Implikasi untuk SIGAP BGN |
|------|--------|---------------------------|
| **K1** | Skoring Effort/Impact menghasilkan Classification (Strategic Initiatives, Quick Wins, Low Hanging Fruit) dan ranking prioritas untuk roadmap multi-tahun | Perlu modul prioritisasi, bukan sekadar tag statis |
| **K2** | Usulan deadline baru selalu dicatat isinya (tanggal + alasan), meski manual | Form pengajuan harus menangkap isi usulan, bukan hanya status |
| **K3** | Taksonomi kendala keterlambatan: Kendala direktorat / Skala prioritas / Kendala resource | Status "Terlambat" perlu kode alasan terstruktur |
| **K4** | Flag "Kesesuaian dengan prioritas" terpisah dari level prioritas | Perlu penanda keselarasan dengan prioritas resmi Badan |
| **K5** | Lapisan kepemilikan berlapis: TA Pengampu, PMO/PIC, PIC Stratplan (tim pengawas sentral), MoD (pemantau administratif per item) | Perlu peran pemantau sentral lintas unit + pemantau per arahan |
| **K6** | Antrean staging "Arahan Baru"/"Arahan Coming Soon" sebelum masuk register resmi | Arahan baru melalui kurasi sebelum resmi tayang |
| **K7** | Juknis Google Sheets membuktikan kerapuhan cara manual: filter bisa terhapus orang lain, status dilarang diubah sendiri, kolom rusak (#REF!), data ganda antar-sheet | Semua aturan yang dijaga lewat "mohon jangan diubah" harus dijaga oleh sistem (RBAC + validasi + audit) |

### 1.3 Struktur organisasi (sampai eselon 1)

Unit disposisi dalam sistem mengikuti bagan organisasi BGN, **hanya sampai eselon 1**:

| Unit dalam sistem | Nama lengkap |
|---|---|
| **Settama** | Sekretariat Utama (Sekretaris Utama) |
| **Irtama** | Inspektorat Utama (Inspektur Utama) |
| **Deputi Sistakol** | Deputi Bidang Sistem dan Tata Kelola |
| **Deputi Dialur** | Deputi Bidang Penyediaan dan Penyaluran |
| **Deputi Prokerma** | Deputi Bidang Promosi dan Kerja Sama |
| **Deputi Tauwas** | Deputi Bidang Pemantauan dan Pengawasan |
| **Pusdatin** | Pusat Data dan Sistem Informasi (unit pendukung; pengelola teknis sistem) |

Unit eselon 2 (biro/direktorat/inspektorat wilayah) **tidak menjadi target disposisi** pada tahap ini — dicatat sebagai label "unit kerja pelaksana" (teks/pilihan) di bawah unit eselon 1, agar struktur data siap bila kelak diperdalam.

**Pimpinan:** Kepala Badan (Kaba) dan Wakil Kepala — pemberi arahan, konsumen dashboard eksekutif. **Dewan Pengarah** — bukan pengguna operasional; bila diperlukan diberi akses baca dashboard eksekutif (lihat US-G6).

### 1.4 Peran (aktor) dalam sistem

| Peran | Padanan organisasi | Fungsi utama |
|---|---|---|
| **Pimpinan** | Kaba / Wakil Kepala | Melihat dashboard eksekutif; sumber arahan |
| **Sekretariat Pimpinan (Notulis)** | Staf sekretariat Kaba/Waka | Mencatat agenda, key takeaways, dan arahan dari forum |
| **Koordinator Sistem (Orkestrator)** | Settama / tim khusus di bawah Sestama (padanan "PIC Stratplan" Kemenkes) | Kurasi arahan masuk, disposisi, persetujuan lintas unit, menjaga kesehatan data |
| **Koordinator Unit (PMO Unit)** | PMO pada tiap unit eselon 1 | Menerima disposisi, menetapkan PIC, memantau pekerjaan unitnya |
| **PIC Pelaksana** | Staf pada unit eselon 1 | Mengerjakan arahan, menulis perkembangan, mengunggah bukti |
| **Pemantau Arahan** (opsional per item) | Staf sekretariat (padanan "MoD" Kemenkes) | Memantau administratif arahan tertentu lintas unit |
| **Pengawas (read-only)** | Irtama | Membaca lintas unit, riwayat, bukti — tanpa mengubah |
| **Admin Sistem** | Pusdatin | Kelola pengguna, unit, peran, hak akses |

---

## 2. Ringkasan Epik & Keterlacakan

| Epik | Nama | Menjawab |
|---|---|---|
| **A** | Pencatatan Arahan Satu Pintu | P1, P2, K6, K7 |
| **B** | Rekap Agenda & Key Takeaways | P4 |
| **C** | Disposisi & Kepemilikan Berlapis | P2, K5 |
| **D** | Monitoring, Status & Siklus Penyelesaian | P3, K2, K3 |
| **E** | Prioritisasi Strategis | K1, K4 |
| **F** | Dashboard, Laporan & Audit | P3, K7 |
| **G** | Administrasi, Peran & Keamanan | K7 |
| **H** | Kebutuhan Non-Fungsional | — |

Label prioritas tiap US: **[MVP]** = wajib ada saat demo akhir (rencana 1 bulan) · **[Lanjutan]** = setelah MVP, sebelum/bersamaan migrasi BGN.

---

## EPIK A — Pencatatan Arahan Satu Pintu

> Menjawab P1 (arahan masih berbentuk surat) dan P2 (belum satu pintu). Semua arahan — dari surat, forum lisan, maupun kanal publik — masuk ke satu register digital dengan penomoran tunggal.

### US-A1 — Mencatat arahan tertulis **[MVP]**
**Sebagai** Sekretariat Pimpinan, **saya ingin** mencatat arahan dari surat/dokumen resmi ke dalam sistem, **agar** arahan tidak lagi tercecer dalam bentuk surat dan langsung masuk register satu pintu.

**Acceptance Criteria:**
- [ ] Form pencatatan memuat: isi arahan (wajib), forum/konteks (wajib), tanggal arahan, program terkait, lampiran dokumen sumber (unggah berkas nyata — PDF/DOCX/PNG/JPG maks 10 MB).
- [ ] Sistem menerbitkan nomor registrasi otomatis dan unik dengan format `SIGAP/{tahun}/{bulan}/{nomor-urut}`; nomor tidak pernah dipakai ulang termasuk untuk arahan yang dibatalkan.
- [ ] Arahan tersimpan dengan status awal `Menunggu Kurasi` (lihat US-A4).
- [ ] Pencatat, waktu pencatatan, dan sumber tercatat otomatis di riwayat.
- [ ] Hanya peran dengan izin `arahan.create.tertulis` yang melihat tombol dan dapat mengakses form ini.

### US-A2 — Mencatat arahan lisan **[MVP]**
**Sebagai** Sekretariat Pimpinan, **saya ingin** mencatat arahan yang disampaikan lisan dalam rapat/kunjungan, **agar** arahan lisan punya jejak tertulis yang sama kuatnya dengan arahan surat.

**Acceptance Criteria:**
- [ ] Form sama dengan US-A1, dengan penanda sumber `Lisan` dan kolom forum/konteks wajib merujuk agenda (bisa memilih dari agenda yang sudah tercatat di Epik B — lihat US-B3).
- [ ] Arahan lisan berstatus awal `Menunggu Konfirmasi`: harus dikonfirmasi kebenarannya oleh Koordinator Sistem sebelum masuk kurasi.
- [ ] Bila dikembalikan saat konfirmasi, pencatat menerima notifikasi berikut catatan alasannya.

### US-A3 — Mencatat arahan dari kanal publik **[MVP]**
**Sebagai** Koordinator Sistem, **saya ingin** mencatat arahan pimpinan yang disampaikan lewat media/kanal publik, **agar** arahan dari luar forum internal juga masuk satu pintu.

**Acceptance Criteria:**
- [ ] Form mewajibkan tautan sumber atau tangkapan layar sebagai bukti asal.
- [ ] Tanpa bukti asal, form tidak dapat disimpan dan menampilkan pesan kesalahan yang menjelaskan apa yang kurang.
- [ ] Status awal `Menunggu Konfirmasi`, mengikuti alur US-A2.

### US-A4 — Kurasi arahan sebelum resmi tayang **[MVP]** *(dari K6)*
**Sebagai** Koordinator Sistem, **saya ingin** meninjau setiap arahan baru di antrean kurasi sebelum resmi masuk register aktif, **agar** register hanya berisi arahan yang benar, tidak ganda, dan siap didisposisikan.

**Acceptance Criteria:**
- [ ] Ada halaman antrean kurasi berisi semua arahan berstatus `Menunggu Kurasi`, terurut dari yang terlama.
- [ ] Pada tiap item, Koordinator Sistem dapat: (a) menyetujui → status menjadi `Belum Ditugaskan` dan arahan tampil di register aktif; (b) mengembalikan ke pencatat dengan catatan wajib; (c) menandai duplikat dengan memilih arahan asli yang sudah ada — duplikat tertutup dan tertaut ke arahan asli.
- [ ] Saat kurasi, Koordinator Sistem dapat memperbaiki redaksi isi arahan; versi sebelum-sesudah tercatat di riwayat.
- [ ] Arahan yang belum lolos kurasi tidak muncul di register aktif maupun dashboard.

### US-A5 — Melihat register arahan sesuai hak akses **[MVP]**
**Sebagai** pengguna dengan peran apa pun, **saya ingin** melihat daftar arahan yang menjadi hak saya dengan pencarian dan filter, **agar** saya cepat menemukan arahan yang relevan tanpa bergantung pada filter manual ala spreadsheet (K7).

**Acceptance Criteria:**
- [ ] Cakupan baris mengikuti izin: `arahan.read.all` melihat semua unit; `arahan.read.unit` hanya unitnya; `arahan.read.assigned` hanya yang ditugaskan padanya.
- [ ] Filter tersedia untuk: status, unit (bila berhak), prioritas, klasifikasi, sumber, kesesuaian prioritas Badan, dan rentang deadline; filter dapat digabung.
- [ ] Pencarian mencakup nomor registrasi, isi arahan, dan nama PIC.
- [ ] Filter/pencarian pengguna satu tidak pernah memengaruhi tampilan pengguna lain.
- [ ] Daftar berpaginasi dan jumlah halaman mengikuti hasil filter (bukan angka statis).

---

## EPIK B — Rekap Agenda & Key Takeaways

> Menjawab P4. Modul baru — belum ada pada prototipe. Setiap forum pimpinan (rapat, kunjungan, audiensi) tercatat agendanya, dan arahan lahir *dari* agenda sehingga konteksnya tidak putus. Pola ini persis kolom "Tanggal Agenda / Agenda Terkait" yang menjadi tulang punggung tracker Kemenkes.

### US-B1 — Mencatat agenda forum pimpinan **[MVP]**
**Sebagai** Sekretariat Pimpinan, **saya ingin** mencatat agenda kegiatan pimpinan (nama forum, jenis, tanggal, peserta, ringkasan), **agar** ada rekap agenda terstruktur yang selama ini tidak ada.

**Acceptance Criteria:**
- [ ] Form agenda memuat: nama forum (wajib), jenis forum (Rapim / Rapat Koordinasi / Kunjungan Kerja / Audiensi / Vicon / Lainnya), tanggal (wajib), unit terkait (multi-pilih eselon 1), ringkasan, lampiran (notulensi/materi).
- [ ] Agenda tersimpan dan tampil pada daftar agenda terurut tanggal terbaru.
- [ ] Agenda dapat disunting oleh pencatatnya dan Koordinator Sistem; setiap suntingan tercatat di riwayat.

### US-B2 — Mencatat key takeaways per agenda **[MVP]**
**Sebagai** Sekretariat Pimpinan, **saya ingin** menambahkan butir-butir key takeaways pada sebuah agenda, **agar** hasil forum terdokumentasi terstruktur, bukan hanya notulensi panjang.

**Acceptance Criteria:**
- [ ] Pada halaman detail agenda, saya dapat menambah, menyunting, dan mengurutkan butir takeaway (teks ringkas per butir).
- [ ] Tiap butir dapat ditandai sebagai: `Informasi`, `Keputusan`, atau `Kandidat Arahan`.
- [ ] Butir bertanda `Kandidat Arahan` menampilkan tombol "Jadikan Arahan" (lihat US-B3).

### US-B3 — Mengubah takeaway menjadi arahan **[MVP]**
**Sebagai** Sekretariat Pimpinan, **saya ingin** membuat arahan langsung dari butir takeaway, **agar** arahan lisan dari forum otomatis membawa konteks agendanya.

**Acceptance Criteria:**
- [ ] Tombol "Jadikan Arahan" membuka form US-A2 dengan isi arahan, forum/konteks, dan tanggal terisi otomatis dari agenda dan butir takeaway.
- [ ] Arahan yang lahir dari takeaway menyimpan tautan dua arah: detail arahan menampilkan agenda asalnya; detail agenda menampilkan daftar arahan yang lahir darinya beserta status terkininya.
- [ ] Satu takeaway hanya dapat menjadi satu arahan; setelah dikonversi, tombolnya berubah menjadi tautan ke arahan tersebut.

### US-B4 — Melihat rekap agenda per periode **[Lanjutan]**
**Sebagai** Pimpinan atau Koordinator Sistem, **saya ingin** melihat rekap agenda per minggu/bulan berikut jumlah arahan yang dihasilkan tiap agenda, **agar** produktivitas forum terpantau.

**Acceptance Criteria:**
- [ ] Halaman rekap menampilkan daftar agenda per rentang tanggal terpilih dengan hitung: jumlah takeaway, jumlah arahan lahir, berapa yang selesai.
- [ ] Rekap dapat diunduh (ikut mekanisme ekspor US-F4).

---

## EPIK C — Disposisi & Kepemilikan Berlapis

> Menjawab P2 dan K5. Setiap arahan jelas: unit eselon 1 mana yang bertanggung jawab, siapa PIC-nya, siapa koordinatornya, dan (bila perlu) siapa pemantau sentralnya.

### US-C1 — Disposisi arahan ke unit eselon 1 **[MVP]**
**Sebagai** Koordinator Sistem, **saya ingin** menetapkan unit eselon 1 penanggung jawab untuk arahan berstatus `Belum Ditugaskan`, **agar** setiap arahan punya pemilik yang jelas.

**Acceptance Criteria:**
- [ ] Pilihan unit terbatas pada 7 unit di §1.3 (6 unit utama + Pusdatin); satu arahan memiliki tepat satu unit utama.
- [ ] Unit pendukung (multi-pilih) dapat ditambahkan untuk arahan lintas unit; unit pendukung mendapat akses baca + tanggapan, tanpa kewajiban klaim selesai.
- [ ] Saat disposisi, Koordinator Sistem dapat menetapkan deadline (wajib) dan catatan disposisi.
- [ ] Setelah disposisi, status menjadi `Belum Mulai`, Koordinator Unit terkait menerima notifikasi, dan disposisi tercatat di riwayat.
- [ ] Opsional: kolom "unit kerja pelaksana" (label eselon 2, teks/pilihan) dapat diisi oleh unit — tidak memengaruhi hak akses.

### US-C2 — Menetapkan PIC pelaksana **[MVP]**
**Sebagai** Koordinator Unit, **saya ingin** menunjuk PIC pelaksana dari anggota unit saya untuk tiap arahan yang didisposisikan ke unit saya, **agar** pekerjaan tidak berhenti di level unit.

**Acceptance Criteria:**
- [ ] Pilihan PIC terbatas pada pengguna aktif yang terdaftar pada unit saya.
- [ ] PIC dapat diganti; pergantian tercatat di riwayat dengan alasan.
- [ ] PIC yang ditunjuk menerima notifikasi dan arahan muncul di daftar "ditugaskan pada saya".
- [ ] Arahan tanpa PIC lebih dari N hari kerja (N dapat diatur, bawaan 3) tampil sebagai peringatan pada dashboard unit dan dashboard Koordinator Sistem.

### US-C3 — Menugaskan Pemantau Arahan **[Lanjutan]** *(padanan MoD — K5)*
**Sebagai** Koordinator Sistem, **saya ingin** menugaskan seorang pemantau administratif pada arahan tertentu (biasanya arahan prioritas), **agar** ada mata kedua lintas unit yang menjaga arahan penting tidak macet.

**Acceptance Criteria:**
- [ ] Pemantau dapat berasal dari unit mana pun; mendapat akses baca penuh + tanggapan pada arahan tersebut, tanpa hak mengubah status.
- [ ] Arahan yang saya pantau tampil pada daftar khusus "Pantauan saya".
- [ ] Pemantau menerima notifikasi yang sama dengan PIC untuk arahan tersebut (perubahan status, mendekati deadline, pengembalian verifikasi).

### US-C4 — Mengajukan pemindahan unit (realihan) dengan isi usulan **[MVP]** *(dari K2 — memperbaiki kelemahan prototipe)*
**Sebagai** Koordinator Unit, **saya ingin** mengajukan pemindahan arahan yang bukan cakupan unit saya, dengan menyebut unit tujuan dan alasan, **agar** pemberi persetujuan punya bahan untuk memutuskan.

**Acceptance Criteria:**
- [ ] Form pengajuan mewajibkan: unit tujuan yang diusulkan (pilihan eselon 1) dan alasan (teks, wajib).
- [ ] Setelah diajukan, status arahan menjadi `Menunggu Keputusan` dan pekerjaan tidak dapat diubah sampai diputuskan.
- [ ] Koordinator Sistem melihat antrean persetujuan berisi: arahan, unit asal, unit tujuan usulan, alasan — lalu dapat menyetujui (arahan berpindah unit, PIC dikosongkan, Koordinator Unit tujuan dinotifikasi) atau menolak dengan catatan (arahan kembali ke status sebelumnya).
- [ ] Seluruh keputusan tercatat di riwayat dengan siapa-kapan-alasan.

---

## EPIK D — Monitoring, Status & Siklus Penyelesaian

> Menjawab P3 — inti dari "tracker" yang belum ada. Status berubah hanya lewat aturan; penyelesaian selalu berbasis bukti dan verifikasi.

### US-D1 — Siklus status baku **[MVP]**
**Sebagai** sistem, **saya ingin** memberlakukan siklus status baku, **agar** tidak ada perubahan status liar seperti di spreadsheet (K7: "mohon TIDAK mengganti kolom Status").

**Acceptance Criteria:**
- [ ] Status yang berlaku: `Menunggu Konfirmasi` → `Menunggu Kurasi` → `Belum Ditugaskan` → `Belum Mulai` → `Sedang Berjalan` → `Menunggu Verifikasi` → `Selesai`; status khusus: `Terlambat` (turunan otomatis), `Menunggu Keputusan`, `Dibatalkan`.
- [ ] Transisi hanya bisa dilakukan peran yang berizin; transisi tidak sah ditolak sistem dengan pesan yang menjelaskan siapa yang berwenang.
- [ ] `Terlambat` dihitung otomatis: deadline lewat dan status belum `Selesai`/`Dibatalkan`; sistem tidak mengubah status dasar, hanya menampilkan penanda terlambat di atasnya (arahan `Sedang Berjalan` yang lewat deadline tampil "Sedang Berjalan · Terlambat").
- [ ] Setiap perubahan status tercatat di riwayat: siapa, kapan, dari status apa ke apa.

### US-D2 — Menulis perkembangan (tanggapan) **[MVP]**
**Sebagai** PIC Pelaksana, **saya ingin** menulis perkembangan pekerjaan pada arahan, **agar** kemajuan terdokumentasi kronologis tanpa saling timpa (K7: masalah Alt+Enter menumpuk tanggapan di satu sel).

**Acceptance Criteria:**
- [ ] Tanggapan tersimpan sebagai entri terpisah dengan penulis dan waktu server (bukan diketik manual); tanggapan lama tidak dapat ditimpa oleh penulis lain.
- [ ] Tanggapan dapat melampirkan berkas (ikut mekanisme unggah US-D3).
- [ ] Penulis dapat menyunting tanggapannya sendiri maks. 15 menit setelah kirim; setelahnya terkunci (koreksi lewat tanggapan baru).
- [ ] Unit pendukung dan Pemantau Arahan juga dapat menulis tanggapan pada arahan yang menjadi aksesnya.

### US-D3 — Mengunggah bukti pendukung **[MVP]**
**Sebagai** PIC Pelaksana, **saya ingin** mengunggah bukti pelaksanaan (dokumen, foto, tautan), **agar** klaim penyelesaian selalu berdasar.

**Acceptance Criteria:**
- [ ] Unggah berkas nyata: PDF/DOCX/XLSX/PNG/JPG hingga 10 MB per berkas; tautan URL juga diterima sebagai bukti.
- [ ] Setiap bukti memuat nama berkas, pengunggah, waktu, dan catatan singkat.
- [ ] Bukti tidak dapat dihapus setelah arahan berstatus `Menunggu Verifikasi` atau `Selesai`; sebelum itu, penghapusan tercatat di riwayat.
- [ ] Pratinjau/unduh bukti tersedia bagi semua yang berhak membaca arahan tersebut.

### US-D4 — Mengajukan penyelesaian (klaim selesai) **[MVP]**
**Sebagai** PIC Pelaksana atau Koordinator Unit, **saya ingin** mengajukan penyelesaian arahan, **agar** status `Selesai` selalu melalui pemeriksaan — menghindari kasus "Marked as DONE di sistem padahal kendala" seperti temuan sheet Final Kendala Kemenkes.

**Acceptance Criteria:**
- [ ] Pengajuan hanya bisa bila minimal satu bukti terlampir; tanpa bukti, tombol nonaktif dengan keterangan alasannya.
- [ ] Form pengajuan memuat ringkasan hasil (teks wajib) — apa yang telah dikerjakan dan hasilnya.
- [ ] Setelah diajukan, status menjadi `Menunggu Verifikasi`; PIC tidak dapat mengubah status lagi sampai diputuskan.
- [ ] Verifikator (Koordinator Sistem) dapat: menyetujui → `Selesai` (dengan tanggal selesai tercatat), atau mengembalikan → `Sedang Berjalan` dengan catatan perbaikan wajib; PIC menerima notifikasi keduanya.

### US-D5 — Mengajukan perubahan deadline dengan isi usulan **[MVP]** *(dari K2)*
**Sebagai** Koordinator Unit, **saya ingin** mengajukan deadline baru dengan tanggal usulan dan alasan, **agar** perubahan deadline terkontrol dan pemberi persetujuan punya bahan menilai.

**Acceptance Criteria:**
- [ ] Form mewajibkan: tanggal deadline usulan (harus lebih besar dari hari ini) dan alasan (teks wajib).
- [ ] Antrean persetujuan Koordinator Sistem menampilkan: deadline lama, deadline usulan, alasan, dan berapa kali arahan ini sudah pernah diperpanjang.
- [ ] Disetujui → deadline berubah dan tercatat di riwayat; ditolak → deadline tetap, alasan penolakan terkirim ke pengusul.
- [ ] Riwayat perpanjangan deadline (berapa kali, dari-ke) tampil di detail arahan.

### US-D6 — Mencatat kendala keterlambatan terstruktur **[MVP]** *(dari K3)*
**Sebagai** Koordinator Unit, **saya ingin** mencatat alasan keterlambatan dengan kategori baku saat arahan unit saya terlambat, **agar** pimpinan melihat pola akar masalah, bukan sekadar daftar merah.

**Acceptance Criteria:**
- [ ] Kategori kendala baku: `Kendala unit/direktorat`, `Skala prioritas`, `Kendala sumber daya`, `Menunggu pihak eksternal`, `Lainnya` (dengan keterangan wajib bila Lainnya).
- [ ] Arahan yang menyandang penanda `Terlambat` lebih dari N hari (bawaan 5 hari kerja) mewajibkan pengisian kendala sebelum Koordinator Unit dapat mengubah apa pun pada arahan itu.
- [ ] Kendala dapat diperbarui bila situasi berubah; setiap perubahan tercatat.
- [ ] Dashboard menampilkan rekap arahan terlambat per kategori kendala per unit (lihat US-F1/F2).

### US-D7 — Membatalkan arahan **[MVP]**
**Sebagai** Koordinator Sistem, **saya ingin** membatalkan arahan yang tidak lagi relevan dengan alasan wajib, **agar** register tetap bersih tanpa menghapus jejak.

**Acceptance Criteria:**
- [ ] Pembatalan mewajibkan alasan; arahan berstatus `Dibatalkan` tetap dapat dibaca berikut seluruh riwayatnya, dan dikecualikan dari hitungan kinerja.
- [ ] Arahan `Selesai` tidak dapat dibatalkan.

### US-D8 — Notifikasi & pengingat deadline **[MVP]**
**Sebagai** PIC/Koordinator Unit, **saya ingin** menerima notifikasi peristiwa penting dan pengingat menjelang deadline, **agar** tidak ada arahan lolos dari pantauan.

**Acceptance Criteria:**
- [ ] Notifikasi dalam aplikasi terbit untuk: disposisi baru, penunjukan PIC, pengembalian verifikasi, keputusan realihan/deadline, arahan memasuki H-3 dan H-1 deadline, dan arahan menjadi terlambat.
- [ ] Notifikasi menandai terbaca/belum dan menaut langsung ke arahan terkait.
- [ ] **[Lanjutan]** Ringkasan harian/mingguan via email atau WhatsApp gateway (mengikuti kebijakan kanal BGN saat implementasi).

---

## EPIK E — Prioritisasi Strategis

> Dari K1 dan K4 — pembeda utama tracker Kemenkes yang belum dimiliki prototipe. Prioritas bukan tag statis, melainkan hasil penilaian yang bisa dipertanggungjawabkan.

### US-E1 — Menilai effort & impact arahan **[Lanjutan]**
**Sebagai** Koordinator Sistem, **saya ingin** memberi skor upaya (effort) dan dampak (impact) pada arahan, **agar** klasifikasi prioritas dihitung konsisten, bukan ditebak.

**Acceptance Criteria:**
- [ ] Skor effort dan impact masing-masing skala 1–5 (boleh desimal satu digit), dengan rubrik singkat tampil di form (apa arti 1, 3, 5).
- [ ] Sistem menghitung klasifikasi otomatis dari kombinasi skor: `Inisiatif Strategis` (impact tinggi, effort tinggi), `Hasil Cepat / Quick Wins` (impact tinggi, effort rendah), `Buah Ranum / Low Hanging` (impact rendah, effort rendah), `Pertimbangkan Ulang` (impact rendah, effort tinggi); ambang batas dapat diatur Admin.
- [ ] Skor dapat direvisi dengan alasan; revisi tercatat di riwayat.
- [ ] Arahan tanpa skor tampil sebagai "Belum dinilai" dan dapat difilter.

### US-E2 — Menandai kesesuaian dengan prioritas Badan **[MVP]** *(dari K4)*
**Sebagai** Koordinator Sistem, **saya ingin** menandai tiap arahan `Sesuai Prioritas Badan` / `Di Luar Prioritas`, terpisah dari level prioritasnya, **agar** pimpinan bisa melihat arahan besar yang ternyata di luar arah strategis resmi.

**Acceptance Criteria:**
- [ ] Field kesesuaian berdiri sendiri di samping level prioritas (`Prioritas Nasional` / `Prioritas Badan` / `Reguler`), dan keduanya dapat diubah oleh peran berizin melalui form (tidak lagi di-hardcode saat pembuatan).
- [ ] Daftar arahan dapat difilter silang: mis. level `Prioritas Nasional` yang `Di Luar Prioritas`.
- [ ] Perubahan nilai tercatat di riwayat.

### US-E3 — Papan prioritas (matriks effort × impact) **[Lanjutan]**
**Sebagai** Pimpinan/Koordinator Sistem, **saya ingin** melihat arahan tersebar pada matriks effort × impact per kuadran, **agar** keputusan "kerjakan mana dulu" berbasis gambar utuh — padanan sheet "Final Prioritas 2025-2029" Kemenkes.

**Acceptance Criteria:**
- [ ] Matriks 2×2 menampilkan arahan sebagai titik/kartu pada kuadrannya; klik membuka detail.
- [ ] Dapat difilter per unit, per status, per program.
- [ ] Daftar ranking prioritas (urutan numerik) dapat diekspor.

---

## EPIK F — Dashboard, Laporan & Audit

> Menjawab P3 di level pimpinan: bukan hanya tiap arahan terlacak, tetapi keseluruhan capaian terbaca sekali pandang.

### US-F1 — Dashboard eksekutif **[MVP]**
**Sebagai** Pimpinan (Kaba/Waka), **saya ingin** dashboard lintas unit, **agar** saya tahu capaian arahan saya tanpa meminta laporan manual.

**Acceptance Criteria:**
- [ ] Menampilkan: total arahan aktif, komposisi status (selesai/berjalan/belum mulai/terlambat/menunggu keputusan), tren penyelesaian per bulan, beban & persentase selesai per unit eselon 1, arahan terlambat per kategori kendala, dan daftar arahan prioritas yang mendekati/melewati deadline.
- [ ] Semua angka dihitung dari data nyata dan setiap kartu dapat diklik menuju daftar arahan yang membentuk angka itu (drill-down).
- [ ] Angka dashboard konsisten dengan hasil daftar + filter yang sama (tidak ada dua versi kebenaran).

### US-F2 — Dashboard unit **[MVP]**
**Sebagai** Koordinator Unit, **saya ingin** dashboard khusus unit saya, **agar** saya memantau beban tim: arahan tanpa PIC, mendekati deadline, terlambat, menunggu verifikasi, dan kinerja per PIC.

**Acceptance Criteria:**
- [ ] Cakupan data terbatas unit sendiri (mengikuti RBAC).
- [ ] Menampilkan daftar kerja hari ini: perlu PIC, perlu tanggapan kendala, dikembalikan verifikator, deadline H-3.
- [ ] Kalender deadline unit tetap tersedia (fitur prototipe dipertahankan).

### US-F3 — Riwayat lengkap per arahan **[MVP]**
**Sebagai** pembaca arahan, **saya ingin** melihat kronologi lengkap satu arahan, **agar** konteks tidak hilang saat berpindah tangan.

**Acceptance Criteria:**
- [ ] Riwayat memuat semua peristiwa: pencatatan, kurasi, disposisi, penunjukan PIC, perubahan status, pengajuan & keputusan (deadline/realihan/penyelesaian), suntingan redaksi, kendala, pembatalan — masing-masing dengan pelaku dan waktu server.
- [ ] Riwayat tidak dapat disunting atau dihapus oleh siapa pun dari antarmuka.

### US-F4 — Ekspor laporan nyata **[MVP]**
**Sebagai** pengguna berizin `laporan.ekspor`, **saya ingin** mengunduh laporan arahan dalam berkas nyata, **agar** kebutuhan pelaporan formal tetap terlayani.

**Acceptance Criteria:**
- [ ] Ekspor menghasilkan berkas XLSX (dan PDF untuk ringkasan) yang benar-benar terunduh — bukan simulasi.
- [ ] Isi ekspor mengikuti filter aktif dan hak akses pengekspor (tidak pernah memuat baris di luar haknya).
- [ ] Kolom ekspor minimal: nomor, isi arahan, sumber, agenda asal, unit, PIC, prioritas, klasifikasi, kesesuaian, deadline, status, kendala, tanggal selesai.
- [ ] Setiap ekspor tercatat di log audit (siapa, kapan, filter apa).

### US-F5 — Log audit sistem **[MVP]**
**Sebagai** Pengawas (Irtama) atau Admin, **saya ingin** membaca log audit lintas sistem, **agar** setiap perubahan dapat diperiksa — jaminan yang mustahil di spreadsheet (K7).

**Acceptance Criteria:**
- [ ] Log mencatat: autentikasi (masuk/gagal), semua operasi tulis pada arahan/agenda/master data, dan ekspor laporan — dengan pelaku, waktu server, objek, dan nilai sebelum-sesudah untuk perubahan penting.
- [ ] Halaman log dapat difilter per pengguna, per objek, per rentang waktu; hanya untuk peran berizin `audit.read`.
- [ ] Log bersifat tambah-saja (append-only); tidak ada antarmuka untuk mengubah/menghapusnya.

---

## EPIK G — Administrasi, Peran & Keamanan Akses

### US-G1 — Kelola pengguna **[MVP]**
**Sebagai** Admin (Pusdatin), **saya ingin** menambah, menonaktifkan, dan menyunting pengguna berikut unit dan perannya, **agar** akses selalu mencerminkan organisasi terkini.

**Acceptance Criteria:**
- [ ] CRUD pengguna: nama, email, unit eselon 1, peran, status aktif/nonaktif.
- [ ] Pengguna nonaktif tidak dapat masuk; riwayat dan tanggapan lamanya tetap utuh atas namanya.
- [ ] Pengguna tidak dapat dihapus permanen bila pernah tercatat di riwayat arahan (hanya nonaktif).

### US-G2 — Kelola struktur unit **[MVP]**
**Sebagai** Admin, **saya ingin** mengelola daftar unit eselon 1 dan label unit kerja pelaksana di bawahnya, **agar** struktur sistem mengikuti bagan organisasi resmi.

**Acceptance Criteria:**
- [ ] Unit eselon 1 dapat disunting nama/singkatannya; penambahan/penonaktifan unit hanya oleh Admin dengan konfirmasi.
- [ ] Unit yang masih memegang arahan aktif tidak dapat dinonaktifkan sebelum arahannya direalihkan.
- [ ] Daftar label unit kerja pelaksana (eselon 2) per unit dapat dikelola sebagai referensi isian (bukan target disposisi).

### US-G3 — Kelola peran & hak akses **[MVP]**
**Sebagai** Admin, **saya ingin** mengatur peran dan izin per peran dari matriks izin, **agar** aturan "siapa boleh apa" dijaga sistem, bukan imbauan (K7).

**Acceptance Criteria:**
- [ ] Matriks izin (grup: Arahan, Agenda, Tanggapan & Bukti, Prioritisasi, Beranda, Data & Pengaturan, Laporan & Riwayat) dapat dicentang per peran; perubahan berlaku tanpa deploy ulang.
- [ ] Setiap perubahan izin tercatat di log audit dengan sebelum-sesudah.
- [ ] Sistem menolak di sisi server setiap aksi yang izinnya tidak dimiliki (bukan hanya menyembunyikan tombol).

### US-G4 — Autentikasi **[MVP]**
**Sebagai** pengguna, **saya ingin** masuk dengan akun pribadi, **agar** semua jejak atas nama saya sahih.

**Acceptance Criteria:**
- [ ] Masuk dengan email + kata sandi (kebijakan minimal: 8 karakter, kombinasi); sesi kedaluwarsa setelah tidak aktif (bawaan 8 jam).
- [ ] Gagal masuk berulang (5×) menahan akun sementara dan tercatat di log audit.
- [ ] Arsitektur autentikasi memisahkan lapisan identitas sehingga siap ditukar ke SSO BGN saat migrasi (di luar cakupan sekarang, tapi tidak boleh terhalang desain).

### US-G5 — Berbagi tampilan tanpa saling ganggu **[MVP]** *(anti-pola K7)*
**Sebagai** pengguna, **saya ingin** preferensi tampilan (filter tersimpan, urutan kolom) bersifat pribadi, **agar** tidak ada lagi insiden "filter terhapus orang lain" seperti era spreadsheet.

**Acceptance Criteria:**
- [ ] Filter yang saya simpan hanya terlihat dan berlaku bagi saya.
- [ ] Tidak ada mekanisme apa pun bagi satu pengguna untuk mengubah tampilan pengguna lain.

### US-G6 — Akses baca Dewan Pengarah **[Lanjutan]**
**Sebagai** Admin, **saya ingin** dapat memberikan akun baca-saja dashboard eksekutif kepada Dewan Pengarah bila diminta, **agar** fungsi pengarahan terlayani tanpa membuka akses operasional.

**Acceptance Criteria:**
- [ ] Peran `Pengarah (baca-saja)` hanya memiliki `dashboard.eksekutif` + `arahan.read.all` tanpa satu pun izin tulis.
- [ ] Percobaan aksi tulis oleh peran ini ditolak server dan tercatat di log.

---

## EPIK H — Kebutuhan Non-Fungsional

### US-H1 — Kinerja & skala **[MVP]**
- [ ] Daftar arahan dengan 5.000+ baris (belajar dari volume Kemenkes: 1.400+ baris/sheet) termuat < 2 detik pada koneksi normal; pencarian & filter dieksekusi di server, bukan memuat semua data ke browser.
- [ ] Dashboard termuat < 3 detik dengan agregasi di sisi server.

### US-H2 — Keandalan data **[MVP]**
- [ ] Tidak ada nilai rusak yang mungkin tampil ke pengguna (padanan `#REF!` yang memenuhi sheet Kemenkes): semua relasi dijaga foreign key; penghapusan referensi yang masih dipakai ditolak.
- [ ] Basis data dicadangkan otomatis harian; prosedur pulih teruji minimal sekali sebelum demo akhir.

### US-H3 — Kompatibilitas & akses **[MVP]**
- [ ] Berjalan baik di Chrome/Edge/Firefox versi 2 tahun terakhir; tampilan responsif untuk tablet dan ponsel (pemantauan lapangan).
- [ ] Seluruh antarmuka berbahasa Indonesia; format tanggal `DD/MM/YYYY`; zona waktu WIB sebagai acuan pencatatan.

### US-H4 — Keamanan dasar **[MVP]**
- [ ] Seluruh lalu lintas melalui HTTPS; kata sandi disimpan ter-hash (bcrypt/argon2); berkas unggahan dipindai tipe & ukurannya di server.
- [ ] Semua endpoint memeriksa izin di server (selaras US-G3); data uji tidak memakai data pribadi sungguhan.

### US-H5 — Kesiapan migrasi BGN **[Lanjutan — batasan desain sejak MVP]**
- [ ] Konfigurasi lingkungan (URL basis data, kredensial, kanal notifikasi) sepenuhnya lewat variabel lingkungan — tanpa nilai tertanam di kode.
- [ ] Dokumentasi deployment + skema basis data + katalog API tersedia sebagai bagian paket serah terima, sehingga tim infrastruktur BGN dapat memasang tanpa pendampingan penuh.

---

## 3. Pemetaan ke Rencana Kerja 1 Bulan

| Fase | US yang dikerjakan |
|---|---|
| **Fase 1** — Proses bisnis & arsitektur (H1–5) | Validasi seluruh dokumen ini dengan unit + Kaba; keputusan ambang/rubrik E1; skema data mencakup SEMUA epik (termasuk Lanjutan) agar tak ada migrasi skema susulan |
| **Fase 2** — Demo prototipe ke Kaba (H6) | Demo alur A→C→D di prototipe; konfirmasi prioritas MVP vs Lanjutan |
| **Fase 3A** — Fondasi (H7–12) | G1–G5, A1–A5, C1–C2, D1–D5, D7 |
| **Fase 3B** — Dashboard & integrasi (H13–18) | B1–B3, D6, D8, E2, F1–F5 |
| **Fase 4** — UAT & demo akhir (H19–22) | Pengujian seluruh AC bertanda [MVP]; AC menjadi skenario UAT langsung |
| **Pasca-MVP** | B4, C3, E1, E3, G6, H5 penuh, notifikasi email/WA |

> **Catatan risiko:** Epik B (Rekap Agenda) adalah modul baru di luar cakupan prototipe awal — sudah diperhitungkan dalam diskusi "2 vs 3 developer". Bila tim tetap 2 developer, Epik B minimum yang masuk MVP adalah B1–B3 tanpa penyempurnaan tampilan; B4 bergeser pasca-MVP.

---

## 4. Definisi Selesai (Definition of Done) per US

Sebuah US dinyatakan selesai bila:
1. Semua butir AC-nya lulus diuji oleh BA/QA (bukan oleh developer yang mengerjakannya).
2. Pemeriksaan izin berjalan di sisi server, bukan hanya penyembunyian tombol.
3. Peristiwa tulis yang relevan muncul di log audit.
4. Tidak menurunkan kinerja di bawah ambang US-H1.
5. Teruji di Chrome + satu browser lain, desktop + lebar layar ponsel.
