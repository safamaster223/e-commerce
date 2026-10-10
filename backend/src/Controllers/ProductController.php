<?php
class ProductController {
    private static function shopMap(): array {
        $m=[];
        foreach (db()->query('SELECT * FROM shops') as $s) $m[$s['id']]=format_shop($s);
        return $m;
    }
    public static function categories(): void {
        $rows=db()->query('SELECT id,name,slug FROM categories ORDER BY name')->fetchAll();
        json_response(['status'=>'success','data'=>$rows]);
    }
    public static function index(): void {
        $q=trim($_GET['q']??$_GET['search']??'');
        $cat=trim($_GET['category']??'');
        $sort=$_GET['sort']??'created_at';
        $dir=strtolower($_GET['dir']??($_GET['order']??'desc'))==='asc'?'ASC':'DESC';
        $page=max(1,(int)($_GET['page']??1)); $per=min(48,max(1,(int)($_GET['per_page']??12)));
        $allowed=['created_at'=>'p.created_at','price'=>'p.price','name'=>'p.name'];
        $orderBy=$allowed[$sort]??'p.created_at';
        $where=['p.is_active=1']; $params=[];
        if ($q!==''){ $where[]='(p.name LIKE ? OR p.description LIKE ?)'; $params[]="%$q%"; $params[]="%$q%"; }
        if ($cat!=='' && strtolower($cat)!=='semua'){
            $where[]='(c.name=? OR c.slug=?)'; $params[]=$cat; $params[]=slugify($cat);
        }
        $w='WHERE '.implode(' AND ',$where);
        $cnt=db()->prepare("SELECT COUNT(*) n FROM products p LEFT JOIN categories c ON c.id=p.category_id $w");
        $cnt->execute($params); $total=(int)$cnt->fetch()['n'];
        $off=($page-1)*$per;
        $sql="SELECT p.*, c.name category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id $w ORDER BY $orderBy $dir LIMIT $per OFFSET $off";
        $st=db()->prepare($sql); $st->execute($params);
        $shops=self::shopMap();
        $data=array_map(fn($p)=>format_product($p,$shops[$p['shop_id']]??null), $st->fetchAll());
        $last=max(1,(int)ceil($total/$per));
        json_response(['status'=>'success','data'=>$data,
            'meta'=>['current_page'=>$page,'last_page'=>$last,'per_page'=>$per,'total'=>$total],
            'total'=>$total,'page'=>$page]);
    }
    public static function show(string $idOrSlug): void {
        $st=db()->prepare('SELECT p.*, c.name category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE (p.id=? OR p.slug=?) AND p.is_active=1 LIMIT 1');
        $st->execute([$idOrSlug,$idOrSlug]);
        $p=$st->fetch();
        if(!$p) json_response(['status'=>'error','message'=>'Produk tidak ditemukan.'],404);
        $s=db()->prepare('SELECT * FROM shops WHERE id=? LIMIT 1'); $s->execute([$p['shop_id']]); $sh=$s->fetch();
        json_response(['status'=>'success','data'=>format_product($p,$sh?format_shop($sh):null)]);
    }
}
