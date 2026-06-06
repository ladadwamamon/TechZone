import { Layout } from "@/components/Layout";
import { useGetStoreSummary } from "@workspace/api-client-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, MessageSquare, Terminal } from "lucide-react";

const FAQ_DATA = [
  {
    category: "الطلب والدفع",
    questions: [
      {
        q: "ما هي طرق الدفع المتاحة؟",
        a: "نقبل الدفع عبر البطاقات الائتمانية (فيزا، ماستركارد)، مدى، أبل باي، التحويل البنكي، والدفع عند الاستلام للطلبات التي لا تتجاوز 5000 ريال."
      },
      {
        q: "كيف يمكنني استخدام كود الخصم؟",
        a: "يمكنك إدخال كود الخصم في سلة المشتريات أو في صفحة إتمام الطلب قبل اختيار طريقة الدفع. سيتم تحديث الإجمالي فوراً."
      },
      {
        q: "هل يمكنني تعديل طلبي بعد تأكيده؟",
        a: "يمكنك تعديل أو إلغاء الطلب إذا كان في حالة 'قيد المراجعة'. بمجرد انتقال الطلب إلى 'قيد التجهيز' أو 'تم الشحن'، لا يمكن تعديله ولكن يمكنك إرجاعه بعد استلامه."
      }
    ]
  },
  {
    category: "الشحن والتوصيل",
    questions: [
      {
        q: "كم يستغرق توصيل الطلب؟",
        a: "يستغرق التوصيل عادةً 1-3 أيام عمل داخل المدن الرئيسية، و3-5 أيام عمل للمدن الأخرى والمحافظات."
      },
      {
        q: "هل يتوفر شحن مجاني؟",
        a: "نعم، نقدم شحناً مجانياً للطلبات التي تتجاوز قيمتها [FREE_SHIPPING_THRESHOLD] ريال."
      },
      {
        q: "كيف أتتبع شحنتي؟",
        a: "يمكنك تتبع شحنتك عبر صفحة 'تتبع الطلب' في موقعنا باستخدام رقم الطلب ورقم الجوال، أو عبر الرابط المرسل في رسالة تأكيد الشحن."
      }
    ]
  },
  {
    category: "الضمان والإرجاع",
    questions: [
      {
        q: "ما هي سياسة الضمان؟",
        a: "جميع الأجهزة الإلكترونية (الكمبيوترات، الشاشات، القطع) مشمولة بضمان الوكيل لمدة سنتين للعيوب المصنعية. الإكسسوارات مشمولة بضمان سنة واحدة."
      },
      {
        q: "كيف يمكنني إرجاع منتج؟",
        a: "يمكنك إرجاع المنتجات خلال 7 أيام من تاريخ الاستلام بشرط أن تكون في حالتها الأصلية وبغلافها غير المفتوح. الاسترجاع للعيوب المصنعية مجاني."
      }
    ]
  },
  {
    category: "الحساب والدعم",
    questions: [
      {
        q: "كيف أتواصل مع الدعم الفني؟",
        a: "فريق الدعم الفني متاح عبر الشات المباشر في الموقع، أو واتساب على الرقم 05XXXXXXX، أو عبر البريد الإلكتروني support@nexus.sa."
      },
      {
        q: "هل أحتاج لإنشاء حساب لإتمام الطلب؟",
        a: "لا، يمكنك إتمام الطلب كزائر، ولكن إنشاء الحساب يتيح لك تتبع طلباتك بسهولة وحفظ العناوين للطلبات المستقبلية وإدارة المفضلة."
      }
    ]
  }
];

function FaqItem({ q, a }: { q: string, a: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-primary/20 bg-background/50 mb-4 clip-corner-sm overflow-hidden glow-hover">
      <button 
        className="w-full text-right p-5 flex items-center justify-between focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{q}</span>
        <ChevronDown 
          size={20} 
          className={`text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 pt-0 border-t border-primary/10 mt-2 bg-primary/5 text-muted-foreground font-sans leading-relaxed text-sm md:text-base">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Faq() {
  const { data: summary } = useGetStoreSummary();
  const threshold = summary?.freeShippingThreshold || 500;

  return (
    <Layout>
      <div className="border-b border-primary/20 py-8 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="w-16 h-16 bg-primary/10 border border-primary/30 clip-corner mx-auto flex items-center justify-center text-primary mb-4 neon-border hud-frame">
            <HelpCircle size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black neon-text text-primary glitch uppercase" data-text="الأسئلة الشائعة">الأسئلة الشائعة</h1>
          <p className="text-muted-foreground mt-4 font-mono text-sm uppercase">{"//"} KNOWLEDGE_BASE_QUERY</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="glass-panel border border-primary/20 p-6 clip-corner flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/30">
                <Terminal size={24} />
              </div>
              <div>
                <h3 className="font-bold mb-2 font-mono uppercase text-primary">SYSTEM_MANUAL</h3>
                <p className="text-sm text-muted-foreground">ابحث في قاعدة المعرفة عن حلول سريعة للمشاكل الشائعة وطرق الاستخدام.</p>
              </div>
            </div>
            
            <div className="glass-panel border border-secondary/20 p-6 clip-corner flex items-start gap-4">
              <div className="w-12 h-12 bg-secondary/10 flex items-center justify-center text-secondary shrink-0 border border-secondary/30">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="font-bold mb-2 font-mono uppercase text-secondary">LIVE_SUPPORT</h3>
                <p className="text-sm text-muted-foreground">لم تجد إجابتك؟ فريق الدعم متاح للمساعدة المباشرة عبر الشات في الزاوية.</p>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            {FAQ_DATA.map((section, idx) => (
              <div key={idx} className="relative">
                <h2 className="text-2xl font-bold font-mono text-primary uppercase mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/20 border border-primary flex items-center justify-center text-sm clip-corner-sm neon-border">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {section.category}
                </h2>
                
                <div className="hud-frame relative">
                  {section.questions.map((q, qIdx) => (
                    <FaqItem 
                      key={qIdx} 
                      q={q.q} 
                      a={q.a.replace('[FREE_SHIPPING_THRESHOLD]', threshold.toString())} 
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Layout>
  );
}
