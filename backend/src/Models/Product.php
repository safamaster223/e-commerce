<?php // Model tipis: Product
class Product {
    public static function find($idOrSlug): ?array {
        $st = db()->prepare('SELECT p.*, c.name category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE (p.id=? OR p.slug=?) LIMIT 1');
        $st->execute([$idOrSlug, $idOrSlug]);
        return $st->fetch() ?: null;
    }
}
