<?php
class AuthController {
    public static function register(array $b): void {
        $name=$b['name']??''; $email=strtolower(trim($b['email']??''));
        $pw=$b['password']??''; $role=in_array($b['role']??'buyer',['buyer','seller'],true)?$b['role']:'buyer';
        $errs=[];
        if (strlen($name)<3) $errs['name'][]='Nama minimal 3 karakter.';
        if (!filter_var($email,FILTER_VALIDATE_EMAIL)) $errs['email'][]='Email tidak valid.';
        if (strlen($pw)<8) $errs['password'][]='Password minimal 8 karakter.';
        if (($b['password_confirmation']??$pw)!==$pw) $errs['password'][]='Konfirmasi password tidak cocok.';
        if ($errs) json_response(['status'=>'error','message'=>'Validasi gagal.','errors'=>$errs],422);
        $pdo=db();
        $c=$pdo->prepare('SELECT id FROM users WHERE email=? LIMIT 1'); $c->execute([$email]);
        if ($c->fetch()) json_response(['status'=>'error','message'=>'Email sudah terdaftar.','errors'=>['email'=>['Email sudah terdaftar.']]],422);
        $pdo->prepare('INSERT INTO users (name,email,password,role,phone) VALUES (?,?,?,?,?)')
            ->execute([$name,$email,password_hash($pw,PASSWORD_DEFAULT),$role,$b['phone']??null]);
        $id=(int)$pdo->lastInsertId();
        if ($role==='seller') {
            $shopName=trim($b['shop_name']??($name."'s Shop"));
            $slug=slugify($shopName); $i=0;
            $chk=$pdo->prepare('SELECT id FROM shops WHERE slug=? LIMIT 1');
            $base=$slug; while(true){ $chk->execute([$slug]); if(!$chk->fetch()) break; $slug=$base.'-'.(++$i); }
            $pdo->prepare('INSERT INTO shops (user_id,name,slug,address,city_id,city_name,province) VALUES (?,?,?,?,?,?,?)')
                ->execute([$id,$shopName,$slug,$b['shop_address']??null,$b['city_id']??'',$b['city_name']??'',($b['province_name']??$b['province']??'')]);
        }
        $tok=bin2hex(random_bytes(32));
        $pdo->prepare('INSERT INTO user_tokens (token,user_id) VALUES (?,?)')->execute([$tok,$id]);
        $u=$pdo->prepare('SELECT * FROM users WHERE id=?'); $u->execute([$id]); $user=$u->fetch(); unset($user['password']);
        if ($role==='seller'){ $s=$pdo->prepare('SELECT * FROM shops WHERE user_id=? LIMIT 1'); $s->execute([$id]); if($sh=$s->fetch()) $user['shop']=format_shop($sh); }
        json_response(['status'=>'success','token'=>$tok,'user'=>$user],201);
    }
    public static function login(array $b): void {
        $st=db()->prepare('SELECT * FROM users WHERE email=? LIMIT 1');
        $st->execute([strtolower(trim($b['email']??''))]);
        $u=$st->fetch();
        if (!$u || !password_verify($b['password']??'', $u['password']))
            json_response(['status'=>'error','message'=>'Email atau password salah.'],401);
        $tok=bin2hex(random_bytes(32));
        db()->prepare('INSERT INTO user_tokens (token,user_id) VALUES (?,?)')->execute([$tok,$u['id']]);
        unset($u['password']);
        if ($u['role']==='seller'){ $s=db()->prepare('SELECT * FROM shops WHERE user_id=? LIMIT 1'); $s->execute([$u['id']]); if($sh=$s->fetch()) $u['shop']=format_shop($sh); }
        json_response(['status'=>'success','token'=>$tok,'user'=>$u]);
    }
    public static function logout(): void {
        $t=bearer_token();
        if ($t) db()->prepare('DELETE FROM user_tokens WHERE token=?')->execute([$t]);
        json_response(['status'=>'success','message'=>'Berhasil logout.']);
    }
    public static function me(array $u): void { json_response(['status'=>'success','data'=>$u,'user'=>$u]); }
}
