/* =========================================================
   ZENLESS ZONE ZERO (ZZZ) THEME SCRIPT
   Portfolio: John Carlo N. Abiva - 2D Game Developer & Artist
   ========================================================= */

// ---------------------------------------------------------
// 1. WEB AUDIO API SYNTHESIZER (SFX & AMBIENT BGM)
// ---------------------------------------------------------
let audioCtx = null;
let sfxEnabled = true;

// ---------------------------------------------------------
// 1.1 NATIVE RANDOM BGM PLAYLIST SYSTEM (3 TRACKS)
// ---------------------------------------------------------
const bgmPlaylist = [
    {
        src: "audio/bgm1.m4a",
        title: "Mili - Hero",
        sub: "Limbus Company OST"
    },
    {
        src: "audio/bgm2.m4a",
        title: "Mili - Through Patches of Violet",
        sub: "Limbus Company OST"
    },
    {
        src: "audio/bgm3.m4a",
        title: "Reverse: 1999 - Goodbye",
        sub: "Version 2.2 EP"
    }
];

let bgmAudio = null;
let isBgmPlaying = false;
let userManuallyPaused = false;

// Persist the current track so it never prematurely changes on reload/navigation
let savedTrackIndex = parseInt(sessionStorage.getItem('bgm_current_track_idx'));
let currentTrackIndex = (!isNaN(savedTrackIndex) && savedTrackIndex >= 0 && savedTrackIndex < bgmPlaylist.length)
    ? savedTrackIndex
    : Math.floor(Math.random() * bgmPlaylist.length);

sessionStorage.setItem('bgm_current_track_idx', currentTrackIndex);

function initBgmPlayer() {
    bgmAudio = document.getElementById('bgmAudio');
    if (!bgmAudio) {
        bgmAudio = document.createElement('audio');
        bgmAudio.id = 'bgmAudio';
        bgmAudio.preload = 'auto';
        document.body.appendChild(bgmAudio);
    }

    bgmAudio.volume = 0.5;

    // Load initial track
    loadBgmTrack(currentTrackIndex, false);

    // Track completion: ONLY change song once it is done!
    bgmAudio.addEventListener('ended', () => {
        console.log("[BGM] Current track finished. Auto-changing to next random song...");
        changeToNextTrack();
    });

    // Native audio play/pause events guarantee UI synchronization
    bgmAudio.addEventListener('play', () => {
        isBgmPlaying = true;
        setBgmUiState(true);
    });

    bgmAudio.addEventListener('pause', () => {
        isBgmPlaying = false;
        setBgmUiState(false);
    });

    // Attempt autoplay upon entering the website
    attemptAutoplay();

    // Fallback: start on first user interaction anywhere if browser blocked initial silent autoplay
    setupAutoplayGesture();
}

function loadBgmTrack(index, autoplay = true) {
    if (!bgmAudio) return;
    const track = bgmPlaylist[index];
    if (!track) return;

    bgmAudio.src = track.src;
    bgmAudio.load();
    updateBgmTrackUi(index);

    if (autoplay && !userManuallyPaused) {
        bgmAudio.play().then(() => {
            isBgmPlaying = true;
            setBgmUiState(true);
        }).catch(err => {
            console.log("[BGM] Autoplay waiting for user gesture:", err);
            isBgmPlaying = false;
            setBgmUiState(false);
        });
    }
}

function attemptAutoplay() {
    if (!bgmAudio || userManuallyPaused) return;
    const playPromise = bgmAudio.play();
    if (playPromise !== undefined) {
        playPromise.then(() => {
            isBgmPlaying = true;
            setBgmUiState(true);
        }).catch(() => {
            // Browser autoplay policy requires user gesture
            isBgmPlaying = false;
            setBgmUiState(false);
        });
    }
}

function setupAutoplayGesture() {
    const onFirstUserGesture = () => {
        if (!isBgmPlaying && !userManuallyPaused && bgmAudio) {
            bgmAudio.play().then(() => {
                isBgmPlaying = true;
                setBgmUiState(true);
            }).catch(e => console.warn(e));
        }
    };

    ['click', 'pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, onFirstUserGesture, { once: true, passive: true });
    });
}

function playBgm() {
    userManuallyPaused = false;
    if (!bgmAudio) return;
    if (!bgmAudio.src || bgmAudio.src === '') {
        loadBgmTrack(currentTrackIndex, true);
        return;
    }
    bgmAudio.play().then(() => {
        isBgmPlaying = true;
        setBgmUiState(true);
    }).catch(e => {
        console.warn("[BGM] Play error:", e);
    });
}

function pauseBgm() {
    userManuallyPaused = true;
    if (bgmAudio) {
        bgmAudio.pause();
    }
    isBgmPlaying = false;
    setBgmUiState(false);
}

function toggleBgm() {
    playSfx('click');
    if (isBgmPlaying) {
        pauseBgm();
    } else {
        playBgm();
    }
}

// Change to next random song (manual click or auto-advance on track completion)
function changeToNextTrack() {
    playSfx('switch');
    let nextIndex;
    if (bgmPlaylist.length > 1) {
        do {
            nextIndex = Math.floor(Math.random() * bgmPlaylist.length);
        } while (nextIndex === currentTrackIndex);
    } else {
        nextIndex = 0;
    }
    currentTrackIndex = nextIndex;
    sessionStorage.setItem('bgm_current_track_idx', currentTrackIndex);

    userManuallyPaused = false;
    loadBgmTrack(currentTrackIndex, true);
}

function updateBgmTrackUi(index) {
    const track = bgmPlaylist[index];
    if (!track) return;
    const titleEl = document.getElementById('bgmTrackTitle');
    if (titleEl) {
        titleEl.textContent = `♫ ${track.title} // ${track.sub}`;
    }
}

