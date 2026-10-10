<?php
class ShippingController {
    public static function cities(): void {
        $s=trim($_GET['search']??'');
        json_response(['status'=>'success','data'=>ShippingService::cities($s)]);
    }
    public static function calculate(array $b): void {
        $origin=$b['origin_city_id']??$b['origin']??'';
        $dest=$b['destination_city_id']??$b['destination']??'';
        $w=(int)($b['weight_grams']??$b['weight_gram']??$b['weight']??0);
        if(!$dest) json_response(['status'=>'error','message'=>'destination_city_id wajib diisi.'],422);
        json_response(['status'=>'success','data'=>ShippingService::calculate($origin,$dest,$w)]);
    }
}
class PaymentController {
    // POST /webhooks/midtrans — settlement/capture(accept)->paid+AWB+stok; cancel/deny/expire->cancelled/failed; pending->pending
    public static function webhook(array $b): void {
        $no=$b['order_id']??$b['order_number']??'';
        $ts=$b['transaction_status']??'';
        $fraud=$b['fraud_status']??'accept';
        if(!$no) json_response(['status'=>'error','message'=>'order_id wajib.'],422);
        $st=db()->prepare('SELECT * FROM orders WHERE order_number=? LIMIT 1'); $st->execute([$no]);
        $o=$st->fetch();
        if(!$o) json_response(['status'=>'error','message'=>'Order tidak ditemukan.'],404);
        $pdo=db();
        if(($ts==='capture'&&$fraud==='accept')||$ts==='settlement'){
            mark_order_paid($o);
            json_response(['status'=>'success','message'=>'Order paid.']);
        }
        if(in_array($ts,['cancel','deny','expire'],true)){
            $ps=$ts==='expire'?'cancelled':'failed';
            $pdo->prepare("UPDATE orders SET payment_status=?, status='cancelled' WHERE id=?")->execute([$ps,$o['id']]);
            json_response(['status'=>'success','message'=>'Order dibatalkan.']);
        }
        $pdo->prepare("UPDATE orders SET payment_status='pending', status='pending_payment' WHERE id=?")->execute([$o['id']]);
        json_response(['status'=>'success','message'=>'Pending.']);
    }
    // POST /payments/simulate/:orderNumber — mode demo: tandai paid + AWB + kurangi stok
    public static function simulate(array $u, string $no): void {
        $st=db()->prepare('SELECT * FROM orders WHERE order_number=? LIMIT 1'); $st->execute([$no]);
        $o=$st->fetch();
        if(!$o) json_response(['status'=>'error','message'=>'Order tidak ditemukan.'],404);
        if($u['role']==='buyer'&&(int)$o['buyer_id']!==(int)$u['id']) json_response(['status'=>'error','message'=>'Forbidden.'],403);
        $o=mark_order_paid($o);
        json_response(['status'=>'success','message'=>'Pembayaran simulasi berhasil.','data'=>OrderController::serialize($o)]);
    }
}
