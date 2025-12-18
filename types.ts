
export interface PoolStatus {
  ph: number;
  chlorine: number;
  alkalinity: number;
  temperature: number;
  lastChecked: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  targetQuantity: number;
  unit: 'kg' | 'L' | 'units';
}

export interface MaintenanceLog {
  id: string;
  date: Date;
  actions: string[];
  chemicalsAdded: { name: string; amount: number; unit: string }[];
  notes?: string;
}

export interface ScheduledTask {
  id: string;
  task: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  nextDate: Date;
  completed: boolean;
  category: 'cleaning' | 'mechanical' | 'chemical';
}

export enum WaterState {
  CLEAR = 'clear',
  CLOUDY = 'cloudy',
  GREEN = 'green',
  ALGAE = 'algae'
}
