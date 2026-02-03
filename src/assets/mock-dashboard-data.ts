// mock-dashboard-data.ts

export interface District {
  name: string;
  cases: number;
  disposed: number;
  pending: number;
  activeRate: number;
}

export interface Officer {
  name: string;
  pending: number;
  disposed: number;
  totalCases: number;
  district: string;
  designation: string;
}

export interface Court {
  court: string;
  disposed: number;
  pending: number;
  totalCases: number;
  avgResolutionDays: number;
}

export interface CaseAging {
  labels: string[];
  data: number[];
  percentages: number[];
}

export interface MonthlyTrend {
  month: string;
  newCases: number;
  disposedCases: number;
  pendingCases: number;
}

export const DASHBOARD_DATA = {
  // Summary Statistics
  summary: {
    totalCases: 12854,
    disposedCases: 9342,
    pendingCases: 3512,
    activeCourts: 62,
    avgResolutionDays: 45,
    disposalRate: 72.7
  },

  // District-wise data with more details
  districts: [
    {
      name: 'Imphal West',
      cases: 2840,
      disposed: 2120,
      pending: 720,
      activeRate: 74.6
    },
    {
      name: 'Imphal East',
      cases: 2410,
      disposed: 1780,
      pending: 630,
      activeRate: 73.9
    },
    {
      name: 'Thoubal',
      cases: 1980,
      disposed: 1440,
      pending: 540,
      activeRate: 72.7
    },
    {
      name: 'Bishnupur',
      cases: 1120,
      disposed: 850,
      pending: 270,
      activeRate: 75.9
    },
    {
      name: 'Churachandpur',
      cases: 1560,
      disposed: 1150,
      pending: 410,
      activeRate: 73.7
    },
    {
      name: 'Chandel',
      cases: 980,
      disposed: 720,
      pending: 260,
      activeRate: 73.5
    },
    {
      name: 'Tamenglong',
      cases: 850,
      disposed: 630,
      pending: 220,
      activeRate: 74.1
    },
    {
      name: 'Ukhrul',
      cases: 1114,
      disposed: 652,
      pending: 462,
      activeRate: 58.5
    }
  ] as District[],

  // Officer-wise pending cases with more details
  officers: [
    {
      name: 'SDM Imphal West',
      pending: 320,
      disposed: 890,
      totalCases: 1210,
      district: 'Imphal West',
      designation: 'Sub-Divisional Magistrate'
    },
    {
      name: 'ADC Thoubal',
      pending: 210,
      disposed: 680,
      totalCases: 890,
      district: 'Thoubal',
      designation: 'Additional Deputy Commissioner'
    },
    {
      name: 'DC Bishnupur',
      pending: 140,
      disposed: 520,
      totalCases: 660,
      district: 'Bishnupur',
      designation: 'Deputy Commissioner'
    },
    {
      name: 'SDM Imphal East',
      pending: 280,
      disposed: 740,
      totalCases: 1020,
      district: 'Imphal East',
      designation: 'Sub-Divisional Magistrate'
    },
    {
      name: 'Tehsildar Churachandpur',
      pending: 190,
      disposed: 450,
      totalCases: 640,
      district: 'Churachandpur',
      designation: 'Tehsildar'
    },
    {
      name: 'ADC Chandel',
      pending: 130,
      disposed: 380,
      totalCases: 510,
      district: 'Chandel',
      designation: 'Additional Deputy Commissioner'
    },
    {
      name: 'SDM Tamenglong',
      pending: 110,
      disposed: 320,
      totalCases: 430,
      district: 'Tamenglong',
      designation: 'Sub-Divisional Magistrate'
    },
    {
      name: 'DC Ukhrul',
      pending: 260,
      disposed: 410,
      totalCases: 670,
      district: 'Ukhrul',
      designation: 'Deputy Commissioner'
    }
  ] as Officer[],

  // Court performance data
  courts: [
    {
      court: 'Revenue Court-I',
      disposed: 1240,
      pending: 420,
      totalCases: 1660,
      avgResolutionDays: 42
    },
    {
      court: 'Revenue Court-II',
      disposed: 980,
      pending: 350,
      totalCases: 1330,
      avgResolutionDays: 38
    },
    {
      court: 'Revenue Court-III',
      disposed: 760,
      pending: 280,
      totalCases: 1040,
      avgResolutionDays: 45
    },
    {
      court: 'Revenue Court-IV',
      disposed: 650,
      pending: 240,
      totalCases: 890,
      avgResolutionDays: 40
    },
    {
      court: 'Revenue Court-V',
      disposed: 580,
      pending: 210,
      totalCases: 790,
      avgResolutionDays: 48
    }
  ] as Court[],

  // Case aging analysis
  aging: {
    labels: ['0-3 Months', '3-6 Months', '6-12 Months', 'Above 1 Year'],
    data: [1420, 980, 720, 392],
    percentages: [40.4, 27.9, 20.5, 11.2]
  } as CaseAging,

  // Monthly trend data for the line chart
  monthlyTrend: [
    { month: 'Jan', newCases: 420, disposedCases: 380, pendingCases: 3150 },
    { month: 'Feb', newCases: 380, disposedCases: 410, pendingCases: 3120 },
    { month: 'Mar', newCases: 450, disposedCases: 420, pendingCases: 3150 },
    { month: 'Apr', newCases: 490, disposedCases: 460, pendingCases: 3180 },
    { month: 'May', newCases: 520, disposedCases: 490, pendingCases: 3210 },
    { month: 'Jun', newCases: 480, disposedCases: 510, pendingCases: 3180 },
    { month: 'Jul', newCases: 510, disposedCases: 480, pendingCases: 3210 },
    { month: 'Aug', newCases: 470, disposedCases: 500, pendingCases: 3180 },
    { month: 'Sep', newCases: 490, disposedCases: 510, pendingCases: 3160 },
    { month: 'Oct', newCases: 530, disposedCases: 520, pendingCases: 3170 },
    { month: 'Nov', newCases: 510, disposedCases: 540, pendingCases: 3140 },
    { month: 'Dec', newCases: 540, disposedCases: 560, pendingCases: 3120 }
  ] as MonthlyTrend[],

  // Case type distribution
  caseTypes: {
    labels: ['Land Disputes', 'Revenue Recovery', 'Tenancy', 'Mutation', 'Survey Issues', 'Others'],
    data: [3450, 2890, 2120, 1850, 1340, 1204],
    colors: [
      'rgba(102, 126, 234, 0.8)',
      'rgba(17, 153, 142, 0.8)',
      'rgba(240, 147, 251, 0.8)',
      'rgba(245, 87, 108, 0.8)',
      'rgba(79, 172, 254, 0.8)',
      'rgba(251, 197, 49, 0.8)'
    ]
  },

  // Priority distribution
  priority: {
    high: 450,
    medium: 1820,
    low: 1242
  },

  // Recent activities (for potential activity feed)
  recentActivities: [
    {
      id: 1,
      type: 'case_filed',
      description: 'New land dispute case filed in Imphal West',
      timestamp: new Date('2026-01-28T09:30:00'),
      officer: 'SDM Imphal West',
      caseId: 'IW/2026/1234'
    },
    {
      id: 2,
      type: 'case_disposed',
      description: 'Revenue recovery case disposed',
      timestamp: new Date('2026-01-28T08:15:00'),
      officer: 'ADC Thoubal',
      caseId: 'TH/2025/9876'
    },
    {
      id: 3,
      type: 'hearing_scheduled',
      description: 'Hearing scheduled for mutation case',
      timestamp: new Date('2026-01-27T16:45:00'),
      officer: 'DC Bishnupur',
      caseId: 'BS/2025/5432'
    },
    {
      id: 4,
      type: 'order_issued',
      description: 'Interim order issued in tenancy dispute',
      timestamp: new Date('2026-01-27T14:20:00'),
      officer: 'SDM Imphal East',
      caseId: 'IE/2025/7890'
    }
  ],

  // Performance metrics
  performance: {
    thisMonth: {
      newCases: 540,
      disposedCases: 560,
      efficiency: 103.7
    },
    lastMonth: {
      newCases: 510,
      disposedCases: 540,
      efficiency: 105.9
    },
    avgHearingsPerCase: 3.2,
    avgDaysToFirstHearing: 12
  }
};

// Helper functions for data manipulation
export class DashboardDataHelper {
  static getTopDistricts(count: number = 5): District[] {
    return [...DASHBOARD_DATA.districts]
      .sort((a, b) => b.cases - a.cases)
      .slice(0, count);
  }

  static getHighLoadOfficers(threshold: number = 200): Officer[] {
    return DASHBOARD_DATA.officers.filter(officer => officer.pending > threshold);
  }

  static calculateDisposalRate(): number {
    const total = DASHBOARD_DATA.summary.totalCases;
    const disposed = DASHBOARD_DATA.summary.disposedCases;
    return Math.round((disposed / total) * 100 * 10) / 10;
  }

  static getMonthlyTrendForPeriod(months: number): MonthlyTrend[] {
    return DASHBOARD_DATA.monthlyTrend.slice(-months);
  }

  static getTotalPendingByDistrict(): { [key: string]: number } {
    return DASHBOARD_DATA.districts.reduce((acc, district) => {
      acc[district.name] = district.pending;
      return acc;
    }, {} as { [key: string]: number });
  }
}
