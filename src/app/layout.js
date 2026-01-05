import { Inter, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { getRestaurantName, getSlogan, getSEOConfig, getIconConfig } from "@/lib/restaurantConfig";
import { getStorageKey, STORAGE_KEYS } from "@/utils/storage";

// Force dynamic rendering để metadata (bao gồm icons) được reload mỗi lần request
// Điều này đảm bảo khi thay đổi icon trong admin panel, nó sẽ được cập nhật ngay mà không cần restart
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
  preload: true,
});

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam-pro",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export async function generateMetadata() {
  const restaurantName = await getRestaurantName();
  const slogan = await getSlogan();
  const seoConfig = await getSEOConfig();
  const iconConfig = await getIconConfig();
  const defaultName = "UK Restaurant";
  const defaultSlogan = "Ăn no khỏi 'bàn'";
  const name = restaurantName || defaultName;
  const tagline = slogan || defaultSlogan;
  
  // Lấy base URL từ environment variable hoặc dùng localhost cho development
  const metadataBase = process.env.NEXT_PUBLIC_BASE_URL;
  
  // Sử dụng SEO config từ database, fallback về giá trị mặc định
  const metaTitle = seoConfig.meta_title || `${name} - ${tagline}`;
  const metaDescription = seoConfig.meta_description || `Website đặt món online ${name} - Đặt món nhanh chóng, tiện lợi. Khám phá hương vị đặc biệt với thực đơn đa dạng, nguyên liệu tươi ngon và dịch vụ tận tâm`;
  const metaKeywords = seoConfig.meta_keywords || `nhà hàng, đặt món online, ${name}, đồ ăn, giao hàng, thực phẩm tươi ngon`;
  
  const ogTitle = seoConfig.og_title || metaTitle;
  const ogDescription = seoConfig.og_description || metaDescription;
  const ogImage = seoConfig.og_image || "/og-image.jpg";
  const ogType = seoConfig.og_type || "website";
  const ogLocale = seoConfig.og_locale || "vi_VN";
  
  const twitterCard = seoConfig.twitter_card || "summary_large_image";
  const twitterTitle = seoConfig.twitter_title || ogTitle;
  const twitterDescription = seoConfig.twitter_description || ogDescription;
  const twitterImage = seoConfig.twitter_image || ogImage;
  
  const robotsIndex = seoConfig.robots_index !== false;
  const robotsFollow = seoConfig.robots_follow !== false;
  
  // Xử lý icon URLs - luôn export icons trong metadata
  // Nếu là absolute URL (http/https) thì dùng trực tiếp, nếu không thì resolve với metadataBase
  const faviconUrl = iconConfig.favicon.startsWith('http://') || iconConfig.favicon.startsWith('https://')
    ? iconConfig.favicon
    : new URL(iconConfig.favicon, metadataBase).toString();
  const appleIconUrl = iconConfig.apple.startsWith('http://') || iconConfig.apple.startsWith('https://')
    ? iconConfig.apple
    : new URL(iconConfig.apple, metadataBase).toString();
  
  return {
    metadataBase,
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name }],
    creator: name,
    publisher: name,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: ogType,
      locale: ogLocale,
      siteName: name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
    },
    twitter: {
      card: twitterCard,
      title: twitterTitle,
      description: twitterDescription,
      images: [twitterImage],
    },
    robots: {
      index: robotsIndex,
      follow: robotsFollow,
      googleBot: {
        index: robotsIndex,
        follow: robotsFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    // Luôn export icons từ config (đã đổi tên file favicon.ico thành favicon-default.ico để Next.js không tự động inject)
    icons: {
      icon: faviconUrl,
      apple: appleIconUrl,
    },
  };
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({ children }) {
  const themeStorageKey = getStorageKey(STORAGE_KEYS.THEME);
  
  return (
    <html lang="vi" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${beVietnamPro.variable} font-sans antialiased`}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const themeKey = ${JSON.stringify(themeStorageKey)};
                const theme = localStorage.getItem(themeKey);
                // Default to light theme if no saved theme
                const shouldBeDark = theme === 'dark';
                if (shouldBeDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
