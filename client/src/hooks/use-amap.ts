import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';

let scriptLoadingPromise: Promise<typeof AMap> | null = null;

function loadAmapScript(
  apiKey: string,
  securityCode?: string
): Promise<typeof AMap> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window is undefined'));
  }

  // JS API 2.0：绑定了安全密钥的 key 必须在脚本加载前注入 securityJsCode，否则出图/服务被判 INVALID_USER_SCODE
  if (securityCode) {
    window._AMapSecurityConfig = { securityJsCode: securityCode };
  }

  if (window.AMap) {
    return Promise.resolve(window.AMap);
  }

  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<typeof AMap>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-amap="true"]'
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        resolve(window.AMap);
      });
      existingScript.addEventListener('error', () => {
        reject(new Error('AMap script failed to load'));
      });
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(
      apiKey
    )}&plugin=AMap.AutoComplete,AMap.HeatMap,AMap.Geocoder`;
    script.dataset.amap = 'true';

    script.onload = () => {
      logger.info('AMap script loaded successfully');
      resolve(window.AMap);
    };

    script.onerror = () => {
      scriptLoadingPromise = null;
      reject(new Error('AMap script failed to load'));
    };

    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export interface UseAmapOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  center?: [number, number];
  zoom?: number;
  mapStyle?: string;
}

export interface UseAmapResult {
  map: AMap.Map | null;
  loading: boolean;
  error: string | null;
  hasKey: boolean;
}

export interface UseAmapServiceResult {
  amap: typeof AMap | null;
  ready: boolean;
  error: string | null;
  hasKey: boolean;
}

// 仅加载高德脚本以使用 AutoComplete / Geocoder 等服务，无需地图容器
export function useAmapService(): UseAmapServiceResult {
  const [amap, setAmap] = useState<typeof AMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = (import.meta.env.VITE_AMAP_KEY as string) || '';
  const securityCode =
    (import.meta.env.VITE_AMAP_SECURITY_CODE as string) || '';
  const hasKey = Boolean(apiKey);

  useEffect(() => {
    if (!hasKey) {
      setError('缺少高德地图 API Key');
      return;
    }
    let cancelled = false;
    loadAmapScript(apiKey, securityCode)
      .then((loaded) => {
        if (!cancelled) setAmap(loaded);
      })
      .catch((err: Error) => {
        logger.error('Failed to load AMap service:', err.message);
        if (!cancelled) setError('地图服务加载失败');
      });
    return () => {
      cancelled = true;
    };
  }, [hasKey, apiKey, securityCode]);

  return { amap, ready: Boolean(amap), error, hasKey };
}

export function useAmap(options: UseAmapOptions): UseAmapResult {
  const { containerRef, center = [116.397428, 39.90923], zoom = 11, mapStyle } =
    options;

  const [map, setMap] = useState<AMap.Map | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mapInstanceRef = useRef<AMap.Map | null>(null);

  const apiKey = (import.meta.env.VITE_AMAP_KEY as string) || '';
  const securityCode =
    (import.meta.env.VITE_AMAP_SECURITY_CODE as string) || '';
  const hasKey = Boolean(apiKey);

  const initMap = useCallback(() => {
    if (!containerRef.current || !window.AMap) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.destroy();
      mapInstanceRef.current = null;
    }

    const mapInstance = new window.AMap.Map(containerRef.current, {
      center,
      zoom,
      mapStyle,
      resizeEnable: true,
    });

    mapInstanceRef.current = mapInstance;

    // 地图内部图层需等 complete 事件后才就绪，
    // 提前 add 覆盖物会报 Cannot read properties of undefined (reading 'add')
    mapInstance.on('complete', () => {
      setMap(mapInstance);
      setLoading(false);
    });
  }, [containerRef, center, zoom, mapStyle]);

  useEffect(() => {
    if (!hasKey) {
      setLoading(false);
      setError('缺少高德地图 API Key');
      return;
    }

    setLoading(true);
    setError(null);

    loadAmapScript(apiKey, securityCode)
      .then(() => {
        // Wait for container to be ready
        const checkContainer = (): void => {
          if (containerRef.current) {
            initMap();
          } else {
            requestAnimationFrame(checkContainer);
          }
        };
        checkContainer();
      })
      .catch((err: Error) => {
        logger.error('Failed to load AMap:', err.message);
        setError('地图加载失败');
        setLoading(false);
      });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
        setMap(null);
      }
    };
  }, [hasKey, apiKey, securityCode, initMap, containerRef]);

  return { map, loading, error, hasKey };
}

export default useAmap;
