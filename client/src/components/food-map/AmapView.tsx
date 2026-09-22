import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useMemo,
  useState,
} from 'react';
import { UtensilsCrossed } from 'lucide-react';
import type { FoodEntryMapMarker, FoodEntryListItem } from '@shared/api.interface';
import { useAmap } from '@/hooks/use-amap';
import { cn } from '@/lib/utils';
import { createMarkerContent, MARKER_STYLES } from './marker-utils';
import { MapPreviewCard } from './MapPreviewCard';

export interface AmapViewRef {
  panTo: (lng: number, lat: number) => void;
  setZoom: (zoom: number) => void;
  fitView: () => void;
}

export interface AmapViewProps {
  markers: FoodEntryMapMarker[];
  center?: [number, number];
  zoom?: number;
  showHeatmap?: boolean;
  currentUserId?: string | null;
  onMarkerClick?: (marker: FoodEntryMapMarker) => void;
  onMapClick?: (lng: number, lat: number) => void;
  className?: string;
  previewEntry?: FoodEntryListItem | null;
  onPreviewEdit?: () => void;
  onPreviewDelete?: () => void;
  onPreviewClose?: () => void;
}

const MIN_PREVIEW_SCALE = 0.35;
const MAX_PREVIEW_SCALE = 2.4;

function clampScale(value: number): number {
  return Math.min(MAX_PREVIEW_SCALE, Math.max(MIN_PREVIEW_SCALE, value));
}

