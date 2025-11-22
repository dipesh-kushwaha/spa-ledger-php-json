import { showToast } from './utils.js';

// Default initial state
let appData = {
    shopName: "Mero Digital Pasal",
    customers: [],
    expenses: []
};

export const loadData = async () => {
    try {
        const response = await fetch('api.php');
        if (response.ok) {
            const serverData = await response.json();
            
            // Safety Check: Only update if serverData is a valid object
            if (serverData && typeof serverData === 'object' && serverData.shopName) {
                appData = serverData;
            } else {
                console.warn("Server returned invalid data, using default/local.");
            }
        }
    } catch (error) {
        console.error("Fetch error, trying local storage:", error);
        
        // Fallback to Local Storage
        const local = localStorage.getItem('meroKhataData');
        if (local) {
            try {
                const parsed = JSON.parse(local);
                if (parsed && parsed.shopName) appData = parsed;
            } catch (e) {
                console.error("Local storage corrupted");
            }
        }
    }
    
    // Final Safety Net: Ensure arrays exist
    if (!appData.customers) appData.customers = [];
    if (!appData.expenses) appData.expenses = [];
    
    return appData;
};

export const saveData = async (newData) => {
    appData = newData;
    
    // 1. Save to Local Storage (Instant)
    localStorage.setItem('meroKhataData', JSON.stringify(appData));
    
    // 2. Sync to Server (Background)
    try {
        await fetch('api.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(appData)
        });
    } catch (e) {
        showToast("Offline: Saved locally only");
    }
};

export const getDataObj = () => appData;