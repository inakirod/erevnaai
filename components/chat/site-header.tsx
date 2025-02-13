import Image from "next/image";
import Link from "next/link";
import { BarChart2, Twitter, Send } from "lucide-react";

export function Header() {
  return (
    <>
      <header className="pt-4 fixed left-0 top-0 z-50 w-full translate-y-[-1rem] animate-fade-in border-b border-base-200 backdrop-blur-[12px] [--animation-delay:600ms]">
        <div className="container flex h-[3.5rem] items-center justify-between">
          <Link
            className="flex items-center text-md text-black"
            href="https://erevnaai.org"
            target="_blank"
          >
            <Image
              src="/logo-text.png"
              alt="erevnaai Logo"
              width={400}
              height={100}
              className="w-48"
            />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="https://dexscreener.com/solana"
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-full transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Chart</span>
            </Link>

            <Link
              href="https://x.com/erevnaai"
              target="_blank"
              className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
            >
              <Twitter className="w-5 h-5" />
            </Link>

            <Link
              href="https://t.me/"
              target="_blank"
              className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
            >
              <Send className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
