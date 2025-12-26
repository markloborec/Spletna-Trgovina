import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { Store } from '../../../models/store';
import { CommonModule, NgFor } from '@angular/common';
import { StoreInfo } from './store-info/store-info';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, NgFor, StoreInfo],
  templateUrl: './contact.html',
  styleUrls: ['./contact.scss'],
})
export class Contact implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private markers: L.Marker[] = [];
  private resizeTimer: any = null;
  private mq = window.matchMedia('(max-width: 900px)');
  private mqListener: ((e: MediaQueryListEvent) => void) | null = null;

  markerIcon = L.icon({
    iconUrl: '/leafset/marker-icon.png',
    iconRetinaUrl: '/leafset/marker-icon-small.png',
    shadowUrl: '/leafset/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    shadowSize: [41, 41],
  });

  stores: Store[] = [
    {
      city: 'Maribor',
      address: 'Ulica heroja Staneta 12, 2000 Maribor',
      phone: '+386 41 255 255',
      manager: 'Matevž Koren',
      workingHours: ['Pon – Pet: 08:00 – 18:00', 'Sob: 09:00 – 13:00', 'Ned: zaprto'],
      location: { lat: 46.55465, lng: 15.645881 },
      notice: 'Zaprto 1. 1. 2026 (novo leto).',
      imageUrl: '/biciklstore_poslovalnica_1.png',
    },
    {
      city: 'Slovenska Bistrica',
      address: 'Kolodvorska cesta 9, 2310 Slovenska Bistrica',
      phone: '+386 41 266 266',
      manager: 'Naja Miličić',
      workingHours: ['Pon – Pet: 08:00 – 16:00', 'Sob: 08:00 – 12:00', 'Ned: zaprto'],
      location: { lat: 46.392281, lng: 15.5732907 },
      notice: 'Inventura: 30. 12. 2025 odprto samo do 12:00.',
      imageUrl: '/biciklstore_poslovalnica_2.png',
    },
    {
      city: 'Celje',
      address: 'Glavni trg 3, 3000 Celje',
      phone: '+386 41 277 277',
      manager: 'Mark Loborec',
      workingHours: ['Pon – Pet: 09:00 – 17:00', 'Sob: 09:00 – 12:00', 'Ned: zaprto'],
      location: { lat: 46.23919, lng: 15.26439 },
      notice: 'Servisna delavnica: 27. 12. 2025 omejeno število terminov.',
      imageUrl: '/biciklstore_poslovalnica_3.png',
    },
  ];

  selectedStore: Store = this.stores[0];

  ngAfterViewInit(): void {
    this.initMap();

    this.onWindowResize = this.onWindowResize.bind(this);
    window.addEventListener('resize', this.onWindowResize, { passive: true });
    window.addEventListener('orientationchange', this.onWindowResize, { passive: true });

    this.mqListener = () => {
      this.safeInvalidateMap();
      this.fitToSelectedStore(false);
    };
    if ('addEventListener' in this.mq) this.mq.addEventListener('change', this.mqListener);
    else (this.mq as any).addListener(this.mqListener);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize as any);
    window.removeEventListener('orientationchange', this.onWindowResize as any);

    if (this.mqListener) {
      if ('removeEventListener' in this.mq) this.mq.removeEventListener('change', this.mqListener);
      else (this.mq as any).removeListener(this.mqListener);
    }

    if (this.map) this.map.remove();
  }

  /** Tipkovnica: Enter/Space na poslovalnici -> select */
  onStoreKeydown(event: KeyboardEvent, store: Store) {
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.selectStore(store);
    }
  }

  private initMap() {
    const startZoom = this.mq.matches ? 8 : 9;

    this.map = L.map('map', {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([this.selectedStore.location.lat, this.selectedStore.location.lng], startZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.addMarkers();

    setTimeout(() => this.safeInvalidateMap(), 0);
    setTimeout(() => this.safeInvalidateMap(), 250);
  }

  private escapeHtml(input: string): string {
    return (input ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  private addMarkers() {
    this.markers.forEach((m) => m.remove());
    this.markers = [];

    this.stores.forEach((store) => {
      const safeCity = this.escapeHtml(store.city);
      const safeAddress = this.escapeHtml(store.address);

      const marker = L.marker([store.location.lat, store.location.lng], { icon: this.markerIcon })
        .bindPopup(`<b>${safeCity}</b><br>${safeAddress}`)
        .addTo(this.map);

      marker.on('click', () => {
        // pomaga proti temu, da Leaflet popup auto-pan "premaga" tvoj center
        this.map?.closePopup();
        this.selectStore(store);
      });

      this.markers.push(marker);
    });
  }

  selectStore(store: Store) {
    this.selectedStore = store;
    this.fitToSelectedStore(true);
  }

  private fitToSelectedStore(openPopup: boolean) {
    if (!this.map || !this.selectedStore) return;

    const zoom = this.mq.matches ? 11 : 12;
    const { lat, lng } = this.selectedStore.location;

    this.safeInvalidateMap();

    this.map.flyTo([lat, lng], zoom, { animate: true, duration: 0.6 });

    if (openPopup) {
      const marker = this.markers.find((m) => {
        const ll = m.getLatLng();
        return Math.abs(ll.lat - lat) < 0.000001 && Math.abs(ll.lng - lng) < 0.000001;
      });

      this.map.once('moveend', () => {
        marker?.openPopup();
      });
    }
  }

  private onWindowResize() {
    if (this.resizeTimer) clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.safeInvalidateMap();
    }, 120);
  }

  private safeInvalidateMap() {
    if (!this.map) return;
    try {
      this.map.invalidateSize(true);
    } catch {
      // ignore
    }
  }
}
