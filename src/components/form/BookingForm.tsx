'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import {
  GoogleMap,
  Autocomplete,
  DirectionsRenderer,
  useJsApiLoader,
} from '@react-google-maps/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/i18n/LanguageContext';
import { TRUCK_TYPES } from '@/lib/constants';
import { calculateTotalPrice } from '@/lib/pricing';
import { FormData, TruckType, MOVE_ITEM_OPTIONS, MoveItemType } from '@/types/form';
import { StepConfirmation } from './StepConfirmation';
import { isValidEgyptPhone } from './StepContact';

/* ─── Constants ───────────────────────────────────── */
const LIBRARIES: ['places'] = ['places'];
const CAIRO_CENTER = { lat: 30.0444, lng: 31.2357 };
const MAP_CONTAINER_STYLE = { width: '100%', height: '220px' };
const MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const MAP_OPTIONS: google.maps.MapOptions = {
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

const DIRECTIONS_RENDERER_OPTIONS: google.maps.DirectionsRendererOptions = {
  suppressMarkers: true,
  polylineOptions: { strokeColor: '#161E3C', strokeWeight: 4, strokeOpacity: 0.85 },
};

const PICKUP_MARKER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36'><circle cx='14' cy='13' r='12' fill='%23161E3C' stroke='white' stroke-width='2'/><circle cx='14' cy='13' r='5' fill='white'/><line x1='14' y1='24' x2='14' y2='36' stroke='%23161E3C' stroke-width='2'/></svg>`;
const DROPOFF_MARKER_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='36' viewBox='0 0 28 36'><circle cx='14' cy='13' r='12' fill='%23E87A3A' stroke='white' stroke-width='2'/><circle cx='14' cy='13' r='5' fill='white'/><line x1='14' y1='24' x2='14' y2='36' stroke='%23E87A3A' stroke-width='2'/></svg>`;

const TRUCK_IMAGES: Record<string, string> = {
  'dababa': '/trucks/Dababa_Open_Main.avif',
  'closed-dababa': '/trucks/Dababa_Open_Main.avif',
  'jumbo': '/trucks/Jumbo_Open_Main.avif',
  'closed-jumbo': '/trucks/Jumbo_Open_Main.avif',
};

const ITEM_ICONS: Record<MoveItemType, React.ReactNode> = {
  furniture: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5"/><path d="M3 12h18v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z"/><path d="M5 19v2M19 19v2"/></svg>,
  boxes: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8l9-4 9 4z"/><path d="M3 8l9 4 9-4M12 12v6"/></svg>,
  appliances: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="4" y1="14" x2="20" y2="14"/><circle cx="12" cy="8" r="3"/><circle cx="12" cy="17.5" r="1"/></svg>,
  electronics: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
  office: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M9 9h6M9 13h4"/></svg>,
  other: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="6" cy="12" r="1"/><circle cx="18" cy="12" r="1"/></svg>,
};

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

  useEffect(() => {
    const idx = items.findIndex(i => i.value === selected);
    if (idx >= 0 && ref.current) { ref.current.scrollTop = idx * ITEM_H; setLiveIdx(idx); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <div className="absolute inset-x-0 top-0 z-10 pointer-events-none" style={{ height: PAD_H, background: 'linear-gradient(to bottom, #fff 40%, transparent)' }} />
      <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none" style={{ height: PAD_H, background: 'linear-gradient(to top, #fff 40%, transparent)' }} />
      <div className="absolute inset-x-3 z-10 pointer-events-none rounded-xl bg-orange/10 border border-orange/20" style={{ top: PAD_H, height: ITEM_H }} />
      <div ref={ref} onScroll={handleScroll} style={{ height: DRUM_H, overflowY: 'scroll', scrollSnapType: 'y mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties} className="[&::-webkit-scrollbar]:hidden">
        <div style={{ height: PAD_H }} />
        {items.map((item, i) => {
          const active = i === liveIdx;
          return (
            <div key={item.value} style={{ height: ITEM_H, scrollSnapAlign: 'center' }} className="flex flex-col items-center justify-center cursor-pointer select-none"
              onClick={() => { onSelect(item.value); ref.current?.scrollTo({ top: i * ITEM_H, behavior: 'smooth' }); }}>
              <span style={{ fontSize: active ? 14 : 12, fontWeight: active ? 700 : 500, color: active ? '#E87A3A' : '#9ca3af', transition: 'all 0.15s', lineHeight: 1.2 }}>{item.label}</span>
              {item.sub && <span style={{ fontSize: 10, color: active ? '#E87A3A' : '#d1d5db', opacity: active ? 0.7 : 1, transition: 'all 0.15s', marginTop: 1 }}>{item.sub}</span>}
            </div>
          );
        })}
        <div style={{ height: PAD_H }} />
      </div>
    </div>
  );
}

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

/* ─── Marker helper ───────────────────────────────── */
function createMarker(position: google.maps.LatLng | google.maps.LatLngLiteral, map: google.maps.Map, svg: string): google.maps.Marker {
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

/* ─── Add-on Icons ────────────────────────────────── */
const ManpowerIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const PackagingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const LiftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 11 12 6 7 11"/><line x1="12" y1="6" x2="12" y2="18"/><path d="M5 20h14"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─── Initial form data ───────────────────────────── */
const INITIAL_FORM_DATA: FormData = {
  pickupAddress: '',
  dropoffAddress: '',
  moveDate: '',
  moveTime: '',
  moveItems: '',
  moveItemsOther: '',
  distanceKm: 0,
  truckType: '',
  manpower: { enabled: false, count: 1 },
  packaging: false,
  liftCrane: false,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  notes: '',
};

/* ─── Section Header ──────────────────────────────── */
function SectionHeader({ label }: { label: string }) {
  return (
    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-3">{label}</p>
  );
}

/* ─── Main Component ──────────────────────────────── */
export function BookingForm() {
  const { t, dir } = useLanguage();
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [pickupMode, setPickupMode] = useState<'now' | 'scheduled'>('now');
  const [phoneError, setPhoneError] = useState('');
  const [phoneTouched, setPhoneTouched] = useState(false);

  const updateFormData = useCallback((updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  /* ─── Time items ── */
  const timeItems = useMemo(() => {
    const todayStr = getTodayStr();
    const selectedDate = formData.moveDate || DATE_ITEMS[0].value;
    if (selectedDate !== todayStr) return ALL_TIME_ITEMS;
    const currentHour = new Date().getHours();
    const filtered = ALL_TIME_ITEMS.filter(item => parseInt(item.value) > currentHour);
    return filtered.length > 0 ? filtered : ALL_TIME_ITEMS;
  }, [formData.moveDate]);

  useEffect(() => {
    if (pickupMode === 'scheduled' && !timeItems.find(i => i.value === formData.moveTime)) {
      updateFormData({ moveTime: timeItems[0]?.value ?? '' });
    }
  }, [timeItems, formData.moveTime, pickupMode, updateFormData]);

  const selectedTime = formData.moveTime && timeItems.find(i => i.value === formData.moveTime)
    ? formData.moveTime : timeItems[0]?.value ?? '';

  /* ─── Maps ── */
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

  const calculateRoute = useCallback(async (pickup: string | google.maps.LatLng, dropoff: string | google.maps.LatLng) => {
    if (!pickup || !dropoff) return;
    try {
      const result = await new google.maps.DirectionsService().route({
        origin: pickup, destination: dropoff, travelMode: google.maps.TravelMode.DRIVING,
      });
      setDirections(result);
      const leg = result.routes[0]?.legs[0];
      updateFormData({ distanceKm: Math.round((leg?.distance?.value ?? 0) / 1000) });
      if (leg?.distance?.text && leg?.duration?.text) setRouteInfo({ distance: leg.distance.text, duration: leg.duration.text });
      if (mapRef.current) {
        const bounds = new google.maps.LatLngBounds();
        result.routes[0].legs.forEach(l => { bounds.extend(l.start_location); bounds.extend(l.end_location); });
        mapRef.current.fitBounds(bounds, { top: 40, right: 30, bottom: 40, left: 30 });
      }
    } catch { /* ignore */ }
  }, [updateFormData]);

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
      updateFormData({ pickupAddress: address });
      const dropoff = dropoffLatLngRef.current || dropoffInputRef.current?.value || formData.dropoffAddress;
      if (!dropoff) setPinMode('dropoff');
      else { setPinMode(null); calculateRoute(latLng, dropoff as google.maps.LatLng); }
    } else {
      dropoffLatLngRef.current = latLng; placeDropoffMarker(latLng);
      if (dropoffInputRef.current) dropoffInputRef.current.value = address;
      updateFormData({ dropoffAddress: address });
      const pickup = pickupLatLngRef.current || pickupInputRef.current?.value || formData.pickupAddress;
      setPinMode(null);
      if (pickup) calculateRoute(pickup as google.maps.LatLng, latLng);
    }
  }, [pinMode, updateFormData, formData.dropoffAddress, formData.pickupAddress, calculateRoute, placePickupMarker, placeDropoffMarker]);

  const onPickupPlaceChanged = useCallback(() => {
    if (!pickupACRef.current) return;
    const place = pickupACRef.current.getPlace();
    const address = place.formatted_address || place.name || '';
    const latLng = place.geometry?.location ?? null;
    if (pickupInputRef.current) pickupInputRef.current.value = address;
    updateFormData({ pickupAddress: address });
    if (latLng) { pickupLatLngRef.current = latLng; placePickupMarker(latLng); }
    const dropoff = dropoffLatLngRef.current || dropoffInputRef.current?.value || formData.dropoffAddress;
    if (dropoff) calculateRoute(latLng || address, dropoff as string);
  }, [updateFormData, formData.dropoffAddress, calculateRoute, placePickupMarker]);

  const onDropoffPlaceChanged = useCallback(() => {
    if (!dropoffACRef.current) return;
    const place = dropoffACRef.current.getPlace();
    const address = place.formatted_address || place.name || '';
    const latLng = place.geometry?.location ?? null;
    if (dropoffInputRef.current) dropoffInputRef.current.value = address;
    updateFormData({ dropoffAddress: address });
    if (latLng) { dropoffLatLngRef.current = latLng; placeDropoffMarker(latLng); }
    const pickup = pickupLatLngRef.current || pickupInputRef.current?.value || formData.pickupAddress;
    if (pickup) calculateRoute(pickup as string, latLng || address);
  }, [updateFormData, formData.pickupAddress, calculateRoute, placeDropoffMarker]);

  /* ─── Pricing ── */
  const pricing = useMemo(() => {
    if (!formData.truckType || formData.distanceKm === 0) return null;
    return calculateTotalPrice({
      truckType: formData.truckType as TruckType,
      distanceKm: formData.distanceKm,
      manpowerCount: formData.manpower.enabled ? formData.manpower.count : 0,
      packaging: formData.packaging,
      liftCrane: formData.liftCrane,
    });
  }, [formData.truckType, formData.distanceKm, formData.manpower, formData.packaging, formData.liftCrane]);

  /* ─── Validation ── */
  const canSubmit =
    formData.pickupAddress.trim().length > 0 &&
    formData.dropoffAddress.trim().length > 0 &&
    formData.truckType !== '' &&
    formData.contactName.trim().length > 0 &&
    isValidEgyptPhone(formData.contactPhone);

  /* ─── Submit ── */
  const handleSubmit = async () => {
    if (!canSubmit) return;
    const payload = {
      ...formData,
      pickupMode,
      estimatedPrice: pricing?.total ?? null,
    };
    try {
      await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch { /* non-blocking */ }
    setSubmitted(true);
  };

  /* ─── Render confirmation ── */
  if (submitted) {
    return <StepConfirmation onReset={() => { setFormData(INITIAL_FORM_DATA); setSubmitted(false); setPinMode(null); setRouteInfo(null); setDirections(null); }} />;
  }

  /* ─── Input styles ── */
  const inputCls = 'w-full bg-transparent text-navy text-sm placeholder:text-muted/50 outline-none';

  const PinIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="11" height="14" viewBox="0 0 12 16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={filled ? 0 : 1.5}>
      <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 11 5 11s5-7.25 5-11C11 2.24 8.76 0 6 0zm0 6.5A1.5 1.5 0 1 1 6 3.5a1.5 1.5 0 0 1 0 3z"/>
    </svg>
  );

  return (
    <div className="w-full rounded-3xl overflow-hidden bg-white" style={{ boxShadow: '0 4px 24px rgba(22,30,60,0.10), 0 1px 4px rgba(22,30,60,0.06)' }} dir={dir}>
      <div className="divide-y divide-border">

        {/* ── Section 1: Locations ── */}
        <div className="px-5 pt-5 pb-4">
          <SectionHeader label={t('form.locations')} />

          {!MAPS_API_KEY || loadError ? (
            /* Fallback: plain text inputs */
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <span className="w-2 h-2 rounded-full bg-navy shrink-0" />
                <input className={inputCls} value={formData.pickupAddress} onChange={e => updateFormData({ pickupAddress: e.target.value })} placeholder={t('steps.trip.pickupPlaceholder')} />
              </div>
              <div className="border-t border-border/60 mx-3" />
              <div className="flex items-center gap-2.5 px-3 py-2.5">
                <span className="w-2 h-2 rounded-sm bg-orange shrink-0" />
                <input className={inputCls} value={formData.dropoffAddress} onChange={e => updateFormData({ dropoffAddress: e.target.value })} placeholder={t('steps.trip.dropoffPlaceholder')} />
              </div>
            </div>
          ) : !isLoaded ? (
            <div className="space-y-2">
              <div className="h-[84px] rounded-xl bg-surface animate-pulse" />
              <div className="h-[220px] rounded-xl bg-surface animate-pulse" />
            </div>
          ) : (
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
                    className={`shrink-0 p-1 rounded-md transition-all cursor-pointer ${pinMode === 'pickup' ? 'text-navy bg-navy/10' : 'text-muted/40 hover:text-navy/60'}`}>
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
                    className={`shrink-0 p-1 rounded-md transition-all cursor-pointer ${pinMode === 'dropoff' ? 'text-orange bg-orange/10' : 'text-muted/40 hover:text-orange/60'}`}>
                    <PinIcon filled={pinMode === 'dropoff'} />
                  </button>
                </div>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden relative" style={{ cursor: pinMode ? 'crosshair' : 'grab' }}>
                <GoogleMap mapContainerStyle={MAP_CONTAINER_STYLE} center={CAIRO_CENTER} zoom={12} options={MAP_OPTIONS} onLoad={map => { mapRef.current = map; }} onClick={handleMapClick}>
                  {directions && <DirectionsRenderer directions={directions} options={DIRECTIONS_RENDERER_OPTIONS} />}
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
          )}
        </div>

        {/* ── Section 2: Pickup time ── */}
        <div className="px-5 py-4">
          <SectionHeader label={t('form.time.label')} />
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => { setPickupMode('now'); updateFormData({ moveDate: '', moveTime: '' }); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${pickupMode === 'now' ? 'bg-navy text-white shadow-sm' : 'bg-surface border border-border text-muted hover:border-navy/30'}`}
            >
              {t('form.time.now')}
            </button>
            <button
              type="button"
              onClick={() => { setPickupMode('scheduled'); if (!formData.moveDate) updateFormData({ moveDate: DATE_ITEMS[0].value, moveTime: timeItems[0]?.value ?? '' }); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${pickupMode === 'scheduled' ? 'bg-navy text-white shadow-sm' : 'bg-surface border border-border text-muted hover:border-navy/30'}`}
            >
              {t('form.time.schedule')}
            </button>
          </div>

          <AnimatePresence>
            {pickupMode === 'scheduled' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-xl overflow-hidden border border-border">
                  <div className="flex border-b border-border/50">
                    <div className="flex-1 text-center py-2 text-[10px] font-bold text-muted uppercase tracking-wide">{t('steps.trip.date')}</div>
                    <div className="w-px bg-border/50" />
                    <div className="flex-1 text-center py-2 text-[10px] font-bold text-muted uppercase tracking-wide">{t('steps.trip.time')}</div>
                  </div>
                  <div className="flex">
                    <DrumColumn items={DATE_ITEMS} selected={formData.moveDate || DATE_ITEMS[0].value} onSelect={v => updateFormData({ moveDate: v })} />
                    <div className="w-px bg-border/40" />
                    <DrumColumn items={timeItems} selected={selectedTime} onSelect={v => updateFormData({ moveTime: v })} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Section 3: What are you moving? ── */}
        <div className="px-5 py-4">
          <SectionHeader label={t('steps.trip.movingWhat')} />
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 -mx-1 px-1 scrollbar-hide">
            {MOVE_ITEM_OPTIONS.map(item => {
              const selected = formData.moveItems === item;
              return (
                <button key={item} type="button"
                  onClick={() => updateFormData({ moveItems: item, moveItemsOther: item === 'other' ? formData.moveItemsOther : '' })}
                  className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${selected ? 'bg-orange text-white shadow-sm' : 'bg-surface text-navy border border-border hover:border-orange/30'}`}>
                  <span className={selected ? 'text-white/80' : 'text-muted'}>{ITEM_ICONS[item]}</span>
                  {t(`steps.trip.items.${item}`)}
                </button>
              );
            })}
          </div>
          {formData.moveItems === 'other' && (
            <input className="mt-2 w-full px-3 py-2 rounded-xl border border-border bg-surface text-navy text-sm placeholder:text-muted/50 outline-none focus:ring-1 focus:ring-orange/30 focus:border-orange transition-all"
              value={formData.moveItemsOther} onChange={e => updateFormData({ moveItemsOther: e.target.value })}
              placeholder={t('steps.trip.otherPlaceholder')} />
          )}
        </div>

        {/* ── Section 4: Vehicle ── */}
        <div className="px-5 py-4">
          <SectionHeader label={t('form.vehicle.title')} />
          <div className="space-y-2">
            {TRUCK_TYPES.map(truck => {
              const selected = formData.truckType === truck.id;
              return (
                <motion.button
                  key={truck.id}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => updateFormData({ truckType: truck.id as TruckType })}
                  className={`w-full text-left flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-200 cursor-pointer ${selected ? 'ring-2 ring-orange bg-orange/[0.04] shadow-sm shadow-orange/10' : 'ring-1 ring-border bg-white hover:ring-navy/20'}`}
                >
                  {/* Truck image */}
                  <div className="relative w-20 h-14 shrink-0 rounded-xl overflow-hidden bg-surface">
                    <Image
                      src={TRUCK_IMAGES[truck.id]}
                      alt={t(`trucks.${truck.labelKey}`)}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-sm ${selected ? 'text-navy' : 'text-navy/80'}`}>{t(`trucks.${truck.labelKey}`)}</h3>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${selected ? 'bg-orange text-white' : 'bg-surface text-navy/50'}`}>{truck.capacity}</span>
                    </div>
                    <p className="text-[11px] text-muted mt-0.5 leading-tight">{t(`trucks.${truck.descriptionKey}`)}</p>
                    <span className="inline-block mt-1.5 text-[10px] font-semibold text-navy/60 bg-navy/[0.06] px-2 py-0.5 rounded-full">
                      {truck.dimensions}
                    </span>
                  </div>

                  {/* Check */}
                  <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${selected ? 'bg-orange' : 'border-2 border-border'}`}>
                    {selected && <CheckIcon />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Section 5: Add-ons ── */}
        <div className="px-5 py-4">
          <SectionHeader label={t('form.addons.title')} />
          <div className="space-y-2">
            {/* Manpower */}
            <div className={`rounded-2xl bg-white transition-all duration-200 overflow-hidden ${formData.manpower.enabled ? 'ring-1 ring-orange shadow-sm shadow-orange/10' : 'ring-1 ring-border'}`}>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <div className={`shrink-0 transition-colors duration-200 ${formData.manpower.enabled ? 'text-orange' : 'text-muted/40'}`}><ManpowerIcon /></div>
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm transition-colors ${formData.manpower.enabled ? 'text-navy' : 'text-navy/60'}`}>{t('steps.services.manpower')}</div>
                  <div className="text-[11px] text-muted mt-0.5 leading-tight">{t('steps.services.manpowerDesc')}</div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button type="button"
                    onClick={() => { const n = formData.manpower.enabled ? formData.manpower.count - 1 : 0; updateFormData({ manpower: n <= 0 ? { count: 1, enabled: false } : { count: n, enabled: true } }); }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all cursor-pointer ${formData.manpower.enabled ? 'bg-navy/8 text-navy hover:bg-navy/15' : 'bg-surface text-muted/40'}`}>−</button>
                  <span className={`w-5 text-center text-sm font-bold tabular-nums transition-colors ${formData.manpower.enabled ? 'text-navy' : 'text-muted/40'}`}>{formData.manpower.enabled ? formData.manpower.count : 0}</span>
                  <button type="button"
                    onClick={() => { const n = formData.manpower.enabled ? Math.min(formData.manpower.count + 1, 10) : 1; updateFormData({ manpower: { count: n, enabled: true } }); }}
                    className="w-8 h-8 rounded-full bg-orange text-white flex items-center justify-center text-base font-bold cursor-pointer hover:bg-orange/90 transition-all">+</button>
                </div>
              </div>
              <AnimatePresence>
                {formData.manpower.enabled && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
                    <div className="mx-4 mb-3 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange/[0.06] border border-orange/15">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-orange/70 shrink-0"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      <span className="text-[11px] text-navy/70 font-medium">{formData.manpower.count} {t('steps.services.people')}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Packaging */}
            <button type="button" onClick={() => updateFormData({ packaging: !formData.packaging })}
              className={`w-full text-left rounded-2xl bg-white flex items-center gap-3 px-4 py-3.5 transition-all duration-200 cursor-pointer ${formData.packaging ? 'ring-1 ring-orange shadow-sm shadow-orange/10' : 'ring-1 ring-border hover:ring-navy/20'}`}>
              <div className={`shrink-0 transition-colors duration-200 ${formData.packaging ? 'text-orange' : 'text-muted/40'}`}><PackagingIcon /></div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm transition-colors ${formData.packaging ? 'text-navy' : 'text-navy/60'}`}>{t('steps.services.packaging')}</div>
                <div className="text-[11px] text-muted mt-0.5 leading-tight">{t('steps.services.packagingDesc')}</div>
              </div>
              <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${formData.packaging ? 'bg-orange' : 'border-2 border-border'}`}>
                {formData.packaging && <CheckIcon />}
              </div>
            </button>

            {/* Lift Crane */}
            <button type="button" onClick={() => updateFormData({ liftCrane: !formData.liftCrane })}
              className={`w-full text-left rounded-2xl bg-white flex items-center gap-3 px-4 py-3.5 transition-all duration-200 cursor-pointer ${formData.liftCrane ? 'ring-1 ring-orange shadow-sm shadow-orange/10' : 'ring-1 ring-border hover:ring-navy/20'}`}>
              <div className={`shrink-0 transition-colors duration-200 ${formData.liftCrane ? 'text-orange' : 'text-muted/40'}`}><LiftIcon /></div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm transition-colors ${formData.liftCrane ? 'text-navy' : 'text-navy/60'}`}>{t('steps.services.lift')}</div>
                <div className="text-[11px] text-muted mt-0.5 leading-tight">{t('steps.services.liftDesc')}</div>
              </div>
              <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${formData.liftCrane ? 'bg-orange' : 'border-2 border-border'}`}>
                {formData.liftCrane && <CheckIcon />}
              </div>
            </button>
          </div>
        </div>

        {/* ── Section 6: Contact ── */}
        <div className="px-5 py-4">
          <SectionHeader label={t('form.contact.title')} />
          <div className="space-y-3">
            <input
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-navy text-sm placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all"
              value={formData.contactName}
              onChange={e => updateFormData({ contactName: e.target.value })}
              placeholder={t('steps.contact.namePlaceholder')}
              autoComplete="name"
            />
            <div>
              <input
                className={`w-full px-4 py-3 rounded-xl border bg-surface text-navy text-sm placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-orange/30 transition-all ${phoneTouched && phoneError ? 'border-red-400 focus:border-red-400' : 'border-border focus:border-orange'}`}
                value={formData.contactPhone}
                onChange={e => {
                  updateFormData({ contactPhone: e.target.value });
                  if (phoneTouched) setPhoneError(isValidEgyptPhone(e.target.value) ? '' : t('steps.contact.phoneError'));
                }}
                onBlur={() => {
                  setPhoneTouched(true);
                  setPhoneError(isValidEgyptPhone(formData.contactPhone) ? '' : t('steps.contact.phoneError'));
                }}
                placeholder={t('steps.contact.phonePlaceholder')}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
              />
              {phoneTouched && phoneError && <p className="mt-1 text-[11px] text-red-500">{phoneError}</p>}
            </div>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-navy text-sm placeholder:text-muted/50 outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-all resize-none"
              rows={3}
              value={formData.notes}
              onChange={e => updateFormData({ notes: e.target.value })}
              placeholder={t('steps.contact.notesPlaceholder')}
            />
          </div>
        </div>

        {/* ── Section 7: Price + Submit ── */}
        <div className="px-5 py-5 bg-surface">
          <div className="mb-4">
            <p className="text-xs text-muted mb-1">{t('form.price.estimated')}</p>
            {pricing ? (
              <p className="text-3xl font-bold text-orange tabular-nums">
                {t('currency')} {pricing.total.toLocaleString()}
              </p>
            ) : (
              <p className="text-sm text-muted/60">{t('form.price.notAvailable')}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${canSubmit ? 'bg-orange text-white shadow-md shadow-orange/20 hover:bg-orange/90 cursor-pointer' : 'bg-border text-muted/50 cursor-not-allowed'}`}
          >
            {pricing
              ? `${t('form.price.bookNow')} · ${t('currency')} ${pricing.total.toLocaleString()}`
              : t('form.price.bookNow')}
          </button>

          <p className="mt-3 text-center text-[11px] text-muted/60 leading-relaxed">
            {t('steps.contact.callNote')}
          </p>
        </div>

      </div>
    </div>
  );
}