function setBgmUiState(playing) {
    // Header BGM button
    const headerBtn = document.getElementById('bgmToggleBtn');
    const headerText = document.getElementById('bgmBtnText');
    if (headerBtn) {
        headerBtn.classList.toggle('playing', playing);
        headerBtn.classList.toggle('active', playing);
    }
    if (headerText) {
        headerText.textContent = playing ? "BGM: ON" : "BGM: OFF";
    }

    // Floating cassette deck
    const deck = document.getElementById('bgmFloatingDeck');
    const playIcon = document.getElementById('bgmPlayIcon');
    if (deck) {
        deck.classList.toggle('playing', playing);
    }
    if (playIcon) {
        playIcon.textContent = playing ? "❚❚" : "▶";
    }
}

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSfx(type) {
    if (!sfxEnabled) return;
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;

        if (type === 'blip') {
            // High-tech subtle UI hover
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.exponentialRampToValueAtTime(1320, now + 0.04);
            gain.gain.setValueAtTime(0.04, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.045);
        } else if (type === 'click') {
            // Punchy ZZZ industrial click
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(260, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.065);
        } else if (type === 'switch') {
            // Synth frequency sweep
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.085);
        } else if (type === 'static') {
            // Burst of filtered white noise (CRT channel clunk)
            const bufferSize = ctx.sampleRate * 0.08;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            const noise = ctx.createBufferSource();
            noise.buffer = buffer;
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1000;
            const gain = ctx.createGain();
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);
            noise.start(now);
        } else if (type === 'success') {
            // Upward 3-note arpeggio chime
            [523.25, 659.25, 783.99].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                gain.gain.setValueAtTime(0.08, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.15);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.16);
            });
        }
    } catch (e) {
        // AudioContext not allowed or unsupported
    }
}

function toggleSfx() {
    sfxEnabled = !sfxEnabled;
    const btn = document.getElementById('sfxToggleBtn');
    if (btn) {
        btn.querySelector('.btn-text').textContent = sfxEnabled ? 'SFX: ON' : 'SFX: OFF';
        btn.classList.toggle('active', sfxEnabled);
    }
    if (sfxEnabled) playSfx('click');
}

// CRT Scanlines Toggle
function toggleCrt() {
    document.body.classList.toggle('crt-enabled');
    const isCrt = document.body.classList.contains('crt-enabled');
    const btn = document.getElementById('crtToggleBtn');
    if (btn) btn.classList.toggle('active', isCrt);
    playSfx('static');
}

