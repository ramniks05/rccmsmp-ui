// ================= mock-home-data.ts =================

import { HomeData } from "./home-model";

export const HOME_DATA: HomeData = {
  stateConfig: {
    stateName: 'Manipur',
    departmentName: 'Revenue & Land Reforms Department',
    primaryColor: '#0b5394',
    secondaryColor: '#f58220',
    helpline: '1800-XXX-XXXX',
    email: 'help@manipur.gov.in',
    logoUrl: 'assets/Manipur-Government.png'
  },

  banners: [
    {
      imageUrl: 'assets/home-banner.jpg',
      title: 'Digital Land Governance',
      subtitle: 'Transparent • Citizen-Centric • Efficient'
    },
    {
      imageUrl: 'assets/home-banner.jpg',
      title: 'Revenue Services Online',
      subtitle: 'Fast • Secure • Accessible'
    }
  ],

  statistics: [
    { label: 'Online Services', value: 1280 },
    { label: 'Applications Received', value: 248965 },
    { label: 'Applications Approved', value: 231402 },
    { label: 'Districts Covered', value: 38 }
  ],

  notices: [
    { title: 'Online mutation timelines reduced to 15 days', date: '12 Jan 2025', isNew: true },
    { title: 'Aadhaar-based verification mandatory', date: '05 Jan 2025', isNew: false }
  ],

  quickServices: [
    { title: 'Apply for Mutation', icon: 'assignment' },
    { title: 'View Jamabandi', icon: 'description' },
    { title: 'Track Application', icon: 'track_changes' },
    { title: 'Apply Certificate', icon: 'verified' }
  ],

  categories: [
    { title: 'Land Records', icon: 'map' },
    { title: 'Registration', icon: 'how_to_reg' },
    { title: 'Certificates', icon: 'workspace_premium' },
    { title: 'Grievance', icon: 'support_agent' }
  ],

  vision: 'To deliver transparent and efficient land governance services.',
  mission: 'Digitize land records and simplify citizen access to revenue services.',

  whatsNew: [
    'New dashboard launched for officers',
    'Process automation for mutation cases'
  ]
};
