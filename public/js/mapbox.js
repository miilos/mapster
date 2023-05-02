const mapDom = document.getElementById('map')
let map = undefined

if(mapDom) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibWlsb3MtcG9wIiwiYSI6ImNsZzgzd3R6dDBkNWkza3BpNWUzMjdxZXgifQ.JY5kYTwjAXsJ5vXnF6mPYQ';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/milos-pop/clg84olui004901lal3h5ps87',
        center: [ 19.6301, 45.8129 ],
        zoom: 12
    });
}

export default map