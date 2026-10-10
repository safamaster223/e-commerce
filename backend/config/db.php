<?php
// Loader .env minimal + koneksi PDO singleton. Semua query wajib prepared statement.
function load_env(string $dir): void {
    foreach (['.env', '.env.example'] as $f) {
        $p = rtrim($dir, '/\\') . DIRECTORY_SEPARATOR . $f;
        if (!is_file($p)) continue;
        foreach (file($p, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || $line[0] === '#') continue;
            [$k, $v] = array_pad(explode('=', $line, 2), 2, '');
            $k = trim($k); $v = trim(trim($v), '"\'');
            if ($k !== '' && getenv($k) === false && !isset($_ENV[$k])) {
                $_ENV[$k] = $v; putenv("$k=$v");
            }
        }
        if (isset($_ENV['DB_NAME'])) break;
    }
}
function envv(string $key, $default = null) {
    return $_ENV[$key] ?? getenv($key) ?: $default;
}
function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    load_env(dirname(__DIR__, 2));
    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
        envv('DB_HOST', 'localhost'), envv('DB_PORT', '3306'), envv('DB_NAME', 'belilokal'));
    $pdo = new PDO($dsn, envv('DB_USER', 'root'), envv('DB_PASS', ''), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    return $pdo;
}
