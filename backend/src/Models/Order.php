<?php // Model tipis: Order
class Order {
    public static function findByNumber(string $no): ?array {
        $st = db()->prepare('SELECT * FROM orders WHERE order_number=? LIMIT 1');
        $st->execute([$no]);
        return $st->fetch() ?: null;
    }
}
