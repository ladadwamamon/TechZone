import { Layout } from "@/components/Layout";
import { useGetBlogPost, getGetBlogPostQueryKey } from "@workspace/api-client-react";
import { Link, useParams } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Clock, User, ArrowLeft, Terminal } from "lucide-react";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: post, isLoading, error } = useGetBlogPost(slug || "", {
    query: {
      enabled: !!slug,
      queryKey: getGetBlogPostQueryKey(slug || "")
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 animate-pulse space-y-8">
          <div className="h-10 w-48 bg-primary/20 clip-corner"></div>
          <div className="h-64 md:h-96 w-full bg-primary/10 clip-corner-lg hud-frame"></div>
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="h-10 w-full bg-primary/10"></div>
            <div className="h-4 w-full bg-primary/10"></div>
            <div className="h-4 w-5/6 bg-primary/10"></div>
            <div className="h-4 w-4/6 bg-primary/10"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="glass-panel clip-corner hud-frame p-12 max-w-lg mx-auto flex flex-col items-center">
            <div className="w-20 h-20 bg-destructive/10 clip-corner flex items-center justify-center text-destructive mb-4 shadow-[0_0_15px_var(--destructive)]">
              <Terminal size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2 font-mono uppercase text-destructive neon-text">{">"} ERR_404: FILE_NOT_FOUND</h3>
            <p className="text-muted-foreground mb-8 font-mono text-sm">// السجل المطلوب غير موجود في النظام.</p>
            <Link href="/blog" className="bg-primary/10 border border-primary text-primary hover:bg-primary hover:text-primary-foreground clip-corner font-bold py-3 px-6 transition-all uppercase text-sm font-mono glow-hover">
              [ RETURN_TO_FEED ]
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="border-b border-primary/20 py-8 relative overflow-hidden glass-panel">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-sm text-primary font-mono mb-4">
            <Link href="/" className="hover:text-secondary transition-colors uppercase">ROOT</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-secondary transition-colors uppercase">DATA_FEED</Link>
            <span>/</span>
            <span className="text-foreground uppercase truncate max-w-[200px] md:max-w-md">{post.titleAr}</span>
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-black neon-text text-primary uppercase leading-tight max-w-4xl" style={{ lineHeight: '1.4' }}>
            {post.titleAr}
          </h1>
          <div className="flex flex-wrap items-center gap-6 mt-6 font-mono text-xs md:text-sm text-primary/70 uppercase">
            <div className="flex items-center gap-2">
              {post.authorAvatar ? (
                <img src={post.authorAvatar} alt={post.authorName} className="w-6 h-6 rounded-full border border-primary/50" />
              ) : (
                <User size={16} />
              )}
              <span className="text-foreground">{post.authorName}</span>
            </div>
            <div className="flex items-center gap-2"><Calendar size={16} /> {new Date(post.date).toLocaleDateString('ar-EG-u-nu-latn')}</div>
            <div className="flex items-center gap-2"><Clock size={16} /> {post.readingMinutes} MIN_READ</div>
            <div className="flex items-center gap-2 border border-primary/30 px-2 py-1 clip-corner-sm bg-primary/5">{post.categoryAr}</div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <motion.div 
          className="relative h-64 md:h-[500px] w-full glass-panel border border-primary/20 clip-corner-lg overflow-hidden mb-12 hud-frame"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <img src={post.coverImage} alt={post.titleAr} className="absolute inset-0 w-full h-full object-cover mix-blend-screen opacity-80" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none mix-blend-screen"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {post.excerpt && (
            <p className="text-xl md:text-2xl font-bold text-primary/90 mb-10 leading-relaxed font-sans border-r-4 border-secondary pr-6 py-2 bg-secondary/5 clip-tab">
              {post.excerpt}
            </p>
          )}

          <div className="prose prose-invert prose-p:leading-relaxed prose-p:mb-6 prose-p:text-foreground/90 prose-p:font-sans prose-a:text-primary prose-a:neon-text hover:prose-a:text-secondary max-w-none">
            <div dangerouslySetInnerHTML={{ __html: post.contentAr }} />
          </div>

          <div className="mt-16 pt-8 border-t border-primary/20 flex items-center justify-between">
            <div className="font-mono text-sm text-primary/50 uppercase">{"//"} END_OF_FILE</div>
            <Link href="/blog" className="flex items-center gap-2 font-mono text-sm text-primary hover:text-secondary transition-colors uppercase">
              RETURN_TO_FEED <ArrowLeft size={16} />
            </Link>
          </div>
        </div>

        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="mt-20 pt-10 border-t border-primary/10">
            <h3 className="text-2xl font-bold font-mono text-primary uppercase mb-8 flex items-center gap-3">
              <Terminal size={24} /> {">"} RELATED_LOGS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {post.relatedPosts.map(related => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="block h-full group">
                  <motion.div 
                    className="glass-panel border border-primary/20 clip-corner h-full flex flex-col overflow-hidden glow-hover relative"
                    whileHover={{ y: -5 }}
                  >
                    <div className="h-32 relative overflow-hidden bg-background/80">
                      <img src={related.coverImage} alt={related.titleAr} className="w-full h-full object-cover mix-blend-screen opacity-70 group-hover:scale-110 transition-transform duration-700" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-center justify-between mb-2 text-[10px] font-mono text-primary/70 uppercase">
                        <span>{">"} {related.categoryAr}</span>
                      </div>
                      <h4 className="font-bold text-sm mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">{related.titleAr}</h4>
                      <div className="mt-auto pt-3 border-t border-primary/10 text-xs font-mono text-primary group-hover:text-secondary transition-colors uppercase">
                        ACCESS {">"}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
