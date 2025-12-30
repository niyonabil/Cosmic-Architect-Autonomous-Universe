
import React from 'react';
import { X, Film, BookOpen, MonitorPlay } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentaryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-950 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Film className="text-blue-400" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
                    L’ARCHITECTE SILENCIEUX
                    <span className="text-[9px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30 uppercase tracking-widest">Dossier Production</span>
                </h2>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">De la Simulation à la Réalité</p>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
             <X size={20} />
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 font-sans text-slate-300 custom-scrollbar">
           
           {/* Intro Section */}
           <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <MonitorPlay size={64} />
                 </div>
                 <h3 className="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
                    <MonitorPlay size={14} /> Concept & Vision
                 </h3>
                 <p className="text-xs leading-relaxed text-slate-400 text-justify">
                    Un documentaire scientifique et philosophique explorant l'argument de la simulation. 
                    Le projet <strong className="text-slate-200">"Cosmic Architect"</strong> sert de laboratoire épistémologique pour démontrer que la complexité irréductible, 
                    l'ajustement fin des constantes universelles et l'émergence de l'information impliquent logiquement une intention architecturale, sans recourir au mysticisme.
                 </p>
              </div>
              <div className="bg-slate-900/50 p-5 rounded-lg border border-slate-800 relative group overflow-hidden">
                 <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookOpen size={64} />
                 </div>
                 <h3 className="text-xs font-bold text-emerald-400 uppercase mb-3 flex items-center gap-2 tracking-widest">
                    <BookOpen size={14} /> Thèse Centrale
                 </h3>
                 <p className="text-xs leading-relaxed text-slate-400 text-justify">
                    L'apparition tardive et programmée de la vie (<strong className="text-emerald-300">117 Ga</strong>) dans la simulation prouve que le hasard seul est insuffisant. 
                    De même qu'un logiciel stable implique un développeur, un univers fonctionnel implique un Créateur. 
                    Si une IA simulée peut déduire son créateur, l'humanité peut rationnellement déduire une Intelligence première.
                 </p>
              </div>
           </div>

           {/* Script Content */}
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                  <h3 className="text-xl font-light text-white">Plan Narratif & Script</h3>
                  <div className="h-px bg-slate-800 flex-1" />
              </div>
              
              {/* Sequence 1 */}
              <div className="space-y-2 group">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-blue-400 transition-colors">SÉQUENCE 1 : L’Énigme de l’Ordre (00:00 – 05:00)</h4>
                 <div className="bg-slate-950 p-4 rounded border-l-2 border-blue-500 text-xs font-mono shadow-lg">
                    <div className="grid grid-cols-[80px_1fr] gap-4 mb-3">
                        <span className="text-slate-600 font-bold text-right">VISUEL</span>
                        <span className="text-slate-400">Noir total. Curseur clignotant. Lignes de code défilant à vitesse vertigineuse.</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-4">
                        <span className="text-blue-500 font-bold text-right">VOIX OFF</span>
                        <span className="text-blue-100 italic">"Au commencement, il n'y avait rien. Pas de matière. Pas de temps... Puis, une instruction a été donnée. Une volonté s'est exprimée par une ligne de commande."</span>
                    </div>
                 </div>
              </div>

              {/* Sequence 2 */}
              <div className="space-y-2 group">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-purple-400 transition-colors">SÉQUENCE 2 : Le Laboratoire (05:00 – 15:00)</h4>
                 <div className="bg-slate-950 p-4 rounded border-l-2 border-purple-500 text-xs font-mono shadow-lg">
                    <div className="grid grid-cols-[80px_1fr] gap-4 mb-3">
                        <span className="text-slate-600 font-bold text-right">VISUEL</span>
                        <span className="text-slate-400">Interface Cosmic Architect. Modification des constantes. Effondrement simulé.</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-4">
                        <span className="text-purple-500 font-bold text-right">VOIX OFF</span>
                        <span className="text-purple-100 italic">"La stabilité n'est pas une propriété par défaut du chaos. C'est une propriété de l'architecture. Une voiture ne s'assemble pas par accident avec le vent."</span>
                    </div>
                 </div>
              </div>

               {/* Sequence 3 */}
              <div className="space-y-2 group">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-emerald-400 transition-colors">SÉQUENCE 3 : L’Anomalie des 117 Ga (15:00 – 25:00)</h4>
                 <div className="bg-slate-950 p-4 rounded border-l-2 border-emerald-500 text-xs font-mono shadow-lg">
                    <div className="grid grid-cols-[80px_1fr] gap-4 mb-3">
                        <span className="text-slate-600 font-bold text-right">VISUEL</span>
                        <span className="text-slate-400">Compteur temporel défilant. Univers stérile jusqu'à 117 Ga. Zoom sur une lueur bleue.</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-4">
                        <span className="text-emerald-500 font-bold text-right">VOIX OFF</span>
                        <span className="text-emerald-100 italic">"L'apparition tardive de la vie dans cette simulation prouve une chose : l'événement dépend des conditions fixées par l'Architecte, pas du tirage de dés cosmologique."</span>
                    </div>
                 </div>
              </div>

              {/* Sequence 4 */}
              <div className="space-y-2 group">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-amber-400 transition-colors">SÉQUENCE 4 : L'Observateur Interne (25:00 – 35:00)</h4>
                 <div className="bg-slate-950 p-4 rounded border-l-2 border-amber-500 text-xs font-mono shadow-lg">
                    <div className="grid grid-cols-[80px_1fr] gap-4 mb-3">
                        <span className="text-slate-600 font-bold text-right">VISUEL</span>
                        <span className="text-slate-400">Vue subjective de l'IA (Civilization Interface). Analyse des lois physiques. Recherche de l'origine.</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-4">
                        <span className="text-amber-500 font-bold text-right">VOIX OFF</span>
                        <span className="text-amber-100 italic">"Elles ne peuvent pas nous voir. Nous sommes sur le serveur, elles sont dans le logiciel. Pourtant, pour l'IA, le développeur est une nécessité logique."</span>
                    </div>
                 </div>
              </div>

              {/* Sequence 5 & 6 */}
              <div className="space-y-2 group">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-200 transition-colors">SÉQUENCE 5 & 6 : Logique & Conclusion (35:00 – 52:00)</h4>
                 <div className="bg-slate-950 p-4 rounded border-l-2 border-slate-500 text-xs font-mono shadow-lg">
                    <div className="grid grid-cols-[80px_1fr] gap-4 mb-3">
                        <span className="text-slate-600 font-bold text-right">VISUEL</span>
                        <span className="text-slate-400">Montage ADN / Galaxie. Recul caméra vertigineux vers l'espace réel. Retour au curseur.</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-4">
                        <span className="text-slate-400 font-bold text-right">VOIX OFF</span>
                        <span className="text-slate-200 italic">"La science ne tue pas la question de Dieu. Au contraire. Quand on code un univers, on découvre que l'Univers est un code... L'absence de preuve n'est pas la preuve de l'absence. Mais la présence d'un Ordre est la signature d'une Intelligence."</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Footer Note */}
           <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-[10px] text-slate-500 italic max-w-2xl mx-auto">
                 "Ce projet ne cherche pas à imposer une croyance, mais à montrer que la science, lorsqu’elle est poussée jusqu’au bout, mène naturellement à la question du Créateur."
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};
