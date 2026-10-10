<?php
class CartController {
    private static function detail(int $uid): array {
        $st=db()->prepare('SELECT ci.id,ci.product_id,ci.quantity,p.name,p.price,p.stock,p.weight_gram,p.image_url,p.shop_id,s.name shop_name,s.city_name FROM cart_items ci JOIN products p ON p.id=ci.product_id LEFT JOIN shops s ON s.id=p.shop_id WHERE ci.user_id=? ORDER BY ci.id DESC');
        $st->execute([$uid]);
        $items=[]; $tp=0; $tw=0;
        foreach ($st->fetchAll() as $r) {
            $sub=(int)$r['price']*(int)$r['quantity'];
            $w=(int)$r['weight_gram']*(int)$r['quantity'];
            $tp+=$sub; $tw+=$w;
            $items[]=['id'=>(int)$r['id'],'product_id'=>(int)$r['product_id'],'name'=>$r['name'],
                'price'=>(int)$r['price'],'stock'=>(int)$r['stock'],
                'weight_gram'=>(int)$r['weight_gram'],'weight_grams'=>(int)$r['weight_gram'],
                'image_url'=>$r['image_url'],'quantity'=>(int)$r['quantity'],'subtotal'=>$sub,
                'shop'=>['shop_name'=>$r['shop_name'],'city_name'=>$r['city_name'],'city_id'=>null]];
        }
        return ['data'=>$items,'total_price'=>$tp,'total_weight_grams'=>$tw,'total_weight'=>$tw,'item_count'=>count($items)];
    }
    public static function index(array $u): void {
        $d=self::detail((int)$u['id']);
        json_response(['status'=>'success']+$d);
    }
    // POST /cart {product_id, quantity} = upsert (dipakai tambah & ubah qty oleh frontend)
    public static function store(array $u, array $b): void {
        $pid=(int)($b['product_id']??0); $qty=max(1,(int)($b['quantity']??1));
        $p=db()->prepare('SELECT id,stock FROM products WHERE id=? AND is_active=1 LIMIT 1');
        $p->execute([$pid]); $prod=$p->fetch();
        if(!$prod) json_response(['status'=>'error','message'=>'Produk tidak ditemukan.'],404);
        if($qty>(int)$prod['stock']) json_response(['status'=>'error','message'=>'Stok tidak mencukupi (sisa '.$prod['stock'].').'],422);
        $pdo=db();
        $pdo->prepare('INSERT INTO cart_items (user_id,product_id,quantity) VALUES (?,?,?) ON DUPLICATE KEY UPDATE quantity=?')
            ->execute([(int)$u['id'],$pid,$qty,$qty]);
        json_response(['status'=>'success','message'=>'Keranjang diperbarui.']+self::detail((int)$u['id']));
    }
    public static function update(array $u, $id, array $b): void {
        $qty=max(1,(int)($b['quantity']??1));
        $pdo=db();
        $st=$pdo->prepare('SELECT ci.*,p.stock FROM cart_items ci JOIN products p ON p.id=ci.product_id WHERE ci.id=? AND ci.user_id=? LIMIT 1');
        $st->execute([$id,$u['id']]); $row=$st->fetch();
        if(!$row) json_response(['status'=>'error','message'=>'Item tidak ditemukan.'],404);
        if($qty>(int)$row['stock']) json_response(['status'=>'error','message'=>'Stok tidak mencukupi.'],422);
        $pdo->prepare('UPDATE cart_items SET quantity=? WHERE id=?')->execute([$qty,$id]);
        json_response(['status'=>'success','message'=>'OK']+self::detail((int)$u['id']));
    }
    public static function destroy(array $u, $id): void {
        db()->prepare('DELETE FROM cart_items WHERE id=? AND user_id=?')->execute([$id,$u['id']]);
        json_response(['status'=>'success','message'=>'Item dihapus.']+self::detail((int)$u['id']));
    }
    public static function clear(array $u): void {
        db()->prepare('DELETE FROM cart_items WHERE user_id=?')->execute([$u['id']]);
        json_response(['status'=>'success','message'=>'Keranjang dikosongkan.']);
    }
}
