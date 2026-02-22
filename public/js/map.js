// public/js/map.js
document.addEventListener("DOMContentLoaded", () => {
    const map = L.map('map').setView(mapCoordinates, 12); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // 1. Red Color ka Icon define karo
    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    // 2. Marker banate waqt '{ icon: redIcon }' pass karo
    L.marker(mapCoordinates, { icon: redIcon }).addTo(map)
        .bindPopup(`<h6>${mapLocationName}</h6><p>Exact location after booking</p>`)
        .openPopup();
        
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
});