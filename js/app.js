
var sacCoffee = [
		{"name": "The Coffee Garden", "location": "2904 Franklin Blvd, Sacramento, California", "lat": "38.551855", "lng": "-121.476191"},
		{"name": "Naked Lounge", "location": "1500 Q St, Sacramento, CA", "lat": "38.570534", "lng": "-121.489782"},
		{"name": "Chocolate Fish Coffee", "location": "400 P St #1203, Sacramento, CA", "lat": "38.575240", "lng": "-121.504537"},
        {"name": "Temple Coffee Roasters", "location": "2829 S St, Sacramento, CA", "lat": "38.564003", "lng": "-121.472401"},
        {"name": "Insight Coffee Roasters", "location": "1901 8th St, Sacramento, CA", "lat": "38.570874", "lng": "-121.500213"},		
];

// Initializes the Google Map centered on Sacramento.
var map, coords, infowindow;
function initMap() {

	var mapCanvas = document.getElementById('map');
	var mapOptions = {
		center: new google.maps.LatLng(38.565764,-121.478851),
		zoom: 13,
		mapTypeId:google.maps.MapTypeId.TERRAIN 
	};
	map = new google.maps.Map(mapCanvas, mapOptions);

	
	for (var i = 0; i < sacCoffee.length; i++){
		coords = new google.maps.LatLng(sacCoffee[i].lat, sacCoffee[i].lng);
		sacCoffee[i].marker = new google.maps.Marker({
			position: coords,			
			map: map,
			title: sacCoffee[i].name
		});
		sacCoffee[i].marker.addListener('click', (function(cafe) {
			return function() {
				clickData(cafe);
			};
		})(sacCoffee[i]));
	}
    infowindow = new google.maps.InfoWindow({});
    ko.applyBindings(new ViewModel());
}



//returns a string that is used to create the html elements of the popup
function createContent(cafe) {
	var popupData = "<h3>" + cafe.name + "</h3>" +
		"<div>"+cafe.location+"</div>" +		
		"<div class='donuts'>Nearby Donuts Shops</div>";
	return popupData;
}

//Ajax to Foursquare api
function clickData(cafe) {
	cafe.marker.setAnimation(google.maps.Animation.BOUNCE);
	setTimeout(function(){ cafe.marker.setAnimation(null); }, 1400);
	var url = "https://api.foursquare.com/v2/venues/search?client_id=DFSRRW1BTSRYP0FGOATX4WMZNX2ZZ2GJVYAFYTFW3AFDLLYZ&client_secret=OOMCJTA1EQEC30YGXASCJDIZCVRIPWZZYD0NLRGFIEYERKHS&v=20160221"+
		"&ll="+cafe.lat+","+cafe.lng+"&query=donuts"+"&limit=5"+"&radius=2000";
	var html = "";
	$.getJSON(url, function (data) {
        for (var i=0; i < data.response.venues.length; i++) {
        	html += "<div><a href='https://foursquare.com/v/"+data.response.venues[i].id+"'>"+data.response.venues[i].name+"</a></div>";
        }
        if(html === "") html = "There are no donuts shops close enough to get to before your coffee got cold.";
        infowindow.setContent(createContent(cafe) + html);
		infowindow.open(map, cafe.marker);
        //error handling
    }).error(function(e){
        console.log("Problem with foursquare: " + e);
        html = "<div>We're sorry, something went wrong with your request.</div>";
        infowindow.setContent(createContent(cafe) + html);
		infowindow.open(map, cafe.marker);
    });
}

// Filter
var ViewModel = function() {
	var self = this;
	self.filter = ko.observable("");
	self.viewCafe = ko.computed( function() {
		var coffeeArr = [];
		sacCoffee.forEach(function(cafe) {
			if (cafe.name.toLowerCase().indexOf(self.filter().toLowerCase()) > -1) {
				coffeeArr.push(cafe);
				cafe.marker.setVisible(true);
			}else cafe.marker.setVisible(false);		
		});
		return coffeeArr;
	});	
	self.select = function(parent) {
		clickData(parent);
	};
};

