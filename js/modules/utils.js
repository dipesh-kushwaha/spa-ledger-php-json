export const formatCurrency = (amount) => {
    return 'Rs ' + parseFloat(amount).toLocaleString('en-IN');
};

export const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

export const getNepaliDate = () => {
    // Simplified Nepali Date Logic (Mock)
    // In a real app, import 'nepali-date-converter'
    const date = new Date();
    const year = date.getFullYear() + 57; // Roughly BS
    const months = ["Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin", "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    return `${day} ${month}, ${year}`;
};

export const showToast = (message) => {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3100);
};