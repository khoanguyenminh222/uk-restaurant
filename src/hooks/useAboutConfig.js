import { useState, useEffect } from 'react';
import { defaultAboutConfig } from '@/lib/models/AboutConfig';

/**
 * Custom hook để fetch và cache about config
 */
export function useAboutConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/config/about');
        const data = await res.json();
        if (data.success) {
          setConfig(data.data);
        } else {
          setError(data.error);
          // Fallback to defaults
          setConfig(defaultAboutConfig);
        }
      } catch (err) {
        console.error('Error fetching about config:', err);
        setError(err.message);
        // Fallback to defaults
        setConfig(defaultAboutConfig);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
}
