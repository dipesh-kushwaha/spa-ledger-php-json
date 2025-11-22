import { getDataObj, saveData } from './api.js';
import { formatCurrency, generateId, showToast, getNepaliDate } from './utils.js';
import { renderFinanceChart } from './charts.js';
import { generatePDF } from './pdf.js';

// --- STATE VARIABLES ---
let currentCustomerId = null;

// --- INITIALIZATION ---
export const initUI = () => {
    // Set Nepali Date
    const dateEl = document.getElementById('nepaliDate');
    if (dateEl) dateEl.innerText = getNepaliDate();

    // Initial Render
    renderAll();

    // Setup Event Listeners
    setupEventListeners();
};

// --- MAIN RENDER FUNCTION ---
export const renderAll = () => {
    const data = getDataObj();
    
    // Safety check
    if (!data || !data.shopName) return;

    // 1. Update Shop Name
    const nameDisplay = document.getElementById('shopNameDisplay');
    const nameInput = document.getElementById('settingShopName');
    if (nameDisplay) nameDisplay.innerText = data.shopName;
    if (nameInput) nameInput.value = data.shopName;

    // 2. Render Sections
    renderDashboard(data);
    renderCustomerList(data.customers);
    renderExpenses(data.expenses);
};

// --- SUB-RENDER FUNCTIONS ---

const renderDashboard = (data) => {
    let totalReceive = 0;
    let totalPay = 0;

    data.customers.forEach(c => {
        const bal = calculateBalance(c.transactions);
        if (bal > 0) totalReceive += bal;
        else totalPay += Math.abs(bal);
    });

    const elReceive = document.getElementById('dashReceive');
    const elPay = document.getElementById('dashPay');
    
    if (elReceive) elReceive.innerText = formatCurrency(totalReceive);
    if (elPay) elPay.innerText = formatCurrency(totalPay);

    // Update Chart safely
    try { renderFinanceChart(totalReceive, totalPay); } catch (e) { }

    // Recent Customers (Sort by last transaction date)
    const sortedCustomers = [...data.customers].sort((a, b) => {
        const dateA = a.transactions.length ? a.transactions[a.transactions.length - 1].date : '0';
        const dateB = b.transactions.length ? b.transactions[b.transactions.length - 1].date : '0';
        return dateB.localeCompare(dateA);
    });

    const recent = sortedCustomers.slice(0, 3);
    const dashList = document.getElementById('dashboardCustomerList');
    if (dashList) {
        dashList.innerHTML = recent.length 
            ? recent.map((c, i) => createCustomerRow(c, i)).join('') 
            : '<div style="text-align:center; padding:30px; color:var(--text-muted);">No recent activity</div>';
    }
};

const renderCustomerList = (customers) => {
    const countEl = document.getElementById('custCount');
    const listEl = document.getElementById('fullCustomerList');

    if (countEl) countEl.innerText = `${customers.length} Customer(s)`;
    if (listEl) {
        if (customers.length === 0) {
            listEl.innerHTML = `<div style="text-align:center; margin-top:50px; color:var(--text-muted);">
                <i class="fa-solid fa-users" style="font-size:3rem; margin-bottom:15px; opacity:0.3;"></i><br>
                No customers yet.
            </div>`;
        } else {
            listEl.innerHTML = customers.map((c, i) => createCustomerRow(c, i)).join('');
        }
    }
};

