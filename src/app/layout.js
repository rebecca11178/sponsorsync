import { Geist } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: APP_TAGLINE,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NavBar />
        <main className="flex-1 w-full">{children}</main>
        <footer className="border-t border-border py-6 text-center text-sm text-muted">
          {APP_NAME} · Prototype for the NYU SPS × Google Hackathon (Track 2)
        </footer>
      </body>
    </html>
  );
}
