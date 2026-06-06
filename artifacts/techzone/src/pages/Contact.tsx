import { Layout } from "@/components/Layout";
import { useSubscribeNewsletter } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, MapPin, Phone, Terminal, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const contactSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب (حرفين على الأقل)"),
  email: z.string().email("البريد الإلكتروني غير صالح"),
  message: z.string().min(10, "الرسالة قصيرة جداً"),
});

const newsletterSchema = z.object({
  email: z.string().email("البريد الإلكتروني غير صالح"),
});

export default function Contact() {
  const [contactSuccess, setContactSuccess] = useState(false);
  const subscribeMutation = useSubscribeNewsletter();

  const contactForm = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", message: "" },
  });

  const newsletterForm = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });

  const onContactSubmit = (values: z.infer<typeof contactSchema>) => {
    // Local success state
    setContactSuccess(true);
    toast.success("تم إرسال الرسالة بنجاح", {
      description: "سنقوم بالرد عليك في أقرب وقت ممكن.",
    });
    contactForm.reset();
  };

  const onNewsletterSubmit = (values: z.infer<typeof newsletterSchema>) => {
    subscribeMutation.mutate({ data: { email: values.email } }, {
      onSuccess: (res) => {
        toast.success(res.message || "تم الاشتراك بنجاح");
        newsletterForm.reset();
      },
      onError: () => {
        toast.error("حدث خطأ أثناء الاشتراك");
      }
    });
  };

  return (
    <Layout>
      <div className="border-b border-primary/20 py-12 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-3xl md:text-5xl font-black neon-text text-primary glitch uppercase mb-4" data-text="CONTACT_US">
            اتصل بنا
          </h1>
          <p className="text-primary/70 font-mono text-sm uppercase tracking-widest">
            {"// "} AWAITING_YOUR_TRANSMISSION
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Form */}
          <div className="glass-panel border-primary/20 clip-corner-lg p-8 relative hud-corners">
            <div className="flex items-center gap-3 mb-8 border-b border-primary/20 pb-4">
              <Terminal size={24} className="text-primary" />
              <h2 className="text-2xl font-bold font-mono text-primary neon-text uppercase">SEND_MESSAGE</h2>
            </div>

            {contactSuccess ? (
              <div className="py-12 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-lime/10 border border-lime text-lime flex items-center justify-center clip-corner shadow-[0_0_15px_var(--lime-raw)]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold font-mono text-lime uppercase">TRANSMISSION_SUCCESSFUL</h3>
                <p className="text-muted-foreground font-sans">تم استلام رسالتك في قواعد بياناتنا. سنتواصل معك قريباً.</p>
                <button 
                  onClick={() => setContactSuccess(false)}
                  className="mt-4 px-6 py-2 bg-primary/10 border border-primary text-primary clip-corner-sm hover:bg-primary hover:text-primary-foreground font-mono text-sm uppercase transition-colors"
                >
                  SEND_ANOTHER
                </button>
              </div>
            ) : (
              <Form {...contactForm}>
                <form onSubmit={contactForm.handleSubmit(onContactSubmit)} className="space-y-6">
                  <FormField
                    control={contactForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-primary uppercase text-xs">USER_NAME</FormLabel>
                        <FormControl>
                          <Input placeholder="الاسم الكريم..." {...field} className="bg-background/50 border-primary/30 focus:border-primary clip-corner-sm font-sans" />
                        </FormControl>
                        <FormMessage className="text-destructive text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contactForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-primary uppercase text-xs">USER_EMAIL</FormLabel>
                        <FormControl>
                          <Input placeholder="البريد الإلكتروني..." {...field} className="bg-background/50 border-primary/30 focus:border-primary clip-corner-sm font-sans" dir="ltr" />
                        </FormControl>
                        <FormMessage className="text-destructive text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={contactForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-mono text-primary uppercase text-xs">MESSAGE_PAYLOAD</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="كيف يمكننا مساعدتك؟" 
                            {...field} 
                            className="min-h-[150px] bg-background/50 border-primary/30 focus:border-primary clip-corner-sm font-sans resize-none" 
                          />
                        </FormControl>
                        <FormMessage className="text-destructive text-xs" />
                      </FormItem>
                    )}
                  />
                  <button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 clip-corner font-bold py-3 transition-all glow-hover uppercase tracking-wide font-mono text-sm flex items-center justify-center gap-2">
                    <Send size={16} /> [ TRANSMIT ]
                  </button>
                </form>
              </Form>
            )}
          </div>

          {/* Info & Map */}
          <div className="space-y-8">
            
            <div className="glass-panel border-secondary/30 clip-corner-lg p-8 bg-secondary/5 relative hud-frame-magenta">
              <h2 className="text-2xl font-bold font-mono text-secondary neon-text-magenta uppercase mb-6 border-b border-secondary/20 pb-4">
                BASE_COORDINATES
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-secondary/20 p-3 clip-corner-sm text-secondary border border-secondary/50">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h4 className="font-mono text-sm text-secondary uppercase mb-1">LOCATION</h4>
                    <p className="text-foreground font-sans">مجمع التقنية، شارع التحلية<br/>الرياض، المملكة العربية السعودية</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-secondary/20 p-3 clip-corner-sm text-secondary border border-secondary/50">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 className="font-mono text-sm text-secondary uppercase mb-1">COMMS_LINK</h4>
                    <p className="text-foreground font-sans dir-ltr">+966 50 123 4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-secondary/20 p-3 clip-corner-sm text-secondary border border-secondary/50">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="font-mono text-sm text-secondary uppercase mb-1">EMAIL</h4>
                    <p className="text-foreground font-mono dir-ltr">hello@nexus.sa</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="glass-panel border-lime/30 clip-corner p-8 bg-lime/5">
              <h2 className="text-xl font-bold font-mono text-lime neon-text-lime uppercase mb-2">
                NEWSLETTER_SYNC
              </h2>
              <p className="text-sm text-muted-foreground font-sans mb-6">
                اشترك في النشرة البريدية للحصول على أحدث العروض وتحديثات النظام.
              </p>
              
              <Form {...newsletterForm}>
                <form onSubmit={newsletterForm.handleSubmit(onNewsletterSubmit)} className="flex gap-2">
                  <FormField
                    control={newsletterForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="EMAIL_ADDRESS..." {...field} className="bg-background/50 border-lime/30 focus:border-lime clip-corner-sm font-mono text-sm" dir="ltr" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <button 
                    type="submit" 
                    disabled={subscribeMutation.isPending}
                    className="bg-lime/20 text-lime border border-lime hover:bg-lime hover:text-lime-foreground px-4 clip-corner-sm font-mono font-bold text-sm uppercase transition-colors disabled:opacity-50 shadow-[0_0_10px_var(--lime-raw)]"
                  >
                    {subscribeMutation.isPending ? "..." : "SYNC"}
                  </button>
                </form>
              </Form>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}
