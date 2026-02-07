document.addEventListener("DOMContentLoaded", () => {
    console.log("Kirk Clicker - Performance Optimized");
    
    // ==================== DOM ELEMENTS & STATE ====================
    const elements = {
        kirkButton: document.getElementById('kirkButton'),
        counter: document.getElementById('counter'),
        upgradesContainer: document.getElementById('upgradesContainer'),
        authStatus: document.getElementById('authStatus'),
        btnSave: document.getElementById('btnSave'),
        btnLoad: document.getElementById('btnLoad'),
        btnLogout: document.getElementById('btnLogout'),
        openAuth: document.getElementById('openAuth'),
        authModal: document.getElementById('authModal'),
        authUsername: document.getElementById('authUsername'),
        authPassword: document.getElementById('authPassword'),
        authMsg: document.getElementById('authMsg'),
        btnLogin: document.getElementById('btnLogin'),
        btnRegister: document.getElementById('btnRegister')
    };
    
    // Game state
    let gameState = {
        kirks: 0,
        accountId: null,
        username: null,
        freeMode: false,
        upgrades: [
            { id: 'tyler', name: 'Tyler Robinson', desc: 'Generates 0.5 Kirks/sec', 
              owned: 0, baseCost: 50, cost: 50, perSec: 0.5, costMult: 1.15, 
              image: '/static/tyler.jpeg', unlocked: true },
            { id: 'woke', name: 'The Woke Left', desc: 'Generates 2 Kirks/sec', 
              owned: 0, baseCost: 300, cost: 300, perSec: 2, costMult: 1.15, 
              image: null, unlocked: false },
            { id: 'ac3', name: 'Auto-Clicker 3', desc: 'Generates 10 Kirks/sec', 
              owned: 0, baseCost: 1800, cost: 1800, perSec: 10, costMult: 1.15, 
              image: null, unlocked: false },
            { id: 'ac4', name: 'Auto-Clicker 4', desc: 'Generates 50 Kirks/sec', 
              owned: 0, baseCost: 10800, cost: 10800, perSec: 50, costMult: 1.15, 
              image: null, unlocked: false },
            { id: 'ac5', name: 'Auto-Clicker 5', desc: 'Generates 200 Kirks/sec', 
              owned: 0, baseCost: 64800, cost: 64800, perSec: 200, costMult: 1.15, 
              image: null, unlocked: false },
            { id: 'ac6', name: 'Auto-Clicker 6', desc: 'Generates 1000 Kirks/sec', 
              owned: 0, baseCost: 388800, cost: 388800, perSec: 1000, costMult: 1.15, 
              image: null, unlocked: false },
            { id: 'ac7', name: 'Auto-Clicker 7', desc: 'Generates 5000 Kirks/sec', 
              owned: 0, baseCost: 2332800, cost: 2332800, perSec: 5000, costMult: 1.15, 
              image: null, unlocked: false },
            { id: 'ac8', name: 'Auto-Clicker 8', desc: 'Generates 25000 Kirks/sec', 
              owned: 0, baseCost: 13996800, cost: 13996800, perSec: 25000, costMult: 1.15, 
              image: null, unlocked: false },
            { id: 'ac9', name: 'Auto-Clicker 9', desc: 'Generates 100000 Kirks/sec', 
              owned: 0, baseCost: 83980800, cost: 83980800, perSec: 100000, costMult: 1.15, 
              image: null, unlocked: false },
            { id: 'ac10', name: 'Auto-Clicker 10', desc: 'Generates 500000 Kirks/sec', 
              owned: 0, baseCost: 503884800, cost: 503884800, perSec: 500000, costMult: 1.15, 
              image: null, unlocked: false }
        ]
    };
    
    // Performance-critical: Cached DOM references
    let domCache = {
        buttons: new Map(),      // upgradeId -> button element
        costSpans: new Map(),    // upgradeId -> cost span element
        countSpans: new Map(),   // upgradeId -> count span element
        prodSpans: new Map()     // upgradeId -> production span element
    };
    
    // Performance: Cache upgrade references by ID for O(1) lookup
    const upgradeMap = new Map();
    
    // Rendering control
    let needsRender = false;
    let authModalInstance = null;
    
    // ==================== UTILITY FUNCTIONS ====================
    function formatNumber(num) {
        if (num >= 1000000000000) return (num / 1000000000000).toFixed(1).replace('.0', '') + 'T';
        if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace('.0', '') + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1).replace('.0', '') + 'K';
        return Math.floor(num).toString();
    }
    
    function showMessage(message, isError = true) {
        if (!elements.authMsg) return;
        
        elements.authMsg.textContent = message;
        elements.authMsg.className = `alert ${isError ? 'alert-danger' : 'alert-success'} d-block`;
        
        setTimeout(() => {
            elements.authMsg.classList.add('d-none');
        }, 3000);
    }
    
    // Initialize upgrade map for O(1) lookups
    function initUpgradeMap() {
        upgradeMap.clear();
        gameState.upgrades.forEach((upgrade, index) => {
            upgradeMap.set(upgrade.id, { upgrade, index });
        });
    }
    
    // ==================== GAME FUNCTIONS ====================
    
    // TICK-SAFE: Update counter only (called every 100ms)
    function updateCounterOnly() {
        if (elements.counter) {
            elements.counter.textContent = `${formatNumber(gameState.kirks)} Kirks`;
        }
    }
    
    // TICK-SAFE: Update button states only (no DOM creation, O(n) not O(n²))
    function updateButtonStates() {
        domCache.buttons.forEach((button, upgradeId) => {
            if (!button) return;
            
            // O(1) lookup using upgradeMap
            const cached = upgradeMap.get(upgradeId);
            if (!cached) return;
            
            const { upgrade } = cached;
            const canBuy = gameState.freeMode || gameState.kirks >= upgrade.cost;
            const isDisabled = !canBuy || !upgrade.unlocked;
            
            button.disabled = isDisabled;
            button.classList.toggle('btn-primary', canBuy && upgrade.unlocked);
            button.classList.toggle('btn-secondary', !canBuy || !upgrade.unlocked);
        });
    }
    
    // EVENT-ONLY: Full DOM rebuild (called only on init/buy/load/unlock)
    function renderUpgrades() {
        if (!elements.upgradesContainer) return;
        
        // Clear container
        elements.upgradesContainer.innerHTML = '';
        
        // Clear DOM cache (will rebuild)
        domCache.buttons.clear();
        domCache.costSpans.clear();
        domCache.countSpans.clear();
        domCache.prodSpans.clear();
        
        // Render each upgrade
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
            
            // Cache references
            const button = upgradeEl.querySelector(`button[data-upgrade-id="${upgrade.id}"]`);
            const costSpan = upgradeEl.querySelector(`.upgrade-cost[data-upgrade-id="${upgrade.id}"]`);
            const countSpan = upgradeEl.querySelector(`.upgrade-count[data-upgrade-id="${upgrade.id}"]`);
            const prodSpan = upgradeEl.querySelector(`.upgrade-production[data-upgrade-id="${upgrade.id}"]`);
            
            if (button) domCache.buttons.set(upgrade.id, button);
            if (costSpan) domCache.costSpans.set(upgrade.id, costSpan);
            if (countSpan) domCache.countSpans.set(upgrade.id, countSpan);
            if (prodSpan) domCache.prodSpans.set(upgrade.id, prodSpan);
        });
        
        // Re-attach event listeners to new buttons
        attachUpgradeEventListeners();
        
        // Update button states immediately after render
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
        
        // Deduct cost
        if (!gameState.freeMode) {
            gameState.kirks -= upgrade.cost;
        }
        
        // Update upgrade
        upgrade.owned += 1;
        upgrade.cost = Math.floor(upgrade.cost * upgrade.costMult);
        
        // Check if next upgrade will unlock (before DOM updates)
        const willUnlock = (upgrade.owned === 1 && index < gameState.upgrades.length - 1);
        
        // Only update DOM if NOT doing a full render soon
        if (!willUnlock) {
            const countSpan = domCache.countSpans.get(upgrade.id);
            const costSpan = domCache.costSpans.get(upgrade.id);
            const prodSpan = domCache.prodSpans.get(upgrade.id);
            
            if (countSpan) countSpan.textContent = upgrade.owned;
            if (costSpan) costSpan.textContent = formatNumber(upgrade.cost);
            if (prodSpan) prodSpan.textContent = formatNumber(upgrade.owned * upgrade.perSec);
        }
        
        // Unlock next upgrade if first purchase
        if (willUnlock) {
            gameState.upgrades[index + 1].unlocked = true;
            needsRender = true; // Will trigger full render on next tick
        }
        
        // Update UI
        updateCounterOnly();
        updateButtonStates();
    }
    
    function calculateIncomePerSecond() {
        return gameState.upgrades.reduce((total, upgrade) => {
            return total + (upgrade.owned * upgrade.perSec);
        }, 0);
    }
    
    // ==================== AUTHENTICATION FUNCTIONS ====================
    function updateAuthUI() {
        if (!elements.authStatus) return;
        
        if (gameState.accountId) {
            elements.authStatus.textContent = `Logged in as ${gameState.username}`;
            if (elements.btnSave) elements.btnSave.disabled = false;
            if (elements.btnLoad) elements.btnLoad.disabled = false;
            if (elements.btnLogout) elements.btnLogout.disabled = false;
        } else {
            elements.authStatus.textContent = 'Not logged in';
            if (elements.btnSave) elements.btnSave.disabled = true;
            if (elements.btnLoad) elements.btnLoad.disabled = true;
            if (elements.btnLogout) elements.btnLogout.disabled = true;
        }
    }
    
    async function apiFetch(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                credentials: 'same-origin',
                ...options
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            throw error;
        }
    }
    
    async function checkSession() {
        try {
            const data = await apiFetch('/api/check_session');
            
            if (data.logged_in) {
                gameState.accountId = data.account_id;
                gameState.username = data.username;
                updateAuthUI();
                
                // Auto-load game data
                setTimeout(loadGame, 500);
            }
        } catch (error) {
            console.log('No active session:', error.message);
        }
    }
    
    // ==================== SAVE/LOAD FUNCTIONS ====================
    function getSaveData() {
        return {
            kirks: gameState.kirks,
            upgrades: gameState.upgrades.map(upgrade => ({
                id: upgrade.id,
                owned: upgrade.owned,
                cost: upgrade.cost
            }))
        };
    }
    
    function applySave(saveData) {
        if (!saveData) return;
        
        gameState.kirks = saveData.kirks || 0;
        
        if (saveData.upgrades && Array.isArray(saveData.upgrades)) {
            // Reset all upgrades first
            gameState.upgrades.forEach(upgrade => {
                upgrade.owned = 0;
                upgrade.cost = upgrade.baseCost;
                upgrade.unlocked = (upgrade.id === 'tyler'); // Only first upgrade unlocked by default
            });
            
            // Apply saved upgrades
            saveData.upgrades.forEach(savedUpgrade => {
                const upgrade = gameState.upgrades.find(u => u.id === savedUpgrade.id);
                if (upgrade) {
                    upgrade.owned = savedUpgrade.owned || 0;
                    upgrade.cost = savedUpgrade.cost || upgrade.baseCost;
                    if (upgrade.owned > 0) {
                        upgrade.unlocked = true;
                    }
                }
            });
            
            // Unlock chain: if previous owned > 0, unlock next
            for (let i = 0; i < gameState.upgrades.length - 1; i++) {
                if (gameState.upgrades[i].owned > 0) {
                    gameState.upgrades[i + 1].unlocked = true;
                }
            }
        }
        
        // Update upgrade map
        initUpgradeMap();
        
        // Mark for render
        needsRender = true;
        
        // Update immediate UI
        updateCounterOnly();
    }
    
    async function saveGame() {
        if (!gameState.accountId) {
            showMessage('You must be logged in to save');
            return;
        }
        
        try {
            await apiFetch('/api/save', {
                method: 'POST',
                body: JSON.stringify({
                    save: getSaveData()
                })
            });
            
            alert('Game saved successfully!');
        } catch (error) {
            alert('Save failed: ' + (error.message || 'Unknown error'));
        }
    }
    
    async function loadGame() {
        if (!gameState.accountId) {
            showMessage('You must be logged in to load');
            return;
        }
        
        try {
            const data = await apiFetch('/api/load');
            
            if (data.save) {
                applySave(data.save);
                alert('Game loaded successfully!');
            }
        } catch (error) {
            alert('Load failed: ' + (error.message || 'No save data found'));
        }
    }
    
    // ==================== EVENT LISTENERS ====================
    
    // Click Kirk
    if (elements.kirkButton) {
        elements.kirkButton.addEventListener('click', clickKirk);
    }
    
    // Bootstrap Modal (store instance once)
    if (elements.authModal) {
        authModalInstance = new bootstrap.Modal(elements.authModal);
        
        if (elements.openAuth) {
            elements.openAuth.addEventListener('click', () => {
                authModalInstance.show();
            });
        }
    }
    
    // Login
    if (elements.btnLogin) {
        elements.btnLogin.addEventListener('click', async () => {
            const username = elements.authUsername?.value.trim();
            const password = elements.authPassword?.value;
            
            if (!username || !password) {
                showMessage('Please enter username and password');
                return;
            }
            
            try {
                const data = await apiFetch('/api/login', {
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                });
                
                gameState.accountId = data.account_id;
                gameState.username = data.username;
                
                showMessage('Login successful!', false);
                updateAuthUI();
                
                if (authModalInstance) {
                    authModalInstance.hide();
                }
                
                if (elements.authUsername) elements.authUsername.value = '';
                if (elements.authPassword) elements.authPassword.value = '';
                
                setTimeout(loadGame, 500);
                
            } catch (error) {
                showMessage(error.message || 'Login failed');
            }
        });
    }
    
    // Register
    if (elements.btnRegister) {
        elements.btnRegister.addEventListener('click', async () => {
            const username = elements.authUsername?.value.trim();
            const password = elements.authPassword?.value;
            
            if (!username || !password) {
                showMessage('Please enter username and password');
                return;
            }
            
            try {
                const data = await apiFetch('/api/register', {
                    method: 'POST',
                    body: JSON.stringify({ username, password })
                });
                
                gameState.accountId = data.account_id;
                gameState.username = data.username;
                
                showMessage('Registration successful! You are now logged in.', false);
                updateAuthUI();
                
                if (authModalInstance) {
                    authModalInstance.hide();
                }
                
                if (elements.authUsername) elements.authUsername.value = '';
                if (elements.authPassword) elements.authPassword.value = '';
                
            } catch (error) {
                showMessage(error.message || 'Registration failed');
            }
        });
    }
    
    // Save
    if (elements.btnSave) {
        elements.btnSave.addEventListener('click', saveGame);
    }
    
    // Load
    if (elements.btnLoad) {
        elements.btnLoad.addEventListener('click', loadGame);
    }
    
    // Logout
    if (elements.btnLogout) {
        elements.btnLogout.addEventListener('click', async () => {
            try {
                await apiFetch('/api/logout', {
                    method: 'POST'
                });
                
                gameState.accountId = null;
                gameState.username = null;
                updateAuthUI();
                
                showMessage('Logged out successfully', false);
            } catch (error) {
                showMessage('Logout failed');
            }
        });
    }
    
    // ==================== GAME LOOP ====================
    function gameLoop() {
        // 1. Update numbers only
        const incomePerSecond = calculateIncomePerSecond();
        const incomePerTick = incomePerSecond / 10;
        gameState.kirks += incomePerTick;
        
        // 2. Tick-safe UI updates
        updateCounterOnly();
        updateButtonStates();
        
        // 3. Check if render needed (from buy/load/unlock events)
        if (needsRender) {
            renderUpgrades();
            needsRender = false;
        }
    }
    
    // ==================== INITIALIZATION ====================
    function init() {
        // Initialize upgrade map for O(1) lookups
        initUpgradeMap();
        
        // Initial render
        renderUpgrades();
        updateCounterOnly();
        updateAuthUI();
        
        // Start game loop
        setInterval(gameLoop, 100);
        
        // Check session
        checkSession();
        
        console.log('Game initialized with performance optimization');
    }
    
    // Start the game
    init();
});