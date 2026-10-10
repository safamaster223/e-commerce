Oke, saya udah baca panduannya sampai habis. Ini bedah lengkapnya:

Inti panduannya (penting!)

PPL itu bukan lomba bikin aplikasi paling canggih — yang dinilai itu cara tim mengelola proyek: backlog rapi, sprint jalan, board + GitHub + Discord saling terhubung otomatis, dan jejak kolaborasinya kelihatan. Durasi: 7 minggu kerja (minggu 6–13, minggu 8 = UTS/Monev), dibagi 4 sprint. Nilai individu bisa naik-turun berdasarkan jejak kontribusi + peer assessment, dan dosen boleh nanya ke anggota mana pun — jadi semua wajib paham keseluruhan proyek, bukan cuma bagian sendiri.

Isi panduan step-by-step
Tujuan — bisa bikin backlog (user story), jalanin seremoni Scrum, pakai board + GitHub + Discord yang terintegrasi, nulis laporan requirement standar IEEE, bikin video branding.
Peran — 6–7 orang; Product Owner dan Scrum Master wajib ada dan nggak boleh dirangkap orang yang sama. Sisanya: UI/UX, Backend, Frontend, QA, Dokumentasi & Branding.
Fitur minimal — kelola produk (admin), katalog + keranjang + checkout (pembeli), API pembayaran sandbox (Midtrans/Xendit/Duitku, cukup sampai status jadi "dibayar"), API ongkir sandbox (RajaOngkir/Biteship/dsb, cukup hitung ongkir saat checkout), daftar pesanan + status. API key wajib di .env, haram di-commit.
Komponen komputasional — pilih 1: moving average, rule-based (misal: stok < 5 → peringatan restock), atau scoring (5 produk terlaris).
3 integrasi wajib — I-1: GitHub → Discord (ini yang kemarin udah kamu pasang ✅), I-2: Board ↔ GitHub (kode PPL-12 dipakai di kartu, branch, commit, PR), I-3: Board → Discord (kartu pindah → notif otomatis).
Jadwal sprint — Sprint 0 (mgg 6): setup tools + integrasi + backlog awal. Sprint 1 (mgg 7): fitur dasar (produk, katalog, keranjang) + draf laporan bab 1–2. Mgg 8: Monev UTS (demo integrasi live ±5 menit!). Sprint 2 (mgg 9–10): checkout + payment API. Sprint 3 (mgg 11–12): API ongkir + komputasional + testing. Sprint 4 (mgg 13): bugfix + laporan final + video.
Luaran — laporan requirement IEEE (.docx + .pdf) + video iklan 1–2 menit di YouTube.
Penilaian — UTS: kesiapan tools 25%, perencanaan Agile 25%, sprint 0–1 20%, analisis kebutuhan 20%, presentasi 10%. UAS: mirip + fungsionalitas aplikasi 15%.
Pembagian peran buat 6 orang (rekomendasi saya)
Orang	Peran	Tugas tiap fase
1	Product Owner (+ System Analyst)	Sprint 0: gali kebutuhan UMKM camilan, susun & prioritaskan backlog (user story + kode PPL-01 dst). Tiap sprint: review & terima hasil. Akhir: pimpin laporan IEEE
2	Scrum Master (+ QA/Tester)	Sprint 0: setup board, kanal, repo + 3 integrasi. Tiap sprint: pimpin planning, stand-up mingguan (tertulis di #diskusi), review, retro; jaga board tetap mutakhir; uji fitur sesuai DoD, catat bug jadi kartu
3	UI/UX Designer (+ Branding)	Sprint 0–1: wireframe/mockup (katalog, checkout, admin). Jaga konsistensi tampilan. Sprint 4: produksi video iklan 1–2 menit
4	Backend Dev 1 (PHP+MySQL)	Sprint 1: database, auth, CRUD produk. Sprint 2–3: pesanan + komponen komputasional
5	Backend Dev 2 (Integrator)	Sprint 2: integrasi Midtrans sandbox. Sprint 3: integrasi RajaOngkir sandbox
6	Frontend Dev (Vue)	Sprint 1: katalog + keranjang. Sprint 2: checkout + UI pembayaran. Sprint 3: UI ongkir + status pesanan

Catatan: dokumentasi sprint (planning/review/retro, maks 1 halaman per sprint) dikerjain bareng — tiap akhir sprint SM ngumpulin dari semua.

Implikasi tema kalian (camilan + sistem PO)

PO ngaruh ke data model & backlog. User story tambahan yang perlu masuk backlog:

Sebagai pembeli, saya ingin tahu produk mana yang ready-stock vs PO, agar tahu estimasi kirimnya
Sebagai pembeli, saya ingin ikut batch PO (dengan kuota & tanggal tutup PO yang jelas)
Sebagai admin, saya ingin buka/tutup batch PO dan lihat rekap pesanan per batch
Komponen komputasional yang paling cocok: rule-based (stok < X → "segera restock", atau diskon otomatis) — paling gampang dijelaskan rumusnya di laporan
PRIORITY JOB SEKARANG (Sprint 0 / minggu 6)

Urut dari paling urgent:

⬜ Undang dosen ke repo, board, dan Discord — deadline akhir minggu 6, ini syarat mutlak
⬜ Beresin I-3 (Board → Discord) — ini satu-satunya integrasi yang tricky di stack kalian, karena GitHub Projects nggak punya integrasi native ke Discord. Opsi: Zapier/Make (gratis) atau GitHub Action custom. I-1 ✅ udah, I-2 semi-otomatis ✅
⬜ Product backlog: tulis user story format "Sebagai [peran], saya ingin [butuh], agar [manfaat]" + kode PPL-01, PPL-02... + prioritas + kriteria penerimaan 2–3 butir. Sepakati Definition of Done (misal: merge via PR yang di-review + lolos uji QA)
⬜ Setup repo: struktur PHP + MySQL + Vue, .env + .gitignore (API key jangan ke-commit!), README (deskripsi, cara jalanin, daftar anggota), branch protection (PR wajib review)
⬜ Tentukan UMKM/studi kasus + gali kebutuhan (daftar camilan, alur PO, harga, dsb) — bahan buat laporan bab 1–2
⬜ Stand-up pertama tertulis di #diskusi minggu ini (format: sudah/akan/kendala)

Satu peringatan keras dari panduan: jejak kolaborasi harus tersebar di minimal 5 dari 7 minggu — jangan numpuk di akhir, itu nurunin nilai.

Mau saya bantu yang mana dulu? Saran saya: draft product backlog (user story + kode PPL-nya) — itu fondasi semuanya dan bisa langsung ditempel ke board.