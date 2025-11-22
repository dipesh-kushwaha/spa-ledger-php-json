let financeChartInstance = null;

export const renderFinanceChart = (receivable, payable) => {
    const ctx = document.getElementById('financeChart').getContext('2d');
    
    if (financeChartInstance) {
        financeChartInstance.destroy();
    }

    financeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Receive (Pauna)', 'Pay (Tirna)'],
            datasets: [{
                data: [receivable, payable],
                backgroundColor: ['#10B981', '#EF4444'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '70%',
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
};