import { Inter } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/Layout/LayoutShell";
import { ThemeProvider } from "next-themes";
import ScrollToTop from '@/components/ScrollToTop';
import Aoscompo from "@/utils/aos";
import NextTopLoader from 'nextjs-toploader';
import SessionProviderComp from "@/components/nextauth/SessionProvider";
import { AuthDialogProvider } from "./context/AuthDialogContext";
import { AuthProfileProvider } from "./context/AuthProfileContext";
import { AuthModalProvider } from "./context/AuthModalContext";
const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <NextTopLoader />
        <AuthDialogProvider>
          <AuthProfileProvider>
            <AuthModalProvider>
              <SessionProviderComp>
                <ThemeProvider
                  attribute="class"
                  enableSystem={true}
                  defaultTheme="system">
                  <Aoscompo>
                    <LayoutShell>{children}</LayoutShell>
                  </Aoscompo>
                  <ScrollToTop />
                </ThemeProvider>
              </SessionProviderComp>
            </AuthModalProvider>
          </AuthProfileProvider>
        </AuthDialogProvider>
      </body>
    </html>
  );
}
