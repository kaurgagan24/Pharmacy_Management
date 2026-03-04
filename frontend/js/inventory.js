/**
 * inventory.js — Logic for the Inventory list and Inventory form pages.
 */

let allInventory = [];
let productsMap = {};

/* ------------------------------------------------------------------ */
/*  Inventory List Page                                                 */
/* ------------------------------------------------------------------ */

async function loadInventory() {
    const tbody = document.getElementById('inventoryTableBody');
    const spinner = document.getElementById('inventorySpinner');
    const emptyState = document.getElementById('inventoryEmpty');
    if (!tbody) return;

    spinner && (spinner.style.display = 'flex');
    emptyState && (emptyState.style.display = 'none');

    try {
        const [inventory, products] = await Promise.all([
            inventoryAPI.getAll(),
            productsAPI.getAll(),
        ]);
        allInventory = inventory;
        products.forEach(p => productsMap[p.product_id] = p);

        renderInventory(allInventory);
    } catch (err) {
        showToast('Failed to load inventory: ' + err.message, 'error');
    } finally {
        spinner && (spinner.style.display = 'none');
    }
}

function renderInventory(items) {
    const tbody = document.getElementById('inventoryTableBody');
    const emptyState = document.getElementById('inventoryEmpty');

    if (!items.length) {
        tbody.innerHTML = '';
        emptyState && (emptyState.style.display = 'block');
        return;
    }
    emptyState && (emptyState.style.display = 'none');

    tbody.innerHTML = items.map(item => {
        const product = productsMap[item.product_id];
        const productName = product ? product.name : `Product #${item.product_id}`;
        const isLow = item.quantity_on_hand <= item.reorder_threshold;
        const stockBadge = isLow
            ? '<span class="badge badge-low-stock"><i class="bi bi-exclamation-triangle"></i> Low Stock</span>'
            : '<span class="badge badge-in-stock"><i class="bi bi-check-circle"></i> In Stock</span>';
        const rowClass = isLow ? 'style="background-color: #fff8e1;"' : '';
        const updated = new Date(item.last_updated).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        return `
        <tr ${rowClass}>
            <td><strong>#${item.inventory_id}</strong></td>
            <td>${escapeHtml(productName)}</td>
            <td><strong>${item.quantity_on_hand}</strong></td>
            <td>${item.reorder_threshold}</td>
            <td>${stockBadge}</td>
            <td>${updated}</td>
            <td>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-success" onclick="openRestockModal(${item.inventory_id}, '${escapeHtml(productName)}')" title="Restock">
                        <i class="bi bi-plus-lg"></i>
                    </button>
                    <a href="inventory-form.html?id=${item.inventory_id}" class="btn btn-sm btn-outline-primary" title="Edit">
                        <i class="bi bi-pencil-square"></i>
                    </a>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteInventory(${item.inventory_id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function filterInventory() {
    const query = (document.getElementById('searchInventory')?.value || '').toLowerCase();
    const stockFilter = document.getElementById('stockFilter')?.value || '';

    const filtered = allInventory.filter(item => {
        const product = productsMap[item.product_id];
        const productName = product ? product.name.toLowerCase() : '';
        const matchSearch = productName.includes(query)
            || String(item.inventory_id).includes(query);
        const isLow = item.quantity_on_hand <= item.reorder_threshold;
        const matchStock = !stockFilter
            || (stockFilter === 'low' && isLow)
            || (stockFilter === 'ok' && !isLow);
        return matchSearch && matchStock;
    });
    renderInventory(filtered);
}

async function confirmDeleteInventory(itemId) {
    if (!confirm(`Delete inventory record #${itemId}?`)) return;
    try {
        await inventoryAPI.delete(itemId);
        showToast(`Inventory #${itemId} deleted.`, 'success');
        loadInventory();
    } catch (err) {
        showToast('Failed to delete: ' + err.message, 'error');
    }
}

/* ------------------------------------------------------------------ */
/*  Restock Modal                                                       */
/* ------------------------------------------------------------------ */

let restockItemId = null;

function openRestockModal(itemId, productName) {
    restockItemId = itemId;
    document.getElementById('restockProductName').textContent = productName;
    document.getElementById('restockQty').value = '';
    const modal = new bootstrap.Modal(document.getElementById('restockModal'));
    modal.show();
}

async function submitRestock() {
    const qty = parseInt(document.getElementById('restockQty').value);
    if (!qty || qty <= 0) { showToast('Enter a valid quantity', 'warning'); return; }

    try {
        await inventoryAPI.restock(restockItemId, qty);
        showToast(`Added ${qty} units to stock!`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('restockModal')).hide();
        loadInventory();
    } catch (err) {
        showToast('Restock failed: ' + err.message, 'error');
    }
}

/* ------------------------------------------------------------------ */
/*  Inventory Form Page                                                 */
/* ------------------------------------------------------------------ */

async function initInventoryForm() {
    const form = document.getElementById('inventoryForm');
    if (!form) return;

    const productSelect = document.getElementById('productId');
    const submitBtn = document.getElementById('submitBtn');
    const formTitle = document.getElementById('formTitle');

    // Populate product dropdown
    try {
        const products = await productsAPI.getAll();
        products.forEach(p => {
            productsMap[p.product_id] = p;
            const opt = document.createElement('option');
            opt.value = p.product_id;
            opt.textContent = p.name;
            productSelect.appendChild(opt);
        });
    } catch (err) {
        showToast('Failed to load products', 'error');
    }

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');

    if (editId) {
        formTitle.textContent = `Edit Inventory #${editId}`;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Update Inventory';
        try {
            const item = await inventoryAPI.getById(editId);
            productSelect.value = item.product_id;
            productSelect.disabled = true; // can't change product link on edit
            document.getElementById('quantityOnHand').value = item.quantity_on_hand;
            document.getElementById('reorderThreshold').value = item.reorder_threshold;
        } catch (err) {
            showToast('Failed to load inventory details', 'error');
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving…';

        try {
            if (editId) {
                const updateData = {
                    quantity_on_hand: parseInt(document.getElementById('quantityOnHand').value),
                    reorder_threshold: parseInt(document.getElementById('reorderThreshold').value),
                };
                await inventoryAPI.update(editId, updateData);
                showToast(`Inventory #${editId} updated!`, 'success');
            } else {
                const createData = {
                    product_id: parseInt(productSelect.value),
                    quantity_on_hand: parseInt(document.getElementById('quantityOnHand').value),
                    reorder_threshold: parseInt(document.getElementById('reorderThreshold').value),
                };
                await inventoryAPI.create(createData);
                showToast('Inventory item added!', 'success');
            }
            setTimeout(() => window.location.href = 'inventory.html', 1200);
        } catch (err) {
            showToast('Failed to save: ' + err.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = editId
                ? '<i class="bi bi-check-circle"></i> Update Inventory'
                : '<i class="bi bi-plus-circle"></i> Add to Inventory';
        }
    });
}

/* ------------------------------------------------------------------ */
/*  Utilities                                                           */
/* ------------------------------------------------------------------ */

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ------------------------------------------------------------------ */
/*  Init                                                                */
/* ------------------------------------------------------------------ */

document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    initInventoryForm();
});
