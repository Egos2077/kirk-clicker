document.addEventListener("DOMContentLoaded", () => {
    console.log("Kirk Clicker V3 - Loaded");
    
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
    
    // Game state - MINIMAL APPROACH
    let gameState = {
        kirks: 0,
        totalClicks: 0,              // NEW: Track manual clicks
        generalLevel: 0,             // NEW: General upgrade level
        maxGeneralUnlocked: 0,       // NEW: Max general level unlocked by phases
        manualLevel: 0,              // NEW: Manual click upgrade level
        clickerTierById: {},         // NEW: { tyler: 0, erika: 0, ... }
        freeMode: false,
        
        // Phase definitions (unchanged)
        phases: [
            { id: 'phase1', name: 'Personal Circle', start: 0, end: 4 },      // Indices 0-3 (Tyler, Erika, Debater, Fetus)
            { id: 'phase2', name: 'Online Influence', start: 4, end: 12 },    // Indices 4-11
            { id: 'phase3', name: 'Political Power', start: 12, end: 15 },    // Indices 12-14
            { id: 'phase4', name: 'Institutional Power', start: 15, end: 18 }, // Indices 15-17
            { id: 'phase5', name: 'Abstract/Mythological', start: 18, end: 22 } // Indices 18-21
        ],
        
        upgrades: [
            // Phase 1: Personal Circle (indices 0-3)
            { id: 'tyler', name: 'Tyler Robinson', desc: 'Generates 0.5 Kirks/sec', 
              owned: 0, baseCost: 50, cost: 50, perSec: 0.5, costMult: 1.15, 
              image: 'static/tyler.jpeg', unlocked: true },
            
            { id: 'erika', name: 'Erika Kirk', desc: 'Generates 2 Kirks/sec', 
              owned: 0, baseCost: 500, cost: 500, perSec: 2, costMult: 1.15, 
              image: 'static/erikakirk.jpeg', unlocked: false },
            
            { id: 'debater', name: 'Master Debater', desc: 'Generates 10 Kirks/sec', 
              owned: 0, baseCost: 7500, cost: 7500, perSec: 10, costMult: 1.15, 
              image: 'static/master debater.jpg', unlocked: false },
            
            { id: 'fetus', name: 'Fetus in Latin', desc: 'Generates 50 Kirks/sec', 
              owned: 0, baseCost: 112500, cost: 112500, perSec: 50, costMult: 1.15, 
              image: 'static/fetus.jpeg', unlocked: false },
            
            // Phase 2: Online Influence (indices 4-11)
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
            
            // Phase 3: Political Power (indices 12-14)
            { id: 'ice', name: 'Immigration and Customs Enforcement', desc: 'Generates 50,000,000 Kirks/sec', 
              owned: 0, baseCost: 350000000000000000, cost: 350000000000000000, perSec: 50000000, costMult: 1.15, 
              image: 'static/immigration and customs.jpg', unlocked: false },
            
            { id: 'vance', name: 'JD Vance', desc: 'Generates 250,000,000 Kirks/sec', 
              owned: 0, baseCost: 14000000000000000000, cost: 14000000000000000000, perSec: 250000000, costMult: 1.15, 
              image: 'static/vance.jpeg', unlocked: false },
            
            { id: 'aipac', name: 'AIPAC', desc: 'Generates 1,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 560000000000000000000, cost: 560000000000000000000, perSec: 1250000000, costMult: 1.15, 
              image: 'static/aipac.jpeg', unlocked: false },
            
            // Phase 4: Institutional Power (indices 15-17)
            { id: 'oracle', name: 'Oracle', desc: 'Generates 6,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 25000000000000000000000, cost: 25000000000000000000000, perSec: 6250000000, costMult: 1.15, 
              image: 'static/oracle.jpg', unlocked: false },
            
            { id: 'blackrock', name: 'BlackRock', desc: 'Generates 31,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 1250000000000000000000000, cost: 1250000000000000000000000, perSec: 31250000000, costMult: 1.15, 
              image: 'static/blackrock.jpg', unlocked: false },
            
            { id: 'trump', name: 'Donald Trump', desc: 'Generates 156,250,000,000 Kirks/sec', 
              owned: 0, baseCost: 75000000000000000000000000, cost: 75000000000000000000000000, perSec: 156250000000, costMult: 1.15, 
              image: 'static/trump.jpeg', unlocked: false },
            
            // Phase 5: Abstract/Mythological (indices 18-21)
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
    
    // Initialize clickerTierById for all clickers
    gameState.upgrades.forEach(clicker => {
        gameState.clickerTierById[clicker.id] = 0;
    });
    
    // Save system constants
    const SAVE_KEY_V3 = 'kirkClickerSaveV3';
    const SAVE_KEY_V2 = 'kirkClickerSaveV2'; // Old key for migration
    const SAVE_VERSION = 3;
    
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
    let needsUpgradeTabRender = false;
    
    // KPS tracking
    let lastDisplayedKPS = null;
    let lastKpsPulseAt = 0;
    let lastKpsUpdateTime = 0;
    const KPS_PULSE_INTERVAL = 250;
    const KPS_UPDATE_INTERVAL = 1000;
    const KPS_EPSILON = 1e-6;
    
    // Tab state
    let currentTab = 'clickers'; // 'clickers' or 'upgrades'
    
    // ==================== WOBBLE ANIMATION CONTROL ====================
    function initWobbleControl() {
        if (!elements.kirkButton) return;

        const clearWobble = (e) => {
            if (e.animationName === 'wobble') {
                elements.kirkButton.classList.remove('wobble');
            }
        };

        elements.kirkButton.addEventListener('animationend', clearWobble);
        elements.kirkButton.addEventListener('animationcancel', clearWobble);
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    function formatNumber(num) {
        const suffixes = [
            '', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 
            'Dc', 'Ud', 'Dd', 'Td', 'Qad', 'Qid', 'Sxd', 'Spd', 'Ocd', 'Nod',
            'Vg', 'Uvg', 'Dvg', 'Tvg', 'Qavg', 'Qivg', 'Sxvg', 'Spvg', 'Ocvg', 'Novg',
            'Tg', 'Utg', 'Dtg', 'Ttg', 'Qatg', 'Qitg', 'Sxtg', 'Sptg', 'Octg', 'Notg'
        ];
        
        if (num < 1000) return Math.floor(num).toString();
        
        const tier = Math.floor(Math.log10(Math.abs(num)) / 3);
        
        if (tier >= suffixes.length) {
            return num.toExponential(3);
        }
        
        const suffix = suffixes[tier];
        const scale = Math.pow(10, tier * 3);
        const scaled = num / scale;
        
        if (scaled < 10) {
            return scaled.toFixed(2).replace(/\.?0+$/, '') + suffix;
        } else if (scaled < 100) {
            return scaled.toFixed(1).replace(/\.0$/, '') + suffix;
        } else {
            return scaled.toFixed(0) + suffix;
        }
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
    
    function updateKPS(force = false) {
        if (!elements.kpsValue || !elements.kpsCounter) return;
        
        const incomePerSecond = calculateIncomePerSecond();
        const now = Date.now();
        
        const valueChanged = lastDisplayedKPS === null || 
                            Math.abs(incomePerSecond - lastDisplayedKPS) > KPS_EPSILON;
        
        if (force || valueChanged) {
            elements.kpsValue.textContent = formatDecimal(incomePerSecond);
            lastDisplayedKPS = incomePerSecond;
        }
        
        let shouldPulse = false;
        
        if (incomePerSecond > 0) {
            if (force) {
                shouldPulse = true;
            } else if (valueChanged) {
                shouldPulse = true;
            } else if (now - lastKpsUpdateTime >= KPS_UPDATE_INTERVAL) {
                shouldPulse = true;
            }
        }
        
        if (shouldPulse && (force || now - lastKpsPulseAt >= KPS_PULSE_INTERVAL)) {
            elements.kpsCounter.classList.add("income-pulse");
            setTimeout(() => {
                if (elements.kpsCounter) {
                    elements.kpsCounter.classList.remove("income-pulse");
                }
            }, 300);
            
            lastKpsPulseAt = now;
            if (!force) {
                lastKpsUpdateTime = now;
            }
        }
    }
    
    function initUpgradeMap() {
        upgradeMap.clear();
        gameState.upgrades.forEach((upgrade, index) => {
            upgradeMap.set(upgrade.id, { upgrade, index });
        });
    }
    
    // ==================== MULTIPLIER CALCULATIONS ====================
    
    // General multiplier: 1.3^generalLevel
    function getGeneralMultiplier() {
        return Math.pow(1.3, gameState.generalLevel);
    }
    
    // Manual click value: baseClick * (2^manualLevel) * generalMultiplier
    function getManualClickValue() {
        const manualMultiplier = Math.pow(2, gameState.manualLevel);
        return 1 * manualMultiplier * getGeneralMultiplier();
    }
    
    // Clicker production: owned * perSec * (2^tier) * generalMultiplier
    function getClickerProduction(clickerId) {
        const cached = upgradeMap.get(clickerId);
        if (!cached) return 0;
        
        const clicker = cached.upgrade;
        const tier = gameState.clickerTierById[clickerId] || 0;
        const tierMultiplier = Math.pow(2, tier);
        
        return clicker.owned * clicker.perSec * tierMultiplier * getGeneralMultiplier();
    }
    
    // Total income per second
    function calculateIncomePerSecond() {
        let total = 0;
        gameState.upgrades.forEach(clicker => {
            total += getClickerProduction(clicker.id);
        });
        return total;
    }
    
    // ==================== UPGRADE COST CALCULATIONS ====================
    
    // General upgrade cost: 1,000,000 * (1000^level)
    function getGeneralUpgradeCost() {
        return 1000000 * Math.pow(1000, gameState.generalLevel);
    }
    
    // Manual upgrade cost: 10,000 * (100^level)
    function getManualUpgradeCost() {
        return 10000 * Math.pow(100, gameState.manualLevel);
    }
    
    // Clicker tier cost: baseCost * (100^tier)
    function getClickerTierCost(clickerId) {
        const cached = upgradeMap.get(clickerId);
        if (!cached) return Infinity;
        
        const clicker = cached.upgrade;
        const tier = gameState.clickerTierById[clickerId] || 0;
        
        return clicker.baseCost * Math.pow(100, tier + 1);
    }
    
    // ==================== UPGRADE AVAILABILITY CHECKS ====================
    
    // Check if general upgrade is available
    function isGeneralUpgradeAvailable() {
        return gameState.generalLevel < gameState.maxGeneralUnlocked;
    }
    
    // Check if manual upgrade is available
    function isManualUpgradeAvailable() {
        const requiredClicks = (gameState.manualLevel + 1) * 1000;
        return gameState.totalClicks >= requiredClicks;
    }
    
    // Get list of clickers with available tier upgrades
    function getAvailableClickerTierUpgrades() {
        const available = [];
        
        gameState.upgrades.forEach(clicker => {
            if (!clicker.unlocked) return;
            
            const tier = gameState.clickerTierById[clicker.id] || 0;
            const requiredOwned = (tier + 1) * 50;
            
            if (clicker.owned >= requiredOwned) {
                available.push({
                    id: clicker.id,
                    name: clicker.name,
                    tier: tier + 1,
                    requiredOwned: requiredOwned,
                    cost: getClickerTierCost(clicker.id)
                });
            }
        });
        
        return available;
    }
    
    // ==================== PHASE DETECTION ====================
    
    // Detect highest phase reached based on owned clickers
    function getHighestPhaseReached() {
        let highestPhase = 0;
        
        gameState.phases.forEach((phase, index) => {
            // Check if any clicker in this phase is owned
            for (let i = phase.start; i < phase.end; i++) {
                if (gameState.upgrades[i].owned > 0) {
                    highestPhase = Math.max(highestPhase, index);
                    break;
                }
            }
        });
        
        return highestPhase;
    }
    
    // Update max general unlocked based on phases
    function updateMaxGeneralUnlocked() {
        const highestPhase = getHighestPhaseReached();
        gameState.maxGeneralUnlocked = highestPhase + 1; // Phase 0 unlocks 1 general, etc.
    }
    
    // ==================== SAVE SYSTEM ====================
    
    function getSaveData() {
        return {
            version: SAVE_VERSION,
            kirks: gameState.kirks,
            totalClicks: gameState.totalClicks,
            generalLevel: gameState.generalLevel,
            maxGeneralUnlocked: gameState.maxGeneralUnlocked,
            manualLevel: gameState.manualLevel,
            clickerTierById: gameState.clickerTierById,
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
            localStorage.setItem(SAVE_KEY_V3, JSON.stringify(saveData));
            return true;
        } catch (error) {
            console.error('Failed to save:', error);
            return false;
        }
    }
    
    function loadFromLocalStorage() {
        try {
            // Try V3 first
            let saved = localStorage.getItem(SAVE_KEY_V3);
            let saveData = null;
            
            if (saved) {
                saveData = JSON.parse(saved);
            } else {
                // Migrate from V2
                saved = localStorage.getItem(SAVE_KEY_V2);
                if (saved) {
                    const v2Data = JSON.parse(saved);
                    
                    // Convert V2 to V3 format
                    saveData = {
                        version: SAVE_VERSION,
                        kirks: v2Data.kirks || 0,
                        totalClicks: 0,
                        generalLevel: 0,
                        maxGeneralUnlocked: 0,
                        manualLevel: 0,
                        clickerTierById: {},
                        upgrades: v2Data.upgrades || []
                    };
                    
                    // Initialize all clicker tiers to 0
                    gameState.upgrades.forEach(clicker => {
                        saveData.clickerTierById[clicker.id] = 0;
                    });
                    
                    console.log('Migrated from V2 to V3');
                }
            }
            
            if (!saveData || typeof saveData !== 'object') return null;
            
            const version = saveData.version || 1;
            if (version > SAVE_VERSION) {
                showStatusMessage(`Save v${version} too new (v${SAVE_VERSION} max)`);
                return null;
            }
            
            if (typeof saveData.kirks !== 'number') return null;
            if (!Array.isArray(saveData.upgrades)) return null;
            
            saveData.version = SAVE_VERSION;
            
            return saveData;
        } catch (error) {
            console.error('Failed to load:', error);
            return null;
        }
    }
    
    function applySave(saveData) {
        if (!saveData) return;
        
        gameState.kirks = Number.isFinite(saveData.kirks) ? saveData.kirks : 0;
        gameState.totalClicks = Number.isFinite(saveData.totalClicks) ? saveData.totalClicks : 0;
        gameState.generalLevel = Number.isFinite(saveData.generalLevel) ? saveData.generalLevel : 0;
        gameState.maxGeneralUnlocked = Number.isFinite(saveData.maxGeneralUnlocked) ? saveData.maxGeneralUnlocked : 0;
        gameState.manualLevel = Number.isFinite(saveData.manualLevel) ? saveData.manualLevel : 0;
        
        // Load clicker tiers
        if (saveData.clickerTierById && typeof saveData.clickerTierById === 'object') {
            gameState.clickerTierById = { ...saveData.clickerTierById };
        }
        
        // Ensure all clickers have a tier entry
        gameState.upgrades.forEach(clicker => {
            if (!(clicker.id in gameState.clickerTierById)) {
                gameState.clickerTierById[clicker.id] = 0;
            }
        });
        
        // Reset all upgrades first
        gameState.upgrades.forEach(upgrade => {
            upgrade.owned = 0;
            upgrade.cost = upgrade.baseCost;
            upgrade.unlocked = (upgrade.id === 'tyler');
        });
        
        // Apply saved upgrades
        if (saveData.upgrades && Array.isArray(saveData.upgrades)) {
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
        
        // Update phase-based unlocks
        updateMaxGeneralUnlocked();
        
        initUpgradeMap();
        needsRender = true;
        needsUpgradeTabRender = true;
        updateCounterOnly();
        updateKPS(true);
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
            a.download = `kirk-clicker-save-v3.json`;
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
            localStorage.removeItem(SAVE_KEY_V3);
            localStorage.removeItem(SAVE_KEY_V2);
            
            gameState.kirks = 0;
            gameState.totalClicks = 0;
            gameState.generalLevel = 0;
            gameState.maxGeneralUnlocked = 0;
            gameState.manualLevel = 0;
            
            gameState.upgrades.forEach(upgrade => {
                upgrade.owned = 0;
                upgrade.cost = upgrade.baseCost;
                upgrade.unlocked = (upgrade.id === 'tyler');
                gameState.clickerTierById[upgrade.id] = 0;
            });
            
            initUpgradeMap();
            needsRender = true;
            needsUpgradeTabRender = true;
            
            showStatusMessage('Game reset!');
            updateKPS(true);
        }
    }
    
    // ==================== GAME FUNCTIONS ====================
    
    function updateCounterOnly() {
        if (elements.counter) {
            elements.counter.textContent = `${formatNumber(gameState.kirks)} Kirks`;
        }
    }
    
    function updateButtonStates() {
        // Auto-clicker buttons
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
            
            const imgTag = upgrade.image ? 
                `<img src="${upgrade.image}" alt="${upgrade.name}" loading="lazy">` : 
                `<div class="placeholder-text">${upgrade.id.toUpperCase()}</div>`;
            
            const production = getClickerProduction(upgrade.id);
            
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
                            <span class="stat">Production: <span class="upgrade-production" data-upgrade-id="${upgrade.id}">${formatNumber(production)}</span>/sec</span>
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
        const clickValue = getManualClickValue();
        gameState.kirks += clickValue;
        gameState.totalClicks += 1;
        
        updateCounterOnly();
        updateButtonStates();
        
        // Check if manual upgrade became available
        if (isManualUpgradeAvailable() && currentTab === 'upgrades') {
            needsUpgradeTabRender = true;
        }
        
        playGunshot();
        
        const el = elements.kirkButton;
        if (!el) return;
        
        // Click-pulse: restart every click with reflow trick
        el.classList.remove('click-pulse');
        void el.offsetWidth; // Force reflow
        el.classList.add('click-pulse');
        
        // Wobble: only if not already wobbling (class gate)
        if (!el.classList.contains('wobble')) {
            el.classList.add('wobble');
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
            if (prodSpan) prodSpan.textContent = formatNumber(getClickerProduction(upgrade.id));
        }
        
        if (willUnlock) {
            gameState.upgrades[index + 1].unlocked = true;
            needsRender = true;
        }
        
        // Check if this unlocks a new phase (and thus general upgrade)
        const oldMax = gameState.maxGeneralUnlocked;
        updateMaxGeneralUnlocked();
        if (gameState.maxGeneralUnlocked > oldMax && currentTab === 'upgrades') {
            needsUpgradeTabRender = true;
        }
        
        // Check if clicker tier upgrade became available
        if (currentTab === 'upgrades') {
            const tier = gameState.clickerTierById[upgrade.id] || 0;
            const requiredOwned = (tier + 1) * 50;
            if (upgrade.owned >= requiredOwned) {
                needsUpgradeTabRender = true;
            }
        }
        
        updateCounterOnly();
        updateButtonStates();
        updateKPS(true);
        
        saveToLocalStorage();
    }
    
    // ==================== UPGRADE TAB RENDERING ====================
    
    function renderUpgradeTab() {
        const container = document.getElementById('upgradeTabContent');
        if (!container) return;
        
        container.innerHTML = '';
        
        let hasAnyUpgrade = false;
        
        // 1. GENERAL UPGRADE
        if (isGeneralUpgradeAvailable()) {
            hasAnyUpgrade = true;
            const cost = getGeneralUpgradeCost();
            const canAfford = gameState.freeMode || gameState.kirks >= cost;
            const currentMult = getGeneralMultiplier();
            const nextMult = Math.pow(1.3, gameState.generalLevel + 1);
            
            const generalEl = document.createElement('div');
            generalEl.className = 'upgrade-item-special';
            generalEl.innerHTML = `
                <div class="upgrade-special-header">
                    <h4 class="upgrade-special-name">⚡ General Multiplier</h4>
                    <span class="upgrade-special-level">Level ${gameState.generalLevel} → ${gameState.generalLevel + 1}</span>
                </div>
                <p class="upgrade-special-desc">
                    Multiply ALL production and click power by 1.3x<br>
                    <small>Current: ${currentMult.toFixed(2)}x → Next: ${nextMult.toFixed(2)}x</small>
                </p>
                <button class="btn upgrade-btn-special ${canAfford ? '' : 'disabled'}" 
                        id="btnBuyGeneral"
                        ${canAfford ? '' : 'disabled'}>
                    Buy for ${formatNumber(cost)} Kirks
                </button>
            `;
            container.appendChild(generalEl);
            
            const button = generalEl.querySelector('#btnBuyGeneral');
            if (button) {
                button.addEventListener('click', buyGeneralUpgrade);
            }
        }
        
        // 2. MANUAL UPGRADE
        if (isManualUpgradeAvailable()) {
            hasAnyUpgrade = true;
            const cost = getManualUpgradeCost();
            const canAfford = gameState.freeMode || gameState.kirks >= cost;
            const requiredClicks = (gameState.manualLevel + 1) * 1000;
            const currentValue = getManualClickValue();
            const nextValue = Math.pow(2, gameState.manualLevel + 1) * getGeneralMultiplier();
            
            const manualEl = document.createElement('div');
            manualEl.className = 'upgrade-item-special';
            manualEl.innerHTML = `
                <div class="upgrade-special-header">
                    <h4 class="upgrade-special-name">👆 Manual Click Power</h4>
                    <span class="upgrade-special-level">Tier ${gameState.manualLevel + 1}</span>
                </div>
                <p class="upgrade-special-desc">
                    Double manual click power (affected by General Multiplier)<br>
                    <small>Current: ${formatDecimal(currentValue)} → Next: ${formatDecimal(nextValue)}</small><br>
                    <small class="upgrade-progress">Unlocked at ${formatNumber(requiredClicks)} clicks (✓)</small>
                </p>
                <button class="btn upgrade-btn-special ${canAfford ? '' : 'disabled'}" 
                        id="btnBuyManual"
                        ${canAfford ? '' : 'disabled'}>
                    Buy for ${formatNumber(cost)} Kirks
                </button>
            `;
            container.appendChild(manualEl);
            
            const button = manualEl.querySelector('#btnBuyManual');
            if (button) {
                button.addEventListener('click', buyManualUpgrade);
            }
        }
        
        // 3. CLICKER TIER UPGRADES
        const availableTiers = getAvailableClickerTierUpgrades();
        if (availableTiers.length > 0) {
            hasAnyUpgrade = true;
            
            availableTiers.forEach(tierUpgrade => {
                const canAfford = gameState.freeMode || gameState.kirks >= tierUpgrade.cost;
                const currentTier = gameState.clickerTierById[tierUpgrade.id] || 0;
                const currentMult = Math.pow(2, currentTier);
                const nextMult = Math.pow(2, tierUpgrade.tier);
                
                const tierEl = document.createElement('div');
                tierEl.className = 'upgrade-item-special upgrade-item-tier';
                tierEl.innerHTML = `
                    <div class="upgrade-special-header">
                        <h4 class="upgrade-special-name">${tierUpgrade.name}</h4>
                        <span class="upgrade-special-level">Tier ${currentTier} → ${tierUpgrade.tier}</span>
                    </div>
                    <p class="upgrade-special-desc">
                        Double this clicker's production<br>
                        <small>Multiplier: ${currentMult}x → ${nextMult}x</small><br>
                        <small class="upgrade-progress">Unlocked at ${tierUpgrade.requiredOwned} owned (✓)</small>
                    </p>
                    <button class="btn upgrade-btn-special ${canAfford ? '' : 'disabled'}" 
                            data-clicker-id="${tierUpgrade.id}"
                            ${canAfford ? '' : 'disabled'}>
                        Buy for ${formatNumber(tierUpgrade.cost)} Kirks
                    </button>
                `;
                container.appendChild(tierEl);
                
                const button = tierEl.querySelector('button');
                if (button) {
                    button.addEventListener('click', () => buyClickerTierUpgrade(tierUpgrade.id));
                }
            });
        }
        
        // Show empty state if no upgrades available
        if (!hasAnyUpgrade) {
            container.innerHTML = `
                <div class="upgrade-empty-state">
                    <p>No upgrades available yet.</p>
                    <p class="upgrade-empty-hint">
                        ${gameState.generalLevel >= gameState.maxGeneralUnlocked ? 
                            'Buy more clickers to unlock phases and General upgrades!' : ''}
                        ${!isManualUpgradeAvailable() ? 
                            `<br>Next Manual upgrade at ${formatNumber((gameState.manualLevel + 1) * 1000)} clicks (${formatNumber(gameState.totalClicks)} / ${formatNumber((gameState.manualLevel + 1) * 1000)})` : ''}
                    </p>
                </div>
            `;
        }
        
        needsUpgradeTabRender = false;
    }
    
    function buyGeneralUpgrade() {
        const cost = getGeneralUpgradeCost();
        
        if (!gameState.freeMode && gameState.kirks < cost) return;
        if (!isGeneralUpgradeAvailable()) return;
        
        if (!gameState.freeMode) {
            gameState.kirks -= cost;
        }
        
        gameState.generalLevel += 1;
        
        // Update all production displays
        gameState.upgrades.forEach(clicker => {
            const prodSpan = domCache.prodSpans.get(clicker.id);
            if (prodSpan) {
                prodSpan.textContent = formatNumber(getClickerProduction(clicker.id));
            }
        });
        
        updateCounterOnly();
        updateButtonStates();
        updateKPS(true);
        needsUpgradeTabRender = true;
        
        saveToLocalStorage();
    }
    
    function buyManualUpgrade() {
        const cost = getManualUpgradeCost();
        
        if (!gameState.freeMode && gameState.kirks < cost) return;
        if (!isManualUpgradeAvailable()) return;
        
        if (!gameState.freeMode) {
            gameState.kirks -= cost;
        }
        
        gameState.manualLevel += 1;
        
        updateCounterOnly();
        updateButtonStates();
        needsUpgradeTabRender = true;
        
        saveToLocalStorage();
    }
    
    function buyClickerTierUpgrade(clickerId) {
        const cost = getClickerTierCost(clickerId);
        
        if (!gameState.freeMode && gameState.kirks < cost) return;
        
        const tier = gameState.clickerTierById[clickerId] || 0;
        const cached = upgradeMap.get(clickerId);
        if (!cached) return;
        
        const requiredOwned = (tier + 1) * 50;
        if (cached.upgrade.owned < requiredOwned) return;
        
        if (!gameState.freeMode) {
            gameState.kirks -= cost;
        }
        
        gameState.clickerTierById[clickerId] = tier + 1;
        
        // Update production display for this clicker
        const prodSpan = domCache.prodSpans.get(clickerId);
        if (prodSpan) {
            prodSpan.textContent = formatNumber(getClickerProduction(clickerId));
        }
        
        updateCounterOnly();
        updateButtonStates();
        updateKPS(true);
        needsUpgradeTabRender = true;
        
        saveToLocalStorage();
    }
    
    // ==================== TAB SYSTEM ====================
    
    function setupTabSystem() {
        // Create tab container if it doesn't exist
        const upgradesBox = document.querySelector('.upgrades-box');
        if (!upgradesBox) return;
        
        // Insert tab navigation before upgrades container
        const tabNav = document.createElement('div');
        tabNav.className = 'upgrade-tabs';
        tabNav.innerHTML = `
            <button class="tab-btn active" data-tab="clickers">AUTO-CLICKERS</button>
            <button class="tab-btn" data-tab="upgrades">UPGRADES</button>
        `;
        
        upgradesBox.insertBefore(tabNav, upgradesBox.firstChild);
        
        // Create upgrade tab content container
        const upgradeTabContent = document.createElement('div');
        upgradeTabContent.id = 'upgradeTabContent';
        upgradeTabContent.className = 'upgrade-tab-content hidden';
        upgradesBox.appendChild(upgradeTabContent);
        
        // Add tab switching logic
        const tabButtons = tabNav.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                
                // Update active button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show/hide content
                if (tab === 'clickers') {
                    currentTab = 'clickers';
                    elements.upgradesContainer.classList.remove('hidden');
                    upgradeTabContent.classList.add('hidden');
                } else {
                    currentTab = 'upgrades';
                    elements.upgradesContainer.classList.add('hidden');
                    upgradeTabContent.classList.remove('hidden');
                    renderUpgradeTab();
                }
            });
        });
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
        updateKPS(false);
        
        if (needsRender) {
            renderUpgrades();
            needsRender = false;
        }
        
        if (needsUpgradeTabRender && currentTab === 'upgrades') {
            renderUpgradeTab();
        }
        
        const now = Date.now();
        if (now - lastAutoSave >= 30000) {
            saveToLocalStorage();
            lastAutoSave = now;
        }
    }
    
    // ==================== INITIALIZATION ====================
    function init() {
        console.log('=== INITIALIZING KIRK CLICKER V3 ===');
        console.log('Total clickers:', gameState.upgrades.length);
        
        initUpgradeMap();
        initWobbleControl(); // Initialize wobble animation control
        
        const savedData = loadFromLocalStorage();
        if (savedData) {
            applySave(savedData);
            console.log('Loaded saved game (v' + (savedData.version || 1) + ')');
        } else {
            console.log('Starting fresh game');
        }
        
        setupTabSystem();
        renderUpgrades();
        updateCounterOnly();
        updateKPS(true);
        
        // Start game loop
        setInterval(gameLoop, 100);
        
        console.log('Kirk Clicker V3 initialized!');
    }
    
    init();
});