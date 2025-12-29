import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "UK Restaurant - Ăn no khỏi 'bàn'",
  description: "Website đặt món online UK Restaurant - Đặt món nhanh chóng, tiện lợi",
  keywords: "nhà hàng, đặt món online, UK Restaurant, đồ ăn, giao hàng",
  authors: [{ name: "UK Restaurant" }],
  openGraph: {
    title: "UK Restaurant - Ăn no khỏi 'bàn'",
    description: "Website đặt món online UK Restaurant - Đặt món nhanh chóng, tiện lợi",
    type: "website",
    locale: "vi_VN",
    siteName: "UK Restaurant",
  },
  twitter: {
    card: "summary_large_image",
    title: "UK Restaurant - Ăn no khỏi 'bàn'",
    description: "Website đặt món online UK Restaurant",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
