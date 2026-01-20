import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { CaseTypeService } from "src/app/core/services/case-type.services";

@Component({
  selector: "app-land-process-types",
  templateUrl: "./land-process-types.component.html",
  styleUrls: ["./land-process-types.component.scss"],
})
export class LandProcessTypesComponent {
  processes: any[] = [];
  caseTypeConfig: Record<string, { icon: string; route: string }> = {
    MUTATION_GIFT_SALE: {
      icon: "assignment",
      route: "/citizen/services/mutation-gift-sales",
    },
    MUTATION_DEATH: {
      icon: "person_off",
      route: "/cases/mutation-death",
    },
    PARTITION: {
      icon: "call_split",
      route: "/cases/partition",
    },
    CLASSIFICATION_CHANGE_BEFORE_2014: {
      icon: "history",
      route: "/cases/classification-pre-2014",
    },
    CLASSIFICATION_CHANGE_AFTER_2014: {
      icon: "update",
      route: "/cases/classification-post-2014",
    },
    HIGHER_COURT_ORDER: {
      icon: "gavel",
      route: "/cases/court-order",
    },
    ALLOTMENT: {
      icon: "domain",
      route: "/cases/allotment",
    },
    LAND_ACQUISITION_RFCTLARR_NHA: {
      icon: "account_balance",
      route: "/cases/acquisition-act",
    },
    LAND_ACQUISITION_DIRECT_PURCHASE: {
      icon: "paid",
      route: "/cases/acquisition-direct",
    },
  };

  constructor(
    private router: Router,
    private caseTypeService: CaseTypeService
  ) {}

  ngOnInit(): void {
    this.getCaseTypes();
  }

  openForm(route: string) {
    this.router.navigate([route]);
  }

  getCaseTypes() {
    this.caseTypeService.getCaseTypes().subscribe({
    next: (res) => {
      this.processes = res.data
        .filter((ct: any) => ct.isActive)
        .map((ct: any) => ({
          id: ct.id,
          title: ct.name,
          code: ct.code,
          description: ct.description,
          icon: this.caseTypeConfig[ct.code]?.icon || 'description',
          route: this.caseTypeConfig[ct.code]?.route || '/cases'
        }));

      console.log('Mapped Processes:', this.processes);
    },
    error: (err) => console.error(err)
  });
  }
}
