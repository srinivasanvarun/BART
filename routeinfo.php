<?php
	header("Content-Type:application/json");
	if(!empty($_GET['src'])){
	$route=$_GET['route'];
	$url = "http://api.bart.gov/api/route.aspx?cmd=routeinfo&route=".$route."&key=MW9S-E7SL-26DU-VV8V";
	$fileContents= file_get_contents($url);
	$fileContents = str_replace(array("\n", "\r", "\t"), '', $fileContents);
	$fileContents = trim(str_replace('"', "'", $fileContents));
	$simpleXml = simplexml_load_string($fileContents);
	$json = json_encode($simpleXml);
	echo $json;
	}
	else{
	$url = "http://api.bart.gov/api/route.aspx?cmd=routeinfo&route=4&key=MW9S-E7SL-26DU-VV8V";
	$fileContents= file_get_contents($url);
	$fileContents = str_replace(array("\n", "\r", "\t"), '', $fileContents);
	$fileContents = trim(str_replace('"', "'", $fileContents));
	$simpleXml = simplexml_load_string($fileContents);
	$json = json_encode($simpleXml);
	echo $json;
	}
?>