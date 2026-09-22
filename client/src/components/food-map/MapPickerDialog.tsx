import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Crosshair, Loader2 } from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAmap } from '@/hooks/use-amap';

export interface PickedLocation {
  longitude: number;
  latitude: number;
  address: string;
}

interface MapPickerDialogProps {
  open: boolean;
  onClose: () => void;
  initialCenter?: [number, number] | null;
  onConfirm: (location: PickedLocation) => void;
}

interface MapPickerContentProps {
  initialCenter?: [number, number] | null;
  onConfirm: (location: PickedLocation) => void;
  onCancel: () => void;
}

function MapPickerContent({
  initialCenter,
  onConfirm,
  onCancel,
}: MapPickerContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<AMap.Marker | null>(null);
  const geocoderRef = useRef<AMap.Geocoder | null>(null);
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  const center = useMemo<[number, number]>(
    () => initialCenter ?? [104.0633, 30.6598],
    // 仅依赖经纬度基本值，避免父组件每次渲染传入新数组导致地图反复重建
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialCenter?.[0], initialCenter?.[1]],
  );
  const { map, loading, error, hasKey } = useAmap({
    containerRef,
    center,
    zoom: 14,
  });

  const reverseGeocode = (lng: number, lat: number): void => {
    if (!window.AMap) return;
    if (!geocoderRef.current) {
      geocoderRef.current = new window.AMap.Geocoder({});
    }
    setGeocoding(true);
    geocoderRef.current.getAddress([lng, lat], (status, result) => {
      setGeocoding(false);
      const address =
        status === 'complete' && result?.regeocode
          ? result.regeocode.formattedAddress
          : '';
      setPicked({ longitude: lng, latitude: lat, address });
    });
  };

  const placeMarker = (lng: number, lat: number): void => {
    if (!map || !window.AMap) return;
    if (!markerRef.current) {
      markerRef.current = new window.AMap.Marker({
        position: [lng, lat],
        draggable: true,
        anchor: 'bottom-center',
      });
      map.add(markerRef.current);
      markerRef.current.on('dragend', (e: AMap.MarkerEvent) => {
        reverseGeocode(e.lnglat.getLng(), e.lnglat.getLat());
      });
    } else {
      markerRef.current.setPosition([lng, lat]);
    }
    reverseGeocode(lng, lat);
  };

  useEffect(() => {
    if (!map) return;
    const handleClick = (e: AMap.MapEvent): void => {
      placeMarker(e.lnglat.getLng(), e.lnglat.getLat());
    };
    map.on('click', handleClick);

    // 若带初始坐标（编辑已有记录/已填经纬度），预置标记
    if (initialCenter) {
      placeMarker(initialCenter[0], initialCenter[1]);
    }

    return () => {
      map.off('click', handleClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    return () => {
      markerRef.current = null;
      geocoderRef.current = null;
    };
  }, []);

  const handleConfirm = (): void => {
    if (!picked) return;
    onConfirm(picked);
  };

  if (!hasKey) {
    return (
      <div className="flex h-[360px] flex-col items-center justify-center gap-2 rounded-xl border-4 border-black bg-[#FFF9C4]">
        <MapPin className="h-10 w-10 text-black/40" />
        <p className="text-sm font-bold text-black/60">
          未配置高德地图 Key，暂无法使用地图选址
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-[360px] w-full overflow-hidden rounded-xl border-4 border-black shadow-[6px_6px_0_0_#000]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FFF9C4]/70">
            <Loader2 className="h-6 w-6 animate-spin text-black" />
          </div>
        )}
        {error && !loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#FFF9C4]/70">
            <p className="text-sm font-bold text-black/60">{error}</p>
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
        <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-widest text-black shadow-[3px_3px_0_0_#000]">
          <Crosshair className="mr-1 inline h-3 w-3" />
          点击地图选点
        </div>
      </div>

      <div className="rounded-xl border-4 border-black bg-[#FFF9C4] p-3">
        {picked ? (
          <div className="space-y-1">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#FF3B30]" />
              <span className="text-sm font-black text-black">
                {geocoding
                  ? '解析地址中…'
                  : picked.address || '该点位暂无地址信息'}
              </span>
            </div>
            <div className="pl-6 text-xs font-bold text-black/50">
              经度 {picked.longitude.toFixed(6)} · 纬度{' '}
              {picked.latitude.toFixed(6)}
            </div>
          </div>
        ) : (
          <p className="text-sm font-bold text-black/50">
            在地图上点击以选择位置，可拖动标记微调
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="rounded-xl border-4 border-black bg-white font-black uppercase text-black shadow-[4px_4px_0_0_#000] hover:bg-[#FFDE00] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
        >
          取消
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={!picked || geocoding}
          className="rounded-xl border-4 border-black bg-[#4CD964] font-black uppercase text-black shadow-[4px_4px_0_0_#000] hover:bg-[#4CD964] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_0_#000]"
        >
          确认此位置
        </Button>
      </DialogFooter>
    </div>
  );
}

export function MapPickerDialog({
  open,
  onClose,
  initialCenter,
  onConfirm,
}: MapPickerDialogProps) {
  const handleConfirm = (location: PickedLocation): void => {
    logger.info('地图选址确认', `${location.longitude},${location.latitude}`);
    onConfirm(location);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v: boolean) => !v && onClose()}>
      <DialogContent className="max-w-2xl rounded-2xl border-4 border-black shadow-[12px_12px_0_0_#000]">
        <DialogHeader>
          <DialogTitle className="pop-font text-2xl font-black uppercase tracking-tight">
            地图选址
          </DialogTitle>
          <DialogDescription className="font-bold text-black/50">
            在地图上点选位置，自动填充地址与经纬度
          </DialogDescription>
        </DialogHeader>
        {open && (
          <MapPickerContent
            initialCenter={initialCenter}
            onConfirm={handleConfirm}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
