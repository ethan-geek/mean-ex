import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAutheticated = false;
  private authListenerSubs: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.userIsAutheticated = this.authService.getIsAuth();
    this.authListenerSubs = this.authService
      .getAuthStatusSubject()
      .subscribe((isAuthenticated) => {
        this.userIsAutheticated = isAuthenticated;
      });
  }

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
    this.authListenerSubs = null;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