const AmapView = forwardRef<AmapViewRef, AmapViewProps>(function AmapView(
  {
    markers,
    center,
    zoom = 11,
    showHeatmap = false,
    currentUserId = null,
    onMarkerClick,
    onMapClick,
    className,
    previewEntry,
    onPreviewEdit,
    onPreviewDelete,
    onPreviewClose,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, AMap.Marker>>(new Map());
  const heatmapRef = useRef<AMap.HeatMap | null>(null);
  const baseZoomRef = useRef<number | null>(null);
  const rafIdRef = useRef<number>(0);

  const [overlay, setOverlay] = useState<{ x: number; y: number; scale: number } | null>(
    null
  );

  const defaultCenter: [number, number] = useMemo(
    () => center ?? [116.397428, 39.90923],
    [center]
  );

  const { map, loading, error, hasKey } = useAmap({
    containerRef,
    center: defaultCenter,
    zoom,
  });

  useImperativeHandle(
    ref,
    () => ({
      panTo: (lng: number, lat: number) => {
        if (map) map.setCenter([lng, lat]);
      },
      setZoom: (z: number) => {
        if (map) map.setZoom(z);
      },
      fitView: () => {
        if (map && markersRef.current.size > 0) {
          const overlays = Array.from(markersRef.current.values());
          map.setFitView(overlays, false, [60, 60, 60, 60], 16);
        }
      },
    }),
    [map]
  );

  // Map click handler
  useEffect(() => {
    if (!map || !onMapClick) return;

    const handleClick = (e: AMap.MapEvent): void => {
      const lnglat = e.lnglat;
      onMapClick(lnglat.getLng(), lnglat.getLat());
    };

    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);

  // Render markers
  useEffect(() => {
    if (!map || !window.AMap) return;

    const currentIds = new Set(markers.map((m: FoodEntryMapMarker) => m.id));

    // Remove markers no longer in the list
    markersRef.current.forEach((existingMarker, id) => {
      if (!currentIds.has(id)) {
        map.remove(existingMarker);
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    markers.forEach((markerData: FoodEntryMapMarker) => {
      const existing = markersRef.current.get(markerData.id);
      if (existing) {
        existing.setPosition([markerData.longitude, markerData.latitude]);
        return;
      }

      const content = createMarkerContent(markerData, currentUserId);
      const marker = new window.AMap.Marker({
        position: [markerData.longitude, markerData.latitude],
        content,
        offset: new window.AMap.Pixel(-18, -46),
        clickable: true,
        extData: markerData,
      });

      marker.on('click', () => {
        const data = marker.getExtData() as FoodEntryMapMarker;
        if (onMarkerClick) onMarkerClick(data);
      });

      markersRef.current.set(markerData.id, marker);
      map.add(marker);
    });
  }, [map, markers, onMarkerClick]);

  // 预览态下隐藏对应原生 Marker（由 overlay 卡片内的图标替代，避免图标重叠）
  useEffect(() => {
    const previewId = previewEntry?.id ?? null;
    markersRef.current.forEach((marker, id) => {
      if (id === previewId) {
        marker.hide();
      } else {
        marker.show();
      }
    });
  }, [previewEntry, markers]);

  // 预览项变化时启动/停止 rAF 轮询——每帧从地图读当前 zoom 与坐标，
  // 只在值真正变化时才更新 React state，避免无关重渲染。
  // 放弃依赖 AMap 事件（zoomchange 在滚轮缩放时不可靠）。
  useEffect(() => {
    const entryId = previewEntry?.id ?? null;

    if (!map || !entryId) {
      setOverlay(null);
      baseZoomRef.current = null;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
      return;
    }

    baseZoomRef.current = map.getZoom();

    const tick = () => {
      if (!map || !previewEntry || !window.AMap) {
        rafIdRef.current = requestAnimationFrame(tick);
        return;
      }

      const pixel = map.lngLatToContainer([
        previewEntry.longitude,
        previewEntry.latitude,
      ]);
      const px = pixel.getX();
      const py = pixel.getY();
      const currentZoom = map.getZoom();
      const base = baseZoomRef.current ?? currentZoom;
      const scale = clampScale(Math.pow(2, currentZoom - base));

      setOverlay((prev) => {
        if (
          prev &&
          prev.x === px &&
          prev.y === py &&
          prev.scale === scale
        ) {
          return prev;
        }
        return { x: px, y: py, scale };
      });

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
    };
  }, [map, previewEntry?.id ?? null]);

  // Heatmap
  useEffect(() => {
    if (!map || !window.AMap) return;

    if (showHeatmap && markers.length > 0) {
      if (!heatmapRef.current) {
        heatmapRef.current = new window.AMap.HeatMap(map, {
          radius: 30,
          opacity: [0.3, 0.8],
          gradient: {
            '0.4': '#4CD964',
            '0.6': '#FFDE00',
            '0.8': '#FF9500',
            '1.0': '#FF3B30',
          },
        });
      }

      heatmapRef.current.setDataSet({
        data: markers.map((m: FoodEntryMapMarker) => ({
          lng: m.longitude,
          lat: m.latitude,
          count: m.rating,
        })),
        max: 5,
      });
      heatmapRef.current.show();
    } else if (heatmapRef.current) {
      heatmapRef.current.hide();
    }

    return () => {
      if (heatmapRef.current) {
        heatmapRef.current.setMap(null);
        heatmapRef.current = null;
      }
    };
  }, [map, showHeatmap, markers]);

  // Cleanup
  useEffect(() => {
    return () => {
      markersRef.current.clear();
      heatmapRef.current = null;
    };
  }, []);

  if (!hasKey) {
    return (
      <div
        className={cn(
          'flex h-full w-full flex-col items-center justify-center rounded-xl bg-accent/50',
          className
        )}
      >
        <UtensilsCrossed className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          请配置 VITE_AMAP_KEY 环境变量以启用地图
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn('relative h-full w-full overflow-hidden rounded-xl', className)}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-accent/30">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
            <p className="text-sm text-muted-foreground">地图加载中...</p>
          </div>
        </div>
      )}
      {error && !loading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-accent/50">
          <UtensilsCrossed className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      )}
      <div
        ref={containerRef}
        className="h-full w-full"
        style={{ minHeight: '300px' }}
      />

      {/* 跟随地图坐标的店铺预览卡片（与图标同一覆盖物，随地图缩放一起放缩） */}
      {previewEntry && overlay && (
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
          <div
            className="absolute"
            style={{
              left: overlay.x,
              top: overlay.y,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <MapPreviewCard
              entry={previewEntry}
              scale={overlay.scale}
              isOwner={!currentUserId || previewEntry.userId === currentUserId}
              onEdit={() => onPreviewEdit?.()}
              onDelete={() => onPreviewDelete?.()}
              onClose={() => onPreviewClose?.()}
            />
          </div>
        </div>
      )}

      <style>{MARKER_STYLES}</style>
    </div>
  );
});

AmapView.displayName = 'AmapView';

export default AmapView;
