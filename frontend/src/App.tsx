import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, Navigation, AlertTriangle, ShieldCheck, 
  Loader2, Zap, Users, ThermometerSun, 
  Coffee, Crosshair, BarChart3, LayoutDashboard, ChevronDown, RefreshCw 
} from 'lucide-react';
import { m, LazyMotion, domAnimation, AnimatePresence } from 'framer-motion';
import './index.css';

interface Zone {
  id: string;
  name: string;
  description: string;
  crowdLevel: 'Low' | 'Medium' | 'High';
  waitTime: number;
  incidents: { id: string; description: string; severity: string }[];
}

interface RouteData {
  optimalRoute: string[];
  eta: string;
  aiSummary: string;
}

interface DigestData {
  status: string;
  criticalAlert: string;
  recommendations: string[];
}

const BACKEND_URL = import.meta.env.VITE_API_URL || '/api';

const zoneCoordinates: Record<string, { x: number, y: number }> = {
  "Main Entrance": { x: 700, y: 825 },
  "Gate A - North": { x: 700, y: 125 },
  "Gate B - East": { x: 1100, y: 475 },
  "Gate C - South": { x: 700, y: 905 },
  "West Concourse": { x: 300, y: 475 },
  "East Concourse": { x: 1100, y: 275 },
  "Food Court": { x: 300, y: 275 }
};

const amenitiesData = [
  { type: 'food', icon: <Coffee className="w-5 h-5" />, x: 550, y: 225 },
  { type: 'medical', icon: <Crosshair className="w-5 h-5" />, x: 850, y: 225 },
  { type: 'restroom', icon: <Users className="w-5 h-5" />, x: 550, y: 725 },
  { type: 'food', icon: <Coffee className="w-5 h-5" />, x: 850, y: 725 },
  { type: 'restroom', icon: <Users className="w-5 h-5" />, x: 700, y: 725 },
];