// ---------------------------------------------------------
// 2. AGENTS / CHARACTER ROSTER DATA (ZZZ ROSTER HOMAGE)
// ---------------------------------------------------------
const agentRoster = [
    {
        id: "crepuscule",
        code: "AGENT_ID: CREPUSCULE-01",
        name: "MISTRESS OF CREPUSCULE",
        alias: "Protagonist // The First Turning Point",
        faction: "denouement",
        factionLabel: "DENOUEMENT SQUAD",
        engine: "GODOT ENGINE 4.X",
        role: "Main Protagonist / Sorcerer",
        style: "2D Digital & Cel Shaded",
        tool: "Clip Studio / Godot 4",
        resolution: "1920 x 1080 FHD",
        image: "images/Mistress of crepuscule_20260828133647.png",
        thumb: "images/madam.png",
        watermark: "CREPUSCULE",
        desc: "The enigmatic central figure of the 2D visual novel and RPG 'Denouement: The First Turning Point'. Designed with high-contrast gothic streetwear silhouettes, striking dual-tone hair, and subtle arcane motifs."
    },
    {
        id: "elaine",
        code: "AGENT_ID: ELAINE-01",
        name: "ELAINE",
        alias: "The Lost Alchemist // Main Villain of Denouement",
        faction: "denouement",
        factionLabel: "DENOUEMENT SQUAD",
        engine: "GODOT ENGINE 4.X",
        role: "Master Alchemist / Main Villain",
        style: "High-Res 2D Concept Art",
        tool: "Clip Studio / Ibis Paint",
        resolution: "2465 x 2737 HD",
        image: "images/Untitled1603.png",
        thumb: "images/Untitled1603.png",
        watermark: "ELAINE",
        desc: "A famous alchemist from the Laguna region who mysteriously disappeared a long time ago. She resurfaces as one of the main villains of Denouement, wielding ancient alchemical secrets and forbidden power."
    },
    {
        id: "wren",
        code: "AGENT_ID: WREN-03",
        name: "WREN",
        alias: "Young Musician // Model Sheet Turnaround",
        faction: "denouement",
        factionLabel: "DENOUEMENT SQUAD",
        engine: "GODOT ENGINE",
        role: "Young Musician / Model Sheet",
        style: "Character Model Sheet",
        tool: "Ibis Paint / Clip Studio",
        resolution: "1920 x 1080 FHD",
        image: "images/a3.jpg",
        thumb: "images/a3.jpg",
        watermark: "WREN",
        desc: "Wren a young musician in Crepuscule who says to be a younger sister of Miss Blue. Featured in this full character model sheet and color turnaround."
    },
    {
        id: "gliceria",
        code: "AGENT_ID: GLICERIA-07",
        name: "GLICERIA",
        alias: "Occult Scholar // Denouement",
        faction: "denouement",
        factionLabel: "DENOUEMENT SQUAD",
        engine: "GODOT ENGINE",
        role: "Mystic / Lorekeeper",
        style: "2D Character Doodle",
        tool: "Ibis Paint & Digital Lineart",
        resolution: "1080 x 1920 Portrait",
        image: "images/a7.jpg",
        thumb: "images/a7.jpg",
        watermark: "GLICERIA",
        desc: "Gliceria is an eccentric occult researcher from 'Denouement'. Her design balances historical scholastic robes with quirky, disheveled streetwear accessories."
    },
    {
        id: "emma",
        code: "AGENT_ID: EMMA-SIM",
        name: "EMMA",
        alias: "VIP Regular Customer // Food Cart Sim",
        faction: "foodcart",
        factionLabel: "FOOD CART SIM",
        engine: "GODOT / UNITY 2D",
        role: "Interactive Quest NPC",
        style: "Expressive 2D NPC Sprite",
        tool: "Clip Studio / Pixel Studio / Godot",
        resolution: "720 x 1344 Mobile/HD",
        image: "images/a4.jpg",
        thumb: "images/a4.jpg",
        watermark: "EMMA",
        desc: "Emma is one of the memorable recurring customer NPCs in 'Food Cart Simulator'. She triggers unique mini-dialogues, orders custom street food combos, and offers humorous neighborhood gossip."
    },
    {
        id: "astra",
        code: "AGENT_ID: ASTRA-09",
        name: "MS. ASTRA",
        alias: "Cosmic Mercenary // Starbound",
        faction: "concepts",
        factionLabel: "ORIGINAL CONCEPTS",
        engine: "UNITY 2D PIPELINE",
        role: "Ranged Specialist",
        style: "New Stylized Art Direction",
        tool: "Clip Studio / Krita",
        resolution: "1080 x 1920 HD",
        image: "images/wink.png",
        thumb: "images/wink.png",
        watermark: "ASTRA",
        desc: "Ms. Astra represents an updated art direction focusing on vibrant cell-shading, playful character expressions, and sharp kinetic silhouettes suited for fast-paced 2D combat titles."
    },
    {
        id: "stalker-1604",
        code: "AGENT_ID: OPERATIVE-1604",
        name: "TACTICAL STALKER",
        alias: "Covert Special Ops // Unit 1604",
        faction: "concepts",
        factionLabel: "ORIGINAL CONCEPTS",
        engine: "GODOT 4.X",
        role: "Tactical Striker",
        style: "2D Character Illustration",
        tool: "Ibis Paint / Clip Studio",
        resolution: "2465 x 2737 HD",
        image: "images/Untitled1604.png",
        thumb: "images/Untitled1604.png",
        watermark: "TACTICAL",
        desc: "A stylized cyber-infiltrator designed with an emphasis on asymmetric silhouette clarity, allowing readability even at zoomed-out camera distances in top-down or sidescrolling combat arenas."
    },
    {
        id: "wren-1600",
        code: "AGENT_ID: WREN-02",
        name: "WREN",
        alias: "Young Musician in Crepuscule // Sister of Miss Blue",
        faction: "denouement",
        factionLabel: "DENOUEMENT SQUAD",
        engine: "GODOT 4 / UNITY",
        role: "Young Musician / Acoustic Concept",
        style: "2D Character Illustration",
        tool: "Clip Studio / Ibis Paint",
        resolution: "2465 x 2737 HD",
        image: "images/Untitled1600_20251130164901.png",
        thumb: "images/Untitled1600_20251130164901.png",
        watermark: "WREN",
        desc: "Wren a young musician in Crepuscule who says to be a younger sister of Miss Blue."
    },
    {
        id: "blue-chill",
        code: "AGENT_ID: CHILL-02",
        name: "MISS BLUE (CHILL)",
        alias: "Street Vendor Partner // Food Cart Sim",
        faction: "foodcart",
        factionLabel: "FOOD CART SIM",
        engine: "GODOT / UNITY",
        role: "Assistant & Cashier",
        style: "Chibi / Casual Concept",
        tool: "Clip Studio / Pixel Studio",
        resolution: "768 x 1024 HD",
        image: "images/blue.png",
        thumb: "images/blue.png",
        watermark: "CHILL",
        desc: "A relaxed, stylish street food vendor assistant created for 'Food Cart Simulator'. Features warm, approachable color palettes and charming idle expressions."
    },
    {
        id: "denouement-madam",
        code: "AGENT_ID: CREPUSCULE-DOODLE",
        name: "CREPUSCULE: THE DOODLE",
        alias: "Concept Draft // Denouement",
        faction: "denouement",
        factionLabel: "DENOUEMENT SQUAD",
        engine: "GODOT ENGINE",
        role: "Early Concept Draft",
        style: "Character Ideation Sketch",
        tool: "Ibis Paint / Sketchpad",
        resolution: "720 x 1497 Portrait",
        image: "images/madam.png",
        thumb: "images/madam.png",
        watermark: "DOODLE",
        desc: "The original rough sketch and personality ideation that laid the design foundation for the final Mistress of Crepuscule protagonist in Denouement."
    }
];

let activeAgentIndex = 0;
let currentAgentFilter = 'all';

function renderAgentRosterList() {
    const listEl = document.getElementById('agentRosterList');
    if (!listEl) return;
    listEl.innerHTML = '';

    const filtered = agentRoster.filter(a => {
        if (currentAgentFilter === 'all') return true;
        return a.faction === currentAgentFilter;
    });

    // Update counts
    const countAll = document.getElementById('count-all');
    if (countAll) countAll.textContent = agentRoster.length;
    const countD = document.getElementById('count-denouement');
    if (countD) countD.textContent = agentRoster.filter(a => a.faction === 'denouement').length;
    const countF = document.getElementById('count-foodcart');
    if (countF) countF.textContent = agentRoster.filter(a => a.faction === 'foodcart').length;
    const countC = document.getElementById('count-concepts');
    if (countC) countC.textContent = agentRoster.filter(a => a.faction === 'concepts').length;

    filtered.forEach((agent, idx) => {
        const item = document.createElement('div');
        item.className = `agent-roster-item ${agent.id === agentRoster[activeAgentIndex].id ? 'active' : ''}`;
        item.onclick = () => {
            selectAgentById(agent.id);
            playSfx('switch');
        };

        item.innerHTML = `
            <div class="roster-thumb-wrap">
                <img src="${agent.thumb}" alt="${agent.name}" class="roster-thumb-img" loading="lazy">
            </div>
            <div class="roster-item-info">
                <span class="roster-item-faction">${agent.factionLabel}</span>
                <span class="roster-item-name">${agent.name}</span>
                <span class="roster-item-role">${agent.role}</span>
            </div>
        `;
        listEl.appendChild(item);
    });
}

