import { Geist } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
  title: "Curricullm - Chat with your CV collection",
  description: "Transform static resumes into dynamic conversations with AI",
};

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light" data-theme="light">
      <body className={`${geistSans.className} bg-background text-foreground`}>
        <ThemeProvider forcedTheme="light">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
