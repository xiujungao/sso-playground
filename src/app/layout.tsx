import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import theme from "@/theme";
import { ThemeProvider } from "@mui/material/styles";
import Navbar from "./components/Navbar";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { AlertProvider } from "./components/AlertProvider";
import { PublicEnvScript } from "next-runtime-env";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SSO Playground",
  description: "OIDC and SAML Playground",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <Navbar />
            <AlertProvider>{children}</AlertProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