// Custom Select Component to replace native HTML select
function CustomSelect({ options, value, onChange, label, disabledOptions = [] }: { options: string[], value: string, onChange: (val: string) => void, label: string, disabledOptions?: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const controlId = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="relative w-full" ref={ref}>
      <label htmlFor={controlId} className="block text-xs font-bold text-[#30005C] mb-1">{label}</label>
      <button 
        id={controlId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border-2 border-slate-200 rounded-lg p-3 text-[#30005C] font-black tracking-wide flex justify-between items-center cursor-pointer hover:border-[#30005C]/30 transition-colors shadow-sm"
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <m.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-white border-2 border-slate-200 rounded-lg shadow-xl overflow-hidden"
          >
            <div className="max-h-60 overflow-y-auto py-1">
              {options.map((option) => {
                const isDisabled = disabledOptions.includes(option);
                return (
                  <div
                    key={option}
                    onClick={() => {
                      if (!isDisabled) {
                        onChange(option);
                        setIsOpen(false);
                      }
                    }}
                    className={`px-4 py-3 font-semibold text-sm transition-colors ${
                      isDisabled 
                        ? 'text-slate-300 bg-slate-50 cursor-not-allowed' 
                        : value === option
                          ? 'bg-[#C00040] text-white'
                          : 'text-[#30005C] hover:bg-slate-100 cursor-pointer'
                    }`}
                  >
                    {option}
                  </div>
                );
              })}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [startLocation, setStartLocation] = useState<string>('Main Entrance');
  const [destination, setDestination] = useState<string>('Gate A - North');
  const [needsWheelchair, setNeedsWheelchair] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  
  const [digest, setDigest] = useState<DigestData | null>(null);
  const [loadingDigest, setLoadingDigest] = useState(false);
  const [activeTab, setActiveTab] = useState<'navigation' | 'incidents' | 'analytics'>('navigation');
  
  const [showFood, setShowFood] = useState(false);
  const [showMedical, setShowMedical] = useState(false);
  const [showRestrooms, setShowRestrooms] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/stadium`)
      .then(res => res.json())
      .then(data => setZones(data))
      .catch(console.error);
      
    fetchDigest();
  }, []);

  const fetchDigest = () => {
    setLoadingDigest(true);
    fetch(`${BACKEND_URL}/digest`)
      .then(res => res.json())
      .then(data => setDigest(data))
      .catch(console.error)
      .finally(() => setLoadingDigest(false));
  };

  const handleRouteRequest = async () => {
    if (startLocation === destination) {
       alert("Start location and destination cannot be the same.");
       return;
    }
    
    setLoadingRoute(true);
    setRouteData(null);
    try {
      const response = await fetch(`${BACKEND_URL}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startLocation, destination, needsWheelchair }),
      });
      const data = await response.json();
      if (!response.ok || data.error) {
         throw new Error(data.error || 'Failed to generate route');
      }
      
      if (data.optimalRoute && Array.isArray(data.optimalRoute)) {
        if (data.optimalRoute[0] !== startLocation) {
          data.optimalRoute.unshift(startLocation);
        }
        if (data.optimalRoute[data.optimalRoute.length - 1] !== destination) {
          data.optimalRoute.push(destination);
        }
      }

      setRouteData(data);
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoadingRoute(false);
    }
  };

  const generateSvgPath = (routeNodes: string[]) => {
    if (!routeNodes || !Array.isArray(routeNodes) || routeNodes.length === 0) return '';
    let path = '';

    let prevCoord: { x: number, y: number } | null = null;
    routeNodes.forEach((node, index) => {
      let coord = zoneCoordinates[node];
      if (!coord) {
         const key = Object.keys(zoneCoordinates).find(k => k.includes(node) || node.includes(k));
         if (key) coord = zoneCoordinates[key];
      }
      
      if (coord) {
        if (index === 0) {
          path += `M ${coord.x} ${coord.y} `;
        } else if (prevCoord) {
          if ((Math.abs(prevCoord.y - 850) < 150 || Math.abs(prevCoord.y - 125) < 150) && Math.abs(prevCoord.x - 700) < 150) {
             if (coord.x !== prevCoord.x) path += `L ${coord.x} ${prevCoord.y} `;
             if (coord.y !== prevCoord.y) path += `L ${coord.x} ${coord.y} `;
          } else {
             if (coord.y !== prevCoord.y) path += `L ${prevCoord.x} ${coord.y} `;
             if (coord.x !== prevCoord.x) path += `L ${coord.x} ${coord.y} `;
          }
        }
        prevCoord = coord;
      }
    });
    return path;
  };

  const getCrowdColor = (level: string) => {
    if (level === 'High') return 'bg-[#C00040] shadow-[#C00040]/50';
    if (level === 'Medium') return 'bg-yellow-500 shadow-yellow-500/50';
    return 'bg-[#CCFF00] shadow-[#CCFF00]/50';
  };
  
  const getSeverityBadgeColor = (severity: string) => {
    const s = severity.toLowerCase();
    if (s.includes('high') || s.includes('critical')) return 'bg-[#C00040] text-white';
    if (s.includes('medium') || s.includes('warning')) return 'bg-yellow-400 text-[#30005C]';
    return 'bg-[#CCFF00] text-[#30005C]';
  };

  // Calculate dynamic stats
  const avgWaitTime = zones.length > 0 ? Math.round(zones.reduce((acc, z) => acc + z.waitTime, 0) / zones.length) : 0;
  
  // Prepare options for custom dropdowns
  const locationOptions = ["Main Entrance", ...zones.filter(z => z.name !== "Main Entrance").map(z => z.name)];

  return (
    <LazyMotion features={domAnimation}>
    <main className="w-screen h-screen flex flex-col bg-slate-50 font-sans overflow-hidden">
      
      {/* Top Operations Header - FIFA 2026 THEME */}
      <header className="h-16 bg-[#30005C] text-white flex items-center justify-between px-4 md:px-8 shadow-xl z-30 shrink-0 border-b-2 border-[#C00040]">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-[#CCFF00]" />
          <h1 className="text-xl font-black tracking-widest uppercase">FIFA WORLD CUP 2026™ <span className="font-light text-[#00E5FF] tracking-normal ml-2">STADIUM NAVIGATION</span></h1>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8 text-xs md:text-sm font-bold">
          <div className="flex items-center gap-2">
             <span className="w-2.5 h-2.5 rounded-full bg-[#C00040] animate-pulse" />
             <span className="hidden md:inline text-slate-300 font-medium">LIVE MATCH:</span>
             <span>USA <span className="text-slate-300 font-normal">vs</span> MEX</span>
             <span className="ml-1 md:ml-2 bg-white/20 text-white px-2 py-0.5 rounded text-[10px] md:text-xs font-black">68'</span>
          </div>
          <div className="hidden md:block h-4 w-px bg-white/20" />
          <div className="hidden md:flex items-center gap-2">
             <Users className="w-4 h-4 text-[#CCFF00]" />
             <span>68,402 / 80,000</span>
          </div>
          <div className="hidden lg:block h-4 w-px bg-white/20" />
          <div className="hidden lg:flex items-center gap-2">
             <ThermometerSun className="w-4 h-4 text-[#00E5FF]" />
             <span>72°F Clear</span>
          </div>
        </div>
      </header>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Left Sidebar: Control Panel */}
        <div className="w-full md:w-[360px] h-1/2 md:h-full bg-white border-t md:border-t-0 md:border-r border-slate-200 shadow-2xl flex flex-col z-20 shrink-0 relative order-2 md:order-1">
          
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50 shrink-0">
            <button 
              className={`flex-1 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors flex justify-center items-center gap-2 ${activeTab === 'navigation' ? 'border-[#30005C] text-[#30005C] bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('navigation')}
            >
              <Navigation className="w-4 h-4" /> Route
            </button>
            <button 
              className={`flex-1 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors flex justify-center items-center gap-2 ${activeTab === 'incidents' ? 'border-[#30005C] text-[#30005C] bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('incidents')}
            >
              <AlertTriangle className="w-4 h-4" /> Incidents
            </button>
            <button 
              className={`flex-1 py-4 text-xs font-black uppercase tracking-wider border-b-2 transition-colors flex justify-center items-center gap-2 ${activeTab === 'analytics' ? 'border-[#30005C] text-[#30005C] bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('analytics')}
            >
              <BarChart3 className="w-4 h-4" /> Analytics
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 pb-8">
            <AnimatePresence mode="wait">
              {/* TAB 1: NAVIGATION */}
              {activeTab === 'navigation' && (
                <m.div 
                  key="nav"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="space-y-6 flex flex-col min-h-full"
                >
                  <section className="space-y-4 shrink-0">
                    <h2 className="text-[10px] font-bold text-[#C00040] uppercase tracking-widest">Smart Routing Setup</h2>
                    
                    <div className="space-y-4 z-40 relative">
                      <CustomSelect 
                        label="Start Location"
                        options={locationOptions}
                        value={startLocation}
                        onChange={setStartLocation}
                        disabledOptions={[destination]}
                      />
                      <CustomSelect 
                        label="Destination"
                        options={locationOptions}
                        value={destination}
                        onChange={setDestination}
                        disabledOptions={[startLocation]}
                      />
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors mt-2" onClick={() => setNeedsWheelchair(!needsWheelchair)}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${needsWheelchair ? 'bg-[#30005C] border-[#30005C]' : 'bg-white border-slate-300'}`}>
                        {needsWheelchair && <ShieldCheck className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-sm font-bold text-[#30005C]">Accessible Route Needed</span>
                    </div>

                    <button 
                      onClick={handleRouteRequest}
                      disabled={loadingRoute}
                      className="w-full bg-[#C00040] hover:bg-[#D40047] text-white font-black text-lg py-4 rounded-xl transition-all shadow-lg shadow-[#C00040]/30 flex items-center justify-center gap-2 disabled:opacity-70 uppercase tracking-wide"
                    >
                      {loadingRoute ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                      {loadingRoute ? 'Optimizing...' : 'Generate Route'}
                    </button>
                  </section>

                  <AnimatePresence>
                    {routeData && (
                      <m.section 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[#30005C] to-[#1A0033] rounded-2xl p-5 shadow-2xl text-white shrink-0 border border-[#C00040]/30 relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C00040] opacity-20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        
                        <div className="flex items-center gap-2 mb-3 relative z-10">
                          <div className="w-8 h-8 rounded-full bg-[#CCFF00] text-[#30005C] flex items-center justify-center shadow-md">
                            <Zap className="w-4 h-4 fill-current" />
                          </div>
                          <h3 className="font-black tracking-wide">GenAI Optimization</h3>
                        </div>
                        
                        <p className="text-slate-300 font-medium leading-relaxed mb-4 text-[13px] relative z-10">
                          {routeData.aiSummary}
                        </p>

                        <div className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/10 flex flex-col gap-1 relative z-10">
                          <p className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-widest">Estimated Wait + Travel</p>
                          <p className="text-3xl font-black text-white">{routeData.eta}</p>
                        </div>
                      </m.section>
                    )}
                  </AnimatePresence>

                  <div className="flex-1" />

                  <section className="space-y-3 pt-4 border-t border-slate-200 shrink-0 mt-auto">
                    <h2 className="text-[10px] font-bold text-[#C00040] uppercase tracking-widest">Live Stadium Stats</h2>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-0.5">Parking A</span>
                        <span className="text-[#30005C] font-black text-lg">84% Full</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl text-center">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest block mb-0.5">Avg Wait</span>
                        <span className="text-[#30005C] font-black text-lg">{avgWaitTime > 0 ? `${avgWaitTime} mins` : '...'}</span>
                      </div>
                    </div>
                  </section>
                </m.div>
              )}

              {/* TAB 2: INCIDENTS & DIGEST */}
              {activeTab === 'incidents' && (
                <m.div 
                  key="inc"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                     <h2 className="text-[10px] font-bold text-[#C00040] uppercase tracking-widest">Operations Digest</h2>
                     <button onClick={fetchDigest} disabled={loadingDigest} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-500 transition-colors disabled:opacity-50">
                       <RefreshCw className={`w-4 h-4 ${loadingDigest ? 'animate-spin' : ''}`} />
                     </button>
                  </div>
                  {/* Predictive AI Digest */}
                  {digest ? (
                    <div className="bg-[#30005C] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden -mt-2">
                       <div className="absolute top-0 right-0 w-32 h-32 bg-[#C00040] opacity-20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                       <div className="flex items-center gap-2 mb-4 relative z-10">
                         <LayoutDashboard className="w-5 h-5 text-[#CCFF00]" />
                         <h3 className="font-black tracking-wide">GenAI Analysis</h3>
                       </div>
                       
                       <div className="mb-4 relative z-10">
                         <span className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-widest block mb-1">Critical Alert</span>
                         <p className="font-semibold text-white bg-[#C00040] p-3 rounded-lg shadow-inner">{digest.criticalAlert}</p>
                       </div>

                       <div className="relative z-10">
                         <span className="text-[10px] text-[#00E5FF] font-bold uppercase tracking-widest block mb-2">Recommendations</span>
                         <ul className="space-y-2">
                           {(digest.recommendations || []).map((rec, i) => (
                             <li key={i} className="flex gap-2 text-sm text-slate-200">
                               <span className="text-[#CCFF00]">•</span> {rec}
                             </li>
                           ))}
                         </ul>
                       </div>
                    </div>
                  ) : loadingDigest ? (
                    <div className="bg-slate-100 rounded-2xl p-8 flex justify-center items-center -mt-2">
                      <Loader2 className="w-8 h-8 text-[#30005C] animate-spin" />
                    </div>
                  ) : null}

                  <section className="space-y-3">
                     <h2 className="text-[10px] font-bold text-[#C00040] uppercase tracking-widest">Live Incident Feed</h2>
                     <div className="space-y-3">
                       {zones.flatMap(z => z.incidents.map(inc => (
                         <div key={inc.id} className="flex gap-3 bg-white border border-slate-200 p-4 rounded-xl text-sm shadow-sm relative overflow-hidden">
                            {/* Color bar based on severity */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                              inc.severity.toLowerCase().includes('high') ? 'bg-[#C00040]' : 'bg-yellow-400'
                            }`} />
                            
                            <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ml-1 ${
                              inc.severity.toLowerCase().includes('high') ? 'text-[#C00040]' : 'text-yellow-500'
                            }`} />
                            <div className="w-full">
                              <div className="flex justify-between items-start w-full mb-1">
                                <p className="font-black text-[#30005C]">{z.name}</p>
                                <span className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-md ${getSeverityBadgeColor(inc.severity)}`}>
                                  {inc.severity}
                                </span>
                              </div>
                              <p className="text-slate-600 font-medium">{inc.description}</p>
                            </div>
                         </div>
                       )))}
                       {zones.every(z => z.incidents.length === 0) && (
                         <p className="text-slate-500 text-sm text-center py-4 bg-slate-50 rounded-lg border border-slate-200 font-medium">No active incidents reported.</p>
                       )}
                     </div>
                  </section>
                </m.div>
              )}

              {/* TAB 3: ANALYTICS */}
              {activeTab === 'analytics' && (
                <m.div 
                  key="analytics"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                   <h2 className="text-[10px] font-bold text-[#C00040] uppercase tracking-widest">Zone Crowd Density</h2>
                   <div className="space-y-3">
                     {zones.map(z => (
                       <div key={z.id} className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm relative overflow-hidden">
                         <div className={`absolute left-0 top-0 bottom-0 w-1 ${getCrowdColor(z.crowdLevel).split(' ')[0]}`} />
                         <div className="ml-2">
                           <p className="font-black text-[#30005C]">{z.name}</p>
                           <p className="text-xs text-slate-500 font-medium">Wait time: <span className="font-bold text-slate-800">{z.waitTime} mins</span></p>
                         </div>
                         <span className={`px-3 py-1 rounded-md text-[10px] uppercase tracking-wider font-black text-[#30005C] ${
                           z.crowdLevel === 'High' ? 'bg-[#C00040] text-white' : z.crowdLevel === 'Medium' ? 'bg-yellow-400' : 'bg-[#CCFF00]'
                         }`}>
                           {z.crowdLevel}
                         </span>
                       </div>
                     ))}
                   </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Interactive SVG Map with better layout & branding background */}
        <div className="flex-1 relative bg-slate-100 overflow-hidden flex justify-center items-center order-1 md:order-2">
          
          {/* Subtle background branding */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />

          {/* The Site Container - Scaled responsively */}
          <div className="relative w-[1400px] h-[950px] shrink-0 flex items-center justify-center transform scale-[0.45] md:scale-[0.5] lg:scale-[0.6] xl:scale-[0.7] 2xl:scale-[0.85] origin-center transition-transform duration-500 ease-out">
             
             {/* Top-Left Widget: Match Context */}
             <div className="absolute top-6 left-6 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden flex flex-col w-64 pointer-events-none">
               <div className="bg-[#30005C] text-white text-[10px] font-black uppercase tracking-widest p-3 text-center border-b-2 border-[#C00040]">
                 Live Match Context
               </div>
               <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-black text-[#30005C]">USA <span className="text-slate-500 font-medium text-base">vs</span> MEX</span>
                    <span className="bg-[#C00040] text-white text-xs font-black px-2 py-0.5 rounded">68'</span>
                  </div>
                  <div className="text-sm font-bold text-slate-700 flex justify-between">
                    <span>Score</span>
                    <span className="text-xl text-[#C00040]">2 - 1</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <div>
                      <p className="mb-0.5 text-slate-500">Weather</p>
                      <p className="text-[#30005C]">72°F, Clear</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-slate-500">Roof</p>
                      <p className="text-[#30005C]">Open</p>
                    </div>
                  </div>
               </div>
             </div>

             {/* Top-Right Widget: AI Health */}
             <div className="absolute top-6 right-6 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden flex flex-col w-56 pointer-events-none">
               <div className="bg-[#30005C] text-white text-[10px] font-black uppercase tracking-widest p-3 text-center border-b-2 border-[#C00040]">
                 AI Operations Health
               </div>
               <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.6)] animate-pulse" />
                    <span className="text-sm font-black text-[#30005C] uppercase">Optimal</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Active Incidents</span>
                      <span className="font-black text-[#C00040]">{zones.reduce((acc, z) => acc + z.incidents.length, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500">Predicted Risk</span>
                      <span className="font-black text-[#30005C] px-2 py-0.5 bg-[#CCFF00] rounded">Low</span>
                    </div>
                  </div>
               </div>
             </div>

             {/* Bottom-Left Widget: Transport */}
             <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden flex flex-col w-60 pointer-events-none">
               <div className="bg-[#30005C] text-white text-[10px] font-black uppercase tracking-widest p-3 text-center border-b-2 border-[#C00040]">
                 Transit & Parking Hub
               </div>
               <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500 uppercase">Parking A</span>
                      <span className="font-black text-[#C00040]">84% Full</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-[#C00040] h-full" style={{ width: '84%' }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-500 uppercase">Parking B</span>
                      <span className="font-black text-yellow-500">42% Full</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-yellow-400 h-full" style={{ width: '42%' }} />
                    </div>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Next Subway</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C00040]" />
                      <span className="text-xs font-black text-[#30005C]">Red Line: 4 mins</span>
                    </div>
                  </div>
               </div>
             </div>

             {/* Combined Legend & Toggles Panel */}
             <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-slate-200 z-40 overflow-hidden flex flex-col w-52">
               <div className="bg-[#30005C] text-white text-[10px] font-black uppercase tracking-widest p-3 text-center border-b-2 border-[#C00040]">
                 Amenities & Legend
               </div>
               
               {/* Toggles */}
               <div className="p-3 grid grid-cols-3 gap-2 bg-slate-50 border-b border-slate-200">
                 <button 
                   onClick={() => setShowFood(!showFood)}
                   className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${showFood ? 'bg-orange-500 text-white shadow-md scale-105' : 'bg-white border border-slate-200 text-slate-500 hover:border-orange-200'}`}
                 >
                   <Coffee className="w-4 h-4" />
                   <span className="text-[9px] font-black">FOOD</span>
                 </button>
                 <button 
                   onClick={() => setShowMedical(!showMedical)}
                   className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${showMedical ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-white border border-slate-200 text-slate-500 hover:border-red-200'}`}
                 >
                   <Crosshair className="w-4 h-4" />
                   <span className="text-[9px] font-black">MED</span>
                 </button>
                 <button 
                   onClick={() => setShowRestrooms(!showRestrooms)}
                   className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${showRestrooms ? 'bg-blue-500 text-white shadow-md scale-105' : 'bg-white border border-slate-200 text-slate-500 hover:border-blue-200'}`}
                 >
                   <Users className="w-4 h-4" />
                   <span className="text-[9px] font-black">WC</span>
                 </button>
               </div>

               {/* Static Legend */}
               <div className="p-4 flex flex-col gap-3">
                 <div className="space-y-2.5">
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-[#C00040] shadow-[0_0_8px_rgba(255,0,85,0.6)]"></div>
                     <span className="text-[11px] font-bold text-slate-700">High Crowd</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]"></div>
                     <span className="text-[11px] font-bold text-slate-700">Medium Crowd</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.6)]"></div>
                     <span className="text-[11px] font-bold text-slate-700">Low Crowd</span>
                   </div>
                 </div>
               </div>
             </div>
             
             {/* The Stadium Building */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[760px] h-[600px] bg-slate-200 rounded-[140px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-[8px] border-white flex items-center justify-center overflow-hidden z-0">
                {/* Outer Concourse Ring */}
                <div className="w-[720px] h-[560px] bg-slate-300 rounded-[120px] shadow-[inset_0_5px_20px_rgba(0,0,0,0.2)] flex items-center justify-center p-3 relative overflow-hidden">
                  
                  {/* Seating Bowl Container (Concrete Background) */}
                  <div className="w-full h-full bg-[#94a3b8] rounded-[105px] shadow-[inset_0_30px_60px_rgba(0,0,0,0.6)] relative overflow-hidden flex items-center justify-center border-4 border-slate-400">
                    
                    {/* SVG Seating Details */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 696 536">
                       {/* Concentric Seating Rows (Dashed for individual seats) */}
                       <g fill="none" strokeWidth="7" opacity="0.9">
                         <rect x="16" y="16" width="664" height="504" rx="90" stroke="#b91c1c" strokeDasharray="5 4" />
                         <rect x="32" y="32" width="632" height="472" rx="75" stroke="#991b1b" strokeDasharray="5 4" />
                         <rect x="48" y="48" width="600" height="440" rx="60" stroke="#1e293b" strokeDasharray="5 4" />
                         <rect x="64" y="64" width="568" height="408" rx="45" stroke="#1e293b" strokeDasharray="5 4" />
                         <rect x="80" y="80" width="536" height="376" rx="30" stroke="#0f172a" strokeDasharray="5 4" />
                         <rect x="96" y="96" width="504" height="344" rx="20" stroke="#b91c1c" strokeDasharray="5 4" />
                       </g>
                       
                       {/* Aisle Stairs */}
                       <g stroke="#cbd5e1" strokeWidth="6" opacity="0.9">
                         <line x1="348" y1="0" x2="348" y2="120" />
                         <line x1="348" y1="536" x2="348" y2="416" />
                         <line x1="0" y1="268" x2="120" y2="268" />
                         <line x1="696" y1="268" x2="576" y2="268" />
                         {/* Corner aisles */}
                         <line x1="100" y1="80" x2="180" y2="150" />
                         <line x1="596" y1="80" x2="516" y2="150" />
                         <line x1="100" y1="456" x2="180" y2="386" />
                         <line x1="596" y1="456" x2="516" y2="386" />
                       </g>
                    </svg>
                    
                    {/* The Pitch */}
                    <div className="relative w-[480px] h-[320px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] z-10 rounded-sm overflow-hidden border-2 border-slate-300">
                      <svg width="480" height="320" viewBox="0 0 480 320" className="w-full h-full">
                         {/* Grass background */}
                         <rect width="480" height="320" fill="#228B22" />
                         
                         {/* Vertical Mowing Stripes */}
                         <g opacity="0.12">
                           {Array.from({length: 12}).map((_, i) => (
                             <rect key={`d${i}`} x={i * 40} y="0" width="20" height="320" fill="#000000" />
                           ))}
                         </g>
                         <g opacity="0.15">
                           {Array.from({length: 12}).map((_, i) => (
                             <rect key={`l${i}`} x={i * 40 + 20} y="0" width="20" height="320" fill="#ffffff" />
                           ))}
                         </g>

                         {/* Pitch White Lines */}
                         <g stroke="#ffffff" fill="none" strokeWidth="2.5" opacity="0.95">
                           <rect x="15" y="15" width="450" height="290" />
                           <line x1="240" y1="15" x2="240" y2="305" />
                           <circle cx="240" cy="160" r="45" />
                           <circle cx="240" cy="160" r="3" fill="#ffffff" />
                           
                           {/* Left Penalty Area */}
                           <rect x="15" y="70" width="80" height="180" />
                           <rect x="15" y="120" width="30" height="80" />
                           <circle cx="65" cy="160" r="2.5" fill="#ffffff" stroke="none" />
                           <path d="M 95 125 A 45 45 0 0 1 95 195" />

                           {/* Right Penalty Area */}
                           <rect x="385" y="70" width="80" height="180" />
                           <rect x="435" y="120" width="30" height="80" />
                           <circle cx="415" cy="160" r="2.5" fill="#ffffff" stroke="none" />
                           <path d="M 385 125 A 45 45 0 0 0 385 195" />

                           {/* Corner Arcs */}
                           <path d="M 25 15 A 10 10 0 0 0 15 25" />
                           <path d="M 15 295 A 10 10 0 0 0 25 305" />
                           <path d="M 455 15 A 10 10 0 0 1 465 25" />
                           <path d="M 465 295 A 10 10 0 0 1 455 305" />
                         </g>
                         
                         {/* Goals */}
                         <rect x="5" y="135" width="10" height="50" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" opacity="0.9" />
                         <rect x="465" y="135" width="10" height="50" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" opacity="0.9" />
                      </svg>
                    </div>
                  </div>
                </div>
             </div>

             {/* Zone Markers with Crowd Heatmaps */}
             {zones.map((z) => {
               const coord = zoneCoordinates[z.name];
               if (!coord) return null;
               
               const isTarget = z.name === destination;

               return (
                 <div 
                    key={z.id}
                    className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: coord.x, top: coord.y, zIndex: isTarget ? 30 : 20 }}
                 >
                    {/* Heatmap Pulse Effect */}
                    <div className={`absolute -inset-5 rounded-full opacity-30 animate-ping ${
                      z.crowdLevel === 'High' ? 'bg-[#C00040]' : z.crowdLevel === 'Medium' ? 'bg-yellow-400' : 'bg-[#CCFF00]'
                    }`} />
                    
                    <div className={`w-6 h-6 rounded-full shadow-xl border-[3px] border-white relative z-10 transition-transform group-hover:scale-125 ${getCrowdColor(z.crowdLevel)}`} />
                    
                    <div className="bg-[#30005C]/95 px-3 py-1.5 rounded-xl shadow-xl border border-white/10 whitespace-nowrap relative z-10 backdrop-blur">
                      <span className="text-xs font-black text-white block tracking-wide">{z.name}</span>
                      <span className="text-[10px] text-[#00E5FF] font-bold block text-center mt-0.5 uppercase tracking-wider">{z.waitTime}m wait</span>
                    </div>
                 </div>
               );
             })}

             {/* Internal Routing Nodes */}
             {["Main Entrance", "West Concourse", "East Concourse", "Food Court"].map((nodeName) => {
               const coord = zoneCoordinates[nodeName];
               if (!coord) return null;
               return (
                 <div 
                    key={nodeName}
                    className="absolute flex flex-col items-center gap-1 -translate-x-1/2 -translate-y-1/2 z-30"
                    style={{ left: coord.x, top: coord.y }}
                 >
                    <div className="w-2.5 h-2.5 rounded-full border-[2px] border-slate-400 bg-white shadow-sm" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest whitespace-nowrap bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200">{nodeName}</span>
                 </div>
               );
             })}

             {/* Dynamic Amenities Overlays */}
             <AnimatePresence>
               {amenitiesData.map((amenity, idx) => {
                 const isVisible = 
                   (amenity.type === 'food' && showFood) || 
                   (amenity.type === 'medical' && showMedical) || 
                   (amenity.type === 'restroom' && showRestrooms);
                 
                 return isVisible && (
                   <m.div
                     key={idx}
                     initial={{ scale: 0, opacity: 0, y: 10 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     exit={{ scale: 0, opacity: 0, y: -10 }}
                     className={`absolute -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full shadow-2xl border-[3px] flex items-center justify-center z-20 backdrop-blur-sm ${
                       amenity.type === 'food' ? 'bg-orange-500 text-white border-white' : 
                       amenity.type === 'medical' ? 'bg-red-500 text-white border-white' : 'bg-blue-500 text-white border-white'
                     }`}
                     style={{ left: amenity.x, top: amenity.y }}
                   >
                     {amenity.icon}
                   </m.div>
                 );
               })}
             </AnimatePresence>

             {/* The Drawn SVG Route */}
             {routeData && (
               <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 25 }}>
                  <path 
                    d={generateSvgPath(routeData.optimalRoute)} 
                    fill="none" 
                    stroke="#C00040" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="map-line drop-shadow-[0_0_12px_rgba(255,0,85,0.6)]"
                  />
                  
                  {/* Glowing inner path for a neon effect */}
                  <path 
                    d={generateSvgPath(routeData.optimalRoute)} 
                    fill="none" 
                    stroke="#FFFFFF" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="map-line"
                  />
                  
                  {/* Destination pulse */}
                  {(() => {
                    if (!routeData.optimalRoute || !Array.isArray(routeData.optimalRoute) || routeData.optimalRoute.length === 0) return null;
                    const lastNode = routeData.optimalRoute[routeData.optimalRoute.length - 1];
                    const targetNode = lastNode || destination;
                    let endCoord = zoneCoordinates[targetNode];
                    if (!endCoord) {
                       const key = Object.keys(zoneCoordinates).find(k => k.includes(targetNode) || targetNode.includes(k));
                       if (key) endCoord = zoneCoordinates[key];
                    }
                    
                    if (endCoord) {
                      return (
                        <circle 
                          cx={endCoord.x} 
                          cy={endCoord.y} 
                          r="18" 
                          fill="#CCFF00" 
                          stroke="#30005C"
                          strokeWidth="4"
                          className="animate-ping" 
                        />
                      );
                    }
                    return null;
                  })()}
               </svg>
             )}
          </div>
        </div>
      </div>
    </main>
    </LazyMotion>
  );
}
