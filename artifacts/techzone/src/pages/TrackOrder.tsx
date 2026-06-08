import { Layout } from "@/components/Layout";
import { useTrackOrder, getTrackOrderQueryKey } from "@workspace/api-client-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Terminal, Package, CheckCircle2, Circle, AlertTriangle, Truck } from "lucide-react";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data: tracking, isLoading, error, isError } = useTrackOrder(
    { orderId, phone },
    { query: { enabled: submitted, queryKey: getTrackOrderQueryKey({ orderId, phone }) } }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId && phone) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setOrderId("");
    setPhone("");
  };

  return (
    <Layout>
      <div className="border-b border-primary/20 py-8 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 clip-corner mx-auto flex items-center justify-center text-primary mb-4 hud-frame">
            <Search size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black neon-text text-primary glitch uppercase" data-text="تتبع الطلب">تتبع الطلب</h1>
          <p className="text-muted-foreground mt-4 font-mono text-sm uppercase">{"//"} LOGISTICS_MAINFRAME_UPLINK</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-start">
          
          {/* Query Terminal */}
          <div className="w-full md:w-1/3 shrink-0">
            <div className="glass-panel clip-corner-lg border border-primary/30 p-6 hud-frame relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
              
              <h2 className="font-mono font-bold text-lg text-primary uppercase mb-6 flex items-center gap-2 border-b border-primary/20 pb-4">
                <Terminal size={18} /> [ INPUT_PARAMS ]
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block font-mono text-xs text-primary/70 mb-2 uppercase">{"//"} ORDER_ID</label>
                  <input 
                    type="text" 
                    required
                    value={orderId}
                    onChange={e => { setOrderId(e.target.value); setSubmitted(false); }}
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-3 font-mono text-foreground focus:border-primary focus:shadow-[0_0_10px_var(--cyan)] focus:outline-none transition-all"
                    placeholder="مثال: ORD-12345"
                  />
                </div>
                
                <div>
                  <label className="block font-mono text-xs text-primary/70 mb-2 uppercase">{"//"} PHONE_NUMBER</label>
                  <input 
                    type="text" 
                    required
                    value={phone}
                    onChange={e => { setPhone(e.target.value); setSubmitted(false); }}
                    className="w-full bg-background/50 border border-primary/30 clip-corner-sm px-4 py-3 font-mono text-foreground text-left focus:border-primary focus:shadow-[0_0_10px_var(--cyan)] focus:outline-none transition-all"
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={!orderId || !phone || isLoading}
                  className="w-full bg-primary/20 border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold py-3 clip-corner transition-all flex items-center justify-center gap-2 glow-hover disabled:opacity-50 disabled:pointer-events-none uppercase font-mono tracking-wider"
                >
                  {isLoading ? "INITIATING_SCAN..." : "EXECUTE_QUERY"}
                </button>
              </form>
            </div>
          </div>

          {/* Results Display */}
          <div className="w-full md:w-2/3">
            <AnimatePresence mode="wait">
              {!submitted && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-panel border border-primary/10 clip-corner p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px]"
                >
                  <Package size={48} className="text-primary/20 mb-4" />
                  <p className="font-mono text-primary/50 uppercase">{"//"} AWAITING_INPUT_PARAMETERS</p>
                </motion.div>
              )}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-panel border border-primary/20 clip-corner p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px] space-y-6 hud-frame"
                >
                  <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <div className="font-mono text-primary animate-pulse uppercase">ACCESSING_MAINFRAME...</div>
                  <div className="w-full max-w-xs h-2 bg-primary/10 overflow-hidden clip-corner-sm">
                    <div className="h-full bg-primary w-1/2 animate-marquee"></div>
                  </div>
                </motion.div>
              )}

              {isError && submitted && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="glass-panel border border-destructive/50 clip-corner p-12 text-center h-full flex flex-col items-center justify-center min-h-[400px] hud-frame"
                >
                  <AlertTriangle size={48} className="text-destructive mb-6 shadow-[0_0_15px_var(--destructive)] rounded-full" />
                  <h3 className="text-xl font-bold font-mono text-destructive uppercase mb-2 neon-text-destructive">ERR_404: RECORD_NOT_FOUND</h3>
                  <p className="text-muted-foreground font-mono text-sm mb-6">// تأكد من صحة رقم الطلب ورقم الجوال المرتبط به.</p>
                  <button onClick={handleReset} className="bg-destructive/10 border border-destructive text-destructive px-6 py-2 clip-corner-sm hover:bg-destructive hover:text-destructive-foreground transition-colors uppercase font-mono text-sm">
                    [ RESET_TERMINAL ]
                  </button>
                </motion.div>
              )}

              {tracking && submitted && !isLoading && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                  className="glass-panel border border-lime/30 clip-corner-lg p-6 md:p-8 hud-frame relative"
                >
                  <div className="absolute top-0 right-0 p-4 font-mono text-xs text-lime/50 uppercase flex flex-col items-end text-right">
                    <span>SYS.STATUS: SECURE</span>
                    <span>TIMESTAMP: {new Date().toISOString()}</span>
                  </div>

                  <div className="mb-10 pt-4">
                    <h3 className="font-bold text-2xl mb-2 text-foreground font-sans">معلومات الشحنة</h3>
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="bg-background/50 border border-primary/20 px-4 py-2 clip-corner-sm">
                        <div className="font-mono text-[10px] text-primary/70 uppercase mb-1">{"//"} STATUS</div>
                        <div className="font-mono font-bold text-lime uppercase neon-text-lime">{tracking.status}</div>
                      </div>
                      <div className="bg-background/50 border border-primary/20 px-4 py-2 clip-corner-sm">
                        <div className="font-mono text-[10px] text-primary/70 uppercase mb-1">{"//"} EST_DELIVERY</div>
                        <div className="font-mono font-bold text-primary">{new Date(tracking.estimatedDelivery).toLocaleDateString('ar-EG-u-nu-latn')}</div>
                      </div>
                      {tracking.trackingNumber && (
                        <div className="bg-background/50 border border-primary/20 px-4 py-2 clip-corner-sm">
                          <div className="font-mono text-[10px] text-primary/70 uppercase mb-1">{"//"} TRACKING_NO</div>
                          <div className="font-mono font-bold text-foreground">{tracking.trackingNumber}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="relative border-r-2 border-primary/20 pr-6 mr-4 space-y-12">
                    {tracking.timeline.map((step, idx) => (
                      <div key={idx} className="relative">
                        <div className={`absolute -right-[35px] top-1 rounded-full bg-background border-2 z-10 flex items-center justify-center w-6 h-6
                          ${step.completed ? 'border-lime text-lime shadow-[0_0_10px_var(--lime-raw)]' : 'border-primary/30 text-primary/30'}`}
                        >
                          {step.completed ? <CheckCircle2 size={14} className="fill-current" /> : <Circle size={10} />}
                        </div>
                        
                        <div className={`font-bold text-lg mb-1 ${step.completed ? 'text-lime' : 'text-foreground/50'}`}>
                          {step.statusAr}
                        </div>
                        {step.date && (
                          <div className="font-mono text-sm text-primary/50">
                            {new Date(step.date).toLocaleString('ar-EG-u-nu-latn', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        )}
                        {!step.completed && !step.date && (
                          <div className="font-mono text-xs text-primary/30 uppercase mt-1">PENDING...</div>
                        )}
                      </div>
                    ))}
                    
                    {/* Animated progress line connecting completed steps */}
                    <div className="absolute top-0 bottom-0 -right-[24px] w-0.5 bg-gradient-to-b from-lime to-transparent" style={{ height: `${(tracking.timeline.filter(s => s.completed).length / tracking.timeline.length) * 100}%` }}></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </Layout>
  );
}
