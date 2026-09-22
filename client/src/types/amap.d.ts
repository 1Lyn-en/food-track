// Ambient type declarations for AMap JS API 2.0

interface Window {
  AMap: typeof AMap;
  _AMapSecurityConfig?: {
    securityJsCode?: string;
  };
}

declare namespace AMap {
  class Map {
    constructor(container: string | HTMLElement, options?: MapOptions);
    destroy(): void;
    setCenter(center: [number, number] | LngLat): void;
    getCenter(): LngLat;
    setZoom(zoom: number): void;
    getZoom(): number;
    lngLatToContainer(lnglat: [number, number] | LngLat): Pixel;
    containerToLngLat(pixel: Pixel): LngLat;
    on(event: string, handler: (e: MapEvent) => void): void;
    off(event: string, handler: (e: MapEvent) => void): void;
    add(overlay: Overlay | Overlay[]): void;
    remove(overlay: Overlay | Overlay[]): void;
    clearMap(): void;
    setFitView(
      overlays?: Overlay[] | null,
      immediately?: boolean,
      avoid?: number[],
      maxZoom?: number
    ): void;
  }

  interface MapOptions {
    center?: [number, number] | LngLat;
    zoom?: number;
    mapStyle?: string;
    viewMode?: '2D' | '3D';
    pitch?: number;
    rotation?: number;
    resizeEnable?: boolean;
    defaultCursor?: string;
  }

  interface MapEvent {
    lnglat: LngLat;
    pixel: Pixel;
    target: Map;
    type: string;
  }

  class LngLat {
    constructor(lng: number, lat: number);
    getLng(): number;
    getLat(): number;
    toArray(): [number, number];
  }

  class Pixel {
    constructor(x: number, y: number);
    getX(): number;
    getY(): number;
  }

  class Marker implements Overlay {
    constructor(options?: MarkerOptions);
    setPosition(position: [number, number] | LngLat): void;
    getPosition(): LngLat;
    setMap(map: Map | null): void;
    getMap(): Map | null;
    setContent(content: string | HTMLElement): void;
    getContent(): string | HTMLElement;
    setOffset(offset: Pixel): void;
    getOffset(): Pixel;
    on(event: string, handler: (e: MarkerEvent) => void): void;
    off(event: string, handler: (e: MarkerEvent) => void): void;
    show(): void;
    hide(): void;
    setExtData(data: unknown): void;
    getExtData(): unknown;
  }

  interface MarkerOptions {
    position?: [number, number] | LngLat;
    content?: string | HTMLElement;
    offset?: Pixel;
    anchor?: string;
    angle?: number;
    clickable?: boolean;
    draggable?: boolean;
    cursor?: string;
    extData?: unknown;
  }

  interface MarkerEvent {
    lnglat: LngLat;
    target: Marker;
    type: string;
  }

  class InfoWindow {
    constructor(options?: InfoWindowOptions);
    open(map: Map, position?: [number, number] | LngLat): void;
    close(): void;
    setContent(content: string | HTMLElement): void;
    getContent(): string | HTMLElement;
    setPosition(position: [number, number] | LngLat): void;
    getPosition(): LngLat;
    isOpen(): boolean;
    on(event: string, handler: (e: unknown) => void): void;
    off(event: string, handler: (e: unknown) => void): void;
  }

  interface InfoWindowOptions {
    content?: string | HTMLElement;
    offset?: Pixel;
    isCustom?: boolean;
    closeWhenClickMap?: boolean;
    showShadow?: boolean;
  }

  class HeatMap implements Overlay {
    constructor(map: Map, options?: HeatMapOptions);
    setDataSet(dataset: HeatMapDataSet): void;
    show(): void;
    hide(): void;
    setMap(map: Map | null): void;
    getMap(): Map | null;
  }

  interface HeatMapOptions {
    radius?: number;
    gradient?: Record<string, string>;
    opacity?: [number, number];
    zooms?: [number, number];
  }

  interface HeatMapDataSet {
    data: Array<{ lng: number; lat: number; count?: number }>;
    max?: number;
  }

  class AutoComplete {
    constructor(options?: AutoCompleteOptions);
    search(
      keyword: string,
      callback: (status: string, result: AutoCompleteResult) => void
    ): void;
  }

  interface AutoCompleteOptions {
    city?: string;
    input?: string | HTMLInputElement;
    output?: string;
  }

  interface AutoCompleteResult {
    tips: Array<AutoCompleteTip>;
  }

  interface AutoCompleteTip {
    id: string;
    name: string;
    district: string;
    address: string;
    location: LngLat;
    adcode: string;
  }

  class Geocoder {
    constructor(options?: GeocoderOptions);
    getAddress(
      location: [number, number] | LngLat,
      callback: (status: string, result: ReGeocodeResult) => void
    ): void;
    getLocation(
      address: string,
      callback: (status: string, result: GeocodeResult) => void
    ): void;
  }

  interface GeocoderOptions {
    city?: string;
    radius?: number;
  }

  interface ReGeocodeResult {
    info: string;
    regeocode?: {
      formattedAddress: string;
      addressComponent: {
        province: string;
        city: string;
        district: string;
        township: string;
        street: string;
        streetNumber: string;
      };
    };
  }

  interface GeocodeResult {
    info: string;
    geocodes: Array<{
      formattedAddress: string;
      location: LngLat;
      level: string;
    }>;
  }

  interface Overlay {
    setMap(map: Map | null): void;
    getMap(): Map | null;
    show(): void;
    hide(): void;
  }
}
