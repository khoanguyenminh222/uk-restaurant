import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  preload: true,
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata = {
  title: "UK Restaurant - Ăn no khỏi 'bàn'",
  description: "Website đặt món online UK Restaurant - Đặt món nhanh chóng, tiện lợi. Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm",
  keywords: "nhà hàng, đặt món online, UK Restaurant, đồ ăn, giao hàng, thực phẩm tươi ngon",
  authors: [{ name: "UK Restaurant" }],
  creator: "UK Restaurant",
  publisher: "UK Restaurant",
  openGraph: {
    title: "UK Restaurant - Ăn no khỏi 'bàn'",
    description: "Website đặt món online UK Restaurant - Đặt món nhanh chóng, tiện lợi",
    type: "website",
    locale: "vi_VN",
    siteName: "UK Restaurant",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "UK Restaurant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UK Restaurant - Ăn no khỏi 'bàn'",
    description: "Website đặt món online UK Restaurant",
    images: ["/og-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('uk-restaurant-theme');
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const shouldBeDark = theme === 'dark' || (!theme && systemPrefersDark);
                if (shouldBeDark) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
