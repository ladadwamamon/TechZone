import { Layout } from "@/components/Layout";
import { useListBlogPosts } from "@workspace/api-client-react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, ArrowLeft, Terminal } from "lucide-react";

export default function Blog() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const category = searchParams.get("category") || undefined;

  const { data: posts, isLoading } = useListBlogPosts({ category });

  const featuredPost = posts?.find(p => p.isFeatured);
  const gridPosts = posts?.filter(p => !p.isFeatured) || [];

  const CATEGORIES = ["أخبار الجيمنج", "مراجعات", "شروحات وتجميعات", "تحديثات المتجر"];

  return (
    <Layout>
      <div className="border-b border-primary/20 py-8 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-2 text-sm text-primary font-mono mb-4">
            <Link href="/" className="hover:text-secondary transition-colors uppercase">ROOT</Link>
            <span>/</span>
            <span className="text-foreground uppercase">DATA_FEED</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black neon-text text-primary glitch uppercase" data-text="المدونة">المدونة</h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm uppercase">{"//"} SYSTEM_UPDATE_LOGS</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-3 mb-8">
          <Link 
            href="/blog" 
            className={`px-4 py-2 clip-corner-sm text-sm font-mono border transition-all ${!category ? 'bg-primary text-primary-foreground border-primary neon-border' : 'bg-background/50 border-primary/30 text-primary hover:border-primary hover:bg-primary/10'}`}
          >
            [ ALL_LOGS ]
          </Link>
          {CATEGORIES.map(c => (
            <Link 
              key={c}
              href={`/blog?category=${encodeURIComponent(c)}`}
              className={`px-4 py-2 clip-corner-sm text-sm font-mono border transition-all ${category === c ? 'bg-primary text-primary-foreground border-primary neon-border' : 'bg-background/50 border-primary/30 text-primary hover:border-primary hover:bg-primary/10'}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-64 md:h-96 w-full bg-primary/10 clip-corner-lg hud-frame"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-80 bg-primary/10 clip-corner hud-frame"></div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {featuredPost && !category && (
              <Link href={`/blog/${featuredPost.slug}`} className="block group">
                <motion.div 
                  className="relative h-64 md:h-96 w-full glass-panel border border-primary/20 clip-corner-lg overflow-hidden glow-hover hud-frame"
                  whileHover={{ scale: 0.99 }}
                >
                  <img src={featuredPost.coverImage} alt={featuredPost.titleAr} className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-50 group-hover:opacity-70 transition-opacity duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="max-w-3xl">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-secondary/20 border border-secondary text-secondary text-[10px] font-mono font-bold px-2 py-1 clip-corner-sm shadow-[0_0_8px_var(--magenta)] uppercase">
                          FEATURED
                        </span>
                        <span className="text-primary text-xs font-mono">{featuredPost.categoryAr}</span>
                      </div>
                      <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">{featuredPost.titleAr}</h2>
                      <p className="text-muted-foreground line-clamp-2 md:line-clamp-3 text-sm md:text-base font-sans">{featuredPost.excerpt}</p>
                    </div>
                    
                    <div className="flex flex-row md:flex-col items-center md:items-end gap-4 text-xs font-mono text-primary/70 shrink-0">
                      <div className="flex items-center gap-2"><Calendar size={14} /> {new Date(featuredPost.date).toLocaleDateString('ar-EG-u-nu-latn')}</div>
                      <div className="flex items-center gap-2"><Clock size={14} /> {featuredPost.readingMinutes} MIN_READ</div>
                      <div className="mt-2 text-primary group-hover:text-secondary transition-colors uppercase font-bold flex items-center gap-1">
                        READ_FILE <ArrowLeft size={14} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}

            {gridPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {gridPosts.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="block h-full group">
                    <motion.div 
                      className="glass-panel border border-primary/20 clip-corner h-full flex flex-col overflow-hidden glow-hover hud-frame relative"
                      whileHover={{ y: -5 }}
                    >
                      <div className="h-48 relative overflow-hidden bg-background/80">
                        <img src={post.coverImage} alt={post.titleAr} className="w-full h-full object-cover mix-blend-screen opacity-70 group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none mix-blend-screen"></div>
                      </div>
                      <div className="p-5 flex flex-col flex-1 relative z-10 bg-gradient-to-b from-background/40 to-background/80">
                        <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-primary/70 uppercase">
                          <span>{">"} {post.categoryAr}</span>
                          <span className="flex items-center gap-1"><Clock size={12}/> {post.readingMinutes}M</span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">{post.titleAr}</h3>
                        <p className="text-muted-foreground text-sm line-clamp-3 flex-1 mb-4">{post.excerpt}</p>
                        <div className="flex items-center justify-between border-t border-primary/20 pt-3 mt-auto">
                          <span className="text-[10px] font-mono text-primary/50">{new Date(post.date).toLocaleDateString('ar-EG-u-nu-latn')}</span>
                          <span className="text-xs font-mono text-primary group-hover:text-secondary transition-colors uppercase">ACCESS {">"}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="glass-panel clip-corner hud-frame p-12 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-primary/10 clip-corner flex items-center justify-center text-primary mb-4 neon-border">
                  <Terminal size={40} />
                </div>
                <h3 className="text-xl font-bold mb-2 font-mono uppercase neon-text">{">"} END_OF_FEED</h3>
                <p className="text-muted-foreground mb-6 font-mono text-sm">// لا توجد سجلات مطابقة في قاعدة البيانات.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
