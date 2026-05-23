# Gunakan image Node.js versi 20
FROM node:20-slim

# Set direktori kerja
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependensi (termasuk devDependencies karena kita butuh tsx untuk running)
RUN npm install

# Salin seluruh kode proyek
COPY . .

# Build frontend React
RUN npm run build

# Ekspos port (Cloud Run menggunakan variabel PORT, biasanya 8080)
EXPOSE 8080

# Jalankan aplikasi menggunakan tsx (karena entry point kita server.ts)
# Kita paksa NODE_ENV=production agar server menyajikan file dari /dist
CMD ["npx", "cross-env", "NODE_ENV=production", "tsx", "server.ts"]
