#!/bin/bash

# Computer Inventory System - Setup Script
# Run: bash setup.sh

echo "🚀 Computer Inventory System - Setup"
echo "=====================================\n"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js tidak terinstal. Instal dari https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node -v)"

# Install dependencies
echo "\n📦 Menginstal dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies berhasil diinstal"
else
    echo "❌ Gagal menginstal dependencies"
    exit 1
fi

# Copy env file
if [ ! -f .env.local ]; then
    echo "\n⚙️  Membuat .env.local..."
    cp .env.local.example .env.local
    echo "✓ File .env.local dibuat"
    echo "⚠️  PERHATIAN: Edit .env.local dengan credentials Supabase Anda!"
else
    echo "✓ .env.local sudah ada"
fi

echo "\n✅ Setup selesai!"
echo "\n📖 Langkah selanjutnya:"
echo "1. Edit .env.local dengan Supabase credentials"
echo "2. Jalankan: npm run dev"
echo "3. Buka: http://localhost:3000"
echo "\n📚 Dokumentasi: README.md dan SETUP.md"
