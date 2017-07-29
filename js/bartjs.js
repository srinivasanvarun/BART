  function parseTime(timeString){
    if (timeString == '') return null;
    var d = new Date();
    var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);
    d.setHours( parseInt(time[1],10) + ( ( parseInt(time[1],10) < 12 && time[4] ) ? 12 : 0) );
    d.setMinutes( parseInt(time[3],10) || 0 );
    d.setSeconds(0, 0);
    return d;
  }

  var directionsService, directionsDisplay, map;
  function initMap() {
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer;
    map = new google.maps.Map(document.getElementById('googleMap'), {
      zoom: 10,
      center: {lat: 37.80467476, lng: -122.2945822}
    });
    directionsDisplay.setMap(map);
  }

  function calculateAndDisplayRoute(src,dst) {
    console.log(src);
    console.log(dst);
      directionsService.route({
        origin: src,
        destination: dst,
        travelMode: 'TRANSIT'
      }, function(response, status) {
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    }

  //Populating dropdown list
  function loadStations(){
    var req = new XMLHttpRequest();
    req.open('GET','/stations');
    req.onload=function(){
      var json1 = req.responseText;
      var json = JSON.parse(json1);
      var sopt = '<select id="sourcestn" class="w3-padding w3-border"><option value="">---Station of departure---</option>';
      var dopt = '<select id="deststn" class="w3-padding w3-border"><option value="">---Station of arrival---</option>';
      for (var i = 0; i<json.stations.station.length; i++) {
        sopt += '<option value="'+json.stations.station[i].abbr+'">'+json.stations.station[i].name+'</option>';
        dopt += '<option value="'+json.stations.station[i].abbr+'">'+json.stations.station[i].name+'</option>';
      }
      sopt+='</select>';
      dopt+='</select>';
      document.getElementById("sourcedd").insertAdjacentHTML('beforeend',sopt);
      document.getElementById("destinationdd").insertAdjacentHTML('beforeend',dopt);
    };
    req.send();
  }

  //populate Station Info
  function populateStationInfo(srchstn, id, type){
    var xml = new XMLHttpRequest();
    xml.open('GET', '/station/'+srchstn);
    xml.onload = function(){
      var json = JSON.parse(xml.responseText);
      var htmlstmt = "<hr><p>Station: <b>"+json.stations.station.name+"</b></p>";
      htmlstmt += "<p>Address: "+json.stations.station.address+", "+json.stations.station.city+", "+json.stations.station.state+" "+json.stations.station.zipcode+"</p>";
      htmlstmt += "<p><u>Towards North:</u></p>";
      htmlstmt += '<p><ul><li>Routes: ';
      if(json.stations.station.north_routes.route != undefined){
        for(var i=0; i<json.stations.station.north_routes.route.length; i++){
          if(i!=json.stations.station.north_routes.route.length-1){
            htmlstmt += json.stations.station.north_routes.route[i]+", ";
          }
          else{
            htmlstmt += json.stations.station.north_routes.route[i];
          }
        }
      }else{
          htmlstmt+=' -- </li>';
      }
      htmlstmt += "</li>";
      htmlstmt += "<li>Platform: "+json.stations.station.north_platforms.platform+"</li></ul></p>";
      htmlstmt += "<p><u>Towards South:</u></p>";
      htmlstmt += '<p><ul><li>Routes: ';
      if(json.stations.station.south_routes.route != undefined){
        for(var i=0; i<json.stations.station.south_routes.route.length; i++){
          if(i!=json.stations.station.south_routes.route.length-1){
            htmlstmt += json.stations.station.south_routes.route[i]+", ";
          }
          else{
            htmlstmt += json.stations.station.south_routes.route[i];
          }
        }
      }else{
        htmlstmt+=' -- ';
      }
      htmlstmt += "</li>";
      htmlstmt += "<li>Platform: "+json.stations.station.south_platforms.platform+"</li></ul></p>";
      document.getElementById(id).insertAdjacentHTML('beforeend',htmlstmt);
      if(type=='src'){
        window.srclat=json.stations.station.gtfs_latitude;
        window.srclong=json.stations.station.gtfs_longitude;
      }
      else{
        window.destlat=json.stations.station.gtfs_latitude;
        window.destlong=json.stations.station.gtfs_longitude;
      }
    };
    xml.send();
  }

  function getLatLongMap() {
      calculateAndDisplayRoute(window.srclat+','+window.srclong,window.destlat+','+window.destlong);
  }

  //populate Route Info
  function populateRouteInfo(src, des){
    var xml = new XMLHttpRequest();
    xml.open('GET', '/route/'+src+'/'+des);
    xml.onload = function(){
      var json = JSON.parse(xml.responseText);
      var sdate = json.schedule['request']['trip']['@attributes']['origTimeDate'];
      var stime = json.schedule['request']['trip']['@attributes']['origTimeMin'];
      var ufare = json.schedule['request']['trip']['@attributes']['fare'];
      var cfare = json.schedule['request']['trip']['@attributes']['clipper'];
      var dtime = json.schedule['request']['trip']['@attributes']['destTimeMin'];
      var htmlstmt = "<hr><ul>";
      htmlstmt += "<li><b>Fare: </b><ul><li>Cash: "+ufare+"</li><li>Clipper Card: "+cfare+"</li></ul></li>";
      htmlstmt += "<li><b>Times: </b><ul><li>Start Time: "+stime+"</li><li>Destination Time: "+dtime+"</li></ul></li>";
      htmlstmt += "</ul>";
      if(json.schedule['request']['trip']['leg'].length>1){
        srctwd = json.schedule['request']['trip']['leg'][0]['@attributes']['trainHeadStation'];
        linktwd = json.schedule['request']['trip']['leg'][1]['@attributes']['trainHeadStation'];
        htmlstmt+="<ul><li><b>Links:</b></li><ul>";
        for(var i=0; i< json.schedule['request']['trip']['leg'].length; i++){
          var ori = json.schedule['request']['trip']['leg'][i]['@attributes']['origin'];
          var desti = json.schedule['request']['trip']['leg'][i]['@attributes']['destination'];
          htmlstmt+="<li>"+ori+" to "+desti+"</li>";
        }
        htmlstmt+="</ul></ul>";
      }
      else{
        srctwd = json.schedule['request']['trip']['leg']['@attributes']['trainHeadStation'];
      }
      document.getElementById("MoreInfo").insertAdjacentHTML('beforeend',htmlstmt);
      var xml2 = new XMLHttpRequest();
      xml2.open('GET', '/estimate/'+src);
      xml2.onload = function(){
        var json2 = JSON.parse(xml2.responseText);
        console.log(json2);
        if(json2.station.etd.length>1){
          for(var k=0; k<json2.station.etd.length; k++){
            if(srctwd == json2.station.etd[k].abbreviation){
              flinkest = json2.station.etd[k].estimate[0].minutes;
              console.log(flinkest);
            }
          }
        }
        else{
          flinkest = json2.station.etd.estimate[0].minutes;
        }
        if(flinkest>1){
          function countdown(minutes) {
            var seconds = 60;
            var mins = minutes;
            function tick() {
              //This script expects an element with an ID = "counter". You can change that to what ever you want. 
              var current_minutes = mins-1;
              seconds--;
              document.getElementById("CountDown").innerHTML = String(current_minutes) + ":" + (seconds < 10 ? "0" : "") + String(seconds)+" left to board the train from "+src+" towards "+srctwd;
              if( seconds > 0 ) {
                  setTimeout(tick, 1000);
              } else {
                  if(mins > 1){
                      countdown(mins-1);           
                  }
                  else{
                    document.getElementById("CountDown").innerHTML = "<h5>No Trains now! Come back later.</h5>";
                    document.getElementById('id02').style.display='block';
                  }
              }
            }
            tick();
          }
          countdown(parseInt(flinkest));
        }
        else{
          if(flinkest==1){
            document.getElementById("CountDown").innerHTML = "<h5>Leaving in leass than 1 minute.</h5>";
          }
          else{
            document.getElementById("CountDown").innerHTML = "<h5>LEAVING</h5>";
            document.getElementById('id02').style.display='block';
          }
        }
      }
      xml2.send();
      document.getElementById("MapButton").innerHTML = "<input class='w3-btn w3-dark-grey w3-center' id='mapbtn' type='button' name='submit' value='Show Map' onclick='getLatLongMap()'>";
    };
    xml.send();
  }

  //Form validate
  function validate(){
    var s = document.getElementById("sourcestn").value;
    var d = document.getElementById("deststn").value;
    if(s==d){
      alert("Source and destination stations are the same.");
    }
    else if(s==null || s==""){
      alert("Source station is empty!");
    }
    else if(d==null || d==""){
      alert("Destination station is empty!");
    }
    else if(s=="" && d==""){
      alert("Both source and destination stations are empty!");
    }
    else{
      document.getElementById("SourceInfo").innerHTML = '';
      populateStationInfo(s,"SourceInfo","src");
      document.getElementById("DestInfo").innerHTML = '';
      populateStationInfo(d,"DestInfo","dest");
      //document.getElementById("MoreInfo").innerHTML = '';
      //document.getElementById("CountDown").innerHTML = '';
      //populateRouteInfo(s,d);
    }
  }

  //to populate station dropdown values and show maps
  function init(){
    loadStations();
    initMap();
  }