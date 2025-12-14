# Implementation Plan

- [x] 1. Update Telegram Utility dengan Inline Keyboard Support





  - [x] 1.1 Tambahkan fungsi `sendTelegramMessageWithButton` di `netlify/functions/utils/telegram.js`


    - Fungsi menerima message, chatId, dan inlineKeyboard array
    - Mengirim request ke Telegram API dengan reply_markup
    - Return boolean success status
    - _Requirements: 1.3_

  - [x] 1.2 Tambahkan fungsi `buildWhatsAppLink` untuk membuat deep link WhatsApp

    - Menerima phoneNumber, clientName, projectName, amount
    - Membuat URL dengan format `https://wa.me/{phone}?text={encodedMessage}`
    - Handle nomor dengan format berbeda (08xx, 628xx, +628xx)
    - _Requirements: 2.1, 2.2_
  - [ ]* 1.3 Write property test untuk WhatsApp link builder
    - **Property 3: WhatsApp Button Contains Valid URL and Template**
    - **Validates: Requirements 1.3, 2.2**

- [x] 2. Update Scheduled Reminders untuk Admin Notification






  - [x] 2.1 Modifikasi `netlify/functions/scheduled-reminders.js` untuk kirim ke admin

    - Gunakan Admin Telegram ID dari environment variable `ADMIN_TELEGRAM_ID`
    - Gunakan Bot Token dari environment variable `TELEGRAM_BOT_TOKEN`
    - Build message dengan format informatif (emoji, struktur jelas)
    - Format nominal dengan format Indonesia (Rp, separator ribuan)
    - _Requirements: 1.1, 1.2, 4.1, 4.2, 4.3_

  - [x] 2.2 Tambahkan inline keyboard dengan tombol WhatsApp
    - Gunakan `buildWhatsAppLink` untuk generate URL
    - Handle case nomor WA tidak valid (kirim tanpa button)
    - _Requirements: 1.3, 2.3_
  - [ ]* 2.3 Write property test untuk message formatting
    - **Property 2: Message Contains All Required Information**
    - **Validates: Requirements 1.2, 4.1, 4.2, 4.3**

- [x] 3. Implement Duplicate Prevention Logic






  - [x] 3.1 Pastikan logic pengecekan `last_reminder_sent` berfungsi dengan benar

    - Cek apakah timestamp dalam 23 jam terakhir
    - Skip jika sudah kirim, kirim jika belum
    - Update timestamp setelah berhasil kirim
    - _Requirements: 3.1, 3.2, 3.3_
  - [ ]* 3.2 Write property test untuk duplicate prevention
    - **Property 4: Duplicate Prevention Within 23 Hours**
    - **Validates: Requirements 3.1, 3.3**


- [x] 4. Checkpoint - Pastikan semua tests passing




  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Update Environment Variables






  - [x] 5.1 Dokumentasikan environment variables yang diperlukan

    - TELEGRAM_BOT_TOKEN (atau hardcode sesuai requirement)
    - ADMIN_TELEGRAM_ID (atau hardcode sesuai requirement)
    - _Requirements: 1.1_

- [ ]* 6. Write Integration Test (Optional)
  - [ ]* 6.1 Test end-to-end flow dengan mock Telegram API
    - Mock fetch untuk Telegram API
    - Verify payload yang dikirim sesuai format
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 7. Final Checkpoint - Pastikan semua tests passing





  - Ensure all tests pass, ask the user if questions arise.

