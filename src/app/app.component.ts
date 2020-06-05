import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UsersService } from './core/services/users.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
    title = 'ng9-contacts';
    userService: UsersService;

  constructor(router: Router, userService: UsersService) {
    const self = this;
    this.userService = userService;
  }

  ngOnInit() {
    this.userService.populate();
    // this.userService.logout();

  }

  logout(): void {
    this.userService.logout();
  }

}

