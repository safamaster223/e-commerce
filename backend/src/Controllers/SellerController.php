<?php
class SellerController {
    private static function shop(array $u): array {
        $st=db()->prepare('SELECT * FROM shops WHERE user_id=? LIMIT 1'); $st->execute([$u['id']]);
        $s=$st->fetch();
        if(!$s) json_response(['status'=>'error','message'=>'Toko tidak ditemukan.'],404);
        return $s;
    }
    public static function products(array $u): void {
        $s=self::shop($u);
        $st=db()->prepare('SELECT p.*, c.name category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.shop_id=? ORDER BY p.id DESC');
        $st->execute([$s['id']]);
        $out=[]; foreach($st->fetchAll() as $p) $out[]=format_product($p,format_shop($s));
        json_response(['status'=>'success','data'=>$out]);
    }
    private static function payload(): array {
        if(!empty($_FILES['image']['tmp_name'])){
            $dir=dirname(__DIR__,3).'/backend/public/uploads';
            if(!is_dir($dir)) mkdir($dir,0775,true);
            $ext=strtolower(pathinfo($_FILES['image']['name'],PATHINFO_EXTENSION)?:'jpg');
            if(!in_array($ext,['jpg','jpeg','png','webp'],true)) $ext='jpg';
            $fn='p-'.date('YmdHis').'-'.substr(bin2hex(random_bytes(4)),0,6).'.'.$ext;
            move_uploaded_file($_FILES['image']['tmp_name'],$dir.'/'.$fn);
            $_POST['image_url']='/uploads/'.$fn;
        }
        $raw=file_get_contents('php://input');
        $json=$raw?json_decode($raw,true):[];
        return array_merge(is_array($json)?$json:[],$_POST);
    }
    private static function save(array $u, ?int $id, array $b): void {
        $s=self::shop($u); $pdo=db();
        if($id){
            $st=$pdo->prepare('SELECT * FROM products WHERE id=? AND shop_id=? LIMIT 1');
            $st->execute([$id,$s['id']]);
            if(!$st->fetch()) json_response(['status'=>'error','message'=>'Produk tidak ditemukan.'],404);
        }
        $name=trim($b['name']??'');
        if(!$name) json_response(['status'=>'error','message'=>'Nama produk wajib.'],422);
        $catName=trim($b['category']??$b['category_name']??'');
        $catId=null;
        if($catName!==''){
            $c=$pdo->prepare('SELECT id FROM categories WHERE name=? OR slug=? LIMIT 1');
            $c->execute([$catName,slugify($catName)]); $r=$c->fetch();
            if($r) $catId=$r['id'];
            else { $pdo->prepare('INSERT INTO categories (name,slug) VALUES (?,?)')->execute([$catName,slugify($catName)]); $catId=(int)$pdo->lastInsertId(); }
        }
        $price=(int)($b['price']??0); $stock=(int)($b['stock']??0);
        $weight=(int)($b['weight_grams']??$b['weight_gram']??500);
        $img=trim($b['image_url']??$b['image']??'');
        if($id){
            $pdo->prepare('UPDATE products SET category_id=?,name=?,slug=?,description=?,price=?,stock=?,weight_gram=?,image_url=? WHERE id=?')
                ->execute([$catId,$name,slugify($name).'-'.$id,($b['description']??null),$price,$stock,$weight,($img?:null),$id]);
            $st=$pdo->prepare('SELECT p.*, c.name category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=? LIMIT 1');
            $st->execute([$id]);
            json_response(['status'=>'success','data'=>format_product($st->fetch(),format_shop($s))]);
        }
        $slug=slugify($name); $chk=$pdo->prepare('SELECT id FROM products WHERE slug=? LIMIT 1');
        $base=$slug;$i=0; while(true){ $chk->execute([$slug]); if(!$chk->fetch()) break; $slug=$base.'-'.(++$i); }
        $pdo->prepare('INSERT INTO products (shop_id,category_id,name,slug,description,price,stock,weight_gram,image_url) VALUES (?,?,?,?,?,?,?,?,?)')
            ->execute([$s['id'],$catId,$name,$slug,($b['description']??null),$price,$stock,$weight,($img?:null)]);
        $nid=(int)$pdo->lastInsertId();
        $st=$pdo->prepare('SELECT p.*, c.name category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.id=? LIMIT 1');
        $st->execute([$nid]);
        json_response(['status'=>'success','data'=>format_product($st->fetch(),format_shop($s))], 201);
    }
    public static function store(array $u): void { self::save($u,null,self::payload()); }
    public static function update(array $u, $id): void { self::save($u,(int)$id,self::payload()); }
    public static function destroy(array $u, $id): void {
        $s=self::shop($u);
        // soft delete: nonaktifkan (aman untuk riwayat order)
        $st=db()->prepare('UPDATE products SET is_active=0 WHERE id=? AND shop_id=?');
        $st->execute([$id,$s['id']]);
        if(!$st->rowCount()) json_response(['status'=>'error','message'=>'Produk tidak ditemukan.'],404);
        json_response(['status'=>'success','message'=>'Produk dinonaktifkan.']);
    }
    public static function orders(array $u): void {
        $s=self::shop($u);
        $st=db()->prepare('SELECT * FROM orders WHERE shop_id=? ORDER BY id DESC'); $st->execute([$s['id']]);
        json_response(['status'=>'success','data'=>array_map([OrderController::class,'serialize'],$st->fetchAll())]);
    }
    public static function tracking(array $u, string $no, array $b): void {
        $s=self::shop($u);
        $st=db()->prepare('SELECT * FROM orders WHERE order_number=? AND shop_id=? LIMIT 1');
        $st->execute([$no,$s['id']]);
        if(!$st->fetch()) json_response(['status'=>'error','message'=>'Order tidak ditemukan.'],404);
        $resi=trim($b['tracking_number']??$b['resi']??'');
        if(!$resi) json_response(['status'=>'error','message'=>'tracking_number wajib.'],422);
        db()->prepare("UPDATE orders SET tracking_number=?, status='shipped' WHERE order_number=?")->execute([$resi,$no]);
        json_response(['status'=>'success','message'=>'Resi disimpan. Order dikirim.']);
    }
}
