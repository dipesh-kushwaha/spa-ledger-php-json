import { loadData, saveData } from './modules/api.js';
import { initUI, renderAll } from './modules/ui.js';
import { showToast } from './modules/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    initUI();
    showToast("Welcome to Mero Digital Khata Pro");
});

// Global accessible functions for HTML onclicks (if needed for simple elements)
window.syncApp = async () => {
    const btn = document.querySelector('.sync-btn i');
    btn.classList.add('fa-spin');
    
    const data = await loadData(); // Reloads and syncs logic inside api.js
    // Forcing a save to ensure PHP gets local data if newer
    await saveData(data); 
    
    setTimeout(() => {
        btn.classList.remove('fa-spin');
        renderAll();
        showToast("Data Synced Successfully");
    }, 800);
};