function selectAgentById(id) {
    const index = agentRoster.findIndex(a => a.id === id);
    if (index !== -1) {
        activeAgentIndex = index;
        updateActiveAgentDisplay();
        renderAgentRosterList();
    }
}

function updateActiveAgentDisplay() {
    const agent = agentRoster[activeAgentIndex];
    if (!agent) return;

    const artImg = document.getElementById('activeAgentArt');
    const watermark = document.getElementById('agentWatermark');
    const code = document.getElementById('activeAgentCode');
    const faction = document.getElementById('activeAgentFaction');
    const engine = document.getElementById('activeAgentEngine');
    const name = document.getElementById('activeAgentName');
    const alias = document.getElementById('activeAgentAlias');
    const desc = document.getElementById('activeAgentDesc');
    const role = document.getElementById('activeAgentRole');
    const style = document.getElementById('activeAgentStyle');
    const tool = document.getElementById('activeAgentTool');
    const res = document.getElementById('activeAgentRes');

    // Subtle glitch transition
    if (artImg) {
        artImg.style.opacity = '0';
        artImg.style.transform = 'scale(0.96) translateX(-10px)';
        setTimeout(() => {
            artImg.src = agent.image;
            artImg.alt = agent.name;
            artImg.style.opacity = '1';
            artImg.style.transform = 'scale(1) translateX(0)';
        }, 120);
    }

    if (watermark) watermark.textContent = agent.watermark;
    if (code) code.textContent = agent.code;
    if (faction) faction.textContent = agent.factionLabel;
    if (engine) engine.textContent = agent.engine;
    if (name) name.textContent = agent.name;
    if (alias) alias.textContent = agent.alias;
    if (desc) desc.textContent = agent.desc;
    if (role) role.textContent = agent.role;
    if (style) style.textContent = agent.style;
    if (tool) tool.textContent = agent.tool;
    if (res) res.textContent = agent.resolution;
}

// ---------------------------------------------------------
// 2.1 ROSTER CATEGORY SHOWCASE BANNER SYSTEM
// ---------------------------------------------------------
const categoryBanners = {
    all: {
        code: "CATEGORY_ID // ALL_UNITS",
        title: "ALL REGISTERED AGENTS",
        desc: "Comprehensive archive of playable protagonists, visual novel figures, NPC sprites, and original concept designs.",
        image: "images/Mistress of crepuscule.png",
        tag: "ALL FACTIONS"
    },
    denouement: {
        code: "FACTION // DENOUEMENT_VN_RPG",
        title: "DENOUEMENT: THE FIRST TURNING POINT",
        desc: "Visual novel & 2D RPG cast: protagonists, enigmatic occult scholars, young musicians, and villainous alchemists from the Laguna region.",
        image: "images/facer.png",
        tag: "DENOUEMENT SQUAD"
    },
    foodcart: {
        code: "SECTOR // STREET_FOOD_SIM",
        title: "FOOD CART SIMULATOR // CASUAL CAST",
        desc: "Charming customer NPCs, vendor partners, and interactive dialogue figures for the street food tycoon simulation.",
        image: "images/foodsims.PNG",
        tag: "FOOD CART SIM"
    },
    concepts: {
        code: "ARCHIVE // ORIGINAL_CONCEPTS",
        title: "ORIGINAL COMBAT & ACTION CONCEPTS",
        desc: "Stylized fighters, kinetic cybernetic infiltrators, and modern streetpunk character designs engineered for 2D combat titles.",
        image: "images/1a.jpg",
        tag: "ORIGINAL CONCEPTS"
    }
};

function updateRosterCategoryBanner(faction) {
    const data = categoryBanners[faction] || categoryBanners['all'];
    const bannerImg = document.getElementById('catBannerImg');
    const bannerCode = document.getElementById('catBannerCode');
    const bannerTitle = document.getElementById('catBannerTitle');
    const bannerDesc = document.getElementById('catBannerDesc');
    const bannerCount = document.getElementById('catBannerCount');
    const bannerPill = document.getElementById('catBannerPill');

    const count = (faction === 'all')
        ? agentRoster.length
        : agentRoster.filter(a => a.faction === faction).length;

    if (bannerImg) {
        bannerImg.style.opacity = '0';
        bannerImg.style.transform = 'scale(1.05)';
        setTimeout(() => {
            bannerImg.src = data.image;
            bannerImg.style.opacity = '1';
            bannerImg.style.transform = 'scale(1)';
        }, 120);
    }
    if (bannerCode) bannerCode.textContent = data.code;
    if (bannerTitle) bannerTitle.textContent = data.title;
    if (bannerDesc) bannerDesc.textContent = data.desc;
    if (bannerCount) bannerCount.textContent = `${count} AGENTS`;
    if (bannerPill) bannerPill.textContent = data.tag;
}

function filterAgents(faction) {
    currentAgentFilter = faction;
    document.querySelectorAll('.roster-filter-bar .faction-tab').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-filter') === faction);
    });
    playSfx('click');

    // Update dynamic banner picture for category
    updateRosterCategoryBanner(faction);

    // Pick first matching agent
    const matching = agentRoster.find(a => faction === 'all' || a.faction === faction);
    if (matching) {
        activeAgentIndex = agentRoster.indexOf(matching);
        updateActiveAgentDisplay();
    }
    renderAgentRosterList();
}

