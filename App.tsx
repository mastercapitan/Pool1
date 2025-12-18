
import React, { useState } from 'react';
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
  History,
  TrendingUp,
  BarChart3,
  Settings2,
  ShoppingCart,
  CalendarDays,
  CheckCircle2,
  Circle,
  Wrench,
  Waves,
  Calendar,
  X,
  LayoutGrid,
  Trash2,
  PlusCircle,
  Check
} from 'lucide-react';
import { POOL_VOLUME_M3, DOSAGE } from './constants';
import { InventoryItem, WaterState, MaintenanceLog, ScheduledTask } from './types';
import { getMaintenanceAdvice } from './geminiService';

type Tab = 'estado' | 'analiticas' | 'stock' | 'agenda';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('estado');
  const [ph, setPh] = useState(8.2);
  const [cl, setCl] = useState(0.5);
  const [waterState, setWaterState] = useState<WaterState>(WaterState.GREEN);
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showTargetConfig, setShowTargetConfig] = useState(false);
  const [isConfigMode, setIsConfigMode] = useState(false);
  
  // New Task Form State
  const [newTask, setNewTask] = useState<{
    task: string;
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
    category: 'cleaning' | 'mechanical' | 'chemical';
  }>({
    task: '',
    frequency: 'weekly',
    category: 'cleaning'
  });

  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Cloro Granulado', quantity: 5, targetQuantity: 10, unit: 'kg' },
    { id: '2', name: 'Ácido Muriático', quantity: 10, targetQuantity: 15, unit: 'L' },
    { id: '3', name: 'Alguicida', quantity: 2, targetQuantity: 5, unit: 'L' },
    { id: '4', name: 'Floculante', quantity: 1, targetQuantity: 3, unit: 'L' }
  ]);

  const [schedule, setSchedule] = useState<ScheduledTask[]>([
    { id: 't1', task: 'Cepillado de paredes y fondo', frequency: 'weekly', nextDate: new Date(), completed: false, category: 'cleaning' },
    { id: 't2', task: 'Lavado y enjuague de filtro (Cuarzo)', frequency: 'biweekly', nextDate: new Date(), completed: false, category: 'mechanical' },
    { id: 't3', task: 'Reposición de pastillas de cloro', frequency: 'weekly', nextDate: new Date(), completed: false, category: 'chemical' },
    { id: 't4', task: 'Limpieza de canastillo de bomba', frequency: 'weekly', nextDate: new Date(), completed: true, category: 'mechanical' },
    { id: 't5', task: 'Aspirado de fondo', frequency: 'weekly', nextDate: new Date(), completed: false, category: 'cleaning' },
    { id: 't6', task: 'Control de nivel (Evaporación)', frequency: 'daily', nextDate: new Date(), completed: true, category: 'cleaning' },
  ]);

  const [logs, setLogs] = useState<MaintenanceLog[]>([
    { 
      id: '1', 
      date: new Date(Date.now() - 86400000), 
      actions: ['Limpieza de fondo', 'Retrolavado'], 
      chemicalsAdded: [{ name: 'Cloro', amount: 0.5, unit: 'kg' }] 
    },
    { 
      id: '2', 
      date: new Date(Date.now() - 172800000), 
      actions: ['Medición rutinaria'], 
      chemicalsAdded: [] 
    }
  ]);

  const handleGetAdvice = async () => {
    setLoading(true);
    try {
      const result = await getMaintenanceAdvice({ ph, chlorine: cl, waterState }, inventory);
      setAdvice(result || "No se pudo obtener consejo.");
    } catch (error) {
      console.error(error);
      setAdvice("Error al conectar con el Arquitecto de Piscinas.");
    } finally {
      setLoading(false);
    }
  };

  const updateInventory = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: Math.max(0, parseFloat((item.quantity + delta).toFixed(2))) } : item
    ));
  };

  const updateTarget = (id: string, delta: number) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, targetQuantity: Math.max(0, parseFloat((item.targetQuantity + delta).toFixed(2))) } : item
    ));
  };

  const toggleTask = (id: string) => {
    if (isConfigMode) return;
    setSchedule(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTask = () => {
    if (!newTask.task.trim()) return;
    
    const task: ScheduledTask = {
      id: `custom-${Date.now()}`,
      task: newTask.task,
      frequency: newTask.frequency,
      category: newTask.category,
      nextDate: new Date(),
      completed: false
    };

    setSchedule(prev => [task, ...prev]);
    setNewTask({ task: '', frequency: 'weekly', category: 'cleaning' });
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSchedule(prev => prev.filter(t => t.id !== id));
  };

  const renderEstado = () => (
    <div className="space-y-6">
      {waterState === WaterState.GREEN && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg flex gap-3 items-start shadow-sm">
          <AlertTriangle className="text-amber-500 shrink-0" />
          <div>
            <h3 className="font-bold text-amber-800 uppercase text-xs">Alerta de Calidad</h3>
            <p className="text-sm text-amber-700">Agua verde detectada. El pH de {ph} está favoreciendo el crecimiento de algas.</p>
          </div>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-slate-500 font-semibold mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
            <FlaskConical className="w-4 h-4" /> Niveles Químicos
          </h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 uppercase tracking-tighter">pH</label>
                <span className={`text-lg font-bold ${ph > 7.6 ? 'text-red-500' : 'text-green-600'}`}>{ph}</span>
              </div>
              <input 
                type="range" min="6.5" max="8.5" step="0.1" value={ph} 
                onChange={(e) => setPh(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-slate-700 uppercase tracking-tighter">Cloro (ppm)</label>
                <span className={`text-lg font-bold ${cl < 1.0 ? 'text-red-500' : 'text-green-600'}`}>{cl}</span>
              </div>
              <input 
                type="range" min="0" max="5" step="0.1" value={cl} 
                onChange={(e) => setCl(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-slate-500 font-semibold mb-6 flex items-center gap-2 text-sm uppercase tracking-wide">
            <Thermometer className="w-4 h-4" /> Estado del Agua
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(WaterState).map((state) => (
              <button
                key={state}
                onClick={() => setWaterState(state)}
                className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all uppercase tracking-tight ${
                  waterState === state 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 scale-[1.02]' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-blue-300'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1e293b] text-white p-8 rounded-[2rem] shadow-2xl overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="font-bold mb-6 flex items-center gap-2 text-lg">
            <ClipboardList className="w-6 h-6 text-blue-400" /> Cálculos Rápidos (70 m³)
          </h2>
          <div className="space-y-5">
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-sm font-medium text-slate-200">Bajar pH a 7.2 (desde {ph})</span>
              <span className="font-bold text-yellow-400 text-lg">
                {(DOSAGE.PH_DOWN(ph, 7.2) / 1000).toFixed(1)} L Ácido
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-sm font-medium text-slate-200">Cloro de Choque (Supercloración)</span>
              <span className="font-bold text-blue-400 text-lg">
                {(DOSAGE.CHLORINE_SHOCK() / 1000).toFixed(1)} kg Granulado
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
              <span className="text-sm font-medium text-slate-200">Alguicida (Dosis inicial agua verde)</span>
              <span className="font-bold text-emerald-400 text-lg">
                {(DOSAGE.ALGAECIDE_SHOCK() / 1000).toFixed(1)} L Líquido
              </span>
            </div>
          </div>
          <p className="mt-8 text-[11px] text-slate-400 uppercase tracking-[0.2em] font-bold text-center opacity-80">
            Diseñado para clima de Tocopilla - Chile
          </p>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-xl">
              <Zap className="w-6 h-6 text-yellow-300 fill-yellow-300/20" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Asistente Experto AI</h2>
              <p className="text-blue-200 text-xs font-medium">Análisis en tiempo real</p>
            </div>
          </div>
          <button 
            onClick={handleGetAdvice}
            disabled={loading}
            className="bg-white text-blue-900 px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-blue-50 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-black/10"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? "Calculando..." : "Analizar"}
          </button>
        </div>
        {advice && (
          <div className="bg-black/20 backdrop-blur-sm p-5 rounded-2xl text-sm leading-relaxed prose prose-invert max-h-96 overflow-y-auto mt-4 scrollbar-hide">
            <div dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br/>') }} />
          </div>
        )}
      </section>
    </div>
  );

  const renderAgenda = () => {
    const today = new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Weekly Header Card */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Calendar className="w-24 h-24" />
          </div>
          <div className="flex justify-between items-start mb-2 relative z-10">
            <div>
              <h2 className="text-slate-800 font-bold flex items-center gap-2 text-lg">
                <CalendarDays className="w-5 h-5 text-blue-600" /> Cronograma Semanal
              </h2>
              <p className="text-slate-500 text-sm font-medium capitalize">{today}</p>
            </div>
            {/* THIS IS THE BUTTON FROM THE SCREENSHOT */}
            <button 
              onClick={() => setIsConfigMode(!isConfigMode)}
              className={`p-2.5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center ${
                isConfigMode ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-50 text-blue-600 border border-slate-100 hover:bg-slate-100'
              }`}
              title="Configurar Actividades"
            >
              {isConfigMode ? <X className="w-6 h-6" /> : <LayoutGrid className="w-6 h-6" />}
            </button>
          </div>
          
          {/* New Activity / Management Form Panel */}
          {isConfigMode && (
            <div className="mt-4 p-5 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 animate-in slide-in-from-top-4 duration-300 relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-blue-600 rounded-lg">
                  <PlusCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-widest">Nueva Actividad</h3>
              </div>
              
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="¿Qué actividad quieres agregar?"
                  value={newTask.task}
                  onChange={(e) => setNewTask({...newTask, task: e.target.value})}
                  className="w-full bg-white border border-blue-100 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all shadow-sm font-medium"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-blue-400 uppercase ml-2">Frecuencia</label>
                    <select 
                      value={newTask.frequency}
                      onChange={(e) => setNewTask({...newTask, frequency: e.target.value as any})}
                      className="w-full bg-white border border-blue-100 rounded-xl px-3 py-3 text-[11px] font-bold uppercase tracking-tight focus:outline-none cursor-pointer shadow-sm"
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-blue-400 uppercase ml-2">Categoría</label>
                    <select 
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value as any})}
                      className="w-full bg-white border border-blue-100 rounded-xl px-3 py-3 text-[11px] font-bold uppercase tracking-tight focus:outline-none cursor-pointer shadow-sm"
                    >
                      <option value="cleaning">Limpieza</option>
                      <option value="mechanical">Mecánica</option>
                      <option value="chemical">Química</option>
                    </select>
                  </div>
                </div>
                <button 
                  onClick={addTask}
                  disabled={!newTask.task.trim()}
                  className="w-full bg-blue-600 disabled:bg-blue-300 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-2 uppercase text-[10px] tracking-[0.2em] mt-2"
                >
                  <Check className="w-4 h-4" /> Registrar en Cronograma
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-6 space-y-3 relative z-10">
            {schedule.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all relative ${
                  task.completed && !isConfigMode
                  ? 'bg-slate-50 border-slate-100 opacity-60' 
                  : 'bg-white border-slate-100 hover:border-blue-300 shadow-sm'
                } ${isConfigMode ? 'cursor-default ring-1 ring-blue-50 shadow-md' : 'cursor-pointer active:scale-[0.98]'}`}
              >
                <div className={`shrink-0 transition-transform ${task.completed ? 'text-emerald-500' : 'text-slate-300'}`}>
                  {task.completed ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-bold transition-all ${task.completed && !isConfigMode ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {task.task}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{task.frequency}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tighter ${
                      task.category === 'mechanical' ? 'bg-amber-100 text-amber-700' : 
                      task.category === 'chemical' ? 'bg-purple-100 text-purple-700' : 
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {task.category}
                    </span>
                  </div>
                </div>
                
                {isConfigMode ? (
                  <button 
                    onClick={(e) => deleteTask(task.id, e)}
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                ) : (
                  !task.completed && (
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {task.category === 'mechanical' ? <Wrench className="w-4 h-4" /> : <Waves className="w-4 h-4" />}
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Action Logs */}
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-slate-800 font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" /> Historial de Actividad
            </h2>
          </div>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-z-10 before:h-full before:w-0.5 before:bg-slate-100">
            {logs.map(log => (
              <div key={log.id} className="relative flex gap-6">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 shadow-sm border-2 border-white">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div className="flex-1 pb-6">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xs font-bold text-slate-800">Tarea Completada</h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {log.actions.map((action, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-100 rounded-md text-[9px] font-bold text-slate-600 uppercase">
                        {action}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderAnaliticas = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" /> Tendencias de pH (Últimos 7 días)
        </h2>
        <div className="flex items-end justify-between h-32 gap-2 mt-8">
          {[7.2, 7.4, 7.8, 8.2, 8.0, 7.6, 8.2].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">{val}</div>
              <div 
                className={`w-full rounded-t-lg transition-all duration-500 ${val > 7.6 ? 'bg-red-400' : 'bg-blue-400'}`} 
                style={{ height: `${((val - 6.5) / 2) * 100}%` }}
              />
              <span className="text-[10px] text-slate-500 font-bold uppercase mt-2">D{i+1}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <h2 className="text-slate-800 font-bold mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" /> Consumo de Cloro
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600 font-medium">Promedio semanal</span>
            <span className="font-bold text-slate-900">2.4 kg / semana</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full w-[65%]" />
          </div>
          <p className="text-[11px] text-slate-400">El consumo aumentó un 12% debido a las temperaturas extremas en Tocopilla.</p>
        </div>
      </section>
    </div>
  );

  const renderStock = () => {
    const missingStock = inventory.filter(item => item.quantity < item.targetQuantity);
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {missingStock.length > 0 && (
          <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 flex items-start gap-4 shadow-sm">
            <div className="p-2 bg-blue-600 rounded-xl text-white">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-900 uppercase tracking-tight">Lista de Compras Necesaria</h3>
              <div className="mt-2 space-y-1">
                {missingStock.map(item => (
                  <p key={item.id} className="text-xs text-blue-700 font-medium">
                    Faltan <span className="font-bold">{(item.targetQuantity - item.quantity).toFixed(1)} {item.unit}</span> de {item.name}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-slate-800 font-bold flex items-center gap-2 text-base">
              <Package className="w-5 h-5 text-blue-600" /> Control de Inventario
            </h2>
            <button 
              onClick={() => setShowTargetConfig(!showTargetConfig)}
              className={`p-2 rounded-xl transition-all ${showTargetConfig ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              <Settings2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {inventory.map(item => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 font-medium">Disponible: <span className="text-slate-700 font-bold">{item.quantity} {item.unit}</span></span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-xs text-slate-500 font-medium">Ideal: <span className="text-blue-600 font-bold">{item.targetQuantity} {item.unit}</span></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.quantity < item.targetQuantity && (
                      <span className="px-2 py-0.5 bg-amber-100 text-[10px] font-bold text-amber-700 rounded-md uppercase">Faltante</span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase w-20">Stock Actual</span>
                    <div className="flex-1 flex items-center justify-end gap-3">
                      <button 
                        onClick={() => updateInventory(item.id, -0.5)}
                        className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-600 active:scale-90 transition-transform shadow-sm"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-[2.5rem] text-center text-sm font-bold text-slate-700">{item.quantity}</span>
                      <button 
                        onClick={() => updateInventory(item.id, 0.5)}
                        className="p-1.5 bg-white rounded-lg border border-slate-200 text-slate-600 active:scale-90 transition-transform shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {showTargetConfig && (
                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-200/50 animate-in slide-in-from-top-1">
                      <span className="text-[10px] font-bold text-blue-500 uppercase w-20">Config Meta</span>
                      <div className="flex-1 flex items-center justify-end gap-3">
                        <button 
                          onClick={() => updateTarget(item.id, -1)}
                          className="p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-blue-600 active:scale-90 transition-transform shadow-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="min-w-[2.5rem] text-center text-sm font-bold text-blue-700">{item.targetQuantity}</span>
                        <button 
                          onClick={() => updateTarget(item.id, 1)}
                          className="p-1.5 bg-blue-50 rounded-lg border border-blue-100 text-blue-600 active:scale-90 transition-transform shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-700 ${item.quantity < (item.targetQuantity * 0.3) ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, (item.quantity / item.targetQuantity) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-['Inter']">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 shadow-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2 text-balance">
              <Droplets className="w-8 h-8 shrink-0" /> PoolGuard
            </h1>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-[0.2em] mt-1 opacity-80">Tocopilla | 70 m³ System</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10">
            En Línea
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {activeTab === 'estado' && renderEstado()}
        {activeTab === 'analiticas' && renderAnaliticas()}
        {activeTab === 'stock' && renderStock()}
        {activeTab === 'agenda' && renderAgenda()}
      </main>

      {/* Navigation Bar */}
      <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-200 flex justify-around p-3 pb-8 z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => setActiveTab('estado')}
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab === 'estado' ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400 font-medium'}`}
        >
          <Droplets className="w-6 h-6" />
          <span className="text-[9px] uppercase tracking-wider">Estado</span>
        </button>
        <button 
          onClick={() => setActiveTab('analiticas')}
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab === 'analiticas' ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400 font-medium'}`}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-[9px] uppercase tracking-wider">Analíticas</span>
        </button>
        <button 
          onClick={() => setActiveTab('stock')}
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab === 'stock' ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400 font-medium'}`}
        >
          <Package className="w-6 h-6" />
          <span className="text-[9px] uppercase tracking-wider">Stock</span>
        </button>
        <button 
          onClick={() => setActiveTab('agenda')}
          className={`flex flex-col items-center gap-1.5 transition-all active:scale-90 ${activeTab === 'agenda' ? 'text-blue-600 scale-105 font-bold' : 'text-slate-400 font-medium'}`}
        >
          <ClipboardList className="w-6 h-6" />
          <span className="text-[9px] uppercase tracking-wider">Agenda</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
