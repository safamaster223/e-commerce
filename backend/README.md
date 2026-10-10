# Backend — PHP Native + MySQL (PDO)

## Cara menjalankan
1. Buat DB & import seed:
   ```sql
   -- via mysql client:
   SOURCE schema.sql;
   -- (file ada di root repo: schema.sql)
   ```
   Isi `.env` (root repo): `DB_HOST, DB_PORT, DB_NAME=belilokal, DB_USER, DB_PASS`.
2. Jalankan API:
   ```
   php -S localhost:8000 -t backend/public
   ```
3. Jalankan frontend (proxy `/api` → `:8000`):
   ```
   cd frontend && npm install && npm run dev   # http://localhost:5173
   ```
4. Akun demo (password semua `password`): `admin@belilokal.id`, `seller@belilokal.id`, `buyer@belilokal.id`.

Tanpa `MIDTRANS_SERVER_KEY` / `RAJAONGKIR_API_KEY` semua tetap jalan (mode demo):
ongkir fallback Rp15.000/kg + `is_fallback:true`, snap token `SNAP-...` mock.

## Uji cepat (curl)
```bash
curl -s -X POST localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"email":"buyer@belilokal.id","password":"password"}'
curl -s "localhost:8000/api/products?q=kopi&page=1"
curl -s "localhost:8000/api/shipping/cities?search=bandung"
curl -s -X POST localhost:8000/api/shipping/calculate -H "Content-Type: application/json" -d '{"origin_city_id":"398","destination_city_id":"399","weight_grams":850}'
# tambah cart lalu checkout (ganti TOKEN):
curl -s -X POST localhost:8000/api/cart -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"product_id":1,"quantity":1}'
curl -s -X POST localhost:8000/api/checkout -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{"recipient_name":"Budi","recipient_phone":"0812","shipping_address":"Jl. Sudirman 10","destination_city_id":"399","destination_city_name":"Kota Bandung","destination_province":"Jawa Barat","shipping_courier":"jne","shipping_service":"REG","shipping_cost":15000}'
# simulasi bayar (ganti NO):
curl -s -X POST localhost:8000/api/payments/simulate/NO -H "Authorization: Bearer TOKEN"
```
