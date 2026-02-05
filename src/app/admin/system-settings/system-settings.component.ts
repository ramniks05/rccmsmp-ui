import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  SystemSettingsService,
  SystemSettings,
} from '../../core/services/system-settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-system-settings',
  templateUrl: './system-settings.component.html',
  styleUrls: ['./system-settings.component.scss'],
})
export class SystemSettingsComponent implements OnInit {
  settingsForm!: FormGroup;
  loading = false;
  saving = false;
  currentSettings: SystemSettings | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private settingsService: SystemSettingsService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCurrentSettings();
  }

  /**
   * Initialize the form
   */
  initializeForm(): void {
    this.settingsForm = this.fb.group({
      logoUrl: [''],
      logoHeader: ['', Validators.required],
      logoSubheader: ['', Validators.required],
      stateName: [''],

      secondaryLogoUrl: [''],
      secondaryLogoHeader: [''],
      secondaryLogoSubheader: [''],

      tertiaryLogoUrl: [''],
      tertiaryLogoHeader: [''],
      tertiaryLogoSubheader: [''],

      marqueeText: [''],

      footerText: [''],
      footerCopyright: [''],
      footerAddress: [''],
      footerEmail: ['', Validators.email],
      footerPhone: [''],
      footerWebsite: [''],

      banners: this.fb.array([])
    });
  }

  // ---------- BANNERS ----------
  get banners(): FormArray {
    return this.settingsForm.get('banners') as FormArray;
  }

  private createBannerGroup(data?: any): FormGroup {
    return this.fb.group({
      url: [data?.url || '', Validators.required],
      header: [data?.header || '', Validators.required]
    });
  }

  addBanner(): void {
    this.banners.push(this.createBannerGroup());
  }

  removeBanner(index: number): void {
    this.banners.removeAt(index);
  }

  /**
   * Load current settings
   */
  loadCurrentSettings(): void {
    this.loading = true;

    this.settingsService.getSettings().subscribe({
      next: (settings) => {
        this.currentSettings = settings;

        if (settings) {
          // --------- PATCH NORMAL FIELDS ----------
          this.settingsForm.patchValue({
            logoUrl: settings.logoUrl || '',
            logoHeader: settings.logoHeader || '',
            logoSubheader: settings.logoSubheader || '',
            stateName: settings.stateName || '',
            footerText: settings.footerText || '',
            footerCopyright: settings.footerCopyright || '',
            footerAddress: settings.footerAddress || '',
            footerEmail: settings.footerEmail || '',
            footerPhone: settings.footerPhone || '',
            footerWebsite: settings.footerWebsite || '',
            secondaryLogoUrl: settings.secondaryLogoUrl || '',
            secondaryLogoHeader: settings.secondaryLogoHeader || '',
            secondaryLogoSubheader: settings.secondaryLogoSubheader || '',
            tertiaryLogoUrl: settings.tertiaryLogoUrl || '',
            tertiaryLogoHeader: settings.tertiaryLogoHeader || '',
            tertiaryLogoSubheader: settings.tertiaryLogoSubheader || '',
            marqueeText: settings.marqueeText || '',
          });

          // --------- PATCH BANNERS ----------
          this.banners.clear();

          if (Array.isArray(settings.banners) && settings.banners.length) {
            settings.banners.forEach(banner => {
              this.banners.push(this.createBannerGroup(banner));
            });
          } else {
            this.addBanner(); // show at least one input
          }
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading settings:', error);
        this.loading = false;
        this.snackBar.open('Failed to load settings', 'Close', { duration: 3000 });
      },
    });
  }

  /**
   * Save settings
   */
  saveSettings(): void {
    if (this.settingsForm.invalid) {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000,
      });
      return;
    }

    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      this.snackBar.open('Please login as admin to save settings', 'Close', {
        duration: 5000,
      });
      return;
    }

    this.saving = true;

    const formValue = this.settingsForm.value;

    const settings: SystemSettings = {
      id: this.currentSettings?.id,
      ...formValue,
      banners: formValue.banners
    };

    this.settingsService.updateSettings(settings).subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('Settings saved successfully!', 'Close', {
            duration: 3000,
          });
          this.currentSettings = response.data;
          this.settingsService.refreshSettings();
        } else {
          this.snackBar.open('Failed to save settings', 'Close', {
            duration: 3000,
          });
        }
        this.saving = false;
      },
      error: (error) => {
        console.error('Error saving settings:', error);
        this.snackBar.open('Error saving settings', 'Close', {
          duration: 5000,
        });
        this.saving = false;
      },
    });
  }

  /**
   * Reset form
   */
  resetForm(): void {
    if (!this.currentSettings) return;

    this.settingsForm.reset();
    this.banners.clear();

    this.loadCurrentSettings();
  }
}
