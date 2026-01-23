import { HomeData } from 'src/assets/home-model';
import { HOME_DATA } from './../../../assets/mock-home-data';
import { Component, OnInit } from '@angular/core';

interface Banner {
  imageUrl: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  // component.ts (snippet)
  highlights = [
    {
      title: 'New Circular Issued',
      description: 'Important circular regarding administrative changes.',
      icon: 'description',
    },
    {
      title: 'Transfer Policy Update',
      description: 'Latest update on transfer & posting guidelines.',
      icon: 'swap_horiz',
    },
    {
      title: 'Training Schedule',
      description: 'Upcoming capacity building programs.',
      icon: 'school',
    },
  ];

  notices = [
    'Departmental Promotion Committee meeting on 12 Feb',
    'Annual Property Return submission deadline extended',
    'New HRMS module launched',
  ];

  // sidebar-menu.component.ts (menu structure)
  menu = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
    },
    {
      label: 'Services',
      icon: 'miscellaneous_services',
      children: ['Land Records', 'Mutation', 'Revenue Courts', 'Certificates'],
    },
    {
      label: 'Applications',
      icon: 'assignment',
      children: ['Apply Online', 'Track Status', 'Pending Applications'],
    },
    {
      label: 'Circulars',
      icon: 'description',
    },
    {
      label: 'Help & Support',
      icon: 'support_agent',
    },
  ];

  banners: Banner[] = [
    {
      imageUrl: '../../../assets/home-banner.jpg',
      title: 'Digital Land Services',
      subtitle: 'Transparent, citizen-centric revenue governance',
    },
    {
      imageUrl: '../../../assets/manipurlegislativeassembly.jpg',
      title: 'Fast & Secure Applications',
      subtitle: 'Track applications and services online',
    },
    {
      imageUrl: '../../../assets/sc-manipur-organe.jpeg',
      title: 'Single Unified Portal',
      subtitle: 'All land & revenue services at one place',
    },
  ];

  data: HomeData = HOME_DATA;
  animatedStatistics: number[] = [];
  marqueeText =
    'Online services available | Apply digitally | Transparent governance';
  activeBanner = 0;

  ngOnInit(): void {
    setInterval(() => {
      this.activeBanner = (this.activeBanner + 1) % this.banners.length;
    }, 5000);
    document.documentElement.style.setProperty(
      '--primary-color',
      this.data.stateConfig.primaryColor,
    );
    this.animateStatistics();
  }

  private animateStatistics(): void {
    this.data.statistics.forEach((stat: any, index: any) => {
      let current = 0;
      const step = Math.ceil(stat.value / 60);

      const interval = setInterval(() => {
        current += step;
        if (current >= stat.value) {
          current = stat.value;
          clearInterval(interval);
        }
        this.animatedStatistics[index] = current;
      }, 20);
    });
  }
}
