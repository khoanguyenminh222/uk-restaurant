import { useState, useEffect } from 'react';
import { defaultLandingConfig } from '@/lib/models/LandingConfig';

/**
 * Custom hook để fetch và cache landing config
 */
export function useLandingConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/config/landing');
        const data = await res.json();
        if (data.success) {
          setConfig(data.data);
        } else {
          setError(data.error);
          // Fallback to defaults
          setConfig(defaultLandingConfig);
        }
      } catch (err) {
        console.error('Error fetching landing config:', err);
        setError(err.message);
        // Fallback to defaults
        setConfig(defaultLandingConfig);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
}

