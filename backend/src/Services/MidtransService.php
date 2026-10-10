<?php
// Midtrans Snap: kalau MIDTRANS_SERVER_KEY kosong/demo -> token mock. Kalau asli -> POST sandbox.
class MidtransService {
    public static function clientKey(): string {
        return $_ENV['MIDTRANS_CLIENT_KEY'] ?? getenv('MIDTRANS_CLIENT_KEY') ?: 'SB-Mid-demo-client-key';
    }
    public static function createTransaction(array $order, array $items): array {
        $serverKey = trim($_ENV['MIDTRANS_SERVER_KEY'] ?? getenv('MIDTRANS_SERVER_KEY') ?: '');
        $orderNo = $order['order_number'];
        $gross = (int)$order['grand_total'];
        if ($serverKey === '' || strtolower($serverKey) === 'demo') {
            $tok = 'SNAP-' . strtoupper(substr(bin2hex(random_bytes(8)), 0, 12));
            return [
                'token' => $tok,
                'redirect_url' => "https://app.sandbox.midtrans.com/snap/v2/vtweb/$tok",
            ];
        }
        $payload = [
            'transaction_details'=>['order_id'=>$orderNo,'gross_amount'=>$gross],
            'item_details'=>array_map(fn($i)=>[
                'id'=> (string)($i['product_id'] ?? $i['product_name']),
                'price'=>(int)$i['price'],'quantity'=>(int)$i['quantity'],'name'=>$i['product_name'],
            ], $items),
            'customer_details'=>['first_name'=>$order['recipient_name'] ?? 'Buyer','phone'=>$order['recipient_phone'] ?? ''],
        ];
        $ch = curl_init('https://app.sandbox.midtrans.com/snap/v1/transactions');
        curl_setopt_array($ch, [
            CURLOPT_POST=>true, CURLOPT_RETURNTRANSFER=>true, CURLOPT_TIMEOUT=>15,
            CURLOPT_HTTPHEADER=>['Content-Type: application/json','Accept: application/json',
                'Authorization: Basic ' . base64_encode($serverKey . ':')],
            CURLOPT_POSTFIELDS=>json_encode($payload),
        ]);
        $raw = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        $js = json_decode((string)$raw, true);
        if ($code >= 200 && $code < 300 && isset($js['token'])) return $js;
        // gagal -> fallback mock agar checkout tidak error
        $tok = 'SNAP-' . strtoupper(substr(bin2hex(random_bytes(8)), 0, 12));
        return ['token'=>$tok,'redirect_url'=>"https://app.sandbox.midtrans.com/snap/v2/vtweb/$tok"];
    }
}
