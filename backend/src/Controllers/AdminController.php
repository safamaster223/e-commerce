<?php
class AdminController {
    public static function stats(): void {
        $pdo=db();
        $q=fn($s)=> (int)$pdo->query($s)->fetch()['n'];
        $gmv=(int)($pdo->query("SELECT COALESCE(SUM(grand_total),0) g FROM orders WHERE payment_status='paid'")->fetch()['g'] ?? 0);
        json_response(['status'=>'success','data'=>[
            'total_users'=>$q('SELECT COUNT(*) n FROM users'),
            'total_sellers'=>$q("SELECT COUNT(*) n FROM users WHERE role='seller'"),
            'total_shops'=>$q('SELECT COUNT(*) n FROM shops'),
            'total_products'=>$q('SELECT COUNT(*) n FROM products WHERE is_active=1'),
            'total_orders'=>$q('SELECT COUNT(*) n FROM orders'),
            'paid_orders'=>$q("SELECT COUNT(*) n FROM orders WHERE payment_status='paid'"),
            'gmv_rupiah'=>$gmv,'gmv'=>$gmv,
        ]]);
    }
    public static function users(): void {
        $rows=db()->query('SELECT id,name,email,role,phone,avatar,created_at FROM users ORDER BY id ASC')->fetchAll();
        json_response(['status'=>'success','data'=>$rows]);
    }
    public static function orders(): void {
        $rows=db()->query('SELECT * FROM orders ORDER BY id DESC')->fetchAll();
        json_response(['status'=>'success','data'=>array_map([OrderController::class,'serialize'],$rows)]);
    }
    public static function shops(): void {
        $rows=db()->query('SELECT s.*, u.name owner_name, u.email owner_email FROM shops s JOIN users u ON u.id=s.user_id ORDER BY s.id ASC')->fetchAll();
        $out=array_map(fn($s)=>format_shop($s)+['user'=>['name'=>$s['owner_name'],'email'=>$s['owner_email']],
            'owner'=>$s['owner_name'],'shop_name'=>$s['name']],$rows);
        json_response(['status'=>'success','data'=>$out]);
    }
    public static function verifyShop($id): void {
        $st=db()->prepare('SELECT id FROM shops WHERE id=? LIMIT 1'); $st->execute([$id]);
        if(!$st->fetch()) json_response(['status'=>'error','message'=>'Toko tidak ditemukan.'],404);
        db()->prepare('UPDATE shops SET is_verified=1 WHERE id=?')->execute([$id]);
        json_response(['status'=>'success','message'=>'Toko diverifikasi.']);
    }
}
