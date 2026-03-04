'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { FormData, MOVE_ITEM_OPTIONS, MoveItemType } from '@/types/form';
import {
  GoogleMap,
  Autocomplete,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api';

const LIBRARIES: ['places'] = ['places'];
const CAIRO_CENTER = { lat: 30.0444, lng: 31.2357 };
const mapContainerStyle = { width: '100%', height: '200px' };

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  gestureHandling: 'greedy',
  clickableIcons: false,
  styles: [
    { elementType: 'geometry', stylers: [{ color: '#f8f9fb' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#f8f9fb' }] },
    { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e5e7eb' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#e5e7eb' }] },
    { featureType: 'road.arterial', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9dbe9' }] },
    { featureType: 'water', elementType: 'labels.text', stylers: [{ visibility: 'off' }] },
  ],
};

const directionsRendererOptions: google.maps.DirectionsRendererOptions = {
  suppressMarkers: true,
  polylineOptions: { strokeColor: '#161E3C', strokeWeight: 4, strokeOpacity: 0.85 },
};

const PICKUP_MARKER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36'><circle cx='14' cy='13' r='12' fill='%23161E3C' stroke='white' stroke-width='2'/><circle cx='14' cy='13' r='5' fill='white'/><line x1='14' y1='24' x2='14' y2='36' stroke='%23161E3C' stroke-width='2'/></svg>`;
const DROPOFF_MARKER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36'><circle cx='14' cy='13' r='12' fill='%23E87A3A' stroke='white' stroke-width='2'/><circle cx='14' cy='13' r='5' fill='white'/><line x1='14' y1='24' x2='14' y2='36' stroke='%23E87A3A' stroke-width='2'/></svg>`;

interface StepTripProps {
  formData: FormData;
  onChange: (updates: Partial<FormData>) => void;
}

const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

function createMarker(
  position: google.maps.LatLng | google.maps.LatLngLiteral,
  map: google.maps.Map,
  svg: string,
): google.maps.Marker {
  return new google.maps.Marker({
    position,
    map,
    icon: {
      url: `data:image/svg+xml;charset=UTF-8,${svg}`,
      scaledSize: new google.maps.Size(28, 36),
      anchor: new google.maps.Point(14, 36),
    },
  });
}

/* ─── Drum Picker ─────────────────────────────────── */
const ITEM_H = 42;
const VISIBLE = 3;
const DRUM_H = ITEM_H * VISIBLE;
const PAD_H = ITEM_H * 1;

interface DrumItem { value: string; label: string; sub?: string }

function DrumColumn({ items, selected, onSelect }: { items: DrumItem[]; selected: string; onSelect: (v: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [liveIdx, setLiveIdx] = useState(() => Math.max(0, items.findIndex(i => i.value === selected)));

  // Set initial scroll position
  useEffect(() => {
    const idx = items.findIndex(i => i.value === selected);
    if (idx >= 0 && ref.current) {
      ref.current.scrollTop = idx * ITEM_H;
      setLiveIdx(idx);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when external value changes
  useEffect(() => {
    if (busy.current) return;
    const idx = items.findIndex(i => i.value === selected);
    if (idx >= 0 && ref.current && ref.current.scrollTop !== idx * ITEM_H) {
      ref.current.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
      setLiveIdx(idx);
    }
  }, [selected, items]);

  const handleScroll = () => {
    busy.current = true;
    if (!ref.current) return;
    const idx = Math.max(0, Math.min(Math.round(ref.current.scrollTop / ITEM_H), items.length - 1));
    setLiveIdx(idx);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      busy.current = false;
      const final = Math.max(0, Math.min(Math.round(ref.current!.scrollTop / ITEM_H), items.length - 1));
      if (items[final]?.value !== selected) onSelect(items[final].value);
    }, 120);
  };

  return (
    <div className="relative flex-1 overflow-hidden" style={{ height: DRUM_H }}>
      {/* Top fade */}
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none" style={{ height: PAD_H, background: 'linear-gradient(to bottom, #fff 40%, transparent)' }} />
      {/* Bottom fade */}
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: PAD_H, background: 'linear-gradient(to top, #fff 40%, transparent)' }} />
      {/* Selection band */}
      <div className="absolute inset-x-3 z-10 pointer-events-none rounded-xl bg-orange/10 border border-orange/20" style={{ top: PAD_H, height: ITEM_H }} />

      <div
        ref={ref}
        onScroll={handleScroll}
        style={{
          height: DRUM_H,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
        className="[&::-webkit-scrollbar]:hidden"
      >
        <div style={{ height: PAD_H }} />
        {items.map((item, i) => {
          const active = i === liveIdx;
          return (
            <div
              key={item.value}
              style={{ height: ITEM_H, scrollSnapAlign: 'center' }}
              className="flex flex-col items-center justify-center cursor-pointer select-none"
              onClick={() => {
                onSelect(item.value);
                ref.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' });
              }}
            >
              <span style={{
                fontSize: active ? 14 : 12,
                fontWeight: active ? 700 : 500,
                color: active ? '#E87A3A' : '#9ca3af',
                transition: 'all 0.15s',
                lineHeight: 1.2,
              }}>
                {item.label}
              </span>
              {item.sub && (
                <span style={{
                  fontSize: 10,
                  color: active ? '#E87A3A' : '#d1d5db',
                  opacity: active ? 0.7 : 1,
                  transition: 'all 0.15s',
                  marginTop: 1,
                }}>
                  {item.sub}
                </span>
              )}
            </div>
          );
        })}
        <div style={{ height: PAD_H }} />
      </div>
    </div>
  );
}

/* ─── Date / Time data ─────────────────────────────── */
function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }

function buildDateItems(): DrumItem[] {
  const items: DrumItem[] = [];
  const today = new Date();
  for (let i = 0; i < 21; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en', { weekday: 'long' });
    const sub = d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    items.push({ value, label, sub });
  }
  return items;
}

function buildTimeItems(): DrumItem[] {
  return Array.from({ length: 17 }, (_, i) => {
    const h = i + 6;
    const value = `${h < 10 ? '0' : ''}${h}:00`;
    const label = h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`;
    return { value, label };
  });
}

const DATE_ITEMS = buildDateItems();
const ALL_TIME_ITEMS = buildTimeItems();

function getTodayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/* ─── Item icons ─── */
const ITEM_ICONS: Record<MoveItemType, React.ReactNode> = {
  furniture: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/><path d="M3 12h18v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z"/><path d="M5 19v2M19 19v2"/></svg>,
  boxes: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8l9-4 9 4z"/><path d="M3 8l9 4 9-4M12 12v6"/></svg>,
  appliances: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="14" x2="20" y2="14"/><circle cx="12" cy="8" r="3"/><circle cx="12" cy="17.5" r="1"/></svg>,
  electronics: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  office: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M9 9h6M9 13h4"/></svg>,
  other: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="6" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></svg>,
};

/* ─── Map Section ─────────────────────────────────── */
function MapSection({ formData, onChange }: StepTripProps) {
  const { t } = useLanguage();
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: MAPS_API_KEY,
    libraries: LIBRARIES,
    preventGoogleFontsLoading: true,
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
  const [pinMode, setPinMode] = useState<'pickup' | 'dropoff' | null>(null);

  const pickupACRef = useRef<google.maps.places.Autocomplete | null>(null);
  const dropoffACRef = useRef<google.maps.places.Autocomplete | null>(null);
  const pickupInputRef = useRef<HTMLInputElement>(null);
  const dropoffInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const pickupMarkerRef = useRef<google.maps.Marker | null>(null);
  const dropoffMarkerRef = useRef<google.maps.Marker | null>(null);
  const pickupLatLngRef = useRef<google.maps.LatLng | null>(null);
  const dropoffLatLngRef = useRef<google.maps.LatLng | null>(null);

  const calculateRoute = useCallback(
    async (pickup: string | google.maps.LatLng, dropoff: string | google.maps.LatLng) => {
      if (!pickup || !dropoff) return;
      try {
        const result = await new google.maps.DirectionsService().route({
          origin: pickup, destination: dropoff, travelMode: google.maps.TravelMode.DRIVING,
        });
        setDirections(result);
        const leg = result.routes[0]?.legs[0];
        onChange({ distanceKm: Math.round((leg?.distance?.value ?? 0) / 1000) });
        if (leg?.distance?.text && leg?.duration?.text) setRouteInfo({ distance: leg.distance.text, duration: leg.duration.text });
        if (mapRef.current) {
          const bounds = new google.maps.LatLngBounds();
          result.routes[0].legs.forEach(l => { bounds.extend(l.start_location); bounds.extend(l.end_location); });
          mapRef.current.fitBounds(bounds, { top: 40, right: 30, bottom: 40, left: 30 });
        }
      } catch { /* ignore */ }
    },
    [onChange]
  );

  const placePickupMarker = useCallback((latLng: google.maps.LatLng) => {
    if (!mapRef.current) return;
    pickupMarkerRef.current?.setMap(null);
    pickupMarkerRef.current = createMarker(latLng, mapRef.current, PICKUP_MARKER_SVG);
  }, []);

  const placeDropoffMarker = useCallback((latLng: google.maps.LatLng) => {
    if (!mapRef.current) return;
    dropoffMarkerRef.current?.setMap(null);
    dropoffMarkerRef.current = createMarker(latLng, mapRef.current, DROPOFF_MARKER_SVG);
  }, []);

  const handleMapClick = useCallback(async (e: google.maps.MapMouseEvent) => {
    if (!pinMode || !e.latLng) return;
    const latLng = e.latLng;
    let address = `${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`;
    try { const r = await new google.maps.Geocoder().geocode({ location: latLng }); if (r.results[0]) address = r.results[0].formatted_address; } catch { /* fallback */ }
    if (pinMode === 'pickup') {
      pickupLatLngRef.current = latLng; placePickupMarker(latLng);
      if (pickupInputRef.current) pickupInputRef.current.value = address;
      onChange({ pickupAddress: address });
      const dropoff = dropoffLatLngRef.current || dropoffInputRef.current?.value || formData.dropoffAddress;
      if (!dropoff) setPinMode('dropoff');
      else { setPinMode(null); calculateRoute(latLng, dropoff as google.maps.LatLng); }
    } else {
      dropoffLatLngRef.current = latLng; placeDropoffMarker(latLng);
      if (dropoffInputRef.current) dropoffInputRef.current.value = address;
      onChange({ dropoffAddress: address });
      const pickup = pickupLatLngRef.current || pickupInputRef.current?.value || formData.pickupAddress;
      setPinMode(null);
      if (pickup) calculateRoute(pickup as google.maps.LatLng, latLng);
    }
  }, [pinMode, onChange, formData.dropoffAddress, formData.pickupAddress, calculateRoute, placePickupMarker, placeDropoffMarker]);

  const onPickupPlaceChanged = useCallback(() => {
    if (!pickupACRef.current) return;
    const place = pickupACRef.current.getPlace();
    const address = place.formatted_address || place.name || '';
    const latLng = place.geometry?.location ?? null;
    if (pickupInputRef.current) pickupInputRef.current.value = address;
    onChange({ pickupAddress: address });
    if (latLng) { pickupLatLngRef.current = latLng; placePickupMarker(latLng); }
    const dropoff = dropoffLatLngRef.current || dropoffInputRef.current?.value || formData.dropoffAddress;
    if (dropoff) calculateRoute(latLng || address, dropoff as string);
  }, [onChange, formData.dropoffAddress, calculateRoute, placePickupMarker]);

  const onDropoffPlaceChanged = useCallback(() => {
    if (!dropoffACRef.current) return;
    const place = dropoffACRef.current.getPlace();
    const address = place.formatted_address || place.name || '';
    const latLng = place.geometry?.location ?? null;
    if (dropoffInputRef.current) dropoffInputRef.current.value = address;
    onChange({ dropoffAddress: address });
    if (latLng) { dropoffLatLngRef.current = latLng; placeDropoffMarker(latLng); }
    const pickup = pickupLatLngRef.current || pickupInputRef.current?.value || formData.pickupAddress;
    if (pickup) calculateRoute(pickup as string, latLng || address);
  }, [onChange, formData.pickupAddress, calculateRoute, placeDropoffMarker]);

  const inputCls = 'w-full bg-transparent text-navy text-sm placeholder:text-muted/50 outline-none';

  if (!MAPS_API_KEY || loadError) {
    return (
      <div className="space-y-2">
        {!MAPS_API_KEY && <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800">Add <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to .env.local</div>}
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <span className="w-2 h-2 rounded-full bg-navy shrink-0" />
            <input className={inputCls} value={formData.pickupAddress} onChange={e => onChange({ pickupAddress: e.target.value })} placeholder={t('steps.trip.pickupPlaceholder')} />
          </div>
          <div className="border-t border-border/60 mx-3" />
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <span className="w-2 h-2 rounded-sm bg-orange shrink-0" />
            <input className={inputCls} value={formData.dropoffAddress} onChange={e => onChange({ dropoffAddress: e.target.value })} placeholder={t('steps.trip.dropoffPlaceholder')} />
          </div>
        </div>
        <div className="rounded-xl bg-surface h-[160px] flex items-center justify-center border border-border/50">
          <span className="text-muted text-[10px]">Map requires API key</span>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="space-y-2">
        <div className="h-[84px] rounded-xl bg-surface animate-pulse" />
        <div className="h-[200px] rounded-xl bg-surface animate-pulse" />
      </div>
    );
  }

  const PinIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="11" height="14" viewBox="0 0 12 16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
      <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 11 5 11s5-7.25 5-11C11 2.24 8.76 0 6 0zm0 6.5A1.5 1.5 0 1 1 6 3.5a1.5 1.5 0 0 1 0 3z"/>
    </svg>
  );

  return (
    <div className="space-y-2">
      {/* Connected address inputs */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors ${pinMode === 'pickup' ? 'bg-navy/[0.04] border-l-2 border-l-navy -ml-px pl-[14px]' : ''}`}>
          <span className="w-2 h-2 rounded-full bg-navy shrink-0" />
          <div className="flex-1 min-w-0">
            <Autocomplete onLoad={ref => { pickupACRef.current = ref; }} onPlaceChanged={onPickupPlaceChanged}>
              <input ref={pickupInputRef} className={inputCls} defaultValue={formData.pickupAddress} placeholder={t('steps.trip.pickupPlaceholder')} />
            </Autocomplete>
          </div>
          <button type="button" onClick={() => setPinMode(p => p === 'pickup' ? null : 'pickup')}
            className={`shrink-0 p-1 rounded-md transition-all cursor-pointer ${pinMode === 'pickup' ? 'text-navy bg-navy/10' : 'text-muted/40 hover:text-navy/60'}`}
            title="Drop pin on map">
            <PinIcon filled={pinMode === 'pickup'} />
          </button>
        </div>
        <div className="border-t border-border/60 mx-3" />
        <div className={`flex items-center gap-2.5 px-3 py-2.5 transition-colors ${pinMode === 'dropoff' ? 'bg-orange/[0.04] border-l-2 border-l-orange -ml-px pl-[14px]' : ''}`}>
          <span className="w-2 h-2 rounded-sm bg-orange shrink-0" />
          <div className="flex-1 min-w-0">
            <Autocomplete onLoad={ref => { dropoffACRef.current = ref; }} onPlaceChanged={onDropoffPlaceChanged}>
              <input ref={dropoffInputRef} className={inputCls} defaultValue={formData.dropoffAddress} placeholder={t('steps.trip.dropoffPlaceholder')} />
            </Autocomplete>
          </div>
          <button type="button" onClick={() => setPinMode(p => p === 'dropoff' ? null : 'dropoff')}
            className={`shrink-0 p-1 rounded-md transition-all cursor-pointer ${pinMode === 'dropoff' ? 'text-orange bg-orange/10' : 'text-muted/40 hover:text-orange/60'}`}
            title="Drop pin on map">
            <PinIcon filled={pinMode === 'dropoff'} />
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden relative" style={{ cursor: pinMode ? 'crosshair' : 'grab' }}>
        <GoogleMap mapContainerStyle={mapContainerStyle} center={CAIRO_CENTER} zoom={12} options={mapOptions} onLoad={map => { mapRef.current = map; }} onClick={handleMapClick}>
          {directions && <DirectionsRenderer directions={directions} options={directionsRendererOptions} />}
        </GoogleMap>
        {pinMode && (
          <div className={`absolute top-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-semibold text-white pointer-events-none ${pinMode === 'pickup' ? 'bg-navy' : 'bg-orange'}`}>
            {pinMode === 'pickup' ? 'Tap map for pickup' : 'Tap map for drop-off'}
          </div>
        )}
        {routeInfo && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1 text-[10px] font-semibold text-navy border border-border/40">
            <span>{routeInfo.distance}</span><span className="opacity-30">|</span><span>{routeInfo.duration}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main Step ─────────────────────────────────── */
export function StepTrip({ formData, onChange }: StepTripProps) {
  const { t } = useLanguage();

  // Filter time items: if today is selected, only show future hours (current hour + 1 min)
  const timeItems = useMemo(() => {
    const todayStr = getTodayStr();
    const selectedDate = formData.moveDate || DATE_ITEMS[0].value;
    if (selectedDate !== todayStr) return ALL_TIME_ITEMS;
    const currentHour = new Date().getHours();
    const filtered = ALL_TIME_ITEMS.filter(item => parseInt(item.value) > currentHour);
    return filtered.length > 0 ? filtered : ALL_TIME_ITEMS; // fallback if past 10 PM
  }, [formData.moveDate]);

  // If the currently selected time is no longer valid (e.g. user switched to today
  // and the saved time is in the past), auto-advance to the first valid slot.
  useEffect(() => {
    if (!timeItems.find(i => i.value === formData.moveTime)) {
      onChange({ moveTime: timeItems[0]?.value ?? '' });
    }
  }, [timeItems, formData.moveTime, onChange]);

  const selectedTime = formData.moveTime && timeItems.find(i => i.value === formData.moveTime)
    ? formData.moveTime
    : timeItems[0]?.value ?? '';

  return (
    <div className="p-4 space-y-3">
      {/* Addresses + Map */}
      <MapSection formData={formData} onChange={onChange} />

      {/* What are you moving? */}
      <div className="bg-white rounded-xl px-3 pt-2.5 pb-3" style={{ boxShadow: '0 1px 3px rgba(22,30,60,0.06)' }}>
        <p className="text-[10px] font-bold text-muted uppercase tracking-wide mb-2">{t('steps.trip.movingWhat')}</p>
        <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-hide">
          {MOVE_ITEM_OPTIONS.map(item => {
            const selected = formData.moveItems === item;
            return (
              <button key={item} type="button"
                onClick={() => onChange({ moveItems: item, moveItemsOther: item === 'other' ? formData.moveItemsOther : '' })}
                className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${selected ? 'bg-orange text-white' : 'bg-surface text-navy border border-border hover:border-orange/30'}`}>
                <span className={selected ? 'text-white/80' : 'text-muted'}>{ITEM_ICONS[item]}</span>
                {t(`steps.trip.items.${item}`)}
              </button>
            );
          })}
        </div>
        {formData.moveItems === 'other' && (
          <input className="mt-2 w-full px-2.5 py-1.5 rounded-lg border border-border bg-surface text-navy text-xs placeholder:text-muted/50 outline-none focus:ring-1 focus:ring-orange/30 focus:border-orange transition-all"
            value={formData.moveItemsOther} onChange={e => onChange({ moveItemsOther: e.target.value })}
            placeholder={t('steps.trip.otherPlaceholder')} />
        )}
      </div>

      {/* When — drum scroll */}
      <div className="bg-white rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 3px rgba(22,30,60,0.06)' }}>
        {/* Column headers */}
        <div className="flex border-b border-border/50">
          <div className="flex-1 text-center py-2 text-[10px] font-bold text-muted uppercase tracking-wide">{t('steps.trip.date')}</div>
          <div className="w-px bg-border/50" />
          <div className="flex-1 text-center py-2 text-[10px] font-bold text-muted uppercase tracking-wide">{t('steps.trip.time')}</div>
        </div>
        {/* Drums */}
        <div className="flex">
          <DrumColumn
            items={DATE_ITEMS}
            selected={formData.moveDate || DATE_ITEMS[0].value}
            onSelect={v => onChange({ moveDate: v })}
          />
          <div className="w-px bg-border/40" />
          <DrumColumn
            items={timeItems}
            selected={selectedTime}
            onSelect={v => onChange({ moveTime: v })}
          />
        </div>
      </div>
    </div>
  );
}
