
import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  Thermometer, 
  FlaskConical, 
  ClipboardList, 
  Package, 
  Zap, 
  AlertTriangle,
  Send,
  Loader2,
  Plus,
  Minus,
  TrendingUp,
  BarChart3,
  Settings2,
  ShoppingCart,
  CalendarDays,
  CheckCircle2,
  Circle,
  Wrench,
  Waves,
  History,
  X,
  LayoutGrid,
  Trash2,
  PlusCircle,
  Check,
  PlusSquare,
  CloudCheck,
  RefreshCcw,
  WifiOff
} from 'lucide-react';
import { POOL_VOLUME_M3, DOSAGE } from './constants';
import { InventoryItem, WaterState, MaintenanceLog, ScheduledTask } from './types';
import { getMaintenanceAdvice } from './geminiService';
import { supabase } from './supabaseClient';

type Tab = 'estado' | 'analiticas' | 'stock' | 'agenda';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('estado');
  const [ph, setPh] = useState(8.2);
  const [cl, setCl] = useState(0.5);
  const [waterState, setWaterState] = useState<WaterState>(WaterState.GREEN);
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduledTask[]>([]);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);

  const [newTask, setNewTask] = useState<{
    task: string;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    category: 'cleaning' | 'mechanical' | 'chemical';
  }>({
    task: '',
    frequency: 'weekly',
    category: 'cleaning'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setDbError(false);
    try {
      const { data: inv, error: e1 } = await supabase.from('inventory').select('*').order('name');
      const { data: sch, error: e2 } = await supabase.from('schedule').select('*').order('created_at', { ascending: false });
      const { data: mLog, error: e3 } = await supabase.from('maintenance_logs').select('*').order('date', { ascending: false });
      const { data: lastMeas, error: e4 } = await supabase.from('measurements').select('*').order('created_at', { ascending: false }).limit(1);

      if (e1 || e2 || e3 || e4) throw new Error("Connection failed");

      if (inv) setInventory(inv);
      if (sch) setSchedule(sch);
      if (mLog) setLogs(mLog);
      if (lastMeas && lastMeas[0]) {
        setPh(Number(lastMeas[0].ph));
        setCl(Number(lastMeas[0].chlorine));
        setWaterState(lastMeas[0].water_state as WaterState);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      setDbError(true);
    } finally {
      setLoading(false);
    }
  };

  const syncMeasurements = async (newPh: number, newCl: number, newState: WaterState) => {
    setSyncing(true);
    try {
      await supabase.from('measurements').insert([{ ph: newPh, chlorine: newCl, water_state: newState }]);
    } catch (err) {
      console.error("Sync Error:", err);
    } finally {
      setSyncing(false);
    }
  };

  const handlePhChange = (val: number) => {
    setPh(val);
    syncMeasurements(val, cl, waterState);
  };

  const handleClChange = (val: number) => {
    setCl(val);
    syncMeasurements(ph, val, waterState);
  };

  const handleStateChange = (state: WaterState) => {
    setWaterState(state);
    syncMeasurements(ph, cl, state);
  };

  const addTask = async () => {
    if (!newTask.task.trim()) return;
    setSyncing(true);
    const { data } = await supabase.from('schedule').insert([{
      task: newTask.task,
      frequency: newTask.frequency,
      category: newTask.category,
      completed: false
    }]).select();

    if (data) {
      setSchedule(prev => [data[0], ...prev]);
      setNewTask({ task: '', frequency: 'weekly', category: 'cleaning' });
      setShowAddForm(false);
    }
    setSyncing(false);
  };

  const toggleTask = async (id: string) => {
    if (isConfigMode) return;
    const task = schedule.find(t => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    setSchedule(prev => prev.map(t => t.id === id ? { ...t, completed: newCompleted } : t));
    await supabase.from('schedule').update({ completed: newCompleted }).eq('id', id);
  };

  const renderHeader = () => (
    <header className="bg-blue-600 text-white p-6 shadow-lg sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Droplets className="w-8 h-8" /> PoolGuard
          </h1>
          <p className="text-blue-100 text-[9px] font-bold uppercase tracking-[0.3em] mt-1">Tocopilla Expert System</p>
        </div>
        <div className="flex items-center gap-3">
           {syncing ? <Loader2 className="w-4 h-4 animate-spin text-blue-200" /> : 
            dbError ? <WifiOff className="w-4 h-4 text-red-300" /> : <CloudCheck className="w-5 h-5 text-blue-200" />}
           <div className="bg-white/10 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase backdrop-blur-md border border-white/10">
              {activeTab}
           </div>
        </div>
      </div>
    </header>
  );

  const renderLoader = () => (
    <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4 animate-in fade-in duration-500">
      <div className="relative">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        <Droplets className="w-4 h-4 text-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
      </div>
      <p className="text-xs font-bold uppercase tracking-[0.2em] animate-pulse">Sincronizando 70m³...</p>
    </div>
  );

  const renderError = () => (
    <div className="p-8 text-center bg-white rounded-[2rem] shadow-sm border border-red-100 mt-10 mx-4">
      <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <WifiOff className="w-8 h-8" />
      </div>
      <h2 className="text-slate-800 font-bold mb-2 uppercase tracking-tight">Error de Conexión</h2>
      <p className="text-slate-500 text-sm mb-6">No se pudo conectar con Supabase. Verifica tus credenciales o el estado de tu red.</p>
      <button 
        onClick={fetchData}
        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 mx-auto hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200"
      >
        <RefreshCcw className="w-4 h-4" /> Reintentar
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-['Inter']">
      {renderHeader()}

      <main className="max-w-4xl mx-auto p-4">
        {loading ? renderLoader() : dbError ? renderError() : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'estado' && (
              <div className="space-y-6">
                {/* Panel de Mediciones */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-slate-500 font-semibold mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <FlaskConical className="w-4 h-4" /> Control Químico
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Nivel de pH</label>
                          <span className={`text-lg font-bold ${ph > 7.6 ? 'text-red-500' : 'text-green-600'}`}>{ph}</span>
                        </div>
                        <input 
                          type="range" min="6.5" max="8.5" step="0.1" value={ph} 
                          onChange={(e) => handlePhChange(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Cloro (ppm)</label>
                          <span className={`text-lg font-bold ${cl < 1.0 ? 'text-red-500' : 'text-green-600'}`}>{cl}</span>
                        </div>
                        <input 
                          type="range" min="0" max="5" step="0.1" value={cl} 
                          onChange={(e) => handleClChange(parseFloat(e.target.value))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-slate-500 font-semibold mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Thermometer className="w-4 h-4" /> Estado Visual
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.values(WaterState).map((state) => (
                        <button
                          key={state}
                          onClick={() => handleStateChange(state)}
                          className={`py-3 rounded-xl text-[10px] font-bold uppercase transition-all border ${
                            waterState === state 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                            : 'bg-white text-slate-400 border-slate-100'
                          }`}
                        >
                          {state}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Calculadora de 70m3 */}
                <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 scale-150"><Droplets className="w-32 h-32" /></div>
                  <h2 className="font-bold mb-6 flex items-center gap-3 text-lg">
                    <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400/20" /> Plan Maestro 70m³
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-xs font-medium text-slate-400">Tratamiento pH-</span>
                      <span className="font-black text-yellow-400 text-xl">{(DOSAGE.PH_DOWN(ph, 7.2) / 1000).toFixed(1)} L Ácido</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                      <span className="text-xs font-medium text-slate-400">Supercloración</span>
                      <span className="font-black text-blue-400 text-xl">{(DOSAGE.CHLORINE_SHOCK() / 1000).toFixed(1)} kg Cloro</span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'agenda' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-2">
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Agenda Semanal</h2>
                  <button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg active:scale-90 transition-all">
                    {showAddForm ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </button>
                </div>
                {showAddForm && (
                  <div className="bg-white p-6 rounded-[2rem] border-2 border-blue-50 space-y-3 shadow-xl">
                    <input 
                      type="text" 
                      placeholder="Nueva tarea..."
                      className="w-full bg-slate-50 p-4 rounded-xl text-sm border-none focus:ring-2 focus:ring-blue-100"
                      value={newTask.task}
                      onChange={e => setNewTask({...newTask, task: e.target.value})}
                    />
                    <button onClick={addTask} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100">Registrar</button>
                  </div>
                )}
                <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                  {schedule.map(t => (
                    <div key={t.id} onClick={() => toggleTask(t.id)} className={`p-5 flex items-center gap-4 transition-all ${t.completed ? 'bg-slate-50/50 grayscale opacity-40' : 'hover:bg-blue-50/20'}`}>
                      {t.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-slate-200" />}
                      <span className={`flex-1 text-sm font-bold ${t.completed ? 'line-through' : 'text-slate-700'}`}>{t.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'stock' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter px-2">Bodega de Químicos</h2>
                <div className="grid gap-3">
                  {inventory.map(item => (
                    <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        <p className="text-[10px] font-bold text-blue-600 uppercase mt-1">{item.quantity} {item.unit} disponibles</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-slate-50 rounded-lg text-slate-400"><Minus className="w-4 h-4" /></button>
                        <button className="p-2 bg-blue-50 rounded-lg text-blue-600"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Navegación inferior persistente */}
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-2xl border-t border-slate-100 flex justify-around p-4 pb-8 z-50">
        {[
          { id: 'estado', icon: Droplets, label: 'Estado' },
          { id: 'agenda', icon: ClipboardList, label: 'Agenda' },
          { id: 'stock', icon: Package, label: 'Stock' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === item.id ? 'text-blue-600 scale-110' : 'text-slate-400'}`}
          >
            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-blue-600/10' : ''}`} />
            <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
