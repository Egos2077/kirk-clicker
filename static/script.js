document.addEventListener("DOMContentLoaded", () => {
    console.log("Kirk Clicker - Loaded");
    
    // ==================== DOM ELEMENTS & STATE ====================
    const elements = {
        kirkButton: document.getElementById('kirkButton'),
        counter: document.getElementById('counter'),
        upgradesContainer: document.getElementById('upgradesContainer'),
        authStatus: document.getElementById('authStatus'),
        btnSave: document.getElementById('btnSave'),
        btnLoad: document.getElementById('btnLoad'),
        btnExport: document.getElementById('btnExport'),
        btnImport: document.getElementById('btnImport'),
        btnReset: document.getElementById('btnReset'),
        importFile: document.getElementById('importFile')
    };
    
    // Game state
    let gameState = {
        kirks: 0,
        freeMode: false,
        upgrades: [
            { id: 'tyler', name: 'Tyler Robinson', desc: 'Generates 0.5 Kirks/sec', 
              owned: 0, baseCost: 50, cost: 50, perSec: 0.5, costMult: 1.15, 
              image: 'static/tyler.jpeg', unlocked: true },
            { id: 'woke', name: 'The Woke Left', desc: 'Generates 2 Kirks/sec', 
              owned: 0, baseCost: 300, cost: 300, perSec: 2, costMult: 1.15, 
              image: 'static/wokeleft.jpeg', unlocked: false },
            { id: 'ac3', name: 'Erika Kirk', desc: 'Generates 10 Kirks/sec', 
              owned: 0, baseCost: 1800, cost: 1800, perSec: 10, costMult: 1.15, 
              image: 'static/erikakirk.jpeg', unlocked: false },
            { id: 'ac4', name: 'Transgender OnlyFans', desc: 'Generates 50 Kirks/sec', 
              owned: 0, baseCost: 10800, cost: 10800, perSec: 50, costMult: 1.15, 
              image: 'static/transfans.jpeg', unlocked: false },
            { id: 'ac5', name: 'Fetus (in Latin)', desc: 'Generates 200 Kirks/sec', 
              owned: 0, baseCost: 64800, cost: 64800, perSec: 200, costMult: 1.15, 
              image: 'static/fetus.jpeg', unlocked: false },
            { id: 'ac6', name: 'AIPAC', desc: 'Generates 1000 Kirks/sec', 
              owned: 0, baseCost: 388800, cost: 388800, perSec: 1000, costMult: 1.15, 
              image: 'static/aipac.jpeg', unlocked: false },
            { id: 'ac7', name: 'JD Vance', desc: 'Generates 5000 Kirks/sec', 
              owned: 0, baseCost: 2332800, cost: 2332800, perSec: 5000, costMult: 1.15, 
              image: 'static/vance.jpeg', unlocked: false },
            { id: 'ac8', name: 'Donald Trump', desc: 'Generates 25000 Kirks/sec', 
              owned: 0, baseCost: 13996800, cost: 13996800, perSec: 25000, costMult: 1.15, 
              image: 'static/trump.jpeg', unlocked: false },
            { id: 'ac9', name: 'Israel', desc: 'Generates 100000 Kirks/sec', 
              owned: 0, baseCost: 83980800, cost: 83980800, perSec: 100000, costMult: 1.15, 
              image: 'static/israel.jpeg', unlocked: false },
            { id: 'ac10', name: 'Yakub', desc: 'Generates 500000 Kirks/sec', 
              owned: 0, baseCost: 503884800, cost: 503884800, perSec: 500000, costMult: 1.15, 
              image: 'static/yakub.jpeg', unlocked: false }
        ]
    };
    
    // Save system constants
    const SAVE_KEY = 'kirkClickerSaveV1';
    const SAVE_VERSION = 1;
    
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
    
    // ==================== UTILITY FUNCTIONS ====================
    function formatNumber(num) {
        if (num >= 1000000000000) return (num / 1000000000000).toFixed(1).replace('.0', '') + 'T';
        if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace('.0', '') + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
        return Math.floor(num).toString();
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
            gameState.upgrades.forEach(upgrade => {
                upgrade.owned = 0;
                upgrade.cost = upgrade.baseCost;
                upgrade.unlocked = (upgrade.id === 'tyler');
            });
            
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
            
            for (let i = 0; i < gameState.upgrades.length - 1; i++) {
                if (gameState.upgrades[i].owned > 0) {
                    gameState.upgrades[i + 1].unlocked = true;
                }
            }
        }
        
        initUpgradeMap();
        needsRender = true;
        updateCounterOnly();
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
            
            upgradeEl.innerHTML = `
                <div class="upgrade-header">
                    <div class="upgrade-image">
                        ${upgrade.image ? 
                            `<img src="${upgrade.image}" alt="${upgrade.name}">` : 
                            `<div class="placeholder-text">${upgrade.id.toUpperCase()}</div>`
                        }
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
        initUpgradeMap();
        
        const savedData = loadFromLocalStorage();
        if (savedData) {
            applySave(savedData);
            console.log('Loaded saved game');
        } else {
            console.log('Starting fresh game');
        }
        
        renderUpgrades();
        updateCounterOnly();
        
        setInterval(gameLoop, 100);
        
        console.log('Kirk Clicker initialized');
        console.log('Images loaded:', gameState.upgrades.map(u => u.image));
    }
    
    init();
});