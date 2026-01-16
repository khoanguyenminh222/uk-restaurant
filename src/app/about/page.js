export const runtime = 'edge';


import { defaultAboutConfig, mergeWithDefaults } from "@/lib/models/AboutConfig";
import clientPromise, { getDatabaseName } from "@/lib/mongodb";
import AboutClient from "./AboutClient";

async function getAboutConfig() {
  try {
    const client = await clientPromise;
    const db = client.db(getDatabaseName());
    const config = await db
      .collection('aboutConfig')
      .findOne({ config_type: 'about' });

    if (!config) return defaultAboutConfig;

    return mergeWithDefaults(config);
  } catch (error) {
    console.error("Error fetching about config for metadata:", error);
    return defaultAboutConfig;
  }
}

export async function generateMetadata() {
  const config = await getAboutConfig();
  const seo = config.seo || defaultAboutConfig.seo;

  return {
    title: seo.meta_title || 'Về Chúng Tôi - Nhà Hàng UK Restaurant',
    description: seo.meta_description || 'Khám phá câu chuyện, sứ mệnh và đội ngũ đằng sau UK Restaurant. Chúng tôi cam kết mang đến trải nghiệm ẩm thực tuyệt vời nhất.',
    keywords: seo.meta_keywords || 'về chúng tôi, giới thiệu, nhà hàng uk, đội ngũ, sứ mệnh, giá trị cốt lõi',
    openGraph: {
      title: seo.og_title || seo.meta_title,
      description: seo.og_description || seo.meta_description,
      images: seo.og_image ? [{ url: seo.og_image }] : [],
      type: seo.og_type || 'website',
      locale: seo.og_locale || 'vi_VN',
    },
    twitter: {
      card: seo.twitter_card || 'summary_large_image',
      title: seo.twitter_title || seo.meta_title,
      description: seo.twitter_description || seo.meta_description,
      images: seo.twitter_image ? [seo.twitter_image] : [],
    },
    robots: {
      index: seo.robots_index !== false,
      follow: seo.robots_follow !== false,
    },
    icons: {
      icon: seo.icon_favicon || '/favicon.ico',
      apple: seo.icon_apple || '/apple-icon.png',
    },
  };
}

export default function AboutPage() {
  return <AboutClient />;
}

