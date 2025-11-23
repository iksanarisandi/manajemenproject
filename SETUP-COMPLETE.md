# 🚀 Complete Setup & Deploy (Solusi Masalah Migrate)

## ❌ Masalah yang Terjadi:
File `.env` Anda masih **kosong** - belum ada `DATABASE_URL` dan `JWT_SECRET`, makanya migrate error.

## ✅ Solusi Lengkap (5 Menit):

### 📋 **Langkah 1: Get DATABASE_URL dari Netlify**

#### Cara Otomatis:
```bash
# Double-click file ini:
get-env.bat
```
Script akan menampilkan semua environment variables dari Netlify.

#### Cara Manual:
1. Buka: https://app.netlify.com
2. Pilih site Anda
3. **Site settings** → **Environment variables**
4. Cari **DATABASE_URL**
5. Copy valuenya (format: `postgresql://...`)

---

### 📋 **Langkah 2: Setup .env File**

#### Cara Otomatis (Recommended):
```bash
# Double-click file ini:
setup-env.bat
```

Script akan:
1. Minta Anda paste DATABASE_URL
2. Auto-generate JWT_SECRET
3. Buat file .env lengkap
4. Tampilkan JWT_SECRET yang harus ditambahkan ke Netlify

#### Cara Manual:
Edit file `.env`:
```env
DATABASE_URL=postgresql://[paste dari Netlify]
JWT_SECRET=[generate dari randomkeygen.com]
TELEGRAM_BOT_TOKEN=8285823339:AAFf0YQF1WzkOW2mm2NzSzpEI67sJafn42o
TELEGRAM_CHAT_ID=
```

---

### 📋 **Langkah 3: Tambahkan JWT_SECRET ke Netlify**

**PENTING!** JWT_SECRET harus **sama** di local dan Netlify.

1. Buka: https://app.netlify.com
2. Site → **Site settings** → **Environment variables**
3. Click **Add a variable**
4. Key: `JWT_SECRET`
5. Value: [copy dari output setup-env.bat atau dari .env file Anda]
6. Click **Save**

---

### 📋 **Langkah 4: Migrate & Deploy**

#### Cara Otomatis (Super Mudah):
```bash
# Double-click file ini:
migrate-and-deploy.bat
```

Script akan otomatis:
1. ✅ Generate migrations
2. ✅ Run migrations ke database
3. ✅ Deploy ke production
4. ✅ Buka site Anda

#### Cara Manual:
```bash
npm run db:generate
npm run db:migrate
netlify deploy --prod
```

---

## 🎯 Quick Start (Copy-Paste):

### Untuk Windows (3 Langkah Aja):

**Step 1:** Get DATABASE_URL
```bash
get-env.bat
```
Copy DATABASE_URL yang ditampilkan.

**Step 2:** Setup environment
```bash
setup-env.bat
```
Paste DATABASE_URL, copy JWT_SECRET yang di-generate.

**Step 3:** Add JWT_SECRET to Netlify → Then:
```bash
migrate-and-deploy.bat
```

**DONE!** 🎉

---

## ❓ Troubleshooting

### Error: "DATABASE_URL is not defined"
**Solusi:**
- Pastikan sudah run `setup-env.bat`
- Check file `.env` ada dan terisi
- DATABASE_URL format: `postgresql://user:pass@host/db`

### Error: "Connection timeout"
**Solusi:**
- Check Neon database masih aktif di Netlify dashboard
- Verify DATABASE_URL benar
- Coba disable antivirus/firewall sementara

### Error: "Failed to generate migrations"
**Solusi:**
```bash
# Delete folder migrations dan coba lagi
rmdir /s /q db\migrations
npm run db:generate
```

### Error: "relation already exists"
**Solusi:**
Database sudah ada tables. Skip migrate, langsung deploy:
```bash
netlify deploy --prod
```

### Error: "Cannot find module 'dotenv'"
**Solusi:**
```bash
npm install
```

---

## ✅ Verification Checklist

Sebelum deploy, pastikan:

- [ ] File `.env` ada dan terisi (bukan kosong)
- [ ] DATABASE_URL format: `postgresql://...`
- [ ] JWT_SECRET ada (minimal 20 karakter)
- [ ] TELEGRAM_BOT_TOKEN terisi
- [ ] JWT_SECRET **sama** di local .env dan Netlify

Setelah deploy:
- [ ] Site bisa dibuka
- [ ] Register account berhasil
- [ ] Login berhasil
- [ ] Dashboard muncul
- [ ] Bisa add client

---

## 🎯 Alternative: Setup via Command Line

Jika script .bat tidak jalan, gunakan command manual:

### 1. Get DATABASE_URL
```bash
netlify env:list
```

### 2. Create .env
Edit `.env` file, isi:
```env
DATABASE_URL=postgresql://[dari-netlify]
JWT_SECRET=[random-32-characters]
TELEGRAM_BOT_TOKEN=8285823339:AAFf0YQF1WzkOW2mm2NzSzpEI67sJafn42o
```

### 3. Add JWT_SECRET to Netlify
Via dashboard atau CLI:
```bash
netlify env:set JWT_SECRET "your-secret-here"
```

### 4. Migrate
```bash
npm run db:generate
npm run db:migrate
```

### 5. Deploy
```bash
netlify deploy --prod
```

---

## 📞 Still Having Issues?

### Check Database Connection
```bash
# Test connection
node -e "const { neon } = require('@neondatabase/serverless'); const sql = neon(process.env.DATABASE_URL); sql('SELECT 1').then(() => console.log('✓ Connected')).catch(e => console.log('✗ Failed:', e))"
```

### View Netlify Logs
```bash
netlify logs
```

### Check Environment Variables
```bash
netlify env:list
```

---

## 🎉 Success Indicators

Jika berhasil, Anda akan lihat:

✅ Terminal output: `✓ Migrations applied successfully`
✅ Terminal output: `✓ Deploy is live!`
✅ Site URL bisa diakses
✅ Halaman login muncul
✅ Register berhasil

---

## 📱 After Deploy

1. **Register account** di site Anda
2. **Go to Settings**
3. Message [@userinfobot](https://t.me/userinfobot) untuk get Chat ID
4. Paste Chat ID di Settings
5. **Save**
6. Start managing projects!

---

## 🔐 Security Note

- **NEVER commit .env** to Git (sudah di .gitignore)
- Keep JWT_SECRET secret
- Don't share DATABASE_URL publicly

---

## 💡 Tips

- Bookmark site URL Anda
- Save JWT_SECRET di tempat aman (password manager)
- Check Netlify dashboard untuk monitor deployment
- Use Netlify logs untuk debugging

---

**Need more help?** Check:
- [DEPLOY-NOW.md](./DEPLOY-NOW.md) - Step-by-step guide
- [README.md](./README.md) - Complete documentation
- [QUICK-START.md](./QUICK-START.md) - Quick reference

**Let's fix this! 🚀**
