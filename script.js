let map;
let mapGlobal;
let currentMarkers = [];
let lakeMarker = null;

// Community Spots aus localStorage laden
let communitySpots = JSON.parse(localStorage.getItem('communitySpots')) || [];

document.addEventListener('DOMContentLoaded', function() {
    loadCatches();
    initMap();
    loadCommunitySpots();

    document.getElementById('catch-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addCatch();
    });

    document.getElementById('map-form').addEventListener('submit', function(e) {
        e.preventDefault();
        searchFishingSpots();
    });

    document.getElementById('add-spot-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addCommunitySpot();
    });

    document.getElementById('fish-locations-form').addEventListener('submit', function(e) {
        e.preventDefault();
        searchGlobalLocations();
    });

    document.getElementById('community-filter-form').addEventListener('submit', function(e) {
        e.preventDefault();
        filterCommunitySpots();
    });

    document.getElementById('chat-form').addEventListener('submit', function(e) {
        e.preventDefault();
        sendChatMessage();
    });

    addChatMessage('🎣 <strong>Willkommen zur Fischer App!</strong><br>👋 Mit freundlichen Grüßen an unseren Partner:<br><a href="https://www.fischer-vereinigung.ch" target="_blank" style="color: var(--secondary-color); text-decoration: underline; font-weight: bold;">Fischer-Vereinigung Schweiz</a><br><br>Ich bin dein persönlicher Angel-Assistent. Frag mich alles über das Angeln!', 'ai');
});

// ===== COMMUNITY SPOTS FUNKTIONEN =====
function addCommunitySpot() {
    const lake = document.getElementById('spot-lake').value.trim();
    const fish = document.getElementById('spot-fish').value.trim();
    const name = document.getElementById('spot-name').value.trim();
    const lat = parseFloat(document.getElementById('spot-latitude').value);
    const lng = parseFloat(document.getElementById('spot-longitude').value);
    const description = document.getElementById('spot-description').value.trim();
    const username = document.getElementById('spot-username').value.trim();

    if (!lake || !fish || !name || !lat || !lng || !username) {
        alert('Bitte alle erforderlichen Felder ausfüllen!');
        return;
    }

    const spot = {
        id: Date.now(),
        lake,
        fish,
        name,
        lat,
        lng,
        description,
        username,
        addedDate: new Date().toLocaleDateString('de-DE'),
        timestamp: Date.now()
    };

    communitySpots.push(spot);
    localStorage.setItem('communitySpots', JSON.stringify(communitySpots));

    document.getElementById('add-spot-form').reset();

    const msg = document.createElement('div');
    msg.className = 'success-message';
    msg.innerHTML = `✅ <strong>Vielen Dank!</strong><br>📍 Dein Spot "${name}" wurde erfolgreich mit der Community geteilt!<br>👥 Andere Angler können deinen Tipp jetzt sehen und nutzen! 🎣`;
    document.getElementById('add-spot-section').appendChild(msg);

    setTimeout(() => msg.remove(), 5000);

    // Neu laden
    loadCommunitySpots();
    filterCommunitySpots();
}

function loadCommunitySpots() {
    const spotsList = document.getElementById('community-spots-list');
    
    if (communitySpots.length === 0) {
        spotsList.innerHTML = `
            <div class="no-community-spots">
                <i class="fas fa-comments"></i>
                <h3>Noch keine Community Spots</h3>
                <p>Sei der Erste und teile deinen besten Fangplatz mit anderen Anglern!</p>
            </div>
        `;
        return;
    }

    // Sortiere nach neuesten zuerst
    const sorted = [...communitySpots].sort((a, b) => b.timestamp - a.timestamp);
    
    spotsList.innerHTML = '';
    sorted.forEach(spot => {
        const card = document.createElement('div');
        card.className = 'community-spot-card';
        card.innerHTML = `
            <div class="community-badge">
                <i class="fas fa-users"></i> Community
            </div>
            <h3>
                <i class="fas fa-map-pin"></i> ${spot.name}
            </h3>
            <p>
                <i class="fas fa-fish"></i>
                <strong>${spot.fish}</strong>
            </p>
            <p>
                <i class="fas fa-water"></i>
                <strong>${spot.lake}</strong>
            </p>
            <p>
                <i class="fas fa-location-dot"></i>
                <span style="font-size: 0.85em;">${spot.lat.toFixed(4)}°, ${spot.lng.toFixed(4)}°</span>
            </p>
            ${spot.description ? `<p><i class="fas fa-pen"></i> ${spot.description}</p>` : ''}
            <span class="spot-user-badge">
                <i class="fas fa-user-circle"></i> ${spot.username}
            </span>
            <p class="spot-date">
                <i class="fas fa-calendar"></i> ${spot.addedDate}
            </p>
        `;
        spotsList.appendChild(card);
    });
}

