/**
 * api.js — Centralized API helper functions.
 * All HTTP communication with the FastAPI backend flows through this module.
 */

const API_BASE = 'http://localhost:8000';

/* ------------------------------------------------------------------ */
/*  Generic helpers                                                     */
/* ------------------------------------------------------------------ */

/**
 * Perform a fetch request with standard error handling and JSON parsing.
 * @param {string} endpoint - API path (e.g. "/orders/")
 * @param {object} options  - fetch options (method, body, headers, etc.)
 * @returns {Promise<any>}
 */
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    };

    try {
        const response = await fetch(url, config);

        // Handle 204 No Content (deletes)
        if (response.status === 204) return null;

        // Parse JSON
        const data = await response.json();

        if (!response.ok) {
            const message = data.detail || JSON.stringify(data);
            throw new Error(message);
        }

        return data;
    } catch (error) {
        console.error(`API Error [${options.method || 'GET'} ${endpoint}]:`, error);
        throw error;
    }
}


/* ------------------------------------------------------------------ */
/*  Orders API                                                          */
/* ------------------------------------------------------------------ */

const ordersAPI = {
    getAll:   ()              => apiRequest('/orders/'),
    getById:  (id)            => apiRequest(`/orders/${id}`),
    create:   (data)          => apiRequest('/orders/', { method: 'POST',   body: JSON.stringify(data) }),
    update:   (id, data)      => apiRequest(`/orders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete:   (id)            => apiRequest(`/orders/${id}`, { method: 'DELETE' }),
};


/* ------------------------------------------------------------------ */
/*  Products API                                                        */
/* ------------------------------------------------------------------ */

const productsAPI = {
    getAll:   ()              => apiRequest('/products/'),
    getById:  (id)            => apiRequest(`/products/${id}`),
    create:   (data)          => apiRequest('/products/', { method: 'POST',  body: JSON.stringify(data) }),
    update:   (id, data)      => apiRequest(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete:   (id)            => apiRequest(`/products/${id}`, { method: 'DELETE' }),
};


/* ------------------------------------------------------------------ */
/*  Inventory API                                                       */
/* ------------------------------------------------------------------ */

const inventoryAPI = {
    getAll:   ()              => apiRequest('/inventory/'),
    getById:  (id)            => apiRequest(`/inventory/${id}`),
    create:   (data)          => apiRequest('/inventory/', { method: 'POST', body: JSON.stringify(data) }),
    update:   (id, data)      => apiRequest(`/inventory/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    restock:  (id, qty)       => apiRequest(`/inventory/${id}/restock?quantity=${qty}`, { method: 'PUT' }),
    delete:   (id)            => apiRequest(`/inventory/${id}`, { method: 'DELETE' }),
};


/* ------------------------------------------------------------------ */
/*  Dashboard / Stats helper                                            */
/* ------------------------------------------------------------------ */

async function getDashboardStats() {
    const [orders, products, inventory] = await Promise.all([
        ordersAPI.getAll(),
        productsAPI.getAll(),
        inventoryAPI.getAll(),
    ]);
    const lowStock = inventory.filter(i => i.quantity_on_hand <= i.reorder_threshold);
    const pendingOrders = orders.filter(o => o.status === 'pending');

    return { orders, products, inventory, lowStock, pendingOrders };
}


/* ------------------------------------------------------------------ */
/*  Toast notification utility                                          */
/* ------------------------------------------------------------------ */

function showToast(message, type = 'success') {
    // Create container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'bi-check-circle-fill',
        error:   'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info:    'bi-info-circle-fill',
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="bi ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(60px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}


/* ------------------------------------------------------------------ */
/*  Sidebar toggle (mobile)                                             */
/* ------------------------------------------------------------------ */

function initSidebar() {
    const toggleBtn = document.querySelector('.btn-sidebar-toggle');
    const sidebar   = document.querySelector('.sidebar');
    const overlay   = document.createElement('div');

    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:999;display:none;';
    document.body.appendChild(overlay);

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.style.display = 'none';
        });
    }
}

document.addEventListener('DOMContentLoaded', initSidebar);
