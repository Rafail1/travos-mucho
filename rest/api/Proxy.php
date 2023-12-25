<?php
use CURLFile;
use Exception;
use RuntimeException;

class Proxy
{
    /**
     * Your private auth key. It is recommended to change it.
     * If you installed the package via composer, call `Proxy::$AUTH_KEY = '<your-new-key>';` before running the proxy.
     * If you copied this file, change the value here in place.
     * @var string
     */
    public static $AUTH_KEY = '';

    /**
     * Set this to false to disable authorization. Useful for debugging, not recommended in production.
     * @var bool
     */
    public static $ENABLE_AUTH = false;

    /**
     * If true, PHP safe mode compatibility will not be checked
     * (you may not need it if no POST files are sent over proxy)
     * @var bool
     */
    public static $IGNORE_SAFE_MODE = false;

    /**
     * Enable debug mode (you can do it by sending Proxy-Debug header as well).
     * This value overrides any value specified in Proxy-Debug header.
     * @var bool
     */
    public static $DEBUG = false;

    /**
     * When set to false the fetched header is not included in the result
     * @var bool
     */
    public static $CURLOPT_HEADER = false;

    /**
     * When set to false the fetched result is echoed immediately instead of waiting for the fetch to complete first
     * @var bool
     */
    public static $CURLOPT_RETURNTRANSFER = true;

    /**
     * Target URL is set via Proxy-Target-URL header. For debugging purposes you might set it directly here.
     * This value overrides any value specified in Proxy-Target-URL header.
     * @var string
     */
    public static $TARGET_URL = 'http://185.240.103.219:8080';

    /**
     * Name of remote debug header
     * @var string
     */
    public static $HEADER_HTTP_PROXY_DEBUG = 'HTTP_PROXY_DEBUG';

    /**
     * Name of the proxy auth key header
     * @var string
     */
    public static $HEADER_HTTP_PROXY_AUTH = 'HTTP_PROXY_AUTH';

    /**
     * Name of the target url header
     * @var string
     */
    public static $HEADER_HTTP_PROXY_TARGET_URL = 'HTTP_PROXY_TARGET_URL';

    /**
     * Line break for debug purposes
     * @var string
     */
    protected static $HR = PHP_EOL . PHP_EOL . '----------------------------------------------' . PHP_EOL . PHP_EOL;

    /**
     * @return string[]
     */
    protected static function getSkippedHeaders()
    {
        return [
            static::$HEADER_HTTP_PROXY_TARGET_URL,
            static::$HEADER_HTTP_PROXY_AUTH,
            static::$HEADER_HTTP_PROXY_DEBUG,
            'HTTP_HOST',
            'HTTP_ACCEPT_ENCODING'
        ];
    }

    /**
     * Return variable or default value if not set
     * @param mixed $variable
     * @param mixed|null $default
     * @return mixed
     * @noinspection PhpParameterByRefIsNotUsedAsReferenceInspection
     */
    protected static function ri(&$variable, $default = null)
    {
        if (isset($variable)) {
            return $variable;
        } else {
            return $default;
        }
    }

    /**
     * @param string $message
     */
    protected static function exitWithError($message)
    {
        http_response_code(500);
        echo 'PROXY ERROR: ' . $message;
        exit(500);
    }

    /**
     * @return bool
     */
    public static function isInstalledWithComposer()
    {
        $autoloaderPath = join(DIRECTORY_SEPARATOR, [dirname(dirname(__DIR__)), 'autoload.php']);
        return is_readable($autoloaderPath);
    }

    /**
     * @return void
     */
    public static function registerErrorHandlers()
    {
        set_error_handler(function ($code, $message, $file, $line) {
            Proxy::exitWithError("($code) $message in $file at line $line");
        }, E_ALL);

        set_exception_handler(function (Exception $ex) {
            Proxy::exitWithError("{$ex->getMessage()} in {$ex->getFile()} at line {$ex->getLine()}");
        });
    }

    /**
     * @return void
     */
    public static function checkCompatibility()
    {
        if (!static::$IGNORE_SAFE_MODE && function_exists('ini_get') && ini_get('safe_mode')) {
            throw new RuntimeException('Safe mode is enabled, this may cause problems with uploading files');
        }

        if (!function_exists('curl_init')) {
            throw new RuntimeException('libcurl is not installed on this server');
        }

        if (!function_exists('gzdecode')) {
            throw new RuntimeException('gzip is not installed on this server');
        }
    }

    /**
     * @return bool
     */
    protected static function hasCURLFileSupport()
    {
        return class_exists('CURLFile');
    }

    /**
     * @param string $headerString
     * @return string[]
     */
    protected static function splitResponseHeaders($headerString)
    {
        $results = [];
        $headerLines = preg_split('/[\r\n]+/', $headerString);
        foreach ($headerLines as $headerLine) {
            if (empty($headerLine)) {
                continue;
            }

            // Header contains HTTP version specification and path
            if (strpos($headerLine, 'HTTP/') === 0) {
                // Reset the output array as there may by multiple response headers
                $results = [];
                continue;
            }

            $results[] = "$headerLine";
        }

        return $results;
    }

    /**
     * Returns true if response code matches 2xx or 3xx
     * @param int $responseCode
     * @return bool
     */
    public static function isResponseCodeOk($responseCode)
    {
        return preg_match('/^[23]\d\d$/', $responseCode) === 1;
    }

    /**
     * @return string
     */
    protected static function getTargetUrl()
    {
        if (!empty(static::$TARGET_URL)) {
            $targetURL = static::$TARGET_URL;
        } else {
            $targetURL = static::ri($_SERVER[static::$HEADER_HTTP_PROXY_TARGET_URL]);
        }

        if (empty($targetURL)) {
            throw new RuntimeException(static::$HEADER_HTTP_PROXY_TARGET_URL . ' header is empty');
        }

        if (filter_var($targetURL, FILTER_VALIDATE_URL) === false) {
            throw new RuntimeException(static::$HEADER_HTTP_PROXY_TARGET_URL . ' "' . $targetURL . '" is invalid');
        }

        return $targetURL;
    }

    public static function run($path)
    {

        $targetURL = static::getTargetUrl();

        $jsonurl = $targetURL . $path . '?' . $_SERVER['QUERY_STRING'];
        $json = file_get_contents($jsonurl);
        echo $json;
    }
}