function inspectActiveAgentArt() {
    const agent = agentRoster[activeAgentIndex];
    if (agent) {
        openLightboxFromSrc(agent.image, agent.name, agent.desc);
        playSfx('click');
    }
}

// ---------------------------------------------------------
// 3. RANDOM PLAY RETRO CRT TV STUDIO SYSTEM
// ---------------------------------------------------------
const tvChannels = {
    1: {
        type: "video",
        video: "images/video1.mp4",
        tape: "PLAY ▶ 00:23:00",
        ch: "CH-01 // GAMEPLAY TAPE 01",
        title: "2D Game Engine Footage",
        sub: "Live In-Engine Reel // 1080p FHD 60FPS"
    },
    2: {
        type: "video",
        video: "images/video2.mp4",
        tape: "PLAY ▶ 00:13:00",
        ch: "CH-02 // ACTION CLIP TAPE 02",
        title: "Combat & Physics Showcase",
        sub: "Real-Time 2D Animation & Action Demo"
    },
    3: {
        type: "image",
        image: "images/Cart1.png",
        tape: "STILL FRAME ▣",
        ch: "CH-03 // FOOD CART SIMULATOR",
        title: "Street Food Cart Blueprint",
        sub: "Filipino Street Food Tycoon // Godot & Unity"
    },
    4: {
        type: "image",
        image: "images/1a.jpg",
        tape: "STILL FRAME ▣",
        ch: "CH-04 // DENOUEMENT REGIONS",
        title: "Laguna 2D Concept Design",
        sub: "Denouement RPG Region // Godot 4"
    }
};

let currentTvChannel = 1;
let isTvStaticMode = false;
let tvNoiseAnimId = null;
let isTvAudioOn = false;

function toggleTvAudio() {
    isTvAudioOn = !isTvAudioOn;
    const video = document.getElementById('crtTvVideo');
    const label = document.getElementById('tvAudioLabel');
    if (video) {
        video.muted = !isTvAudioOn;
    }
    if (label) {
        label.textContent = isTvAudioOn ? "VOL: ON" : "VOL: OFF";
    }
    playSfx('click');
}

function switchTvChannel(ch) {
    playSfx('static');
    currentTvChannel = ch;

    // Update active button
    document.querySelectorAll('.channel-btn-rack .ch-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.getAttribute('data-channel')) === ch);
    });

    const screenImg = document.getElementById('crtTvImage');
    const screenVideo = document.getElementById('crtTvVideo');
    const chDisplay = document.getElementById('crtChDisplay');
    const tapeStatus = document.getElementById('crtTapeStatus');
    const titleDisplay = document.getElementById('crtTitleDisplay');
    const subDisplay = document.getElementById('crtSubDisplay');
    const canvas = document.getElementById('crtNoiseCanvas');

    if (ch === 0) {
        // Pure static noise channel
        isTvStaticMode = true;
        if (screenVideo) {
            screenVideo.pause();
            screenVideo.style.display = 'none';
        }
        if (screenImg) screenImg.style.display = 'none';

        canvas.classList.add('active');
        startTvNoise();
        if (chDisplay) chDisplay.textContent = "CH-00 // NO SIGNAL [STATIC]";
        if (tapeStatus) tapeStatus.textContent = "SIGNAL LOSS ✖";
        if (titleDisplay) titleDisplay.textContent = "White Noise Signal Loss";
        if (subDisplay) subDisplay.textContent = "Hollow Interference Detected";
    } else {
        isTvStaticMode = false;
        canvas.classList.add('active');
        startTvNoise();

        // Brief burst of static before tuning in
        setTimeout(() => {
            canvas.classList.remove('active');
            stopTvNoise();

            const feed = tvChannels[ch];
            if (feed) {
                if (chDisplay) chDisplay.textContent = feed.ch;
                if (tapeStatus) tapeStatus.textContent = feed.tape;
                if (titleDisplay) titleDisplay.textContent = feed.title;
                if (subDisplay) subDisplay.textContent = feed.sub;

                if (feed.type === 'video') {
                    if (screenImg) screenImg.style.display = 'none';
                    if (screenVideo) {
                        screenVideo.style.display = 'block';
                        if (screenVideo.getAttribute('src') !== feed.video) {
                            screenVideo.src = feed.video;
                        }
                        screenVideo.muted = !isTvAudioOn;
                        screenVideo.play().catch(() => {});
                    }
                } else {
                    if (screenVideo) {
                        screenVideo.pause();
                        screenVideo.style.display = 'none';
                    }
                    if (screenImg) {
                        screenImg.style.display = 'block';
                        screenImg.src = feed.image;
                    }
                }
            }
        }, 180);
    }
}

function cycleTvChannel(step) {
    let next = currentTvChannel + step;
    if (next > 4) next = 1;
    if (next < 1) next = 4;
    switchTvChannel(next);
}

function toggleTvStatic() {
    if (isTvStaticMode) {
        switchTvChannel(1);
    } else {
        switchTvChannel(0);
    }
}

