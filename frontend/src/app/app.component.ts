import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoaderService } from './services/loader.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  private navigationTimer: any;
  private readonly LOADER_DURATION = 2000; // 2.5 seconds in milliseconds

  constructor(
    public loaderService: LoaderService,
    private router: Router
  ) {}

  ngOnInit() {
    // Show loader on initial load
    this.loaderService.show();

    // Hide loader after a short delay to allow components to load
    setTimeout(() => {
      this.loaderService.hide();
    }, 1000); // Adjust this delay as needed

    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.navigationTimer) {
          clearTimeout(this.navigationTimer);
        }
        this.showLoaderForDuration();
        this.loaderService.show();
      } else if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        // Add a small delay before hiding the loader
        setTimeout(() => {
          this.loaderService.hide();
        }, 500); // Adjust this delay as needed
      }
    });
  }
  private showLoaderForDuration() {
    this.loaderService.show();
    this.navigationTimer = setTimeout(() => {
      this.loaderService.hide();
    }, this.LOADER_DURATION);
  }
}
