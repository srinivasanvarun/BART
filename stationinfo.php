<?php
	header("Content-Type:application/json");
	if(!empty($_GET['stn'])){
	$stn=$_GET['stn'];
	$url = "http://api.bart.gov/api/stn.aspx?cmd=stninfo&orig=".$stn."&key=MW9S-E7SL-26DU-VV8V";
	$fileContents= file_get_contents($url);
	$fileContents = str_replace(array("\n", "\r", "\t"), '', $fileContents);
	$fileContents = trim(str_replace('"', "'", $fileContents));
	$simpleXml = simplexml_load_string($fileContents);
	$json = json_encode($simpleXml);
	echo $json;
	}
	else{
	$url = "http://api.bart.gov/api/stn.aspx?cmd=stninfo&key=MW9S-E7SL-26DU-VV8V";
	$fileContents= file_get_contents($url);
	$fileContents = str_replace(array("\n", "\r", "\t"), '', $fileContents);
	$fileContents = trim(str_replace('"', "'", $fileContents));
	$simpleXml = simplexml_load_string($fileContents);
	$json = json_encode($simpleXml);
	echo $json;
	}
?>


