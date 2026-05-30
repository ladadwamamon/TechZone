import { AnnouncementBar } from "./AnnouncementBar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-primary/30 text-foreground bg-transparent relative">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1 flex flex-col relative z-0">
        {children}
      </main>
      <Footer />
    </div>
  );
}