function filterCommunitySpots() {
    const lakeName = document.getElementById('community-lake').value.trim().toLowerCase();
    const fishType = document.getElementById('community-fish').value.trim().toLowerCase();

    let filtered = communitySpots;

    if (lakeName) {
        filtered = filtered.filter(s => s.lake.toLowerCase().includes(lakeName));
    }
    if (fishType) {
        filtered = filtered.filter(s => s.fish.toLowerCase().includes(fishType));
    }

    const spotsList = document.getElementById('community-spots-list');
    spotsList.innerHTML = '';

    if (filtered.length === 0) {
        spotsList.innerHTML = `
            <div class="no-community-spots" style="grid-column: 1/-1;">
                <i class="fas fa-search"></i>
                <h3>Keine Spots gefunden</h3>
                <p>Versuche andere Filter oder füge selbst einen Spot hinzu!</p>
            </div>
        `;
        return;
    }

    filtered.forEach(spot => {
        const card = document.createElement('div');
        card.className = 'community-spot-card';
        card.innerHTML = `
            <div class="community-badge">
                <i class="fas fa-users"></i> Community
            </div>
            <h3>
                <i class="fas fa-map-pin"></i> ${spot.name}
            </h3>
            <p>
                <i class="fas fa-fish"></i>
                <strong>${spot.fish}</strong>
            </p>
            <p>
                <i class="fas fa-water"></i>
                <strong>${spot.lake}</strong>
            </p>
            <p>
                <i class="fas fa-location-dot"></i>
                <span style="font-size: 0.85em;">${spot.lat.toFixed(4)}°, ${spot.lng.toFixed(4)}°</span>
            </p>
            ${spot.description ? `<p><i class="fas fa-pen"></i> ${spot.description}</p>` : ''}
            <span class="spot-user-badge">
                <i class="fas fa-user-circle"></i> ${spot.username}
            </span>
            <p class="spot-date">
                <i class="fas fa-calendar"></i> ${spot.addedDate}
            </p>
        `;
        spotsList.appendChild(card);
    });
}

// ===== Chat Funktion =====
async function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();

    if (!message) return;

    addChatMessage(message, 'user');
    input.value = '';

    addChatMessage('<span class="loading-indicator"></span><span class="loading-indicator"></span><span class="loading-indicator"></span>', 'ai-loading');

    const response = await askChatGPT(message);

    const chatMessages = document.getElementById('chat-messages');
    const loadingMsg = chatMessages.lastChild;
    if (loadingMsg && loadingMsg.classList.contains('ai-loading')) {
        chatMessages.removeChild(loadingMsg);
    }

    addChatMessage(response, 'ai');
}

async function askChatGPT(question) {
    return getLocalAIResponse(question);
}

function getLocalAIResponse(question) {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('hecht')) {
        return `<strong>🎣 Tipps zum Hechtangeln:</strong><br><br>
        ✅ <strong>Beste Zeit:</strong> Früh morgens und abends<br>
        ✅ <strong>Ausrüstung:</strong> Starke Rute (bis 30g), geflochtene Schnur<br>
        ✅ <strong>Köder:</strong> Große Gummiköder (12-20cm), Spinner, Wobbler<br>
        ✅ <strong>Standort:</strong> Flache Buchten mit Schilfgürtel, Baumwurzeln<br>
        ✅ <strong>Tiefen:</strong> 2-6 Meter<br>
        ✅ <strong>Geheimtipp:</strong> Bei Regen und Wind ist die Erfolgschance höher! 💪<br><br>
        Viel Erfolg beim Angeln! 🐟`;
    } else if (lowerQuestion.includes('fischer-vereinigung')) {
        return `<strong>🌟 Fischer-Vereinigung Schweiz</strong><br><br>
        Die Fischer-Vereinigung Schweiz ist unser stolzer Partner!<br><br>
        ✅ <strong>Nachhaltige Fischerei</strong><br>
        ✅ <strong>Gewässerschutz</strong><br>
        ✅ <strong>Angler Community</strong><br>
        ✅ <strong>Umweltschutz</strong><br><br>
        <a href="https://www.fischer-vereinigung.ch" target="_blank" style="color: var(--secondary-color); text-decoration: underline;">Mehr erfahren unter www.fischer-vereinigung.ch</a><br><br>
        Gemeinsam für nachhaltige Fischerei! 🌍`;
    } else {
        return `<strong>🤖 Allgemeiner Angelrat:</strong><br><br>
        ✅ <strong>Vorbereitung:</strong> Erkunde dein Gewässer vorher<br>
        ✅ <strong>Ausrüstung:</strong> Investiere in gute Ruten und Rollen<br>
        ✅ <strong>Ködervielfalt:</strong> Probiere verschiedene Köder aus<br>
        ✅ <strong>Geduld:</strong> Gute Fänge brauchen Zeit<br>
        ✅ <strong>Community:</strong> Nutze Community Spots von anderen Anglern!<br><br>
        Stell eine Frage zu einer Fischart! 🎣`;
    }
}

