import React from 'react';
import { createRoot } from 'react-dom/client';
import SpendingAnalytics from './components/SpendingAnalytics';

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
        window.location.href = '/';
        return;
    }

    // Set username
    document.getElementById('username').textContent = user.username;

    // Event listeners
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Mount React component
    const container = document.getElementById('charts-grid');
    const root = createRoot(container);
    root.render(<SpendingAnalytics />);

    // Load initial data
    loadBudgets().then(() => updateCharts());
});

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/';
}