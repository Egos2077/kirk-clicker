document.addEventListener("DOMContentLoaded", () => {
    console.log("Kirk Clicker - Loaded");
    
    // ==================== DOM ELEMENTS & STATE ====================
    const elements = {
        kirkButton: document.getElementById('kirkButton'),
        counter: document.getElementById('counter'),
        kpsCounter: document.getElementById('kpsCounter'),
        kpsValue: document.getElementById('kpsValue'),
        upgradesContainer: document.getElementById('upgradesContainer'),
        authStatus: document.getElementById('authStatus'),
        btnSave: document.getElementById('btnSave'),
        btnLoad: document.getElementById('btnLoad'),
        btnExport: document.getElementById('btnExport'),
        btnImport: document.getElementById('btnImport'),
        btnReset: document.getElementById('btnReset'),
        importFile: document.getElementById('importFile'),
        gunshotSound: document.getElementById('gunshotSound')
    };
    
    // Game state with ALL NEW UPGRADES and images
    let gameState = {
        kirks: 0,
        freeMode: false,
        upgrades: [
            // Phase 1: Personal Circle (1-5)
            { id: 'tyler', name: 'Tyler Robinson', desc: 'Generates 0.5 Kirks/sec', 
              owned: 0, baseCost: 50, cost: 50, perSec: 0.5, costMult: 1.15, 
              image: 'static/tyler.jpeg', unlocked: true },
            
            { id: 'erika', name: 'Erika Kirk', desc: 'Generates 2 Kirks/sec', 
              owned: 0, baseCost: 500, cost: 500, perSec: 2, costMult: 1.15, 
              image: 'static/erikakirk.jpeg', unlocked: false },
            
            { id: 'debater', name: 'Master Debater', desc: 'Generates 10 Kirks/sec', 
              owned: 0, baseCost: 7500, cost: 7500, perSec: 10, costMult: 1.15, 
              image: 'static/master debater.jpg', unlocked: false },
            
            { id: 'fetus', name: 'Fetus (in Latin)', desc: 'Generates 50 Kirks/sec', 
              owned: 0, baseCost: 112500, cost: 112500, perSec: 50, costMult: 1.15, 
              image: 'static/fetus.jpeg', unlocked: false },
            
            // Phase 2: Online Influence (6-12)
            { id: 'woke', name: 'The Woke Left', desc: 'Generates 200 Kirks/sec', 
              owned: 0, baseCost: 1800000, cost: 1800000, perSec: 200, costMult: 1.15, 
              image: 'static/wokeleft.jpeg', unlocked: false },
            
            { id: 'schnapp', name: 'Noah Schnapp', desc: 'Generates 1,000 Kirks/sec', 
              owned: 0, baseCost: 32400000, cost: 32400000, perSec: 1000, costMult: 1.15, 
              image: 'static/noah schnapp.jpg', unlocked: false },
            
            { id: 'owens', name: 'Candace Owens', desc: 'Generates 5,000 Kirks/sec', 
              owned: 0, baseCost: 648000000, cost: 648000000, perSec: 5000, costMult: 1.15, 
              image: 'static/candace owens.jpg', unlocked: false },
            
            { id: 'baby', name: 'Baby No Money', desc: 'Generates 25,000 Kirks/sec', 
              owned: 0, baseCost: 15000000000, cost: 15000000000, perSec: 25000, costMult: 1.15, 
              image: 'static/bbnos.jpg', unlocked: false },
            
            { id: 'shapiro', name: 'Ben Shapiro', desc: 'Generates 100,000 Kirks/sec', 
              owned: 0, baseCost: 375000000000, cost: 375000000000, perSec: 100000, costMult: 1.15, 
              image: 'static/ben shapiro.jpg', unlocked: false },
            
            { id: 'supremacists', name: 'Mexican White Supremacists', desc: 'Generates 500,000 Kirks/sec', 
              owned: 0, baseCost: 10000000000000, cost: 10000000000000, perSec: 500000, costMult: 1.15, 
              image: 'static/white supremacists.jpg', unlocked: false },
            
            { id: 'fuentes', name: 'Nick Fuentes', desc: 'Generates 2,500,000 Kirks/sec', 
              owned: 0, baseCost: 300000000000000, cost: 300000000000000, perSec: 2500000, costMult: 1.15, 
              image: 'static/fuentes.jpg', unlocked: false },
            
            { id: 'trans', name: 'Transgender OnlyFans', desc: 'Generates 10,000,000 Kirks/sec', 
              owned: 0, baseCost: 10000000000000000, cost: 10000000000000000, perSec: 10000000, costMult: 1.15, 
              image: 'static/transfans.jpeg', unlocked: false },
            
            // Phase 3: Political Power (13-15)
            { id: 'ice', name: 'Immigration and Customs', desc: 'Generates 50,000,000 Kirks/sec', 
              owned: 0, baseCost: 350000000000000000, cost: 350000000000000000, perSec: 50000000, costMult: 1.15, 
              image: 'static/immigration and customs.jpg', unlocked: false },
            
            { id: 'vance', name: 'JD Vance', desc: 'Generates 250,000,000 Kirks/sec', 
              owned: 0, baseCost: 14000000000000000000, cost: 14000000000000000000, perSec: 250000000, costMult: 1.15, 
              image: 'static/vance.jpeg', unlocked: false },
            
            { id: 'aipac', name: 'AIPAC', desc: 'Generates 1,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 560000000000000000000, cost: 560000000000000000000, perSec: 1250000000, costMult: 1.15, 
              image: 'static/aipac.jpeg', unlocked: false },
            
            // Phase 4: Institutional Power (16-18)
            { id: 'oracle', name: 'Oracle (the company)', desc: 'Generates 6,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 25000000000000000000000, cost: 25000000000000000000000, perSec: 6250000000, costMult: 1.15, 
              image: 'static/oracle.jpg', unlocked: false },
            
            { id: 'blackrock', name: 'BlackRock (the company)', desc: 'Generates 31,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 1250000000000000000000000, cost: 1250000000000000000000000, perSec: 31250000000, costMult: 1.15, 
              image: 'static/blackrock.jpg', unlocked: false },
            
            { id: 'trump', name: 'Donald Trump', desc: 'Generates 156,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 75000000000000000000000000, cost: 75000000000000000000000000, perSec: 156250000000, costMult: 1.15, 
              image: 'static/trump.jpeg', unlocked: false },
            
            // Phase 5: Abstract/Mythological (19-22)
            { id: 'grok', name: 'Grok', desc: 'Generates 781,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 5000000000000000000000000000, cost: 5000000000000000000000000000, perSec: 781250000000, costMult: 1.15, 
              image: 'static/grok.jpg', unlocked: false },
            
            { id: 'jesus', name: 'Jesus Christ', desc: 'Generates 3,906,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 350000000000000000000000000000000, cost: 350000000000000000000000000000000, perSec: 3906250000000, costMult: 1.15, 
              image: 'static/jesus.gif', unlocked: false },
            
            { id: 'israel', name: 'Israel', desc: 'Generates 19,531,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 28000000000000000000000000000000000, cost: 28000000000000000000000000000000000, perSec: 19531250000000, costMult: 1.15, 
              image: 'static/israel.jpeg', unlocked: false },
            
            { id: 'yakub', name: 'Yakub', desc: 'Generates 97,656,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 2500000000000000000000000000000000000, cost: 2500000000000000000000000000000000000, perSec: 97656250000000, costMult: 1.15, 
              image: 'static/yakub.jpeg', unlocked: false }
        ]
    };
    
    // Save system constants
    const SAVE_KEY = 'kirkClickerSaveV2'; // Changed to V2 for new upgrade structure
    const SAVE_VERSION = 2;
    
    // Performance-critical: Cached DOM references
    let domCache = {
        buttons: new Map(),
        costSpans: new Map(),
        countSpans: new Map(),
        prodSpans: new Map()
    };
    
    // Performance: Cache upgrade references by ID for O(1) lookup
    const upgradeMap = new Map();
    
    // Auto-save tracking
    let lastAutoSave = Date.now();
    let originalStatusText = 'Save System Active';
    
    // Rendering control
    let needsRender = false;
    
    // KPS tracking
    let lastDisplayedKPS = null;
    let lastKpsPulseAt = 0;
    let lastKpsUpdateTime = 0;
    const KPS_PULSE_INTERVAL = 250;    // Min time between pulses
    const KPS_UPDATE_INTERVAL = 1000;  // How often to pulse during steady state
    const KPS_EPSILON = 1e-6;
    
    // ==================== UTILITY FUNCTIONS ====================
    function formatNumber(num) {
        if (num >= 1000000000000) return (num / 1000000000000).toFixed(1).replace('.0', '') + 'T';
        if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace('.0', '') + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
        return Math.floor(num).toString();
    }
    
    function formatDecimal(num) {
        if (num >= 1000) return formatNumber(num);
        if (num >= 100) return num.toFixed(0);
        if (num >= 10) return num.toFixed(1);
        if (num >= 1) return num.toFixed(2);
        if (num >= 0.1) return num.toFixed(3);
        if (num >= 0.01) return num.toFixed(4);
        return num.toFixed(5);
    }
    
    function showStatusMessage(message, duration = 1500) {
        if (!elements.authStatus) return;
        
        elements.authStatus.textContent = message;
        
        setTimeout(() => {
            if (elements.authStatus.textContent === message) {
                elements.authStatus.textContent = originalStatusText;
            }
        }, duration);
    }
    
    // Play gunshot sound for manual clicks
    function playGunshot() {
        if (!elements.gunshotSound) return;
        
        try {
            elements.gunshotSound.currentTime = 0;
            const playPromise = elements.gunshotSound.play();
            
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log('Audio play failed:', error);
                });
            }
        } catch (error) {
            console.log('Sound error:', error);
        }
    }
    
    // Update KPS display
    function updateKPS(force = false) {
        if (!elements.kpsValue || !elements.kpsCounter) return;
        
        const incomePerSecond = calculateIncomePerSecond();
        const now = Date.now();
        
        // 1. Update display value if needed
        const valueChanged = lastDisplayedKPS === null || 
                            Math.abs(incomePerSecond - lastDisplayedKPS) > KPS_EPSILON;
        
        if (force || valueChanged) {
            elements.kpsValue.textContent = formatDecimal(incomePerSecond);
            lastDisplayedKPS = incomePerSecond;
        }
        
        // 2. Determine if we should pulse
        let shouldPulse = false;
        
        if (incomePerSecond > 0) {
            if (force) {
                // Always pulse on forced updates (upgrades, reset, etc.)
                shouldPulse = true;
            } else if (valueChanged) {
                // Pulse when value actually changes
                shouldPulse = true;
            } else if (now - lastKpsUpdateTime >= KPS_UPDATE_INTERVAL) {
                // Periodic pulse during steady-state (makes it feel "alive")
                shouldPulse = true;
            }
        }
        
        // 3. Apply pulse (with throttling)
        if (shouldPulse && (force || now - lastKpsPulseAt >= KPS_PULSE_INTERVAL)) {
            elements.kpsCounter.classList.add("income-pulse");
            setTimeout(() => {
                if (elements.kpsCounter) {
                    elements.kpsCounter.classList.remove("income-pulse");
                }
            }, 300); // Match CSS animation duration
            
            lastKpsPulseAt = now;
            if (!force) {
                lastKpsUpdateTime = now; // Track when we last pulsed in steady-state
            }
        }
    }
    
    // Initialize upgrade map for O(1) lookups
    function initUpgradeMap() {
        upgradeMap.clear();
        gameState.upgrades.forEach((upgrade, index) => {
            upgradeMap.set(upgrade.id, { upgrade, index });
        });
    }
    
    // ==================== SAVE SYSTEM ====================
    function getSaveData() {
        return {
            version: SAVE_VERSION,
            kirks: gameState.kirks,
            upgrades: gameState.upgrades.map(upgrade => ({
                id: upgrade.id,
                owned: upgrade.owned,
                cost: upgrade.cost
            }))
        };
    }
    
    function saveToLocalStorage() {
        try {
            const saveData = getSaveData();
            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to save:', error);
            return false;
        }
    }
    
    function loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(SAVE_KEY);
            if (!saved) return null;
            
            const saveData = JSON.parse(saved);
            
            if (!saveData || typeof saveData !== 'object') return null;
            
            const version = saveData.version || 1;
            if (version > SAVE_VERSION) {
                showStatusMessage(`Save v${version} too new (v${SAVE_VERSION} max)`);
                return null;
            }
            
            if (typeof saveData.kirks !== 'number') return null;
            if (!Array.isArray(saveData.upgrades)) return null;
            
            saveData.version = version;
            
            return saveData;
        } catch (error) {
            console.error('Failed to load:', error);
            return null;
        }
    }
    
    function applySave(saveData) {
        if (!saveData) return;
        
        gameState.kirks = Number.isFinite(saveData.kirks) ? saveData.kirks : 0;
        
        if (saveData.upgrades && Array.isArray(saveData.upgrades)) {
            // Reset all upgrades first
            gameState.upgrades.forEach(upgrade => {
                upgrade.owned = 0;
                upgrade.cost = upgrade.baseCost;
                upgrade.unlocked = (upgrade.id === 'tyler');
            });
            
            // Apply saved upgrades
            saveData.upgrades.forEach(savedUpgrade => {
                const cached = upgradeMap.get(savedUpgrade.id);
                if (cached) {
                    const upgrade = cached.upgrade;
                    upgrade.owned = Number.isFinite(savedUpgrade.owned) ? Math.max(0, savedUpgrade.owned) : 0;
                    upgrade.cost = Number.isFinite(savedUpgrade.cost) ? Math.max(upgrade.baseCost, savedUpgrade.cost) : upgrade.baseCost;
                    
                    if (upgrade.owned > 0) {
                        upgrade.unlocked = true;
                    }
                }
            });
            
            // Unlock next upgrades based on ownership
            for (let i = 0; i < gameState.upgrades.length - 1; i++) {
                if (gameState.upgrades[i].owned > 0) {
                    gameState.upgrades[i + 1].unlocked = true;
                }
            }
        }
        
        initUpgradeMap();
        needsRender = true;
        updateCounterOnly();
        updateKPS(true); // Force KPS update when loading
    }
    
    function saveGame() {
        if (saveToLocalStorage()) {
            showStatusMessage('Saved!');
        } else {
            showStatusMessage('Save failed');
        }
    }
    
    function loadGame() {
        const saveData = loadFromLocalStorage();
        if (saveData) {
            applySave(saveData);
            showStatusMessage('Loaded!');
        } else {
            showStatusMessage('No save found');
        }
    }
    
    function exportSave() {
        try {
            const saveData = getSaveData();
            const blob = new Blob([JSON.stringify(saveData, null, 2)], { 
                type: 'application/json' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `kirk-clicker-save.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            showStatusMessage('Exported!');
        } catch (error) {
            showStatusMessage('Export failed');
        }
    }
    
    function importSave() {
        if (!elements.importFile) {
            showStatusMessage('Import not supported');
            return;
        }
        
        elements.importFile.value = '';
        
        elements.importFile.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const saveData = JSON.parse(e.target.result);
                    
                    if (!saveData || typeof saveData !== 'object') {
                        throw new Error('Invalid file format');
                    }
                    
                    const version = saveData.version || 1;
                    if (version > SAVE_VERSION) {
                        throw new Error(`Save v${version} too new (v${SAVE_VERSION} max)`);
                    }
                    
                    if (typeof saveData.kirks !== 'number' || !Number.isFinite(saveData.kirks)) {
                        throw new Error('Invalid kirks value');
                    }
                    
                    if (!Array.isArray(saveData.upgrades)) {
                        throw new Error('Invalid upgrades data');
                    }
                    
                    applySave(saveData);
                    saveToLocalStorage();
                    showStatusMessage('Imported!');
                } catch (error) {
                    showStatusMessage('Import failed');
                }
            };
            
            reader.readAsText(file);
        };
        
        elements.importFile.click();
    }
    
    function resetGame() {
        if (confirm('Are you sure you want to reset the game? This will delete all progress and cannot be undone.')) {
            localStorage.removeItem(SAVE_KEY);
            
            gameState.kirks = 0;
            gameState.upgrades.forEach(upgrade => {
                upgrade.owned = 0;
                upgrade.cost = upgrade.baseCost;
                upgrade.unlocked = (upgrade.id === 'tyler');
            });
            
            initUpgradeMap();
            needsRender = true;
            
            showStatusMessage('Game reset!');
            updateKPS(true); // Force KPS update when resetting
        }
    }
    
    // ==================== GAME FUNCTIONS ====================
    
    function updateCounterOnly() {
        if (elements.counter) {
            elements.counter.textContent = `${formatNumber(gameState.kirks)} Kirks`;
        }
    }
    
    function updateButtonStates() {
        domCache.buttons.forEach((button, upgradeId) => {
            if (!button) return;
            
            const cached = upgradeMap.get(upgradeId);
            if (!cached) return;
            
            const { upgrade } = cached;
            const canBuy = gameState.freeMode || gameState.kirks >= upgrade.cost;
            const isDisabled = !canBuy || !upgrade.unlocked;
            
            button.disabled = isDisabled;
        });
    }
    
    function renderUpgrades() {
        if (!elements.upgradesContainer) return;
        
        elements.upgradesContainer.innerHTML = '';
        
        domCache.buttons.clear();
        domCache.costSpans.clear();
        domCache.countSpans.clear();
        domCache.prodSpans.clear();
        
        gameState.upgrades.forEach((upgrade, index) => {
            const upgradeEl = document.createElement('div');
            upgradeEl.className = `upgrade-item ${upgrade.unlocked ? '' : 'hidden'}`;
            upgradeEl.dataset.upgradeId = upgrade.id;
            
            // Add lazy loading to images for better performance
            const imgTag = upgrade.image ? 
                `<img src="${upgrade.image}" alt="${upgrade.name}" loading="lazy">` : 
                `<div class="placeholder-text">${upgrade.id.toUpperCase()}</div>`;
            
            upgradeEl.innerHTML = `
                <div class="upgrade-header">
                    <div class="upgrade-image">
                        ${imgTag}
                    </div>
                    <div class="upgrade-info">
                        <h4 class="upgrade-name">${upgrade.name}</h4>
                        <p class="upgrade-description">${upgrade.desc}</p>
                        <div class="upgrade-stats">
                            <span class="stat">Owned: <span class="upgrade-count" data-upgrade-id="${upgrade.id}">${upgrade.owned}</span></span>
                            <span class="stat">Production: <span class="upgrade-production" data-upgrade-id="${upgrade.id}">${formatNumber(upgrade.owned * upgrade.perSec)}</span>/sec</span>
                        </div>
                    </div>
                </div>
                <button class="btn upgrade-btn" 
                        data-upgrade-id="${upgrade.id}"
                        data-upgrade-index="${index}">
                    Buy for <span class="upgrade-cost" data-upgrade-id="${upgrade.id}">${formatNumber(upgrade.cost)}</span> Kirks
                </button>
            `;
            
            elements.upgradesContainer.appendChild(upgradeEl);
            
            const button = upgradeEl.querySelector(`button[data-upgrade-id="${upgrade.id}"]`);
            const costSpan = upgradeEl.querySelector(`.upgrade-cost[data-upgrade-id="${upgrade.id}"]`);
            const countSpan = upgradeEl.querySelector(`.upgrade-count[data-upgrade-id="${upgrade.id}"]`);
            const prodSpan = upgradeEl.querySelector(`.upgrade-production[data-upgrade-id="${upgrade.id}"]`);
            
            if (button) domCache.buttons.set(upgrade.id, button);
            if (costSpan) domCache.costSpans.set(upgrade.id, costSpan);
            if (countSpan) domCache.countSpans.set(upgrade.id, countSpan);
            if (prodSpan) domCache.prodSpans.set(upgrade.id, prodSpan);
        });
        
        attachUpgradeEventListeners();
        updateButtonStates();
    }
    
    function attachUpgradeEventListeners() {
        domCache.buttons.forEach((button, upgradeId) => {
            const index = parseInt(button.dataset.upgradeIndex);
            if (!isNaN(index)) {
                button.addEventListener('click', () => buyUpgrade(index));
            }
        });
    }
    
    function clickKirk() {
        gameState.kirks += 1;
        updateCounterOnly();
        updateButtonStates();
        
        playGunshot();
        
        if (elements.kirkButton) {
            elements.kirkButton.classList.add('click-pulse');
            setTimeout(() => elements.kirkButton.classList.remove('click-pulse'), 500);
        }
    }
    
    function buyUpgrade(index) {
        const upgrade = gameState.upgrades[index];
        
        if (!upgrade.unlocked) return;
        if (!gameState.freeMode && gameState.kirks < upgrade.cost) return;
        
        if (!gameState.freeMode) {
            gameState.kirks -= upgrade.cost;
        }
        
        upgrade.owned += 1;
        upgrade.cost = Math.floor(upgrade.cost * upgrade.costMult);
        
        const willUnlock = (upgrade.owned === 1 && index < gameState.upgrades.length - 1);
        
        if (!willUnlock) {
            const countSpan = domCache.countSpans.get(upgrade.id);
            const costSpan = domCache.costSpans.get(upgrade.id);
            const prodSpan = domCache.prodSpans.get(upgrade.id);
            
            if (countSpan) countSpan.textContent = upgrade.owned;
            if (costSpan) costSpan.textContent = formatNumber(upgrade.cost);
            if (prodSpan) prodSpan.textContent = formatNumber(upgrade.owned * upgrade.perSec);
        }
        
        if (willUnlock) {
            gameState.upgrades[index + 1].unlocked = true;
            needsRender = true;
        }
        
        updateCounterOnly();
        updateButtonStates();
        updateKPS(true); // Force KPS update after buying upgrade
        
        saveToLocalStorage();
    }
    
    function calculateIncomePerSecond() {
        return gameState.upgrades.reduce((total, upgrade) => {
            return total + (upgrade.owned * upgrade.perSec);
        }, 0);
    }
    
    // ==================== EVENT LISTENERS ====================
    
    if (elements.kirkButton) {
        elements.kirkButton.addEventListener('click', clickKirk);
    }
    
    if (elements.btnSave) {
        elements.btnSave.addEventListener('click', saveGame);
    }
    
    if (elements.btnLoad) {
        elements.btnLoad.addEventListener('click', loadGame);
    }
    
    if (elements.btnExport) {
        elements.btnExport.addEventListener('click', exportSave);
    }
    
    if (elements.btnImport) {
        elements.btnImport.addEventListener('click', importSave);
    }
    
    if (elements.btnReset) {
        elements.btnReset.addEventListener('click', resetGame);
    }
    
    // ==================== GAME LOOP ====================
    function gameLoop() {
        const incomePerSecond = calculateIncomePerSecond();
        const incomePerTick = incomePerSecond / 10;
        gameState.kirks += incomePerTick;
        
        updateCounterOnly();
        updateButtonStates();
        
        // Update KPS with throttling
        updateKPS(false);
        
        if (needsRender) {
            renderUpgrades();
            needsRender = false;
        }
        
        const now = Date.now();
        if (now - lastAutoSave >= 30000) {
            saveToLocalStorage();
            lastAutoSave = now;
        }
    }
    
    // ==================== INITIALIZATION ====================
    function init() {
        console.log('=== INITIALIZING KIRK CLICKER V2 ===');
        console.log('Total upgrades:', gameState.upgrades.length);
        
        initUpgradeMap();
        
        const savedData = loadFromLocalStorage();
        if (savedData) {
            applySave(savedData);
            console.log('Loaded saved game (v' + (savedData.version || 1) + ')');
        } else {
            console.log('Starting fresh game');
        }
        
        renderUpgrades();
        updateCounterOnly();
        updateKPS(true); // Force initial KPS update
        
        // Start game loop
        setInterval(gameLoop, 100);
        
        console.log('Kirk Clicker V2 initialized with all new upgrades!');
    }
    
    init();
});