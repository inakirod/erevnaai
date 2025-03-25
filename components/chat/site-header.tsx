import Image from "next/image";
import Link from "next/link";
import { Twitter } from "lucide-react";

export function Header() {
  return (
    <>
      <header className="pt-4 fixed left-0 top-0 z-50 w-full translate-y-[-1rem] animate-fade-in border-b border-base-200 backdrop-blur-[12px] [--animation-delay:600ms]">
        <div className="container flex h-[3.5rem] items-center">
          {/* Left spacer to help with centering */}
          <div className="w-10 flex-none"></div>
          
          {/* Centered logo */}
          <div className="flex-1 flex justify-center">
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
          </div>
          
          {/* Twitter icon on the right */}
          <div className="w-10 flex-none">
            <Link
              href="https://x.com/erevnaai"
              target="_blank"
              className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:text-primary transition-colors rounded-full hover:bg-primary/10"
            >
              <Twitter className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
