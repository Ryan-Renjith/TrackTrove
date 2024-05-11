mapboxgl.accessToken = mapBoxToken;
const map = new mapboxgl.Map({
	container: 'map', 
	style: 'mapbox://styles/mapbox/streets-v12', 
	center: JSON.parse(trackCoord), 
	zoom: 12, 
});

map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');



new mapboxgl.Marker()
    .setLngLat(JSON.parse(trackCoord))
    .addTo(map);