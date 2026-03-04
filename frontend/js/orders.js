/**
 * orders.js — Logic for the Orders list and Order form pages.
 */

let allOrders = [];
let productsMap = {};

/* ------------------------------------------------------------------ */
/*  Orders List Page                                                    */
/* ------------------------------------------------------------------ */

async function loadOrders() {
    const tbody = document.getElementById('ordersTableBody');
    const spinner = document.getElementById('ordersSpinner');
    const emptyState = document.getElementById('ordersEmpty');
    if (!tbody) return;

    spinner && (spinner.style.display = 'flex');
    emptyState && (emptyState.style.display = 'none');

    try {
        const [orders, products] = await Promise.all([
            ordersAPI.getAll(),
            productsAPI.getAll(),
        ]);
        allOrders = orders;
        products.forEach(p => productsMap[p.product_id] = p);

        renderOrders(allOrders);
    } catch (err) {
        showToast('Failed to load orders: ' + err.message, 'error');
    } finally {
        spinner && (spinner.style.display = 'none');
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('ordersTableBody');
    const emptyState = document.getElementById('ordersEmpty');

    if (!orders.length) {
        tbody.innerHTML = '';
        emptyState && (emptyState.style.display = 'block');
        return;
    }
    emptyState && (emptyState.style.display = 'none');

    tbody.innerHTML = orders.map(o => {
        const product = productsMap[o.product_id];
        const productName = product ? product.name : `Product #${o.product_id}`;
        const statusBadge = `<span class="badge badge-${o.status}">${capitalize(o.status)}</span>`;
        const date = new Date(o.order_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        return `
        <tr>
            <td><strong>#${o.order_id}</strong></td>
            <td>${escapeHtml(o.patient_name)}</td>
            <td>${escapeHtml(productName)}</td>
            <td>${o.quantity}</td>
            <td>$${parseFloat(o.total_amount).toFixed(2)}</td>
            <td>${date}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="d-flex gap-2">
                    <a href="order-form.html?id=${o.order_id}" class="btn btn-sm btn-outline-primary" title="Edit">
                        <i class="bi bi-pencil-square"></i>
                    </a>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteOrder(${o.order_id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function filterOrders() {
    const query = (document.getElementById('searchOrders')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('statusFilter')?.value || '';

    const filtered = allOrders.filter(o => {
        const matchSearch = o.patient_name.toLowerCase().includes(query)
            || String(o.order_id).includes(query);
        const matchStatus = !statusFilter || o.status === statusFilter;
        return matchSearch && matchStatus;
    });
    renderOrders(filtered);
}

async function confirmDeleteOrder(orderId) {
    if (!confirm(`Are you sure you want to delete Order #${orderId}?`)) return;
    try {
        await ordersAPI.delete(orderId);
        showToast(`Order #${orderId} deleted successfully.`, 'success');
        loadOrders();
    } catch (err) {
        showToast('Failed to delete order: ' + err.message, 'error');
    }
}

/* ------------------------------------------------------------------ */
/*  Order Form Page                                                     */
/* ------------------------------------------------------------------ */

async function initOrderForm() {
    const form = document.getElementById('orderForm');
    if (!form) return;

    const productSelect = document.getElementById('productId');
    const qtyInput = document.getElementById('quantity');
    const totalInput = document.getElementById('totalAmount');
    const submitBtn = document.getElementById('submitBtn');
    const formTitle = document.getElementById('formTitle');

    // Populate product dropdown
    try {
        const products = await productsAPI.getAll();
        products.forEach(p => {
            productsMap[p.product_id] = p;
            const opt = document.createElement('option');
            opt.value = p.product_id;
            opt.textContent = `${p.name} — $${parseFloat(p.unit_price).toFixed(2)}`;
            productSelect.appendChild(opt);
        });
    } catch (err) {
        showToast('Failed to load products', 'error');
    }

    // Auto-calculate total
    function calcTotal() {
        const pid = parseInt(productSelect.value);
        const qty = parseInt(qtyInput.value) || 0;
        const product = productsMap[pid];
        if (product && qty > 0) {
            totalInput.value = (parseFloat(product.unit_price) * qty).toFixed(2);
        }
    }
    productSelect.addEventListener('change', calcTotal);
    qtyInput.addEventListener('input', calcTotal);

    // Check if editing
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');

    if (editId) {
        formTitle.textContent = `Edit Order #${editId}`;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Update Order';
        try {
            const order = await ordersAPI.getById(editId);
            document.getElementById('patientName').value = order.patient_name;
            productSelect.value = order.product_id;
            qtyInput.value = order.quantity;
            totalInput.value = parseFloat(order.total_amount).toFixed(2);
            document.getElementById('status').value = order.status;
        } catch (err) {
            showToast('Failed to load order details', 'error');
        }
    }

    // Submit handler
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

        const data = {
            patient_name: document.getElementById('patientName').value.trim(),
            product_id: parseInt(productSelect.value),
            quantity: parseInt(qtyInput.value),
            total_amount: parseFloat(totalInput.value),
            status: document.getElementById('status').value,
        };

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving…';

        try {
            if (editId) {
                await ordersAPI.update(editId, data);
                showToast(`Order #${editId} updated successfully!`, 'success');
            } else {
                const created = await ordersAPI.create(data);
                showToast(`Order #${created.order_id} created successfully!`, 'success');
            }
            setTimeout(() => window.location.href = 'orders.html', 1200);
        } catch (err) {
            showToast('Failed to save order: ' + err.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = editId
                ? '<i class="bi bi-check-circle"></i> Update Order'
                : '<i class="bi bi-plus-circle"></i> Create Order';
        }
    });
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                           */
/* ------------------------------------------------------------------ */

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ------------------------------------------------------------------ */
/*  Init                                                                */
/* ------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
    initOrderForm();
});
