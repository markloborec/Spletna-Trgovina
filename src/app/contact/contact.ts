import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { Store } from '../models/store';
import { CommonModule, NgFor } from '@angular/common';
import { StoreInfo } from './store-info/store-info';

@Component({
  selector: 'app-contact',
  imports: [CommonModule, NgFor, StoreInfo,],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements AfterViewInit {

  private map!: L.Map;
  private markers: L.Marker[] = [];

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
      location: { lat: 46.554650, lng: 15.645881 }
    },
    {
      city: 'Slovenska Bistrica',
      address: 'Kolodvorska cesta 9, 2310 Slovenska Bistrica',
      phone: '+386 41 266 266',
      manager: 'Naja Miličić',
      workingHours: ['Pon – Pet: 08:00 – 16:00', 'Sob: 08:00 – 12:00', 'Ned: zaprto'],
      location: { lat: 46.392281, lng: 15.5732907 }
    },
    {
      city: 'Celje',
      address: 'Glavni trg 3, 3000 Celje',
      phone: '+386 41 277 277',
      manager: 'Mark Loborec',
      workingHours: ['Pon – Pet: 09:00 – 17:00', 'Sob: 09:00 – 12:00', 'Ned: zaprto'],
      location: { lat: 46.23919, lng: 15.26439 }
    }
  ];

  selectedStore: Store = this.stores[0];

  ngAfterViewInit(): void {
    this.initMap();
  }

  initMap() {
    this.map = L.map('map').setView(
      [this.selectedStore.location.lat, this.selectedStore.location.lng],
      9
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.addMarkers();
  }

  addMarkers() {
    this.markers.forEach(m => m.remove());
    this.markers = [];

    this.stores.forEach(store => {
      const marker = L.marker(
        [store.location.lat, store.location.lng],
        { icon: this.markerIcon }
      )
        .bindPopup(`<b>${store.city}</b><br>${store.address}`)
        .addTo(this.map);

      this.markers.push(marker);
    });
  }

  selectStore(store: Store) {
    this.selectedStore = store;
    this.map.setView([store.location.lat, store.location.lng], 12);
  }
}
