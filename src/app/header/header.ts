import { Component } from '@angular/core';
import { Navbar } from "./navbar/navbar";
import { HeaderButtonContainer } from "./header-button-container/header-button-container";

@Component({
  selector: 'app-header',
  imports: [Navbar, HeaderButtonContainer],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {

}
