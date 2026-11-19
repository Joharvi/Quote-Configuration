import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import TenantConfigModal from 'ui/tenantConfigModal';
import { loadProducts, saveProducts, loadAssignments, saveAssignments } from '../../data/productStore/productStore';

export default class QuoteTenantConfiguration extends LightningElement {
    @track _selectedProducts = [];
    @track _tenantAssignments = {};

    connectedCallback() {
        this._selectedProducts = loadProducts();
        this._tenantAssignments = loadAssignments();
    }

    /* ---- Computed product list ---- */

    get selectedProducts() {
        return this._selectedProducts.map(p => {
            const assignment = this._tenantAssignments[p.id];
            const isAssigned = !!assignment;
            const tenantDisplay = isAssigned
                ? `${assignment.environment} · ${assignment.orgDisplayId}`
                : 'Not configured';
            return { ...p, isAssigned, showWarning: !isAssigned, tenantDisplay };
        });
    }

    get hasSelectedProducts() {
        return this._selectedProducts.length > 0;
    }

    get selectedCountLabel() {
        return `Selected Products (${this._selectedProducts.length})`;
    }

    /* ---- Quote Issues ---- */

    get _unassignedProducts() {
        return this._selectedProducts.filter(p => !this._tenantAssignments[p.id]);
    }

    get quoteIssues() {
        return this._unassignedProducts.map(p => ({
            id: p.id,
            severity: 'warning',
            message: `Configure Tenant | ${p.name}`,
            action: { label: 'Configure Tenant', event: 'configuretenant' },
        }));
    }

    get showConfigureTenantBtn() {
        return this._unassignedProducts.length > 0;
    }

    get showSuggestedProducts() {
        return false;
    }

    /* ---- Handlers ---- */

    handleQuantityChange(event) {
        const productId = event.currentTarget.dataset.id;
        const qty = parseInt(event.detail.value, 10);
        this._selectedProducts = this._selectedProducts.map(p =>
            p.id === productId
                ? { ...p, quantity: Number.isFinite(qty) && qty >= 1 ? qty : 1 }
                : p
        );
        saveProducts(this._selectedProducts);
    }

    handleDeleteProduct(event) {
        const productId = event.currentTarget.dataset.id;
        this._selectedProducts = this._selectedProducts.filter(p => p.id !== productId);
        const updated = { ...this._tenantAssignments };
        delete updated[productId];
        this._tenantAssignments = updated;
        saveProducts(this._selectedProducts);
        saveAssignments(this._tenantAssignments);
    }

    async handleConfigureTenant() {
        const target = this._unassignedProducts[0] || this._selectedProducts[0];
        if (!target) return;
        await this._openTenantModal(target.id, target.name, null);
    }

    async handleEditTenant(event) {
        const productId = event.currentTarget.dataset.id;
        const product = this._selectedProducts.find(p => p.id === productId);
        if (!product) return;
        await this._openTenantModal(productId, product.name, event.currentTarget);
    }

    async _openTenantModal(productId, productName, triggerElement) {
        const existing = this._tenantAssignments[productId] || null;
        const result = await TenantConfigModal.open({
            size: 'large',
            label: 'Tenant & Fulfillment Configuration',
            productName,
            initialAssignment: existing,
        });
        if (result) {
            this._tenantAssignments = { ...this._tenantAssignments, [productId]: result };
            saveAssignments(this._tenantAssignments);
        }
        if (triggerElement) triggerElement.focus();
    }

    handleBackStep() {
        navigate('/quote/product-selection');
    }

    handleNextStep() {}
}
