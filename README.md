# spa-ledger-php-json
A mobile-first, lightweight digital ledger (Khata) for small businesses in Nepal. Features PDF export, WhatsApp billing, and expense tracking using a flat-file JSON backend.
# 📒 Mero Digital Khata Pro

**Mero Digital Khata Pro** is a lightweight, mobile-first web application designed to digitize daily business transactions for small shops (Pasals) in Nepal. It replaces traditional paper ledgers with a fast, secure, and easy-to-use digital interface.

> **"Simple Accounting for Smart Business."**

## 🌟 Key Features

*   **📱 Mobile-First Design:** Built with a responsive UI that feels like a native app on mobile devices.
*   **👥 Customer Management:** Add customers, track their balances, and view transaction history.
*   **💸 Transaction Recording:** Fast entry for "Given" (Udharo/Diyo) and "Got" (Payment/Liyo) amounts.
*   **📊 Financial Dashboard:** Real-time visual overview of Total Receivables vs. Payables using Chart.js.
*   **🧾 PDF Reports:** Generate professional PDF statements for individual customers instantly.
*   **📲 WhatsApp Integration:** Send payment reminders or bills directly via WhatsApp.
*   **📉 Expense Tracker:** Separate module to track daily shop expenses (Rent, Tea, Transport, etc.).
*   **💾 JSON Database:** Uses a flat-file `data.json` system. No SQL setup required—easy to backup and migrate.

## 🛠️ Technology Stack

*   **Frontend:** HTML5, CSS3 (Glassmorphism, Animations), Vanilla JavaScript (ES6).
*   **Backend:** PHP (API Handler).
*   **Database:** JSON (Flat-file storage).
*   **Libraries:** 
    *   `Chart.js` (Analytics)
    *   `html2pdf.js` (PDF Generation)
    *   `FontAwesome` (Icons)

## 🚀 Installation & Setup

Since this application uses **PHP** to read/write to the JSON file, you need a local server environment.

### Prerequisites
*   XAMPP, WAMP, MAMP, or any PHP-enabled web server.

### Steps
2.  **Move to Server Root:**
    Place the project folder inside your server directory (e.g., `htdocs` for XAMPP).
3.  **Permissions (Important):**
    Ensure the server has **Write Permissions** for the `data.json` file so it can save transactions.
    *   *Windows:* Usually works automatically.
    *   *Linux/Mac:* `chmod 777 data.json`
4.  **Run:**
    Open your browser and go to: `http://localhost/mero-digital-khata`

## 📂 File Structure
mero-digital-khata/
├── css/ # Modern styling with CSS variables
│ ├── main.css
│ ├── layout.css
│ ├── components.css
│ └── animations.css
├── js/
│ └── app.js # Main Application Logic
├── api.php # PHP script handling JSON data
├── data.json # Data storage (Auto-created)
└── index.html # Application Entry Point

## 👨‍💻 Author

**DIPESH MAHATO KOIRI**

*   **Role:** Full Stack Developer / Creator
*   **Location:** Nepal 🇳🇵

## 📄 License

This project is licensed under the **MIT License** - see the text below for details.

---

### The MIT License (MIT)

**Copyright (c) 2025 Dipesh Mahato Koiri**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

*Made with ❤️ in Nepal.*
