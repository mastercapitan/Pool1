
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const getEnv = (key: string): string | undefined => {
  try {
    return (process.env as any)[key];
  } catch {
    return undefined;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

const createMockClient = () => {
  console.warn("PoolGuard: SUPABASE_URL no configurada. Operando en modo Local Mock.");
  
  const mockResponse = (data: any) => ({
    data,
    error: null,
    select: () => mockResponse(data),
    order: () => mockResponse(data),
    limit: () => mockResponse(data),
    insert: () => mockResponse(data),
    update: () => mockResponse(data),
    delete: () => mockResponse(data),
    eq: () => mockResponse(data),
    select_single: () => ({ data: data[0] || null, error: null })
  });

  return {
    from: (table: string) => {
      let defaultData: any[] = [];
      if (table === 'inventory') {
        defaultData = [
          { id: '1', name: 'Cloro Granulado', quantity: 5.5, target_quantity: 15, unit: 'kg' },
          { id: '2', name: 'Ácido Muriático', quantity: 12, target_quantity: 20, unit: 'L' },
          { id: '3', name: 'Alguicida', quantity: 2, target_quantity: 5, unit: 'L' }
        ];
      } else if (table === 'schedule') {
        defaultData = [
          { id: '1', task: 'Medir pH y Cloro (Tocopilla)', frequency: 'daily', category: 'chemical', completed: false },
          { id: '2', task: 'Limpiar Skimmers', frequency: 'daily', category: 'cleaning', completed: true }
        ];
      }
      return mockResponse(defaultData);
    },
    auth: { getSession: async () => ({ data: { session: null }, error: null }) }
  } as any;
};

// Solo inicializar si la URL es una cadena válida que empieza con http
const isValidUrl = supabaseUrl && typeof supabaseUrl === 'string' && supabaseUrl.startsWith('http');

export const supabase = isValidUrl 
  ? createClient(supabaseUrl!, supabaseAnonKey!) 
  : createMockClient();