// Canvas TV Noise Generator
function startTvNoise() {
    if (tvNoiseAnimId) return;
    const canvas = document.getElementById('crtNoiseCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 240;

    function renderNoise() {
        const imgData = ctx.createImageData(canvas.width, canvas.height);
        const buffer = new Uint32Array(imgData.data.buffer);
        const len = buffer.length;
        for (let i = 0; i < len; i++) {
            if (Math.random() < 0.5) {
                buffer[i] = 0xffffffff;
            } else {
                buffer[i] = 0xff111111;
            }
        }
        ctx.putImageData(imgData, 0, 0);
        tvNoiseAnimId = requestAnimationFrame(renderNoise);
    }
    renderNoise();
}

function stopTvNoise() {
    if (tvNoiseAnimId) {
        cancelAnimationFrame(tvNoiseAnimId);
        tvNoiseAnimId = null;
    }
}

// ---------------------------------------------------------
// 4. ASSET & ART VAULT (FULL 35 IMAGE LIBRARY)
// ---------------------------------------------------------
const galleryData = [
    // Hero & Protagonists
    {
        id: "art-elaine",
        title: "Elaine: The Lost Alchemist",
        desc: "A famous alchemist in Laguna who disappeared a long time ago. One of the main villains of Denouement.",
        image: "images/Untitled1603.png",
        category: "characters",
        tag: "MAIN VILLAIN"
    },
    {
        id: "art-1604",
        title: "Tactical Operative 1604",
        desc: "High-resolution character silhouette study for next-gen 2D action titles.",
        image: "images/Untitled1604.png",
        category: "characters",
        tag: "CHARACTER ART"
    },
    {
        id: "art-1600",
        title: "Wren (Musician of Crepuscule)",
        desc: "Wren a young musician in Crepuscule who says to be a younger sister of Miss Blue.",
        image: "images/Untitled1600_20251130164901.png",
        category: "characters",
        tag: "WREN // CREPUSCULE"
    },
    {
        id: "art-crepuscule-main",
        title: "Mistress of Crepuscule (Key Art)",
        desc: "Flagship promotional key art for 'Denouement: The First Turning Point'.",
        image: "images/Mistress of crepuscule_20260828133647.png",
        category: "characters",
        tag: "FLAGSHIP CG"
    },
    {
        id: "art-crepuscule-scene",
        title: "Mistress of Crepuscule Scene",
        desc: "In-game story cutscene illustration crafted for Godot Engine dialogue flow.",
        image: "images/Mistress of crepuscule.png",
        category: "characters",
        tag: "STORY CG"
    },
    {
        id: "art-wren",
        title: "Wren Character Sheet",
        desc: "Comprehensive character turnaround and color palette study for Wren.",
        image: "images/a3.jpg",
        category: "characters",
        tag: "CHARACTER DESIGN"
    },
    {
        id: "art-gliceria",
        title: "2D Gliceria Character Doodle",
        desc: "Occult researcher doodle from the Denouement 2D RPG project.",
        image: "images/a7.jpg",
        category: "characters",
        tag: "DOODLE / SKETCH"
    },
    {
        id: "art-emma",
        title: "Emma NPC Character Doodle",
        desc: "Customer NPC portrait from the Food Cart Simulator game.",
        image: "images/a4.jpg",
        category: "characters",
        tag: "NPC ART"
    },
    {
        id: "art-astra",
        title: "Ms. Astra Character Design",
        desc: "Stylized character art exploring expressive cel shading and dynamic poses.",
        image: "images/wink.png",
        category: "characters",
        tag: "CONCEPT ART"
    },
    {
        id: "art-blue",
        title: "Miss Blue (Chill)",
        desc: "Charming casual character illustration for Food Cart Simulator.",
        image: "images/blue.png",
        category: "characters",
        tag: "CHARACTER ART"
    },
    {
        id: "art-orange",
        title: "Miss Blue (Alternate Palette)",
        desc: "Color exploration concept for companion character in 2D titles.",
        image: "images/orange.png",
        category: "characters",
        tag: "COLOR STUDY"
    },
    {
        id: "art-1540",
        title: "Cyber Character 1540",
        desc: "Cyberpunk character design featuring stylized streetwear.",
        image: "images/Untitled1540_20251210115535.png",
        category: "characters",
        tag: "CHARACTER ART"
    },
    {
        id: "art-1590",
        title: "Wren (Concept Study 1590)",
        desc: "Wren a young musician in Crepuscule who says to be a younger sister of Miss Blue.",
        image: "images/Untitled1590_20251110173907.png",
        category: "characters",
        tag: "WREN // CREPUSCULE"
    },
    {
        id: "art-hello",
        title: "Character Greeting / Expression",
        desc: "Expressive dialogue sprite for interactive storytelling.",
        image: "images/Hello.png",
        category: "characters",
        tag: "EXPRESSION SPRITE"
    },
    {
        id: "art-face",
        title: "Character Portrait Study A",
        desc: "Facial expression and headshot concept art.",
        image: "images/face.png",
        category: "characters",
        tag: "PORTRAIT STUDY"
    },
    {
        id: "art-face2",
        title: "Character Portrait Study B",
        desc: "Alternate facial expression and lighting exploration.",
        image: "images/face2.png",
        category: "characters",
        tag: "PORTRAIT STUDY"
    },
    {
        id: "art-madam",
        title: "Mistress of Crepuscule Sketch",
        desc: "Original character concept doodle that sparked the final protagonist.",
        image: "images/madam.png",
        category: "characters",
        tag: "SKETCH"
    },
    {
        id: "art-a6",
        title: "2D Character Concept A6",
        desc: "Full-height stylized anime illustration with bold rim lighting.",
        image: "images/a6.png",
        category: "characters",
        tag: "CHARACTER ART"
    },
    {
        id: "art-rand",
        title: "Original Character Doodle",
        desc: "Stylized character sketch exploring personality and clothing flow.",
        image: "images/rand.png",
        category: "characters",
        tag: "CONCEPT DOODLE"
    },

    // Environments & Regions
    {
        id: "env-laguna",
        title: "Laguna 2D Background Design",
        desc: "Atmospheric matte concept art for the Laguna region in Denouement.",
        image: "images/1a.jpg",
        category: "environments",
        tag: "ENVIRONMENT ART"
    },
    {
        id: "env-sea",
        title: "Mourning Sky Area Concept",
        desc: "Concept art for the melancholic Mourning Sky coastline region.",
        image: "images/sea.jpg",
        category: "environments",
        tag: "ENVIRONMENT ART"
    },
    {
        id: "env-store",
        title: "Street Food Stall Storefront",
        desc: "Detailed 2D environmental background for Food Cart Simulator.",
        image: "images/store.png",
        category: "environments",
        tag: "GAME BACKGROUND"
    },

    // Food Cart Simulator Assets
    {
        id: "food-cart",
        title: "Main Street Food Cart",
        desc: "High-resolution 2D cart sprite with custom storage compartments.",
        image: "images/Cart1.png",
        category: "foodcart",
        tag: "GAME SPRITE"
    },
    {
        id: "food-fishball",
        title: "Fishball Asset Pack",
        desc: "Modular 2D street food sprites for the cooking frying minigame.",
        image: "images/Fishballassetpaxk.png",
        category: "foodcart",
        tag: "ASSET PACK"
    },
    {
        id: "food-qwek",
        title: "Qwek-Qwek Asset Pack",
        desc: "Complete 2D sprite collection of fried quail eggs with batter textures.",
        image: "images/Qwek qwek asset pack.png",
        category: "foodcart",
        tag: "ASSET PACK"
    },
    {
        id: "food-kikiam",
        title: "Kikiam Asset Pack",
        desc: "Handcrafted 2D food assets with multiple frying states.",
        image: "images/kikiam.png",
        category: "foodcart",
        tag: "ASSET PACK"
    },
    {
        id: "food-puto",
        title: "Puto (Steamed Rice Cake) Pack",
        desc: "Vibrant traditional Filipino delicacy sprites.",
        image: "images/Puto.png",
        category: "foodcart",
        tag: "ASSET PACK"
    },
    {
        id: "food-ihaw",
        title: "Ihaw-Ihaw (BBQ Skewers) Pack",
        desc: "Street grill asset pack featuring skewered meats with grill marks.",
        image: "images/ihawihaw.png",
        category: "foodcart",
        tag: "ASSET PACK"
    },
    {
        id: "food-icecream",
        title: "Sorbetes / Ice Cream Pack",
        desc: "Colorful Filipino dirty ice cream scoops, cones, and cart props.",
        image: "images/ice cream.png",
        category: "foodcart",
        tag: "ASSET PACK"
    },
    {
        id: "food-basket",
        title: "Serving Basket Asset",
        desc: "Woven basket container sprite for holding fried street food.",
        image: "images/Basket.png",
        category: "foodcart",
        tag: "GAME PROP"
    },
    {
        id: "food-sauce",
        title: "Sweet & Spicy Sauce Jars",
        desc: "Condiment jars and dipping sauces for customer orders.",
        image: "images/Sauce.png",
        category: "foodcart",
        tag: "GAME PROP"
    },

    // Games & Action
    {
        id: "game-chaotic",
        title: "Chaotic City: Arena Royale",
        desc: "Action combat arena prototype blending martial arts, firearms, and magic.",
        image: "images/3ad.png",
        category: "games",
        tag: "GAME PROJECT"
    },
    {
        id: "game-concept-banner",
        title: "2D Game Art & Concept Banner",
        desc: "Production artwork and 2D environment composition.",
        image: "images/a5.jpg",
        category: "games",
        tag: "GAME ART"
    },
    {
        id: "game-3d-model",
        title: "3D Character Asset Project",
        desc: "Stylized 3D character modeling and texturing showcase.",
        image: "images/a7a.jpg",
        category: "games",
        tag: "3D MODEL ART"
    },
    {
        id: "dev-profile",
        title: "John Carlo N. Abiva (Profile)",
        desc: "Official photo of John Carlo N. Abiva - 2D Game Developer & Artist.",
        image: "images/a4a.jpg",
        category: "characters",
        tag: "CREATOR ID"
    },
    {
        id: "art-facer",
        title: "Character Expression Study (Facer)",
        desc: "2D character facial expression and headshot concept art.",
        image: "images/facer.png",
        category: "characters",
        tag: "EXPRESSION ART"
    }
];

let currentGalleryFilter = 'all';

function renderGallery() {
    const grid = document.getElementById('vaultGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = galleryData.filter(item => {
        if (currentGalleryFilter === 'all') return true;
        return item.category === currentGalleryFilter;
    });

    filtered.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'vault-item-card';
        card.onclick = () => {
            openLightboxFromItem(item);
            playSfx('click');
        };

        card.innerHTML = `
            <div class="vault-thumb-wrap">
                <img src="${item.image}" alt="${item.title}" class="vault-thumb-img" loading="lazy">
                <span class="vault-category-tag">${item.tag}</span>
            </div>
            <div class="vault-card-info">
                <h4 class="vault-card-title">${item.title}</h4>
                <p class="vault-card-desc">${item.desc}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

function filterGallery(category) {
    currentGalleryFilter = category;
    document.querySelectorAll('.vault-filter-pills .vault-pill').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-cat') === category);
    });
    playSfx('click');
    renderGallery();
}

// ---------------------------------------------------------
// 5. LIGHTBOX MODAL (ZZZ HUD VIEWER)
// ---------------------------------------------------------
let currentModalIndex = 0;

function openLightboxFromItem(item) {
    const idx = galleryData.indexOf(item);
    if (idx !== -1) {
        currentModalIndex = idx;
        displayModalImage();
    }
}

function openLightboxFromSrc(src, title, desc) {
    let idx = galleryData.findIndex(g => g.image === src);
    if (idx === -1) {
        // Temporary view
        const modal = document.getElementById('lightboxModal');
        const img = document.getElementById('modalImage');
        const titleEl = document.getElementById('modalTitle');
        const descEl = document.getElementById('modalDesc');
        const idEl = document.getElementById('modalId');
        const countEl = document.getElementById('modalCounter');

        if (img) img.src = src;
        if (titleEl) titleEl.textContent = title || "Classified Asset";
        if (descEl) descEl.textContent = desc || "Proprietary 2D game asset by John Carlo Abiva.";
        if (idEl) idEl.textContent = "SPEC_FILE #HUD";
        if (countEl) countEl.textContent = "- / -";

        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        return;
    }
    currentModalIndex = idx;
    displayModalImage();
}

function displayModalImage() {
    const item = galleryData[currentModalIndex];
    if (!item) return;

    const modal = document.getElementById('lightboxModal');
    const img = document.getElementById('modalImage');
    const titleEl = document.getElementById('modalTitle');
    const descEl = document.getElementById('modalDesc');
    const idEl = document.getElementById('modalId');
    const countEl = document.getElementById('modalCounter');

    if (img) img.src = item.image;
    if (titleEl) titleEl.textContent = item.title;
    if (descEl) descEl.textContent = item.desc;
    if (idEl) idEl.textContent = `FILE_CODE // ${item.id.toUpperCase()}`;
    if (countEl) countEl.textContent = `${currentModalIndex + 1} / ${galleryData.length}`;

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightboxModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        playSfx('click');
    }
}

