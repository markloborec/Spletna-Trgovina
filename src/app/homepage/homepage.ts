import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Categories } from "./categories/categories";

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, Categories],
  templateUrl: './homepage.html',
  styleUrls: ['./homepage.scss'],
})
export class Homepage {}
