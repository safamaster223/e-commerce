<?php // Model tipis: Shop
class Shop {
    public static function findByUser(int $uid): ?array {
        $st = db()->prepare('SELECT * FROM shops WHERE user_id=? LIMIT 1');
        $st->execute([$uid]);
        return $st->fetch() ?: null;
    }
}
