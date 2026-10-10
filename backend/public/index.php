<?php
// Front controller + router. Jalankan: php -S localhost:8000 -t backend/public
// (lalu import schema.sql ke MySQL belilokal)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers.php';
foreach (glob(__DIR__ . '/../src/Services/*.php') as $f) require_once $f;
foreach (glob(__DIR__ . '/../src/Controllers/*.php') as $f) require_once $f;
foreach (glob(__DIR__ . '/../src/Models/*.php') as $f) require_once $f;

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
// Dukung docroot di project-root (/api/...) maupun subfolder (/e-commerce/api/...)
$path = preg_replace('#^.*/api(?=/|$)#', '', $uri);
if ($path === '' || $path === false) $path = '/';
$method = $_SERVER['REQUEST_METHOD'];
$body = [];
if (str_contains($_SERVER['CONTENT_TYPE'] ?? '', 'application/json')) {
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
} else {
    $body = $_POST;
}

// Static uploads
if (str_starts_with($path, '/uploads/') && $method === 'GET') {
    $f = __DIR__ . $path;
    if (is_file($f)) { header('Content-Type: ' . mime_content_type($f)); readfile($f); exit; }
    http_response_code(404); exit('Not found');
}

$route = function (string $m, string $pattern, callable $fn) use ($method, $path) {
    if ($method !== $m) return false;
    if (preg_match($pattern, $path, $matches)) { $fn($matches); return true; }
    return false;
};

// ---- Auth ----
if ($route('POST', '#^/auth/register$#', fn() => AuthController::register($body))) exit;
if ($route('POST', '#^/auth/login$#', fn() => AuthController::login($body))) exit;
if ($route('POST', '#^/auth/logout$#', fn() => AuthController::logout())) exit;
if ($route('GET', '#^/auth/me$#', fn() => AuthController::me(auth_user()))) exit;

// ---- Katalog ----
if ($route('GET', '#^/categories$#', fn() => ProductController::categories())) exit;
if ($route('GET', '#^/products$#', fn() => ProductController::index())) exit;
if ($route('GET', '#^/products/(.+)$#', fn($m) => ProductController::show(urldecode($m[1])))) exit;

// ---- Shipping & payment ----
if ($route('GET', '#^/shipping/cities$#', fn() => ShippingController::cities())) exit;
if ($route('POST', '#^/shipping/calculate$#', fn() => ShippingController::calculate($body))) exit;
if ($route('POST', '#^/webhooks/midtrans$#', fn() => PaymentController::webhook($body))) exit;
if ($route('POST', '#^/payments/simulate/(.+)$#', fn($m) => PaymentController::simulate(auth_user(), urldecode($m[1])))) exit;

// ---- Cart & checkout & orders (buyer) ----
if ($route('GET', '#^/cart$#', fn() => CartController::index(auth_user()))) exit;
if ($route('POST', '#^/cart$#', fn() => CartController::store(auth_user(), $body))) exit;
if ($route('DELETE', '#^/cart$#', fn() => CartController::clear(auth_user()))) exit;
if ($route('PUT', '#^/cart/(.+)$#', fn($m) => CartController::update(auth_user(), $m[1], $body))) exit;
if ($route('DELETE', '#^/cart/(.+)$#', fn($m) => CartController::destroy(auth_user(), $m[1]))) exit;
if ($route('POST', '#^/checkout$#', function () use ($body) {
    $u = auth_user(); require_role($u, 'buyer', 'admin', 'seller');
    OrderController::checkout($u, $body);
})) exit;
if ($route('GET', '#^/orders$#', fn() => OrderController::index(auth_user()))) exit;
if ($route('GET', '#^/orders/(.+)/label$#', fn($m) => OrderController::label(auth_user(), urldecode($m[1])))) exit;
if ($route('GET', '#^/orders/(.+)$#', fn($m) => OrderController::show(auth_user(), urldecode($m[1])))) exit;

// ---- Seller ----
if ($route('GET', '#^/seller/products$#', function () { $u=auth_user(); require_role($u,'seller','admin'); SellerController::products($u); })) exit;
if ($route('POST', '#^/seller/products$#', function () { $u=auth_user(); require_role($u,'seller','admin'); SellerController::store($u); })) exit;
if ($route('PUT', '#^/seller/products/(.+)$#', function ($m) { $u=auth_user(); require_role($u,'seller','admin'); SellerController::update($u,$m[1]); })) exit;
if ($route('PATCH', '#^/seller/products/(.+)$#', function ($m) { $u=auth_user(); require_role($u,'seller','admin'); SellerController::update($u,$m[1]); })) exit;
if ($route('DELETE', '#^/seller/products/(.+)$#', function ($m) { $u=auth_user(); require_role($u,'seller','admin'); SellerController::destroy($u,$m[1]); })) exit;
if ($route('GET', '#^/seller/orders$#', function () { $u=auth_user(); require_role($u,'seller','admin'); SellerController::orders($u); })) exit;
if ($route('PATCH', '#^/seller/orders/(.+)/tracking$#', function ($m) use ($body) { $u=auth_user(); require_role($u,'seller','admin'); SellerController::tracking($u,urldecode($m[1]),$body); })) exit;

// ---- Admin ----
if ($route('GET', '#^/admin/stats$#', function () { $u=auth_user(); require_role($u,'admin'); AdminController::stats(); })) exit;
if ($route('GET', '#^/admin/users$#', function () { $u=auth_user(); require_role($u,'admin'); AdminController::users(); })) exit;
if ($route('GET', '#^/admin/orders$#', function () { $u=auth_user(); require_role($u,'admin'); AdminController::orders(); })) exit;
if ($route('GET', '#^/admin/shops$#', function () { $u=auth_user(); require_role($u,'admin'); AdminController::shops(); })) exit;
if ($route('PATCH', '#^/admin/shops/(.+)/verify$#', function ($m) { $u=auth_user(); require_role($u,'admin'); AdminController::verifyShop($m[1]); })) exit;

json_response(['status'=>'error','message'=>"Endpoint tidak ditemukan: $method $path"],404);
