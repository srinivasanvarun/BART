<?php
	header("Content-Type:application/json");
	if((!empty($_GET['src']))&&(!empty($_GET['dest']))){
	$src=$_GET['src'];
	$dest=$_GET['dest'];
	$url = "http://api.bart.gov/api/sched.aspx?cmd=depart&orig=".$src."&dest=".$dest."&date=now&key=MW9S-E7SL-26DU-VV8V&b=0&a=1";
	$fileContents= file_get_contents($url);
	$fileContents = str_replace(array("\n", "\r", "\t"), '', $fileContents);
	$fileContents = trim(str_replace('"', "'", $fileContents));
	$simpleXml = simplexml_load_string($fileContents);
	$json = json_encode($simpleXml);
	echo $json;
	}
	else{
	$url = "http://api.bart.gov/api/sched.aspx?cmd=depart&key=MW9S-E7SL-26DU-VV8V&b=0&a=3";
	$fileContents= file_get_contents($url);
	$fileContents = str_replace(array("\n", "\r", "\t"), '', $fileContents);
	$fileContents = trim(str_replace('"', "'", $fileContents));
	$simpleXml = simplexml_load_string($fileContents);
	$json = json_encode($simpleXml);
	echo $json;
	}
?>