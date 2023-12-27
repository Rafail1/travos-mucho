<?
$jsonurl = 'https://fapi.binance.com/fapi/v1/exchangeInfo';
$json = file_get_contents($jsonurl);
header('Content-type: application/json');
header('Access-Control-Allow-Origin: *');
echo $json;
http_response_code(200);
exit;