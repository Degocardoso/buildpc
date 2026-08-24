import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Setup Inventory | Inventário e Planejamento do Setup Gamer",
  description:
    "Gerencie o inventário do seu setup gamer, controle quanto já gastou com datas exatas de compra e planeje os próximos upgrades da sua lista de desejos.",
  keywords: ["setup gamer", "inventário", "wishlist", "PC gamer", "PS5", "controle financeiro"],
};

export const viewport: Viewport = {
  themeColor: "#08090d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
