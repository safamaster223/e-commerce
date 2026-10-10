<?php
// Helper global: response JSON, rupiah, auth Bearer, guard role, slug, AWB.
function json_response($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function rupiah(int $n): string { return 'Rp' . number_format($n, 0, ',', '.'); }
function slugify(string $s): string {
    $s = strtolower(trim(iconv('UTF-8', 'ASCII//TRANSLIT', $s)));
    $s = preg_replace('/[^a-z0-9]+/', '-', $s);
    return trim($s, '-') ?: 'item';
}
function bearer_token(): ?string {
    $h = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '';
    if (!$h && function_exists('getallheaders')) {
        $all = getallheaders();
        foreach ($all as $k => $v) {
            if (strtolower($k) === 'authorization') { $h = $v; break; }
        }
    }
    if (preg_match('/Bearer\s+(.+)/i', $h, $m)) return trim($m[1]);
    return $_GET['token'] ?? null;
}
function auth_user(bool $required = true): ?array {
    $tok = bearer_token();
    if (!$tok) { if ($required) json_response(['status'=>'error','message'=>'Unauthenticated.'], 401); return null; }
    $st = db()->prepare('SELECT u.* FROM user_tokens t JOIN users u ON u.id=t.user_id WHERE t.token=? LIMIT 1');
    $st->execute([$tok]);
    $u = $st->fetch();
    if (!$u) { if ($required) json_response(['status'=>'error','message'=>'Token tidak valid.'], 401); return null; }
    unset($u['password']);
    // lampirkan shop bila seller
    if ($u['role'] === 'seller') {
        $s = db()->prepare('SELECT * FROM shops WHERE user_id=? LIMIT 1');
        $s->execute([$u['id']]);
        $shop = $s->fetch();
        if ($shop) $u['shop'] = format_shop($shop);
    }
    return $u;
}
function require_role(array $user, string ...$roles): void {
    if (!in_array($user['role'], $roles, true))
        json_response(['status'=>'error','message'=>'Forbidden. Butuh role: '.implode(',', $roles)], 403);
}
function generate_awb(string $prefix = 'JNE'): string {
    return strtoupper($prefix) . '-' . date('Ymd') . '-' . substr(str_shuffle('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'), 0, 6);
}
function format_shop(array $s): array {
    return [
        'id'=>$s['id'], 'user_id'=>$s['user_id'],
        'shop_name'=>$s['name'], 'name'=>$s['name'],
        'slug'=>$s['slug'], 'address'=>$s['address'] ?? null,
        'city_id'=>$s['city_id'], 'city_name'=>$s['city_name'],
        'province'=>$s['province'], 'province_name'=>$s['province'],
        'province_id'=>$s['province'], 'is_verified'=>(int)$s['is_verified'],
    ];
}
function format_product(array $p, ?array $shop = null, ?string $catName = null): array {
    return [
        'id'=>(int)$p['id'], 'shop_id'=>(int)$p['shop_id'],
        'name'=>$p['name'], 'slug'=>$p['slug'],
        'description'=>$p['description'], 'price'=>(int)$p['price'],
        'stock'=>(int)$p['stock'],
        'weight_gram'=>(int)$p['weight_gram'], 'weight_grams'=>(int)$p['weight_gram'],
        'image_url'=>$p['image_url'], 'is_active'=>(int)$p['is_active'],
        'category'=>$catName ?? $p['category_name'] ?? null,
        'category_name'=>$catName ?? $p['category_name'] ?? null,
        'shop'=>$shop,
        'created_at'=>$p['created_at'] ?? null,
    ];
}
function mark_order_paid(array $order): array {
    $pdo = db();
    if (($order['payment_status'] ?? '') === 'paid') return $order;
    $awb = $order['tracking_number'] ?: generate_awb($order['courier'] ?: 'JNE');
    $st = $pdo->prepare("UPDATE orders SET payment_status='paid', status='paid', paid_at=NOW(), tracking_number=? WHERE id=?");
    $st->execute([$awb, $order['id']]);
    // kurangi stok per item
    $it = $pdo->prepare('SELECT * FROM order_items WHERE order_id=?');
    $it->execute([$order['id']]);
    $dec = $pdo->prepare('UPDATE products SET stock=GREATEST(0, stock-?) WHERE id=?');
    foreach ($it->fetchAll() as $row) {
        if ($row['product_id']) $dec->execute([(int)$row['quantity'], $row['product_id']]);
    }
    $st = $pdo->prepare('SELECT * FROM orders WHERE id=? LIMIT 1');
    $st->execute([$order['id']]);
    return $st->fetch();
}
