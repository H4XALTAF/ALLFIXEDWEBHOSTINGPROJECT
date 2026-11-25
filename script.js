/* =========================================
   H4X ALTAF - MASTER JAVASCRIPT (script.js)
   ========================================= */

// ==========================================
// 1. THEME SWITCHER (4 Colors)
// ==========================================
function changeTheme(themeClass, btnElement) {
    document.body.className = themeClass;
    document.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    localStorage.setItem('h4x_theme', themeClass);
}

// Theme load karo jab page khule
(function loadTheme() {
    const savedTheme = localStorage.getItem('h4x_theme');
    if(savedTheme) {
        document.body.className = savedTheme;
        const colorName = savedTheme.replace('theme-', '');
        document.querySelectorAll('.color-btn').forEach(btn => {
            if(btn.classList.contains(colorName)) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }
})();

// ==========================================
// 2. FIRE ANIMATION (All 4 Edges)
// ==========================================
(function initFire() {
    const layer = document.getElementById("fire-layer");
    if (!layer) return; 

    const maxFlames = window.innerWidth < 600 ? 30 : 60;

    function createFlame() {
        if(layer.childElementCount > maxFlames) return;
        
        const flame = document.createElement("div");
        flame.className = "fire";
        
        const edges = ["bottom", "top", "left", "right"];
        const edge = edges[Math.floor(Math.random() * edges.length)];
        flame.classList.add(edge);

        const size = Math.random() * 15 + 10; 
        const duration = Math.random() * 2 + 1.5;
        const delay = Math.random() * 2;

        if (edge === "bottom" || edge === "top") {
            flame.style.width = size + "px"; 
            flame.style.height = (size * 1.5) + "px"; 
            flame.style.left = (Math.random() * 100) + "vw";
        } else {
            flame.style.width = (size * 1.5) + "px"; 
            flame.style.height = size + "px"; 
            flame.style.top = (Math.random() * 100) + "vh";
        }
        
        flame.style.animationDuration = duration + "s"; 
        flame.style.animationDelay = delay + "s";
        
        layer.appendChild(flame);
        setTimeout(() => flame.remove(), (duration + delay) * 1000 + 500);
    }

    for(let i=0; i<maxFlames; i++) { createFlame(); }
    setInterval(() => { if(!document.hidden) createFlame(); }, 150);
})();

// ==========================================
// 3. MUSIC PLAYER SYSTEM
// ==========================================
const SONGS = [
    { name: "Phonk #1",  src: "https://files.catbox.moe/wcv8va.mp3" },
    { name: "Phonk #2",  src: "https://files.catbox.moe/5sp3v3.mp3" },
    { name: "Phonk #3",  src: "https://files.catbox.moe/981mvb.mp3" },
    { name: "Phonk #4",  src: "https://files.catbox.moe/84mvos.mp3" },
    { name: "Phonk #5",  src: "https://files.catbox.moe/4sdgiv.mp3" }
];

let currentIndex = 0;
let music = document.getElementById("bg-music");

if (music) {
    const playBtn = document.getElementById("playBtn");
    const songName = document.getElementById("songName");
    const songCount = document.getElementById("songCount");
    const select = document.getElementById("songSelect");
    const volume = document.getElementById("volume");
    const musicToggle = document.getElementById("musicToggle");
    const musicOverlay = document.getElementById("musicOverlay");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const closeMusic = document.getElementById("closeMusic");

    if(select) {
        SONGS.forEach((song, i) => {
            const opt = document.createElement("option");
            opt.value = i;
            opt.textContent = song.name;
            select.appendChild(opt);
        });
    }

    function loadSong(index, autoPlay=false) {
        currentIndex = (index + SONGS.length) % SONGS.length;
        const song = SONGS[currentIndex];
        music.src = song.src;
        
        if(songName) songName.textContent = song.name;
        if(songCount) songCount.textContent = (currentIndex+1) + " / " + SONGS.length;
        if(select) select.value = currentIndex;
        
        if(autoPlay) {
            music.play().then(() => {
                if(playBtn) playBtn.textContent = "⏸"; 
                if(musicToggle) musicToggle.classList.add("playing");
            }).catch(() => {});
        } else {
            if(playBtn) playBtn.textContent = "▶";
            if(musicToggle) musicToggle.classList.remove("playing");
        }
    }

    if(playBtn) {
        playBtn.addEventListener("click", () => {
            if(!music.src) { loadSong(currentIndex, true); return; }
            if(music.paused) {
                music.play().then(() => {
                    playBtn.textContent = "⏸"; 
                    if(musicToggle) musicToggle.classList.add("playing");
                }).catch(() => {});
            } else {
                music.pause(); 
                playBtn.textContent = "▶"; 
                if(musicToggle) musicToggle.classList.remove("playing");
            }
        });
    }

    if(prevBtn) prevBtn.addEventListener("click", () => loadSong(currentIndex-1, true));
    if(nextBtn) nextBtn.addEventListener("click", () => loadSong(currentIndex+1, true));
    if(select) select.addEventListener("change", () => loadSong(parseInt(select.value,10), true));
    
    music.addEventListener("ended", () => loadSong(currentIndex+1, true));
    
    if(volume) {
        volume.addEventListener("input", () => { 
            music.volume = volume.value / 100; 
        });
    }

    if(musicToggle) {
        musicToggle.addEventListener("click", () => {
            if(musicOverlay) musicOverlay.classList.add("open");
        });
    }
    if(closeMusic) {
        closeMusic.addEventListener("click", () => {
            if(musicOverlay) musicOverlay.classList.remove("open");
        });
    }
    if(musicOverlay) {
        musicOverlay.addEventListener("click", (e) => {
            if(e.target === musicOverlay) musicOverlay.classList.remove("open");
        });
    }

    window.addEventListener("load", () => {
        loadSong(0, false);
        if(volume) music.volume = volume.value / 100;
    });
}