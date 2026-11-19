import { LightningElement, track } from 'lwc';
import TenantConfigModal from 'ui/tenantConfigModal';
import { navigate } from '../../../router';
import { getActiveFlowId } from '../../data/flowConfig/flowConfig';
import { loadProducts, saveProducts, loadAssignments, saveAssignments } from '../../data/productStore/productStore';

const ALL_CATALOG_ITEMS = [
    { id: '1', name: 'Sales & Service Cloud - Core Edition', price: '$190.00' },
    { id: '2', name: 'Sales & Service Cloud - Premium Edition', price: '$105.00' },
    { id: '3', name: 'Sales & Service Cloud - Unlimited Edition', price: '$355.00' },
    { id: '4', name: 'Sales Cloud - Core Edition', price: '$165.00' },
    { id: '5', name: 'Sales Cloud - Premium Edition', price: '$80.00' },
    { id: '6', name: 'Sales Cloud - Unlimited Edition', price: '$330.00' },
    { id: '7', name: 'Service Cloud - Core Edition', price: '$80.00' },
    { id: '8', name: 'Service Cloud - Premium Edition', price: '$330.00' },
];

export default class QuoteProductSelection extends LightningElement {
    // Per-product tenant assignments: { [productId]: { mode, orgId, orgDisplayId, environment } }
    @track tenantAssignments = {};

    searchTerm = '';
    selectedCategory = 'all';

    categoryOptions = [{ label: 'All Categories', value: 'all' }];

    pageSizeOptions = [
        { label: '10', value: '10' },
        { label: '20', value: '20' },
        { label: '50', value: '50' },
    ];

    tenantFilterOptions = [{ label: 'All Tenants', value: '' }];
    cartOptions = [{ label: 'Default Cart', value: 'default' }];

    /* ---- Catalog ---- */

    get filteredCatalogItems() {
        const term = this.searchTerm ? this.searchTerm.toLowerCase() : '';
        return ALL_CATALOG_ITEMS
            .filter(item => !term || item.name.toLowerCase().includes(term))
            .map(item => ({ ...item, selectLabel: `Select ${item.name}` }));
    }

    get catalogCount() {
        return `${this.filteredCatalogItems.length} Product(s)`;
    }

    /* ---- Selected products (enriched for template) ---- */

    get selectedProducts() {
        return this._selectedProducts.map(p => {
            const assignment = this.tenantAssignments[p.id];
            const isAssigned = !!assignment;
            const tenantDisplay = isAssigned
                ? `${assignment.environment} · ${assignment.orgDisplayId}`
                : 'Not configured';
            return {
                ...p,
                isAssigned,
                showWarning: !isAssigned,
                tenantDisplay,
            };
        });
    }

    @track _selectedProducts = [];

    get hasSelectedProducts() {
        return this._selectedProducts.length > 0;
    }

    get showEmptySelected() {
        return !this.hasSelectedProducts;
    }

    get selectedCountLabel() {
        return `Selected Products (${this._selectedProducts.length})`;
    }

    /* ---- Quote Issues ---- */

    get unassignedProducts() {
        return this._selectedProducts.filter(p => !this.tenantAssignments[p.id]);
    }

    get quoteIssues() {
        return this.unassignedProducts.map(p => ({
            id: p.id,
            severity: 'warning',
            message: `Configure Tenant | ${p.name}`,
            action: { label: 'Configure Tenant', event: 'configuretenant' },
        }));
    }

    get showConfigureTenantBtn() {
        return this.unassignedProducts.length > 0;
    }

    /* ---- Derived page state ---- */

    get pageClass() {
        return this.hasSelectedProducts ? 'qc-page qc-page_active' : 'qc-page';
    }

    get isVersionB() {
        return getActiveFlowId() === 'version-b';
    }

    get nextStepLabel() {
        return this.isVersionB ? 'Tenant Configuration' : 'Pricing';
    }

    get showTenantFeatures() {
        return !this.isVersionB;
    }

    connectedCallback() {
        if (!this.isVersionB) return;
        this._selectedProducts = loadProducts();
        this.tenantAssignments = loadAssignments();
    }

    _syncStore() {
        if (!this.isVersionB) return;
        saveProducts(this._selectedProducts);
        saveAssignments(this.tenantAssignments);
    }

    /* ---- Catalog handlers ---- */

    handleSearchChange(event) {
        this.searchTerm = event.detail.value;
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.detail.value;
    }

    handleProductSelect(event) {
        const productId = event.currentTarget.dataset.id;
        const product = ALL_CATALOG_ITEMS.find(p => p.id === productId);
        if (!product) return;

        const alreadySelected = this._selectedProducts.some(p => p.id === productId);
        if (alreadySelected) return;

        this._selectedProducts = [
            ...this._selectedProducts,
            { id: product.id, name: product.name, price: product.price, quantity: 1 },
        ];
        this.searchTerm = product.name;
        this._syncStore();
    }

    handleCatalogKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleProductSelect(event);
        }
    }

    handleQuantityChange(event) {
        const productId = event.currentTarget.dataset.id;
        const qty = parseInt(event.detail.value, 10);
        this._selectedProducts = this._selectedProducts.map(p =>
            p.id === productId
                ? { ...p, quantity: Number.isFinite(qty) && qty >= 1 ? qty : 1 }
                : p
        );
        this._syncStore();
    }

    handleDeleteProduct(event) {
        const productId = event.currentTarget.dataset.id;
        this._selectedProducts = this._selectedProducts.filter(p => p.id !== productId);
        const updated = { ...this.tenantAssignments };
        delete updated[productId];
        this.tenantAssignments = updated;
        this._syncStore();
        if (this._selectedProducts.length === 0) {
            this.searchTerm = '';
        }
    }

    /* ---- Tenant configuration ---- */

    async handleConfigureTenant(event) {
        // Determine target product: first unassigned product
        const targetProduct = this.unassignedProducts[0] || this._selectedProducts[0];
        if (!targetProduct) return;
        const triggerElement = event?.currentTarget || null;
        await this._openTenantModal(targetProduct.id, targetProduct.name, triggerElement);
    }

    async handleEditTenant(event) {
        const productId = event.currentTarget.dataset.id;
        const product = this._selectedProducts.find(p => p.id === productId);
        if (!product) return;
        const triggerElement = event.currentTarget;
        await this._openTenantModal(productId, product.name, triggerElement);
    }

    async _openTenantModal(productId, productName, triggerElement) {
        const existing = this.tenantAssignments[productId] || null;
        const result = await TenantConfigModal.open({
            size: 'large',
            label: 'Tenant & Fulfillment Configuration',
            productName,
            initialAssignment: existing,
        });
        if (result) {
            this.tenantAssignments = { ...this.tenantAssignments, [productId]: result };
            this._syncStore();
        }
        // Restore focus to the element that triggered the modal
        if (triggerElement) {
            triggerElement.focus();
        }
    }

    /* ---- Stubs ---- */

    handleSuggestedProducts() {}

    handleBackStep() {}

    handleNextStep() {
        if (this.isVersionB) {
            navigate('/quote/tenant-configuration');
        }
    }

    handleSaveExit() {}

    handleSalesSupport() {}
}
