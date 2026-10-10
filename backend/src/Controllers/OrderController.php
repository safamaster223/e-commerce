<?php
class OrderController {
    public static function serialize(array $o): array {
        $pdo=db();
        $it=$pdo->prepare('SELECT * FROM order_items WHERE order_id=?');
        $it->execute([$o['id']]); $items=$it->fetchAll();
        $sh=$pdo->prepare('SELECT * FROM shops WHERE id=? LIMIT 1'); $sh->execute([$o['shop_id']]);
        $sraw=$sh->fetch();
        $addr=$o['shipping_address'] ? json_decode($o['shipping_address'],true) : null;
        return [
            'id'=>(int)$o['id'],'order_number'=>$o['order_number'],
            'status'=>$o['status'],'payment_status'=>$o['payment_status'],
            'subtotal'=>(int)$o['total_amount'],'total_amount'=>(int)$o['total_amount'],
            'shipping_cost'=>(int)$o['shipping_cost'],'grand_total'=>(int)$o['grand_total'],
            'shipping_courier'=>$o['courier'],'courier'=>$o['courier'],
            'shipping_service'=>$o['courier_service'],'courier_service'=>$o['courier_service'],
            'shipping_etd'=>$o['courier_etd']??null,
            'recipient_name'=>$o['recipient_name'],'recipient_phone'=>$o['recipient_phone'],
            'shipping_address'=>$o['address'],'address'=>$o['address'],
            'destination_city_id'=>$o['destination_city_id'],'destination_city_name'=>$o['destination_city_name'],
            'destination_province'=>$o['destination_province'],'notes'=>$o['notes'],
            'snap_token'=>$o['snap_token'],'paid_at'=>$o['paid_at'],
            'total_weight_grams'=>(int)$o['total_weight_gram'],
            'shop'=>$sraw?format_shop($sraw):null,
            'items'=>$items,
            'shipment'=>$o['tracking_number']?['tracking_number'=>$o['tracking_number'],'courier'=>$o['courier'],'service'=>$o['courier_service']]:null,
            'shipping_address_detail'=>$addr,
            'created_at'=>$o['created_at']??null,
        ];
    }
    // Mendukung 2 varian payload: kontrak MASTER & frontend CheckoutPage.
    public static function checkout(array $u, array $b): void {
        $pdo=db();
        $st=$pdo->prepare('SELECT ci.*,p.price,p.stock,p.weight_gram,p.name,p.shop_id FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.user_id=?');
        $st->execute([$u['id']]); $cart=$st->fetchAll();
        if(!$cart) json_response(['status'=>'error','message'=>'Keranjang kosong.'],422);
        // alamat: dukung nested shipping_address{...} (kontrak) & flat (frontend)
        $nested=is_array($b['shipping_address']??null)?$b['shipping_address']:[];
        $recipient=$b['recipient_name']??$nested['recipient_name']??$u['name'];
        $phone=$b['recipient_phone']??$nested['phone']??($u['phone']??'');
        $addr=$b['shipping_address']??$nested['address']??$nested['address']??'';
        if(is_array($addr)) $addr=$nested['address']??'';
        $addr=$b['address']??$addr;
        $cityId=$b['destination_city_id']??$nested['city_id']??'';
        $cityName=$b['destination_city_name']??$nested['city_name']??($b['city_name']??'');
        $prov=$b['destination_province']??$nested['province']??'';
        $courier=$b['shipping_courier']??$b['courier']??'jne';
        $service=$b['shipping_service']??$b['courier_service']??'REG';
        $cost=(int)($b['shipping_cost']??0);
        $etd=$b['shipping_etd']??$b['courier_etd']??null;
        if(!$recipient||!$addr||!$cityId) json_response(['status'=>'error','message'=>'Alamat pengiriman belum lengkap.'],422);
        $shopId=(int)$cart[0]['shop_id'];
        $total=0;$weight=0;$items=[];
        foreach($cart as $c){
            if((int)$c['quantity']>(int)$c['stock']) json_response(['status'=>'error','message'=>'Stok "'.$c['name'].'" tidak cukup.'],422);
            $sub=(int)$c['price']*(int)$c['quantity'];
            $total+=$sub; $weight+=(int)$c['weight_gram']*(int)$c['quantity'];
            $items[]=$c+['subtotal'=>$sub];
        }
        $no='BL-'.date('Ymd').'-'.strtoupper(substr(bin2hex(random_bytes(4)),0,6));
        $pdo->prepare('INSERT INTO orders (order_number,buyer_id,shop_id,total_amount,shipping_cost,grand_total,status,courier,courier_service,courier_etd,total_weight_gram,payment_method,payment_status,recipient_name,recipient_phone,address,destination_city_id,destination_city_name,destination_province,notes,shipping_address) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
            ->execute([$no,$u['id'],$shopId,$total,$cost,$total+$cost,'pending_payment',$courier,$service,$etd,$weight,($b['payment_method']??'midtrans'),'pending',$recipient,$phone,$addr,$cityId,$cityName,$prov,($b['notes']??null),json_encode(['recipient_name'=>$recipient,'phone'=>$phone,'address'=>$addr,'city_name'=>$cityName,'province'=>$prov,'notes'=>$b['notes']??null],JSON_UNESCAPED_UNICODE)]);
        $oid=(int)$pdo->lastInsertId();
        $ins=$pdo->prepare('INSERT INTO order_items (order_id,product_id,product_name,price,quantity,weight_gram,subtotal) VALUES (?,?,?,?,?,?,?)');
        $snapItems=[];
        foreach($items as $c){
            $ins->execute([$oid,$c['product_id'],$c['name'],$c['price'],$c['quantity'],$c['weight_gram'],$c['subtotal']]);
            $snapItems[]=['product_id'=>$c['product_id'],'product_name'=>$c['name'],'price'=>$c['price'],'quantity'=>$c['quantity']];
        }
        $ord=$pdo->prepare('SELECT * FROM orders WHERE id=? LIMIT 1'); $ord->execute([$oid]); $order=$ord->fetch();
        $snap=MidtransService::createTransaction($order,$snapItems);
        $pdo->prepare('UPDATE orders SET snap_token=? WHERE id=?')->execute([$snap['token'],$oid]);
        $pdo->prepare('DELETE FROM cart_items WHERE user_id=?')->execute([$u['id']]);
        $ord->execute([$oid]);
        json_response(['status'=>'success','message'=>'Order dibuat.','order_number'=>$no,'order'=>self::serialize($ord->fetch()),
            'snap_token'=>$snap['token'],'payment_url'=>$snap['redirect_url']??null,
            'midtrans_client_key'=>MidtransService::clientKey()],201);
    }
    public static function index(array $u): void {
        $st=db()->prepare('SELECT * FROM orders WHERE buyer_id=? ORDER BY id DESC');
        $st->execute([$u['id']]);
        json_response(['status'=>'success','data'=>array_map([self::class,'serialize'],$st->fetchAll())]);
    }
    public static function show(array $u, string $no): void {
        $st=db()->prepare('SELECT * FROM orders WHERE order_number=? LIMIT 1'); $st->execute([$no]);
        $o=$st->fetch();
        if(!$o) json_response(['status'=>'error','message'=>'Order tidak ditemukan.'],404);
        if($u['role']==='buyer' && (int)$o['buyer_id']!==(int)$u['id'])
            json_response(['status'=>'error','message'=>'Forbidden.'],403);
        json_response(['status'=>'success','data'=>self::serialize($o)]);
    }
    public static function label(array $u, string $no): void {
        $st=db()->prepare('SELECT * FROM orders WHERE order_number=? LIMIT 1'); $st->execute([$no]);
        $o=$st->fetch();
        if(!$o){ http_response_code(404); echo 'Order tidak ditemukan'; exit; }
        $d=self::serialize($o);
        $items=''; foreach(($d['items']??[]) as $i){ $items.="<tr><td>{$i['product_name']}</td><td style='text-align:center'>{$i['quantity']}</td><td style='text-align:right'>".number_format($i['subtotal'],0,',','.')."</td></tr>"; }
        header('Content-Type: text/html; charset=utf-8');
        echo "<!doctype html><html><head><title>Label {$d['order_number']}</title><style>
          body{font-family:Arial,sans-serif;max-width:640px;margin:24px auto;color:#1c1917}
          .card{border:2px dashed #15803d;border-radius:12px;padding:20px}
          .awb{font-size:28px;font-weight:bold;letter-spacing:2px;color:#15803d}
          table{width:100%;border-collapse:collapse;margin-top:12px}td{padding:6px 4px;border-bottom:1px solid #eee;font-size:14px}
          @media print{button{display:none}}</style></head><body><div class='card'>
          <h2>Label Pengiriman — UMKM Nusantara</h2>
          <p>No. Order: <b>{$d['order_number']}</b> · Kurir: <b>".strtoupper($d['courier']??'')." {$d['courier_service']}</b></p>
          <p>Penerima: <b>{$d['recipient_name']}</b> ({$d['recipient_phone']})<br>{$d['address']}, {$d['destination_city_name']}, {$d['destination_province']}</p>
          <p>Pengirim: <b>".($d['shop']['shop_name']??'')."</b></p>
          <div class='awb'>".($d['shipment']['tracking_number']??'BELUM ADA RESI')."</div>
          <table>$items</table>
          <p>Total: <b>Rp ".number_format($d['grand_total'],0,',','.')."</b> (produk Rp ".number_format($d['total_amount'],0,',','.')." + ongkir Rp ".number_format($d['shipping_cost'],0,',','.').")</p>
          <button onclick='window.print()'>Cetak Label</button></div></body></html>";
        exit;
    }
}
