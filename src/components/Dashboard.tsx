import { useState, useEffect } from "react";
import { 
  History, 
  Trash2, 
  ExternalLink, 
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  Zap,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth } from "../firebase";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";
import { UserScan } from "../types";
import { cn } from "../lib/utils";
import { useLanguage } from "../context/LanguageContext";
import DossierView from "./DossierView";

export default function Dashboard() {
  const [scans, setScans] = useState<UserScan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScan, setSelectedScan] = useState<UserScan | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    let dbUnsubscribe: () => void;
    
    const authUnsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        setScans([]);
        setLoading(false);
        if (dbUnsubscribe) dbUnsubscribe();
        return;
      }

      setLoading(true);
      const q = query(
        collection(db, "scans"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );

      dbUnsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as UserScan));
        setScans(data);
        setLoading(false);
      }, (error) => {
        console.error("Snapshot error:", error);
        setLoading(false);
      });
    });

    return () => {
      authUnsubscribe();
      if (dbUnsubscribe) dbUnsubscribe();
    };
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(t("dash_delete_confirm_msg"))) return;
    
    try {
      await deleteDoc(doc(db, "scans", id));
      // onSnapshot will automatically update the UI
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-12 py-20">
        <div className="resend-card h-32 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="resend-card h-64 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-24">
      <AnimatePresence>
        {selectedScan && (
          <DossierView scan={selectedScan} onClose={() => setSelectedScan(null)} />
        )}
      </AnimatePresence>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <div className="resend-card p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-resend-charcoal mb-4">{t("dash_total_files")}</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-serif">{scans.length}</span>
            <History className="w-5 h-5 text-resend-hairline-strong" />
          </div>
        </div>
        <div className="resend-card p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-resend-charcoal mb-4">{t("dash_threats")}</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-serif text-red-500">{scans.filter(s => s.riskLevel === 'high').length}</span>
            <ShieldCheck className="w-5 h-5 text-red-500/20" />
          </div>
        </div>
        <div className="resend-card p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-resend-charcoal mb-4">{t("dash_system_trust")}</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-serif">
              {scans.length > 0 ? (scans.reduce((acc, s) => acc + s.trustScore, 0) / scans.length).toFixed(0) : 0}%
            </span>
            <Zap className="w-5 h-5 text-resend-hairline-strong" />
          </div>
        </div>
        <div className="resend-card p-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-resend-charcoal mb-4">{t("dash_index")}</p>
          <div className="flex items-end justify-between">
            <span className="text-4xl font-serif">{(scans.length * 1.5).toFixed(1)} <span className="text-xs uppercase font-sans tracking-tight text-resend-charcoal">TB</span></span>
            <ArrowUpRight className="w-5 h-5 text-resend-hairline-strong" />
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <div className="flex items-baseline justify-between border-b border-resend-hairline pb-8">
          <h2 className="resend-display-xl !text-4xl text-resend-ink">{t("dash_log")}</h2>
          <div className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal opacity-40">{t("dash_resync")} [AUTO]</div>
        </div>

        {scans.length === 0 ? (
          <div className="resend-card p-20 text-center border-dashed border-2">
            <History className="w-10 h-10 text-resend-charcoal mx-auto mb-6 opacity-20" />
            <p className="text-resend-charcoal italic font-serif text-xl opacity-60">{t("dash_no_records")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {scans.map((scan, i) => (
              <motion.div
                key={scan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, backgroundColor: "var(--resend-hairline)" }}
                onClick={() => setSelectedScan(scan)}
                className="resend-card p-8 flex flex-col group cursor-pointer transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-8 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-resend-charcoal opacity-40" />
                    <span className="text-[10px] font-mono text-resend-charcoal opacity-60 uppercase tracking-widest">
                      {scan.timestamp?.toDate ? scan.timestamp.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending...'}
                    </span>
                  </div>
                  <div className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border",
                    scan.riskLevel === 'low' ? "border-green-500/20 text-green-600 dark:text-green-400" : scan.riskLevel === 'medium' ? "border-yellow-500/20 text-yellow-600 dark:text-yellow-500" : "border-red-500/20 text-red-600 dark:text-red-500"
                  )}>
                    {scan.riskLevel}
                  </div>
                </div>

                <h3 className="resend-display-xl !text-xl mb-4 line-clamp-2">{scan.summary}</h3>
                
                <div className="flex-1" />

                <div className="flex items-baseline gap-4 mt-8 pt-6 border-t border-resend-hairline">
                  <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-resend-charcoal opacity-40 mb-1">Authenticity</p>
                    <p className="font-serif text-2xl">{scan.trustScore}%</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={(e) => handleDelete(e, scan.id)}
                      className="text-resend-charcoal opacity-40 hover:text-red-500 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="text-resend-charcoal opacity-40 group-hover:text-resend-ink transition-colors" title="View Dossier">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
