<?php // Model tipis: User
class User {
    public static function findByEmail(string $email): ?array {
        $st = db()->prepare('SELECT * FROM users WHERE email=? LIMIT 1');
        $st->execute([$email]);
        return $st->fetch() ?: null;
    }
    public static function find(int $id): ?array {
        $st = db()->prepare('SELECT id,name,email,role,phone,avatar,created_at FROM users WHERE id=? LIMIT 1');
        $st->execute([$id]);
        return $st->fetch() ?: null;
    }
}