const renderExpenses = (expenses) => {
    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    
    const totalEl = document.getElementById('totalExpenses');
    const listEl = document.getElementById('expenseList');

    if (totalEl) totalEl.innerText = formatCurrency(total);
    
    if (listEl) {
        if (expenses.length === 0) {
            listEl.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-muted);">No expenses recorded yet.</div>';
        } else {
            // Sort new to old
            const sortedExp = [...expenses].reverse();
            listEl.innerHTML = sortedExp.map((e, i) => `
                <div class="list-item animate-in" style="animation-delay: ${i * 0.05}s">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <div style="width:40px; height:40px; background:#F1F5F9; border-radius:12px; display:grid; place-items:center; color:#64748B;">
                           <i class="fa-solid fa-receipt"></i>
                        </div>
                        <div>
                            <h4 style="font-weight:600; font-size:0.95rem;">${e.category}</h4>
                            <small style="color:var(--text-muted); font-size:0.75rem;">${new Date(e.date).toLocaleDateString()} &bull; ${e.note || ''}</small>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center;">
                        <div style="font-weight:700; color:var(--text-main); margin-right:5px;">${formatCurrency(e.amount)}</div>
                        <button class="btn-delete-item" onclick="window.deleteExpense('${e.id}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }
};

const createCustomerRow = (c, index) => {
    const bal = calculateBalance(c.transactions);
    const colorClass = bal > 0 ? 'text-green' : (bal < 0 ? 'text-red' : 'text-muted');
    const status = bal > 0 ? 'Receive' : (bal < 0 ? 'Pay' : 'Settled');
    const initial = c.name.charAt(0).toUpperCase();
    const delay = index * 0.05; 
    
    return `
        <div class="list-item animate-in" style="animation-delay: ${delay}s" onclick="window.openDetail('${c.id}')">
            <div style="display:flex; align-items:center;">
                <div class="avatar">${initial}</div>
                <div>
                    <h4 style="margin-bottom:4px; font-weight:600; color:var(--text-main);">${c.name}</h4>
                    <small style="color:var(--text-muted);"><i class="fa-solid fa-phone" style="font-size:0.7rem"></i> ${c.phone}</small>
                </div>
            </div>
            <div style="text-align:right;">
                <div class="${colorClass}" style="font-weight:700; font-size:1rem;">${formatCurrency(Math.abs(bal))}</div>
                <small style="font-size:0.7rem; color:var(--text-muted); font-weight:500;">${status}</small>
            </div>
        </div>
    `;
};

const calculateBalance = (trans) => {
    if (!trans) return 0;
    return trans.reduce((acc, t) => {
        return t.type === 'give' ? acc + parseFloat(t.amount) : acc - parseFloat(t.amount);
    }, 0);
};

// --- GLOBAL ACTIONS (HTML OnClick Handlers) ---

// 1. OPEN DETAIL VIEW (With Edit/Delete Actions)
window.openDetail = (id) => {
    currentCustomerId = id;
    const data = getDataObj();
    const c = data.customers.find(x => x.id === id);
    if (!c) return;

    document.getElementById('detailName').innerText = c.name;
    document.getElementById('detailAvatar').innerText = c.name.charAt(0).toUpperCase();
    document.getElementById('detailPhone').innerText = c.phone;
    
    const link = document.getElementById('detailPhoneLink');
    if(link) link.href = `tel:${c.phone}`;
    
    const bal = calculateBalance(c.transactions);
    const elBal = document.getElementById('detailBalance');
    const isReceivable = bal >= 0;
    
    elBal.innerHTML = `<span style="font-size:1rem; color:var(--text-muted); font-weight:500; display:block; margin-bottom:5px;">${isReceivable ? 'You will get' : 'You will pay'}</span>` 
                      + formatCurrency(Math.abs(bal));
    elBal.className = "net-balance " + (isReceivable ? "text-green" : "text-red");

    const historyContainer = document.getElementById('transactionHistory');
    
    if (c.transactions.length === 0) {
        historyContainer.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">No transactions yet</div>';
    } else {
        const sortedTrans = [...c.transactions].reverse();
        historyContainer.innerHTML = sortedTrans.map((t, i) => `
            <div class="list-item animate-in" style="animation-delay:${i*0.05}s; border-left: 4px solid ${t.type === 'give' ? '#EF4444' : '#10B981'}; padding-left:16px;">
                <div style="flex:1;">
                    <h4 style="font-size:0.95rem; font-weight:600;">${t.desc || 'No details'}</h4>
                    <small style="color:var(--text-muted); font-size:0.75rem;">${new Date(t.date).toLocaleDateString()}</small>
                </div>
                
                <div style="text-align:right; margin-right:10px;">
                    <h4 class="${t.type === 'give' ? 'text-red' : 'text-green'}" style="font-weight:700;">
                        ${formatCurrency(t.amount)}
                    </h4>
                    <small style="font-size:0.7rem; color:var(--text-muted);">${t.type === 'give' ? 'Out' : 'In'}</small>
                </div>

                <div class="list-actions">
                    <button class="btn-icon-sm btn-edit" onclick="window.editTransaction('${t.id}')">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn-icon-sm btn-delete" onclick="window.deleteTransaction('${t.id}')">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('detail-overlay').classList.add('active');
};

// 2. EDIT TRANSACTION
window.editTransaction = (transId) => {
    const data = getDataObj();
    const customer = data.customers.find(c => c.id === currentCustomerId);
    if(!customer) return;

    const transaction = customer.transactions.find(t => t.id === transId);
    if(!transaction) return;

    openModal('Edit Entry', `
        <div class="input-group">
            <label>Amount (Rs)</label>
            <input id="editAmount" type="number" value="${transaction.amount}" style="font-size:1.5rem; font-weight:700;">
        </div>
        <div class="input-group">
            <label>Remarks</label>
            <input id="editNote" type="text" value="${transaction.desc}">
        </div>
        <div class="input-group">
            <label>Date</label>
            <input id="editDate" type="date" value="${transaction.date.split('T')[0]}">
        </div>
    `, () => {
        const newAmount = document.getElementById('editAmount').value;
        const newNote = document.getElementById('editNote').value;
        const newDate = document.getElementById('editDate').value;

        if(!newAmount) { showToast("Amount cannot be empty"); return false; }

        transaction.amount = parseFloat(newAmount);
        transaction.desc = newNote;
        const oldTime = new Date(transaction.date).toTimeString().split(' ')[0]; 
        transaction.date = new Date(`${newDate}T${oldTime}`).toISOString();

        saveData(data);
        renderAll(); 
        window.openDetail(currentCustomerId); 
        showToast("Entry Updated");
        return true;
    });
};

// 3. DELETE TRANSACTION
window.deleteTransaction = (transId) => {
    if(confirm("Are you sure you want to delete this entry?")) {
        const data = getDataObj();
        const customer = data.customers.find(c => c.id === currentCustomerId);
        
        if(customer) {
            customer.transactions = customer.transactions.filter(t => t.id !== transId);
            saveData(data);
            renderAll();
            window.openDetail(currentCustomerId);
            showToast("Entry Deleted");
        }
    }
};

// 4. DELETE EXPENSE
window.deleteExpense = (id) => {
    if(confirm("Are you sure you want to delete this expense?")) {
        const data = getDataObj();
        const initialLength = data.expenses.length;
        data.expenses = data.expenses.filter(e => e.id !== id);
        
        if (data.expenses.length < initialLength) {
            saveData(data);
            renderAll();
            showToast("Expense Deleted");
        }
    }
    event.stopPropagation(); 
};

// --- EVENT LISTENERS ---
const setupEventListeners = () => {
    
    // Bottom Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('main > section').forEach(s => s.classList.add('hide'));
            const target = document.getElementById(btn.dataset.target);
            if(target) {
                target.classList.remove('hide');
                window.scrollTo(0,0);
            }
            if(btn.dataset.target === 'view-dashboard') renderAll();
        });
    });

    // View All (Dashboard Link)
    const viewAllBtn = document.getElementById('btn-view-all-cust');
    if(viewAllBtn) {
        viewAllBtn.addEventListener('click', () => {
            const khataBtn = document.querySelector('[data-target="view-customers"]');
            if(khataBtn) khataBtn.click();
        });
    }

    // SEARCH TOGGLE
    const searchToggleBtn = document.getElementById('btn-search-toggle');
    if(searchToggleBtn) {
        searchToggleBtn.addEventListener('click', () => {
            const container = document.getElementById('searchContainer');
            if(container) {
                container.classList.toggle('hide');
                if(!container.classList.contains('hide')) {
                    document.getElementById('searchInput').focus();
                }
            }
        });
    }

    // SEARCH INPUT
    const searchInput = document.getElementById('searchInput');
    if(searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            const term = e.target.value.toLowerCase();
            const data = getDataObj();
            const filtered = data.customers.filter(c => c.name.toLowerCase().includes(term) || c.phone.includes(term));
            renderCustomerList(filtered);
            
            // Auto-switch to list view
            if(term.length > 0) {
                const custTab = document.getElementById('view-customers');
                if(custTab && custTab.classList.contains('hide')) {
                    const navBtn = document.querySelector('[data-target="view-customers"]');
                    if(navBtn) navBtn.click();
                }
            }
        });
    }

    // Close Detail View
    const closeDetailBtn = document.getElementById('btn-close-detail');
    if(closeDetailBtn) {
        closeDetailBtn.addEventListener('click', () => {
            document.getElementById('detail-overlay').classList.remove('active');
            renderAll();
        });
    }

    // WHATSAPP
    const waBtn = document.getElementById('btn-whatsapp');
    if(waBtn) {
        waBtn.addEventListener('click', () => {
            const data = getDataObj();
            const c = data.customers.find(x => x.id === currentCustomerId);
            if(c && c.phone) {
                const cleanPhone = c.phone.replace(/[^0-9]/g, '');
                const finalPhone = cleanPhone.length <= 10 ? '977' + cleanPhone : cleanPhone;
                
                const bal = calculateBalance(c.transactions);
                const msg = `Hello ${c.name}, your current balance in ${data.shopName} is ${formatCurrency(Math.abs(bal))} (${bal >= 0 ? 'To Receive' : 'To Pay'}). Please check.`;
                
                window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(msg)}`, '_blank');
            } else {
                showToast("Invalid Phone Number");
            }
        });
    }

    // Delete Customer
    const delCustBtn = document.getElementById('btn-delete-customer');
    if(delCustBtn) {
        delCustBtn.addEventListener('click', () => {
            if(confirm("Permanently delete this customer and all history?")) {
                const data = getDataObj();
                data.customers = data.customers.filter(c => c.id !== currentCustomerId);
                saveData(data);
                document.getElementById('detail-overlay').classList.remove('active');
                renderAll();
                showToast("Customer deleted");
            }
        });
    }

    // Add Customer
    const addCustBtn = document.getElementById('btn-add-customer');
    if(addCustBtn) {
        addCustBtn.addEventListener('click', () => {
            openModal('New Customer', `
                <div class="input-group">
                    <label>Customer Name</label>
                    <input id="newCName" type="text" placeholder="e.g. Ram Bahadur">
                </div>
                <div class="input-group">
                    <label>Phone Number</label>
                    <input id="newCPhone" type="tel" placeholder="98XXXXXXXX">
                </div>
            `, () => {
                const name = document.getElementById('newCName').value.trim();
                const phone = document.getElementById('newCPhone').value.trim();
                if(!name) { showToast("Name is required"); return false; }
                
                const data = getDataObj();
                data.customers.push({ id: generateId(), name, phone, transactions: [] });
                saveData(data);
                renderAll();
                showToast('Customer Created');
                return true;
            });
        });
    }

    // Add Transactions
    const handleTransaction = (type) => {
        const actionName = type === 'give' ? 'You Gave (Diyo)' : 'You Got (Liyo)';
        const color = type === 'give' ? '#EF4444' : '#10B981';

        openModal(actionName, `
            <div class="input-group">
                <label>Amount (Rs)</label>
                <input id="tAmount" type="number" placeholder="0" style="font-size:1.5rem; font-weight:700; color:${color}">
            </div>
            <div class="input-group">
                <label>Remarks</label>
                <input id="tNote" type="text" placeholder="e.g. Rice, Oil, Cash">
            </div>
        `, () => {
            const amountVal = document.getElementById('tAmount').value;
            const note = document.getElementById('tNote').value.trim();
            
            if(!amountVal) { showToast("Amount is required"); return false; }

            const data = getDataObj();
            const custIndex = data.customers.findIndex(c => c.id === currentCustomerId);
            
            if(custIndex > -1) {
                data.customers[custIndex].transactions.push({
                    id: generateId(),
                    type: type,
                    amount: parseFloat(amountVal),
                    desc: note || (type === 'give' ? 'Goods/Cash Given' : 'Payment Received'),
                    date: new Date().toISOString()
                });
                saveData(data);
                window.openDetail(currentCustomerId);
                showToast('Transaction Saved');
                return true;
            }
            return false;
        });
    };

    const btnGive = document.getElementById('btn-action-give');
    const btnTake = document.getElementById('btn-action-take');
    if(btnGive) btnGive.addEventListener('click', () => handleTransaction('give'));
    if(btnTake) btnTake.addEventListener('click', () => handleTransaction('take'));

    // Download PDF
    const pdfBtn = document.getElementById('btn-download-pdf');
    if(pdfBtn) {
        pdfBtn.addEventListener('click', () => {
            const data = getDataObj();
            const c = data.customers.find(x => x.id === currentCustomerId);
            if(c) { showToast("Generating PDF..."); generatePDF(c); }
        });
    }

    // Add Expense
    const addExpBtn = document.getElementById('btn-add-expense');
    if(addExpBtn) {
        addExpBtn.addEventListener('click', () => {
            openModal('New Expense', `
                 <div class="input-group">
                    <label>Amount</label>
                    <input id="exAmount" type="number" placeholder="0">
                 </div>
                 <div class="input-group">
                    <label>Category</label>
                    <select id="exCat">
                        <option value="Tea/Khaja">Tea / Khaja</option>
                        <option value="Rent">Rent</option>
                        <option value="Transport">Transport</option>
                        <option value="Utilities">Electricity/Water</option>
                        <option value="Stock">Stock Purchase</option>
                        <option value="Other">Other</option>
                    </select>
                 </div>
                 <div class="input-group">
                    <label>Note</label>
                    <input id="exNote" type="text" placeholder="Optional details">
                 </div>
            `, () => {
                const amount = document.getElementById('exAmount').value;
                const cat = document.getElementById('exCat').value;
                const note = document.getElementById('exNote').value;
                
                if(!amount) { showToast("Amount is required"); return false; }

                const data = getDataObj();
                data.expenses.push({ 
                    id: generateId(), 
                    amount: parseFloat(amount), 
                    category: cat, 
                    note, 
                    date: new Date().toISOString() 
                });
                saveData(data);
                renderAll();
                showToast('Expense Added');
                return true;
            });
        });
    }

    // Save Settings
    const saveSetBtn = document.getElementById('btn-save-settings');
    if(saveSetBtn) {
        saveSetBtn.addEventListener('click', () => {
            const newName = document.getElementById('settingShopName').value;
            if(newName) {
                const data = getDataObj();
                data.shopName = newName;
                saveData(data);
                renderAll();
                showToast("Shop Name Updated");
            }
        });
    }

    // BACKUP DATA (JSON)
    const backupBtn = document.getElementById('btn-backup-json');
    if(backupBtn) {
        backupBtn.addEventListener('click', () => {
            const data = getDataObj();
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", "MeroKhata_Backup_" + new Date().toISOString().slice(0,10) + ".json");
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();
            showToast("Backup Downloaded");
        });
    }
    
    // CLOSE MODALS (X BUTTON)
    const closeModals = document.querySelectorAll('.btn-close-modal');
    closeModals.forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('modal-generic').classList.remove('active');
        });
    });
};

// --- MODAL HELPER ---
const openModal = (title, bodyHtml, onSaveCallback) => {
    const modal = document.getElementById('modal-generic');
    const titleEl = document.getElementById('modalTitle');
    const bodyEl = document.getElementById('modalBody');
    const saveBtn = document.getElementById('modalActionBtn');

    if(modal && titleEl && bodyEl && saveBtn) {
        titleEl.innerText = title;
        bodyEl.innerHTML = bodyHtml;
        
        const newBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newBtn, saveBtn);
        
        newBtn.addEventListener('click', () => {
            if(onSaveCallback()) {
                modal.classList.remove('active');
            }
        });

        modal.classList.add('active');
        setTimeout(() => {
            const input = bodyEl.querySelector('input');
            if(input) input.focus();
        }, 100);
    }
};