function navigateLightbox(dir) {
    currentModalIndex += dir;
    if (currentModalIndex >= galleryData.length) currentModalIndex = 0;
    if (currentModalIndex < 0) currentModalIndex = galleryData.length - 1;
    displayModalImage();
}

// Keyboard shortcuts for Lightbox
window.addEventListener('keydown', (e) => {
    const modal = document.getElementById('lightboxModal');
    if (modal && modal.classList.contains('active')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') {
            navigateLightbox(-1);
            playSfx('click');
        }
        if (e.key === 'ArrowRight') {
            navigateLightbox(1);
            playSfx('click');
        }
    }
});

// ---------------------------------------------------------
// 6. COMMS FORM & UTILITIES
// ---------------------------------------------------------
function handleFormSubmit(e) {
    e.preventDefault();
    playSfx('click');
    const btn = document.getElementById('sendBtn');
    const feedback = document.getElementById('formFeedback');
    const name = document.getElementById('senderName').value;

    btn.disabled = true;
    btn.querySelector('.btn-label').textContent = 'TRANSMITTING...';
    feedback.textContent = 'CONNECTING TO HOLLOW COMM RELAY...';
    feedback.className = 'submit-feedback';

    setTimeout(() => {
        playSfx('success');
        btn.disabled = false;
        btn.querySelector('.btn-label').textContent = 'TRANSMIT BRIEF';
        feedback.textContent = `TRANSMISSION CONFIRMED! Thank you ${name}, John Carlo will review your brief shortly.`;
        feedback.className = 'submit-feedback success';
        document.getElementById('contactForm').reset();
    }, 1400);
}

