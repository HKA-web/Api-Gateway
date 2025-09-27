# API Gateway

Fungsi utama API Gateway

- Entry point tunggal

- Semua client (web, mobile, aplikasi lain) cukup mengakses satu endpoint utama.

- Contoh: https://api.mycompany.com/ → gateway yang menentukan microservice mana yang dipanggil.

- Routing / load balancing

- Gateway meneruskan request ke microservice yang sesuai.

- Bisa menyeimbangkan beban (load balancing) antar instance microservice.

# Perhatian

Clone Project:
```
git clone https://github.com/HKA-web/api-gateway.git
git submodule update --init --recursive
git pull --recurse-submodules
```

Rubah nama config - example.yaml > config.yaml
   
# Pengaturan Ngrok

Pastikan sudah menjalankan install.bat, kalau sudah buka file cwd.bat:
```
===============================================
 Portable Node.js + Yarn Environment
-----------------------------------------------
 Node exe path: "C:\WA-BOT\bin\nodejs\node.exe"
-----------------------------------------------
 Node Version: v20.18.0
===============================================

Pilih tindakan:
  1. Buka interactive shell (cmd)
  2. Jalankan "yarn start"
  3. Keluar
Choice [1-3]:1
```

Jalankan perintah ini:
```
.\node_modules\.bin\ngrok config add-authtoken <YOUR-TOKEN>
```

Jika sukses, jalankan ngrok.bat

# Struktur Folder
```
api-gateway/
├── bin/                                # utilities
├── install.bat                         # setup environment / install dependencies
├── cwd.bat                             # script untuk set working directory
├── dist/                               # hasil build TypeScript (production)
├── package.json
├── tsconfig.json
├── yarn.lock
│
├── src/
│   ├── modules/
│   │   └── querytool/                  # module untuk query tools
│   │       ├── querytool.controller.ts
│   │       ├── querytool.service.ts
│   │       ├── querytool.routes.ts
│   │       └── querytool.openapi.json
│   │
│   ├── middlewares/
│   │   └── logger.ts
│   │
│   ├── utils/
│   │   ├── transform.ts                # misal trimStrings
│   │   └── config.ts                   # env/config global
│   │
│   ├── index.ts                        # entry point
│   └── generate-openapi.ts             # generate-openapi
```

# Arsitektur
```
             +-------------------+
             |   API Gateway     |  <-- Node.js + Express
             |-------------------|
             | src/index.ts      |
             | src/generate-openapi.ts |
             +-------------------+
                      |
        ---------------------------------
        |                               |
        v                               v
+----------------+               +----------------+
| modules/querytool |             | middlewares/logger.ts |
|------------------|             +----------------+
| querytool.controller.ts         (logging / request)  
| querytool.service.ts
| querytool.routes.ts  <-- router auto-loaded
| querytool.openapi.json  <-- OpenAPI spec module
+----------------+
        |
        | service layer
        v
   +------------+
   | DB Service |
   | (MSSQL,   |
   | PostgreSQL|
   | MySQL)    |
   +------------+
        ^
        |
   +----------------+
   | bin/           | <-- optional scripts / utilities
   | install.bat    | <-- setup env / deps
   | cwd.bat        | <-- set working directory
   +----------------+
        |
   +----------------+
   | dist/          | <-- hasil build TS (production)
   +----------------+
```