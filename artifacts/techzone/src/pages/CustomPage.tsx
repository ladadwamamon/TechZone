import { useParams } from "wouter";
import DOMPurify from "dompurify";
import { Layout } from "@/components/Layout";
import { useGetCustomPage } from "@workspace/api-client-react";
import { FileText } from "lucide-react";
import NotFound from "@/pages/not-found";

export default function CustomPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const { data: page, isLoading, isError } = useGetCustomPage(slug);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-3xl">
          <div className="h-8 w-1/2 bg-primary/20 rounded animate-pulse mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-primary/10 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (isError || !page) {
    return <NotFound />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="flex items-center gap-3 mb-8 border-b border-primary/20 pb-4">
          <FileText className="w-6 h-6 text-primary" />
          <h1 className="text-3xl font-black neon-text">{page.titleAr}</h1>
        </div>
        <article
          className="prose prose-invert max-w-none prose-headings:text-primary prose-a:text-primary prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.contentHtml) }}
        />
      </div>
    </Layout>
  );
}
