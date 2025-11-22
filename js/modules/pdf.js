import { formatCurrency } from './utils.js';

export const generatePDF = (customer) => {
    const element = document.createElement('div');
    element.innerHTML = `
        <div style="padding: 20px; font-family: sans-serif;">
            <h1 style="text-align:center; color:#2563EB;">Mero Digital Pasal</h1>
            <h3 style="text-align:center; border-bottom:1px solid #ddd; padding-bottom:10px;">Statement</h3>
            <p><strong>Customer:</strong> ${customer.name}</p>
            <p><strong>Phone:</strong> ${customer.phone}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <table style="width:100%; border-collapse: collapse; margin-top:20px;">
                <thead style="background:#f3f4f6;">
                    <tr>
                        <th style="padding:8px; border:1px solid #ddd;">Date</th>
                        <th style="padding:8px; border:1px solid #ddd;">Desc</th>
                        <th style="padding:8px; border:1px solid #ddd;">Amount</th>
                        <th style="padding:8px; border:1px solid #ddd;">Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${customer.transactions.map(t => `
                        <tr>
                            <td style="padding:8px; border:1px solid #ddd;">${new Date(t.date).toLocaleDateString()}</td>
                            <td style="padding:8px; border:1px solid #ddd;">${t.desc}</td>
                            <td style="padding:8px; border:1px solid #ddd;">Rs ${t.amount}</td>
                            <td style="padding:8px; border:1px solid #ddd; color:${t.type === 'give' ? 'red' : 'green'}">${t.type.toUpperCase()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <h3 style="text-align:right; margin-top:20px;">Net Balance: ${formatCurrency(customer.transactions.reduce((acc, t) => t.type === 'give' ? acc + parseFloat(t.amount) : acc - parseFloat(t.amount), 0))}</h3>
        </div>
    `;

    html2pdf().from(element).save(`${customer.name}_statement.pdf`);
};