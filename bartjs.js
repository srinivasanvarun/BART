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
    map = new google.maps.Map(document.getElementById('map'), {
      zoom: 7,
      center: {lat: 41.85, lng: -87.65}
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

  function mapMarker(){
    var lat1 = parseFloat(localStorage.getItem('lat1'));
    var long1 = parseFloat(localStorage.getItem('long1'));
    var lat2 = parseFloat(localStorage.getItem('lat2'));
    var long2 = parseFloat(localStorage.getItem('long2'));
    console.log(lat1+", "+long1+", "+lat2+", "+long2);

    calculateAndDisplayRoute(lat1+','+long1,lat2+','+long2);
    
    //destroying localStorage variables after displaying the route.
    localStorage.removeItem(lat1);
    localStorage.removeItem(long1);
    localStorage.removeItem(lat2);
    localStorage.removeItem(long2);
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
  function populateStationInfo(srchstn, id){
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
      if(localStorage.getItem('lat1')!=null||localStorage.getItem('long1')!=null){
        localStorage.setItem("lat2",json.stations.station.gtfs_latitude);
        localStorage.setItem("long2",json.stations.station.gtfs_longitude);
      }else{
        localStorage.setItem("lat1",json.stations.station.gtfs_latitude);
        localStorage.setItem("long1",json.stations.station.gtfs_longitude);
      }
    };
    xml.send();
  }


  //populate Route Info
  function populateRouteInfo(src, des){
    var xml = new XMLHttpRequest();
    xml.open('GET', '/route/'+src+'/'+des);
    xml.onload = function(){
      var json = JSON.parse(xml.responseText);
      var stime = json.schedule['request']['trip']['@attributes']['origTimeMin'];
      var ufare = json.schedule['request']['trip']['@attributes']['fare'];
      var cfare = json.schedule['request']['trip']['@attributes']['clipper'];
      var dtime = json.schedule['request']['trip']['@attributes']['destTimeMin'];
      var htmlstmt = "<hr><ul>";
      htmlstmt += "<li><b>Fare: </b><ul><li>Cash: "+ufare+"</li><li>Clipper Card: "+cfare+"</li></ul></li>";
      htmlstmt += "<li><b>Times: </b><ul><li>Start Time: "+stime+"</li><li>Destination Time: "+dtime+"</li></ul></li>";
      htmlstmt += "</ul>";
      document.getElementById("MoreInfo").insertAdjacentHTML('beforeend',htmlstmt);
      var x = setInterval(function() {
        var now = new Date().getTime();
        var time = parseTime(stime);
        var distance = time - now;

        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the element with id="demo"
        document.getElementById("CountDown").innerHTML = "Time left to board: <b>"+ hours + "h "+ minutes + "m " + seconds + "s </b>";

        // If the count down is finished, write some text 
        if (distance < 0) {
          clearInterval(x);
          document.getElementById("CountDown").innerHTML = "<h5>EXPIRED</h5>";
          document.getElementById('id02').style.display='block';
        }
      }, 1000);
    };
    xml.send();
  }

  //Form validate
  function validate(){
    document.getElementById("results").style = "display:block;";
    document.getElementById("extras").style = "display:block;";
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
      populateStationInfo(s,"SourceInfo");
      document.getElementById("DestInfo").innerHTML = '';
      populateStationInfo(d,"DestInfo");
      document.getElementById("MoreInfo").innerHTML = '';
      document.getElementById("CountDown").innerHTML = '';
      populateRouteInfo(s,d);
      mapMarker();
    }
  }

  //to populate station dropdown values and show maps
  function init(){
    loadStations();
  }