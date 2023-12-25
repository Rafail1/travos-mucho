<?php

class Proxy
{
    public static $TARGET_URL = 'http://185.240.103.219:8080';


    public static function run($path)
    {


        $jsonurl = static::$TARGET_URL . $path . '?' . $_SERVER['QUERY_STRING'];
        $json = file_get_contents($jsonurl);
        header('Content-type: application/json');
        header('Access-Control-Allow-Origin: *');
        header_remove('Location');
        echo $json;
        http_response_code(200);
        exit;
    }
}
