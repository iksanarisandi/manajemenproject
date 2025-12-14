# Requirements Document

## Introduction

Fitur ini menambahkan notifikasi Telegram ke admin ketika ada project yang sudah mencapai tanggal tagihan maintenance. Notifikasi akan dikirim ke admin dengan informasi lengkap tentang maintenance yang jatuh tempo, disertai tombol inline untuk langsung mengirim reminder ke WhatsApp klien. Sistem ini menggunakan bot Telegram yang sudah dikonfigurasi dan mengirim ke ID Telegram admin yang ditentukan.

## Glossary

- **Admin**: Pengguna dengan akses ke sistem yang menerima notifikasi Telegram (dikonfigurasi via ADMIN_TELEGRAM_ID env var)
- **Bot Telegram**: Bot yang mengirim notifikasi otomatis (dikonfigurasi via TELEGRAM_BOT_TOKEN env var)
- **Maintenance**: Record pembayaran bulanan untuk project yang aktif
- **Payment Date**: Tanggal jatuh tempo pembayaran maintenance setiap bulan (1-28)
- **Inline Keyboard**: Tombol interaktif dalam pesan Telegram yang dapat diklik
- **WhatsApp Deep Link**: URL yang membuka WhatsApp dengan pesan pre-filled ke nomor tertentu

## Requirements

### Requirement 1

**User Story:** Sebagai admin, saya ingin menerima notifikasi Telegram ketika ada maintenance yang jatuh tempo, sehingga saya dapat segera mengingatkan klien untuk membayar.

#### Acceptance Criteria

1. WHEN tanggal hari ini sama dengan payment_date maintenance yang aktif THEN the System SHALL mengirim notifikasi ke Telegram admin dengan informasi maintenance tersebut
2. WHEN notifikasi dikirim THEN the System SHALL menyertakan nama klien, nama project, nominal tagihan, dan nomor WhatsApp klien
3. WHEN notifikasi dikirim THEN the System SHALL menyertakan tombol inline "Kirim Reminder ke WA" yang mengarah ke WhatsApp klien
4. IF notifikasi gagal terkirim THEN the System SHALL mencatat error ke log untuk troubleshooting

### Requirement 2

**User Story:** Sebagai admin, saya ingin tombol WhatsApp dalam notifikasi sudah berisi pesan template, sehingga saya dapat langsung mengirim reminder tanpa mengetik ulang.

#### Acceptance Criteria

1. WHEN admin menekan tombol "Kirim Reminder ke WA" THEN the System SHALL membuka WhatsApp dengan nomor klien yang sudah terisi
2. WHEN WhatsApp terbuka THEN the System SHALL menampilkan pesan template yang berisi sapaan, nama project, dan nominal tagihan
3. WHEN nomor WhatsApp klien tidak valid THEN the System SHALL tetap menampilkan notifikasi tanpa tombol WhatsApp

### Requirement 3

**User Story:** Sebagai admin, saya ingin notifikasi tidak dikirim berulang di hari yang sama, sehingga saya tidak terganggu dengan notifikasi duplikat.

#### Acceptance Criteria

1. WHILE maintenance sudah menerima notifikasi dalam 23 jam terakhir THEN the System SHALL melewati pengiriman notifikasi untuk maintenance tersebut
2. WHEN scheduled function berjalan THEN the System SHALL memeriksa timestamp last_reminder_sent sebelum mengirim notifikasi
3. WHEN notifikasi berhasil terkirim THEN the System SHALL memperbarui timestamp last_reminder_sent di database

### Requirement 4

**User Story:** Sebagai admin, saya ingin format notifikasi yang jelas dan informatif, sehingga saya dapat dengan cepat memahami informasi tagihan.

#### Acceptance Criteria

1. WHEN notifikasi dikirim THEN the System SHALL memformat pesan dengan emoji dan struktur yang mudah dibaca
2. WHEN menampilkan nominal THEN the System SHALL memformat angka dengan format mata uang Indonesia (Rp)
3. WHEN menampilkan tanggal THEN the System SHALL menampilkan tanggal dalam format yang mudah dipahami

