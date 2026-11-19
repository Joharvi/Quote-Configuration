import { LightningElement, track } from 'lwc';
import { navigate } from '../../../router';
import { getActiveFlowId, setActiveFlowId } from '../../data/flowConfig/flowConfig';

const FLOWS = [
    {
        id: 'version-a',
        label: 'Version A',
        subtitle: 'Tenant & fulfillment configuration in product selection step',
        entryPath: '/opportunities',
    },
    {
        id: 'version-b',
        label: 'Version B',
        subtitle: 'Tenant Configuration as a dedicated step after product selection',
        entryPath: '/opportunities',
    },
];

export default class FlowNavigator extends LightningElement {
    @track isExpanded = false;
    @track _activeFlowId = getActiveFlowId();

    get flows() {
        return FLOWS.map((f) => ({
            ...f,
            itemClass: `fn__flow-item${f.id === this._activeFlowId ? ' fn__flow-item_active' : ''}`,
        }));
    }

    get activeFlow() {
        return FLOWS.find((f) => f.id === this._activeFlowId) ?? FLOWS[0];
    }

    get panelClass() {
        return `fn__panel${this.isExpanded ? ' fn__panel_open' : ''}`;
    }

    get triggerClass() {
        return `fn__trigger${this.isExpanded ? ' fn__trigger_hidden' : ''}`;
    }

    get isExpandedStr() {
        return this.isExpanded ? 'true' : 'false';
    }

    handleToggle() {
        this.isExpanded = !this.isExpanded;
    }

    handleFlowSelect(event) {
        const id = event.currentTarget.dataset.id;
        const flow = FLOWS.find((f) => f.id === id);
        if (!flow) return;
        this._activeFlowId = id;
        setActiveFlowId(id);
        this.isExpanded = false;
        navigate(flow.entryPath);
    }

    handleFlowKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleFlowSelect(event);
        }
    }
}
