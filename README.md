# API Gateway

Fungsi utama API Gateway

- Entry point tunggal microservice

- Semua client (web, mobile, aplikasi lain) cukup mengakses satu endpoint utama untuk berkomunikasi ke microservice.

- Contoh: https://api.mycompany.com/ → gateway yang menentukan microservice mana yang dipanggil.

- Routing / load balancing

- Gateway meneruskan request ke microservice yang sesuai.

# Perhatian

- Clone Project:
```
git clone https://github.com/HKA-web/api-gateway.git
git submodule update --init --recursive
git pull --recurse-submodules
```

- Rubah nama config - example.yaml > config.yaml .

- Klik 2x pada install.bat .
   
# Pengaturan Ngrok

Pastikan sudah menjalankan install.bat, kalau sudah klik 2x file cwd.bat:
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

Jika sukses, jalankan ngrok dengan cara klik 2x ngrok.bat

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
│   │   └── jwtAuth.ts
│   │
│   ├── utils/
│   │   └── config.ts                   # env/config global
│   │   └── routeLoader.ts
│   │   └── circuitBreaker.ts
│   │   └── redisCache.ts
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
        -------------------------------------------------------------------------
        |                               |										|
        v                               v										v	
+--------------------+            +-----------------------+			+-----------------------+
| modules/querytool  |            | middlewares/logger	  | 		| utils/config			|
|					 |			  | middlewares/jwtAuth	  |			| utils/redisCache		|						
|					 |			  |        				  |			| utils/circuitBreaker	|							
|					 |			  |        				  |			| utils/routeLoader		|						
|--------------------|            +-----------------------+			+-----------------------+
		|
		v
| querytool.controller.ts       <-- logging / request
| querytool.service.ts			<-- service
| querytool.routes.ts  			<-- router auto-loaded
| querytool.openapi.json  		<-- OpenAPI spec module
+-------------------------+
        |
        | service layer
        v
   +------------+
   | DB Service |
   | (MSSQL,   	|
   | PostgreSQL	|
   | MySQL)    	|
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

# Alur Kerja

1. Gateway kirim request ke backend (axios + breaker)
2. Timeout 5 (*Sesuai setup) detik → jika backend lambat, langsung throw
3. Retry 2x (*Sesuai setup) → jika masih gagal, throw error
4. Circuit breaker track error rate → jika terlalu tinggi, buka breaker
5. Client dapat response error (timeout / service unavailable)
