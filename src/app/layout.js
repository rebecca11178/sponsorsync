import { Roboto } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { AuthProvider } from "@/components/AuthProvider";
import { APP_NAME, APP_TAGLINE } from "@/lib/config";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description: APP_TAGLINE,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <NavBar />
          <main className="flex-1 w-full">{children}</main>
          <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted">
            <p>{APP_NAME} · Prototype for the NYU SPS × Google Hackathon (Track 2)</p>
            <p className="mx-auto mt-2 max-w-3xl leading-relaxed">
              All profiles, follower counts, prices and match scores are <strong>sample data for demonstration only</strong>.
              &ldquo;Business verified&rdquo; = company-email check · &ldquo;Channel verified&rdquo; = YouTube channel ownership.
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
