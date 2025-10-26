# API Gateway

Fungsi utama API Gateway

- Entry point tunggal.

- Semua client (web, mobile, aplikasi lain) cukup mengakses satu endpoint utama untuk berkomunikasi.

- Routing.

# Pemasangan

- Clone Project:
```
git clone https://github.com/HKA-web/Api-Gateway.git
git submodule update --init --recursive
git pull --recurse-submodules
```
- Rubah nama config-example.yaml > config.yaml .

- Klik 2x pada install.bat .
   
# Jakankan

Pastikan install.bat sudah sukses, kalau sudah klik 2x pada cwd.bat, pada `opsi tindakan pilih 2`:
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
Choice [1-3]: 1
```

# Jakankan Dengan Ngrok

Pastikan install.bat sudah sukses, kalau sudah klik 2x pada cwd.bat, pada `opsi tindakan pilih 1`:
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
Choice [1-3]: 1
```

>Jalankan perintah ini:
```
.\node_modules\.bin\ngrok config add-authtoken <YOUR-TOKEN>
```
>Jika sukses, jalankan ngrok dengan cara klik 2x ngrok.bat

# Struktur
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
│   │   └── retryRequest.ts
│   │
│   ├── utils/
│   │   └── config.ts                   # env/config global
│   │   └── routeLoader.ts
│   │   └── redisCache.ts
│   │
│   ├── index.ts                        # entry point
│   └── generate-openapi.ts             # generate-openapi
```

# Arsitektur
```
             +--------------------------+
             |   API Gateway     		|
             |--------------------------|
             | src/index.ts      		|
             | src/generate-openapi.ts 	|
             +--------------------------+
                      |
        -------------------------------------------------------------------------
        |                               |										|
        v                               v										v
		modules							middlewares								utils
+-------------------+            +----------------------+			+-----------------------+
| querytool  		|            | logger	  			| 			| config				|
|					|			 | jwtAuth	  			|			| redisCache			|						
|					|			 | retryRequest	  		|			| utils/routeLoader		|										
+-------------------+            +----------------------+			+-----------------------+
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
   | MSSQL   	|
   | PostgreSQL	|
   | MySQL    	|
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