<?php
// Fallback Hostinger / LiteSpeed si index.html n'est pas servi.
header("Content-Type: text/html; charset=UTF-8");
readfile(__DIR__ . "/index.html");