function addChatMessage(text, sender) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender === 'user' ? 'user-message' : sender === 'ai-loading' ? 'ai-loading' : 'ai-message'}`;
    messageDiv.innerHTML = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function initMap() {
    map = L.map('map').setView([51.1657, 10.4515], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

async function searchFishingSpots() {
    const lakeName = document.getElementById('lake-name').value.trim();
    const fishType = document.getElementById('fish-type-search').value.trim();

    clearMarkers();

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lakeName)}&limit=1`);
        const data = await response.json();

        if (data.length === 0) {
            alert(`See "${lakeName}" nicht gefunden.`);
            return;
        }

        const lakeData = data[0];
        const lakeCoords = [parseFloat(lakeData.lat), parseFloat(lakeData.lon)];

        map.setView(lakeCoords, 10);

        if (lakeMarker) map.removeLayer(lakeMarker);

        lakeMarker = L.marker(lakeCoords, {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            })
        }).addTo(map);

        lakeMarker.bindPopup(`<strong>💧 ${lakeName}</strong><br>Fisch: ${fishType}`).openPopup();

        // Community Spots auf der Karte anzeigen
        const communitySpotsList = communitySpots.filter(s => 
            s.lake.toLowerCase() === lakeName.toLowerCase() && 
            s.fish.toLowerCase() === fishType.toLowerCase()
        );

        communitySpotsList.forEach(spot => {
            const marker = L.marker([spot.lat, spot.lng], {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map);

            marker.bindPopup(`
                <strong>⭐ ${spot.name}</strong><br>
                Von: <strong>${spot.username}</strong><br>
                Fisch: ${spot.fish}<br>
                ${spot.description ? `Tipp: ${spot.description}` : ''}
            `);
            currentMarkers.push(marker);
        });

    } catch (error) {
        console.error('Fehler:', error);
        alert('Fehler beim Suchen des Sees.');
    }
}

function clearMarkers() {
    currentMarkers.forEach(marker => map.removeLayer(marker));
    currentMarkers = [];
}

async function searchGlobalLocations() {
    // Existierende Funktion bleibt gleich
    const fishType = document.getElementById('fish-type-global').value.trim();
    // ... rest der Funktion
}

function addCatch() {
    const fishType = document.getElementById('fish-type').value;
    const fishSize = document.getElementById('fish-size').value;
    const location = document.getElementById('location').value;
    const photo = document.getElementById('photo').value;

    const catchData = {
        id: Date.now(),
        fishType,
        fishSize,
        location,
        photo,
        date: new Date().toLocaleDateString('de-DE')
    };

    let catches = JSON.parse(localStorage.getItem('catches')) || [];
    catches.push(catchData);
    localStorage.setItem('catches', JSON.stringify(catches));

    document.getElementById('catch-form').reset();
    loadCatches();

    const msg = document.createElement('div');
    msg.className = 'success-message';
    msg.textContent = `✅ Fang hinzugefügt! ${fishSize}cm ${fishType}`;
    document.getElementById('add-catch').appendChild(msg);
    setTimeout(() => msg.remove(), 3000);
}

function loadCatches() {
    const catches = JSON.parse(localStorage.getItem('catches')) || [];
    const catchesDiv = document.getElementById('catches');
    catchesDiv.innerHTML = '';

    if (catches.length === 0) {
        catchesDiv.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">Noch keine Fänge hinzugefügt. Starte jetzt!</p>';
        return;
    }

    catches.reverse().forEach(catchItem => {
        const catchDiv = document.createElement('div');
        catchDiv.className = 'catch';
        catchDiv.innerHTML = `
            <div class="catch-image">
                ${catchItem.photo ? `<img src="${catchItem.photo}" alt="${catchItem.fishType}">` : `<i class="fas fa-fish"></i>`}
            </div>
            <div class="catch-content">
                <h3>🎣 ${catchItem.fishType}</h3>
                <p><i class="fas fa-ruler"></i> <strong>${catchItem.fishSize} cm</strong></p>
                <p><i class="fas fa-map-pin"></i> ${catchItem.location}</p>
                <p><i class="fas fa-calendar"></i> ${catchItem.date}</p>
            </div>
        `;
        catchesDiv.appendChild(catchDiv);
    });
}