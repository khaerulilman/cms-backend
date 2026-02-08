# ESLint Setup

trigeredd test

## Overview

Project ini menggunakan ESLint versi 9+ dengan konfigurasi flat config (eslint.config.js) untuk menjaga kualitas kode dan konsistensi style.

## Instalasi

ESLint dan plugin-plugin yang diperlukan sudah terinstall:

```bash
npm install --save-dev eslint@latest @eslint/js globals eslint-plugin-import
```

## Konfigurasi

Konfigurasi ESLint tersimpan di file `eslint.config.js` dengan menggunakan format flat config (ESLint 9+).

### Fitur Konfigurasi:

- **Format Modern**: Menggunakan flat config format (ESLint 9+)
- **ES Modules**: Support penuh untuk ES modules
- **Import Plugin**: Mengatur dan memvalidasi urutan import
- **Node.js Globals**: Pre-configured untuk Node.js environment
- **Test Files**: Konfigurasi khusus untuk file test (Vitest)

### Rules yang Diterapkan:

1. **Best Practices**
   - No unused variables (dengan exception untuk `_` prefix)
   - Prefer const over let
   - No var keyword
   - Arrow callbacks preferred

2. **Code Style**
   - Single quotes untuk string
   - Semicolons required
   - 2 spaces indentation
   - Trailing commas in multiline
   - Proper spacing dan formatting

3. **Import Rules**
   - Ordered imports (builtin → external → internal → parent → sibling → index)
   - Newlines between import groups
   - File extensions required for local imports

4. **Console**
   - Warning untuk console.log
   - Allowed: console.warn, console.error, console.info

## NPM Scripts

### `npm run lint`

Menjalankan ESLint untuk memeriksa semua file di project.

```bash
npm run lint
```

### `npm run lint:fix`

Menjalankan ESLint dan otomatis memperbaiki masalah yang bisa diperbaiki.

```bash
npm run lint:fix
```

### `npm run lint:report`

Menghasilkan laporan ESLint dalam format JSON.

```bash
npm run lint:report
```

## Ignored Patterns

File dan folder berikut diabaikan oleh ESLint:

- `node_modules/`
- `coverage/`
- `dist/`
- `build/`
- `uploads/`
- `prisma/migrations/`
- `*.config.js` (config files)
- `vitest.config.js`
- `prisma.config.ts`

## VS Code Integration

Untuk mendapatkan feedback real-time di VS Code, install extension:

- **ESLint** by Microsoft (ms-vscode.vscode-eslint)

Extension akan otomatis mendeteksi konfigurasi dan menampilkan error/warning saat coding.

## Workflow Rekomendasi

### Saat Development:

1. Tulis kode seperti biasa
2. VS Code akan menampilkan error/warning secara real-time
3. Gunakan quick fix (Ctrl+. atau Cmd+.) untuk perbaikan otomatis

### Sebelum Commit:

```bash
npm run lint:fix
```

Ini akan memperbaiki semua masalah yang bisa diperbaiki otomatis.

### CI/CD Integration:

Tambahkan di pipeline CI/CD:

```bash
npm run lint
```

Untuk memastikan semua kode yang di-commit memenuhi standard.

## Common Issues & Fixes

### Issue: Import order warning

**Fix**: Gunakan `npm run lint:fix` atau arrange imports manual sesuai urutan:

1. Node.js built-in modules (fs, path, etc)
2. External packages (express, prisma, etc)
3. Internal modules (./utils, ./config, etc)

### Issue: Unused variable error

**Fix**:

- Hapus variable yang tidak dipakai
- Atau prefix dengan `_` jika intentionally unused: `_unusedVar`

### Issue: Double quotes error

**Fix**: Ganti dengan single quotes atau jalankan `npm run lint:fix`

## Remaining Manual Fixes

Setelah menjalankan `npm run lint:fix`, beberapa issue yang perlu diperbaiki manual:

1. **Unused variables**: Hapus atau prefix dengan `_`
2. **Unused parameters**: Prefix dengan `_` jika memang tidak digunakan
3. **console.log statements**: Ganti dengan console.info/warn/error atau hapus
4. **Import order**: Arrange manual jika auto-fix gagal
5. **Prototype builtins**: Gunakan `Object.prototype.hasOwnProperty.call()` instead of direct access

## Update ESLint

Untuk update ESLint ke versi terbaru:

```bash
npm update eslint @eslint/js eslint-plugin-import
```

## Resources

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [eslint-plugin-import](https://github.com/import-js/eslint-plugin-import)
