
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
  WifiOff,
  Sparkles
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
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [dbError, setDbError] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [schedule, setSchedule] = useState<ScheduledTask[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setDbError(false);
    try {
      const { data: inv } = await supabase.from('inventory').select('*').order('name');
      const { data: sch } = await supabase.from('schedule').select('*').order('created_at', { ascending: false });
      const { data: lastMeas } = await supabase.from('measurements').select('*').order('created_at', { ascending: false }).limit(1);

      if (inv) setInventory(inv);
      if (sch) setSchedule(sch);
      if (lastMeas && lastMeas[0]) {
        setPh(Number(lastMeas[0].ph));
        setCl(Number(lastMeas[0].chlorine));
        setWaterState(lastMeas[0].water_state as WaterState);
      }
    } catch (err) {
      setDbError(true);
    } finally {
      setLoading(false);
    }
  };

  const getAIAdvice = async () => {
    setLoadingAdvice(true);
    try {
      const res = await getMaintenanceAdvice({ ph, chlorine: cl, waterState }, inventory);
      setAdvice(res || "");
    } catch (e) {
      setAdvice("Error al conectar con el experto IA.");
    } finally {
      setLoadingAdvice(false);
    }
  };

  const syncMeasurements = async (newPh: number, newCl: number, newState: WaterState) => {
    setSyncing(true);
    try {
      await supabase.from('measurements').insert([{ ph: newPh, chlorine: newCl, water_state: newState }]);
    } catch (err) {} finally {
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
           {syncing ? <Loader2 className="w-4 h-4 animate-spin text-blue-200" /> : <CloudCheck className="w-5 h-5 text-blue-200" />}
        </div>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-['Inter']">
      {renderHeader()}

      <main className="max-w-4xl mx-auto p-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-400 gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
            <p className="text-xs font-bold uppercase tracking-widest">Sincronizando 70m³...</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {activeTab === 'estado' && (
              <div className="space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-slate-500 font-semibold mb-6 flex items-center gap-2 text-sm uppercase">
                      <FlaskConical className="w-4 h-4" /> Control Químico
                    </h2>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Nivel de pH</label>
                          <span className={`text-lg font-bold ${ph > 7.6 ? 'text-red-500' : 'text-green-600'}`}>{ph}</span>
                        </div>
                        <input type="range" min="6.5" max="8.5" step="0.1" value={ph} onChange={(e) => handlePhChange(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none accent-blue-600"/>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Cloro (ppm)</label>
                          <span className={`text-lg font-bold ${cl < 1.0 ? 'text-red-500' : 'text-green-600'}`}>{cl}</span>
                        </div>
                        <input type="range" min="0" max="5" step="0.1" value={cl} onChange={(e) => handleClChange(parseFloat(e.target.value))} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none accent-blue-600"/>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-slate-500 font-semibold mb-6 flex items-center gap-2 text-sm uppercase">
                      <Waves className="w-4 h-4" /> Estado Visual
                    </h2>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.values(WaterState).map((state) => (
                        <button key={state} onClick={() => handleStateChange(state)} className={`py-3 rounded-xl text-[10px] font-bold uppercase border transition-all ${waterState === state ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}>
                          {state === WaterState.GREEN ? '🟢 Agua Verde' : state === WaterState.CLEAR ? '🔵 Cristalina' : state === WaterState.CLOUDY ? '⚪ Turbia' : '🔴 Algas'}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="font-bold mb-6 flex items-center gap-3 text-lg">
                      <Zap className="w-6 h-6 text-yellow-400" /> Plan Maestro 70m³
                    </h2>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-xs font-medium text-slate-400">Tratamiento pH-</span>
                        <span className="font-black text-yellow-400 text-xl">{(DOSAGE.PH_DOWN(ph, 7.2) / 1000).toFixed(1)} L Ácido</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/10">
                        <span className="text-xs font-medium text-slate-400">Supercloración (Shock)</span>
                        <span className="font-black text-blue-400 text-xl">{(DOSAGE.CHLORINE_SHOCK() / 1000).toFixed(1)} kg Cloro</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={getAIAdvice}
                      disabled={loadingAdvice}
                      className="w-full mt-6 bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {loadingAdvice ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-yellow-300" />}
                      CONSULTAR EXPERTO IA (GEMINI)
                    </button>
                    
                    {advice && (
                      <div className="mt-6 p-6 bg-white/5 rounded-2xl border border-white/10 text-sm text-slate-300 leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                        {advice}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'agenda' && (
              <div className="space-y-4">
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tighter px-2">Agenda Tocopilla</h2>
                <div className="bg-white rounded-3xl border border-slate-100 divide-y divide-slate-50 overflow-hidden shadow-sm">
                  {schedule.map(t => (
                    <div key={t.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                      <div className={`p-2 rounded-lg ${t.category === 'chemical' ? 'bg-purple-50 text-purple-600' : t.category === 'cleaning' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {t.category === 'chemical' ? <FlaskConical className="w-4 h-4" /> : t.category === 'cleaning' ? <Droplets className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                      </div>
                      <span className="flex-1 text-sm font-semibold text-slate-700">{t.task}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{t.frequency}</span>
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
                    <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-sm">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.name}</p>
                        <p className={`text-[10px] font-bold uppercase mt-1 ${item.quantity < 5 ? 'text-red-500' : 'text-blue-600'}`}>
                          {item.quantity} {item.unit} disponibles {item.quantity < 5 && '(CRÍTICO)'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                         <button className="p-2 bg-blue-600 text-white rounded-xl shadow-md"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around p-4 pb-8 z-50">
        {[
          { id: 'estado', icon: Droplets, label: 'Panel' },
          { id: 'agenda', icon: ClipboardList, label: 'Agenda' },
          { id: 'stock', icon: Package, label: 'Stock' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as Tab)}
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-blue-600 scale-105' : 'text-slate-400'}`}
          >
            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-blue-600/10' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
