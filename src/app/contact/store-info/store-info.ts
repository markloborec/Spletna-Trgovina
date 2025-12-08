import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '../../models/store';

@Component({
  selector: 'app-store-info',
  imports: [ CommonModule],
  templateUrl: './store-info.html',
  styleUrl: './store-info.scss',
})
export class StoreInfo {
  @Input() store!: Store;
  @Input() selected: boolean = false;
}
