<?php
	header("Content-Type:application/json");
	$url = "http://api.bart.gov/api/stn.aspx?cmd=stns&key=MW9S-E7SL-26DU-VV8V";
	$fileContents= file_get_contents($url);
	$fileContents = str_replace(array("\n", "\r", "\t"), '', $fileContents);
	$fileContents = trim(str_replace('"', "'", $fileContents));
	$simpleXml = simplexml_load_string($fileContents);
	$json = json_encode($simpleXml);
	deliver_response(200, "Stations List", $json);

	function deliver_response($status, $status_message, $data){
		header("HTTP/1.1 $status $status_message");
		echo $data;
	}
	
?>