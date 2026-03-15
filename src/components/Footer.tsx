import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Pill Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {["Protocol", "Security", "Open Source", "Shelby Mesh", "Aptos", "Documentation", "Status"].map(
            (item) => (
              <span key={item} className="pill-nav">
                {item}
              </span>
            )
          )}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-accent rounded-full" />
            <span className="font-mono text-xs font-bold tracking-widest uppercase">
              GENI
            </span>
          </div>

          <div className="font-mono text-xs text-text-muted flex flex-wrap gap-6">
            <Link href="#" className="hover:text-accent transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-accent transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-accent transition-colors">
              GitHub
            </Link>
            <span>© 2025 Geni Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
