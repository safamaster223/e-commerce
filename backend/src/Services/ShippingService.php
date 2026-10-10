<?php
// 18 kota statis + fallback ongkir Rp15.000/kg (min 1kg). Kalau RAJAONGKIR_API_KEY ada, hit /cost.
class ShippingService {
    public static function cities(string $search = ''): array {
        $all = [
            ['city_id'=>'399','city_name'=>'Kota Bandung','province'=>'Jawa Barat','province_id'=>'9'],
            ['city_id'=>'398','city_name'=>'Kota Yogyakarta','province'=>'DI Yogyakarta','province_id'=>'10'],
            ['city_id'=>'151','city_name'=>'Kota Jakarta Pusat','province'=>'DKI Jakarta','province_id'=>'6'],
            ['city_id'=>'152','city_name'=>'Kota Jakarta Utara','province'=>'DKI Jakarta','province_id'=>'6'],
            ['city_id'=>'153','city_name'=>'Kota Jakarta Barat','province'=>'DKI Jakarta','province_id'=>'6'],
            ['city_id'=>'154','city_name'=>'Kota Jakarta Selatan','province'=>'DKI Jakarta','province_id'=>'6'],
            ['city_id'=>'155','city_name'=>'Kota Jakarta Timur','province'=>'DKI Jakarta','province_id'=>'6'],
            ['city_id'=>'400','city_name'=>'Kota Surabaya','province'=>'Jawa Timur','province_id'=>'11'],
            ['city_id'=>'401','city_name'=>'Kota Semarang','province'=>'Jawa Tengah','province_id'=>'7'],
            ['city_id'=>'402','city_name'=>'Kota Medan','province'=>'Sumatera Utara','province_id'=>'12'],
            ['city_id'=>'403','city_name'=>'Kota Makassar','province'=>'Sulawesi Selatan','province_id'=>'13'],
            ['city_id'=>'404','city_name'=>'Kota Denpasar','province'=>'Bali','province_id'=>'14'],
            ['city_id'=>'405','city_name'=>'Kota Palembang','province'=>'Sumatera Selatan','province_id'=>'15'],
            ['city_id'=>'406','city_name'=>'Kota Balikpapan','province'=>'Kalimantan Timur','province_id'=>'16'],
            ['city_id'=>'407','city_name'=>'Kota Banjarmasin','province'=>'Kalimantan Selatan','province_id'=>'17'],
            ['city_id'=>'408','city_name'=>'Kota Manado','province'=>'Sulawesi Utara','province_id'=>'18'],
            ['city_id'=>'409','city_name'=>'Kota Padang','province'=>'Sumatera Barat','province_id'=>'19'],
            ['city_id'=>'410','city_name'=>'Kota Pontianak','province'=>'Kalimantan Barat','province_id'=>'20'],
        ];
        if ($search === '') return $all;
        $q = strtolower($search);
        return array_values(array_filter($all, fn($c) =>
            str_contains(strtolower($c['city_name']), $q) || str_contains(strtolower($c['province']), $q)));
    }

    public static function calculate($origin, $dest, int $weightGram): array {
        $key = $_ENV['RAJAONGKIR_API_KEY'] ?? getenv('RAJAONGKIR_API_KEY') ?: '';
        if ($key !== '' && $key !== 'demo') {
            try {
                $res = self::viaApi($origin, $dest, $weightGram, $key);
                if ($res) return $res;
            } catch (Throwable $e) { /* jatuh ke fallback */ }
        }
        return self::fallback($weightGram);
    }

    private static function fallback(int $weightGram): array {
        $kg = max(1, (int)ceil($weightGram / 1000));
        $base = 15000 * $kg;
        $mk = fn($code,$name,$svc,$mult,$etd,$desc) => [
            'courier_code'=>$code,'courier_name'=>$name,'service'=>$svc,
            'description'=>$desc,'cost'=>(int)round($base*$mult),'etd'=>(string)$etd,
            'is_fallback'=>true,
        ];
        return [
            $mk('jne','JNE','REG',1,'2-3','Layanan reguler antar kota'),
            $mk('jne','JNE','YES',1.8,'1','Yakin esok sampai'),
            $mk('jnt','J&T Express','REG',1.1,'2-3','Reguler J&T'),
            $mk('pos','POS Indonesia','Paket Kilat Khusus',0.9,'3-4','Paket kilat khusus'),
        ];
    }

    private static function viaApi($origin, $dest, int $weight, string $key): ?array {
        $base = rtrim($_ENV['RAJAONGKIR_BASE_URL'] ?? 'https://api.rajaongkir.com/starter', '/');
        $out = [];
        foreach (['jne','pos','tiki'] as $courier) {
            $ch = curl_init($base . '/cost');
            curl_setopt_array($ch, [
                CURLOPT_POST=>true, CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>10,
                CURLOPT_HTTPHEADER=>["key: $key",'content-type: application/x-www-form-urlencoded'],
                CURLOPT_POSTFIELDS=>http_build_query([
                    'origin'=>$origin,'destination'=>$dest,'weight'=>max(1,$weight),'courier'=>$courier]),
            ]);
            $raw = curl_exec($ch); curl_close($ch);
            $js = json_decode((string)$raw, true);
            foreach (($js['rajaongkir']['results'][0]['costs'] ?? []) as $c) {
                foreach (($c['cost'] ?? []) as $v) {
                    $out[] = [
                        'courier_code'=>$courier,'courier_name'=>strtoupper($courier),
                        'service'=>$c['service'] ?? 'REG','description'=>$c['description'] ?? '',
                        'cost'=>(int)($v['value'] ?? 0),'etd'=>str_replace(' ','',(string)($v['etd'] ?? '')),
                        'is_fallback'=>false,
                    ];
                }
            }
        }
        return $out ?: null;
    }
}
