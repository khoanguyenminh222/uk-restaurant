/**
 * Restaurant Config Utility
 * Lấy cấu hình tên cửa hàng và slogan từ landing config
 */

import clientPromise, { getDatabaseName } from '@/lib/mongodb';
import { defaultLandingConfig, mergeWithDefaults } from '@/lib/models/LandingConfig';

/**
 * Lấy config từ database (helper function)
 * @returns {Promise<object>} Merged config object
 */
async function getConfig() {
  try {
    const client = await clientPromise;
    const db = client.db(getDatabaseName());

    const config = await db
      .collection('landingConfig')
      .findOne({ config_type: 'landing' });

    if (config) {
      return mergeWithDefaults(config);
    }

    return defaultLandingConfig;
  } catch (error) {
    console.error('Error getting config:', error);
    return defaultLandingConfig;
  }
}

/**
 * Lấy tên cửa hàng từ config (server-side only)
 * @returns {Promise<string>} Tên cửa hàng
 */
export async function getRestaurantName() {
  const config = await getConfig();
  return config.restaurant_name || defaultLandingConfig.restaurant_name;
}

/**
 * Lấy slogan từ config (server-side only)
 * @returns {Promise<string>} Slogan
 */
export async function getSlogan() {
  const config = await getConfig();
  return config.slogan || defaultLandingConfig.slogan;
}

/**
 * Lấy SEO config từ database (server-side only)
 * @returns {Promise<object>} SEO config object
 */
export async function getSEOConfig() {
  const config = await getConfig();
  return config.seo || defaultLandingConfig.seo;
}

