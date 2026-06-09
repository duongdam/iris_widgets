import { DataFormat } from "../contracts/chart-record";
import type { DataAdapter, AdapterRegistry as IAdapterRegistry } from "../contracts/data-adapter";
import { ElasticAggregationAdapter } from "./ElasticAggregationAdapter";
import { FlatDataAdapter } from "./FlatDataAdapter";

class AdapterRegistryImpl implements IAdapterRegistry {
    private readonly adapters = new Map<DataFormat, DataAdapter>();

    constructor() {
        this.register(new FlatDataAdapter());
        this.register(new ElasticAggregationAdapter());
    }

    register(adapter: DataAdapter): void {
        this.adapters.set(adapter.format, adapter);
    }

    get(format: DataFormat): DataAdapter {
        const adapter = this.adapters.get(format);
        if (!adapter) {
            throw new Error(`No adapter registered for format: ${format}`);
        }
        return adapter;
    }
}

const adapterRegistry = new AdapterRegistryImpl();

function getAdapter(format: DataFormat): DataAdapter {
    return adapterRegistry.get(format);
}

export { AdapterRegistryImpl, adapterRegistry, getAdapter };
export { AdapterRegistryImpl as AdapterRegistry };
