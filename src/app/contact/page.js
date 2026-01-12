
import { defaultContactConfig, mergeWithDefaults } from "@/lib/models/ContactConfig";
import clientPromise, { getDatabaseName } from "@/lib/mongodb";
import ContactClient from "./ContactClient";

async function getContactConfig() {
    try {
        const client = await clientPromise;
        const db = client.db(getDatabaseName());
        const config = await db
            .collection('contactConfig')
            .findOne({ config_type: 'contact' });

        if (!config) return defaultContactConfig;

        return mergeWithDefaults(config);
    } catch (error) {
        console.error("Error fetching contact config for metadata:", error);
        return defaultContactConfig;
    }
}

export async function generateMetadata() {
    const config = await getContactConfig();
    const seo = config.seo || defaultContactConfig.seo;

    return {
        title: seo.meta_title || 'Liên Hệ - Nhà Hàng UK Restaurant',
        description: seo.meta_description || 'Liên hệ với chúng tôi để đặt bàn và thưởng thức những món ăn ngon miệng.',
        keywords: seo.meta_keywords || 'liên hệ, đặt bàn, nhà hàng, uk restaurant',
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

export default function ContactPage() {
    return <ContactClient />;
}