function copyText(text, btnElement) {
    navigator.clipboard.writeText(text).then(() => {
        playSfx('click');
        const orig = btnElement.querySelector('span').textContent;
        btnElement.querySelector('span').textContent = 'COPIED!';
        btnElement.style.background = 'var(--accent-yellow)';
        btnElement.style.color = '#000';
        setTimeout(() => {
            btnElement.querySelector('span').textContent = orig;
            btnElement.style.background = '';
            btnElement.style.color = '';
        }, 2000);
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById('navMenu');
    if (menu) {
        menu.classList.toggle('open');
        playSfx('click');
    }
}

// Active Nav Link Spy on Scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(sec => {
        const height = sec.offsetHeight;
        const top = sec.offsetTop - 120;
        const id = sec.getAttribute('id');
        const link = document.querySelector(`.nav-menu a[href*='${id}']`);

        if (scrollY > top && scrollY <= top + height) {
            if (link) {
                document.querySelectorAll('.nav-menu a').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        }
    });
});

// ---------------------------------------------------------
// 7. CUSTOM MADAM CURSOR TRACKER
// ---------------------------------------------------------
function initCustomCursor() {
    const cursor = document.getElementById('customCursor');
    if (!cursor) return;

    // Disable if touch / mobile device
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = -100;
    let mouseY = -100;
    let currentX = -100;
    let currentY = -100;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!cursor.classList.contains('visible')) {
            cursor.classList.add('visible');
        }
    });

    document.addEventListener('mouseleave', () => {
        cursor.classList.remove('visible');
    });

    document.addEventListener('mouseenter', () => {
        cursor.classList.add('visible');
    });

    // Hover detection over interactive elements
    const interactiveSelectors = 'a, button, input, select, textarea, .vault-item-card, .agent-roster-item, .ch-btn, .game-card, .inspect-btn, .copy-pill, .tv-dial, .faction-tab, .vault-pill';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursor.classList.add('hovered');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            cursor.classList.remove('hovered');
        }
    });

    document.addEventListener('mousedown', () => {
        cursor.classList.add('active');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('active');
    });

    // High refresh-rate smooth tracking loop
    function updateCursorPos() {
        currentX += (mouseX - currentX) * 0.45;
        currentY += (mouseY - currentY) * 0.45;

        cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
        requestAnimationFrame(updateCursorPos);
    }
    requestAnimationFrame(updateCursorPos);
}

// ---------------------------------------------------------
// 8. INITIALIZATION
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    renderAgentRosterList();
    updateActiveAgentDisplay();
    updateRosterCategoryBanner('all');
    renderGallery();

    // Initialize Native Cyber BGM Player, Track Display & Autoplay
    initBgmPlayer();

    // Start TV Channel 1 video feed
    const initVideo = document.getElementById('crtTvVideo');
    if (initVideo) {
        initVideo.play().catch(() => {});
    }

    // Close mobile menu on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            const menu = document.getElementById('navMenu');
            if (menu) menu.classList.remove('open');
        });
    });

    console.log("%c[ZZZ INTER-KNOT PROTOCOL] %cSystem Online. Welcome to John Carlo Abiva's Portfolio.",
        "color: #f8ea03; font-weight: bold; background: #000; padding: 4px;",
        "color: #00f2fe; font-weight: bold;");
});

