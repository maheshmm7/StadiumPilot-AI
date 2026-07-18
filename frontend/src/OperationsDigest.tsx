import { LayoutDashboard, Loader2 } from 'lucide-react';

interface DigestData {
  status: string;
  criticalAlert: string;
  recommendations: string[];
}

export function OperationsDigest({ digest, loadingDigest }: { digest: DigestData | null, loadingDigest: boolean }) {
  if (digest) {
    return (
      <div aria-live="polite" className="bg-[#30005C] rounded-2xl p-5 text-white shadow-xl relative overflow-hidden -mt-2">
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
             {(digest.recommendations || []).map((rec) => (
               <li key={rec} className="flex gap-2 text-sm text-slate-200">
                 <span className="text-[#CCFF00]">•</span> {rec}
               </li>
             ))}
           </ul>
         </div>
      </div>
    );
  }

  if (loadingDigest) {
    return (
      <div className="bg-slate-100 rounded-2xl p-8 flex justify-center items-center -mt-2">
        <Loader2 className="w-8 h-8 text-[#30005C] animate-spin" />
      </div>
    );
  }

  return null;
}
