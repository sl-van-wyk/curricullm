import { Geist } from "next/font/google";
import "./globals.css";

export const metadata = {
  title: "Next.js App",
  description: "A simple Next.js application",
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
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
