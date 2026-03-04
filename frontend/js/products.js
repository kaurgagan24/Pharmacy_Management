/**
 * products.js — Logic for the Products list and Product form pages.
 */

let allProducts = [];

/* ------------------------------------------------------------------ */
/*  Products List Page                                                  */
/* ------------------------------------------------------------------ */

async function loadProducts() {
    const tbody = document.getElementById('productsTableBody');
    const spinner = document.getElementById('productsSpinner');
    const emptyState = document.getElementById('productsEmpty');
    if (!tbody) return;

    spinner && (spinner.style.display = 'flex');
    emptyState && (emptyState.style.display = 'none');

    try {
        allProducts = await productsAPI.getAll();
        renderProducts(allProducts);
    } catch (err) {
        showToast('Failed to load products: ' + err.message, 'error');
    } finally {
        spinner && (spinner.style.display = 'none');
    }
}

function renderProducts(products) {
    const tbody = document.getElementById('productsTableBody');
    const emptyState = document.getElementById('productsEmpty');

    if (!products.length) {
        tbody.innerHTML = '';
        emptyState && (emptyState.style.display = 'block');
        return;
    }
    emptyState && (emptyState.style.display = 'none');

    tbody.innerHTML = products.map(p => {
        const rxBadge = p.requires_prescription
            ? '<span class="badge badge-rx"><i class="bi bi-clipboard2-pulse"></i> Rx</span>'
            : '<span class="badge badge-otc">OTC</span>';

        return `
        <tr>
            <td><strong>#${p.product_id}</strong></td>
            <td>${escapeHtml(p.name)}</td>
            <td><span class="badge bg-light text-dark">${escapeHtml(p.category)}</span></td>
            <td>$${parseFloat(p.unit_price).toFixed(2)}</td>
            <td>${escapeHtml(p.manufacturer || '—')}</td>
            <td>${rxBadge}</td>
            <td>
                <div class="d-flex gap-2">
                    <a href="product-form.html?id=${p.product_id}" class="btn btn-sm btn-outline-primary" title="Edit">
                        <i class="bi bi-pencil-square"></i>
                    </a>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteProduct(${p.product_id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function filterProducts() {
    const query = (document.getElementById('searchProducts')?.value || '').toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';

    const filtered = allProducts.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(query)
            || (p.manufacturer || '').toLowerCase().includes(query)
            || String(p.product_id).includes(query);
        const matchCategory = !categoryFilter || p.category === categoryFilter;
        return matchSearch && matchCategory;
    });
    renderProducts(filtered);
}

function populateCategoryFilter() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    const categories = [...new Set(allProducts.map(p => p.category))].sort();
    select.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(c => {
        select.innerHTML += `<option value="${c}">${c}</option>`;
    });
}

async function confirmDeleteProduct(productId) {
    if (!confirm(`Are you sure you want to delete Product #${productId}?`)) return;
    try {
        await productsAPI.delete(productId);
        showToast(`Product #${productId} deleted successfully.`, 'success');
        loadProducts();
    } catch (err) {
        showToast('Failed to delete product: ' + err.message, 'error');
    }
}

/* ------------------------------------------------------------------ */
/*  Product Form Page                                                   */
/* ------------------------------------------------------------------ */

async function initProductForm() {
    const form = document.getElementById('productForm');
    if (!form) return;

    const submitBtn = document.getElementById('submitBtn');
    const formTitle = document.getElementById('formTitle');

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('id');

    if (editId) {
        formTitle.textContent = `Edit Product #${editId}`;
        submitBtn.innerHTML = '<i class="bi bi-check-circle"></i> Update Product';
        try {
            const product = await productsAPI.getById(editId);
            document.getElementById('productName').value = product.name;
            document.getElementById('category').value = product.category;
            document.getElementById('description').value = product.description || '';
            document.getElementById('unitPrice').value = parseFloat(product.unit_price).toFixed(2);
            document.getElementById('manufacturer').value = product.manufacturer || '';
            document.getElementById('requiresPrescription').checked = product.requires_prescription;
        } catch (err) {
            showToast('Failed to load product details', 'error');
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!form.checkValidity()) { form.classList.add('was-validated'); return; }

        const data = {
            name: document.getElementById('productName').value.trim(),
            category: document.getElementById('category').value.trim(),
            description: document.getElementById('description').value.trim() || null,
            unit_price: parseFloat(document.getElementById('unitPrice').value),
            manufacturer: document.getElementById('manufacturer').value.trim() || null,
            requires_prescription: document.getElementById('requiresPrescription').checked,
        };

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Saving…';

        try {
            if (editId) {
                await productsAPI.update(editId, data);
                showToast(`Product #${editId} updated successfully!`, 'success');
            } else {
                const created = await productsAPI.create(data);
                showToast(`Product "${created.name}" added successfully!`, 'success');
            }
            setTimeout(() => window.location.href = 'products.html', 1200);
        } catch (err) {
            showToast('Failed to save product: ' + err.message, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = editId
                ? '<i class="bi bi-check-circle"></i> Update Product'
                : '<i class="bi bi-plus-circle"></i> Add Product';
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
    loadProducts().then(() => populateCategoryFilter());
    initProductForm();
});
