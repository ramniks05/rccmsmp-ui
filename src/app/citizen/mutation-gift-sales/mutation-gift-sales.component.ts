import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-mutation-gift-sales',
  templateUrl: './mutation-gift-sales.component.html',
  styleUrls: ['./mutation-gift-sales.component.scss']
})
export class MutationGiftSalesComponent implements OnInit {

  locationForm!: FormGroup;
  applicantForm!: FormGroup;
  landForm!: FormGroup;
  transactionForm!: FormGroup;
  declarationForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForms();
  }

  private buildForms(): void {
    this.locationForm = this.fb.group({
      district: ['', Validators.required],
      tehsil: ['', Validators.required],
      village: ['', Validators.required]
    });

    this.applicantForm = this.fb.group({
      applicantName: ['', Validators.required],
      applicantAddress: ['', Validators.required],
      mobileNo: [
        '',
        [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]
      ]
    });

    this.landForm = this.fb.group({
      ownerName: ['', Validators.required],
      khataNo: ['', Validators.required],
      khasraNo: ['', Validators.required],
      area: ['', Validators.required]
    });

    this.transactionForm = this.fb.group({
      transactionType: ['Gift', Validators.required],
      deedNo: ['', Validators.required],
      deedDate: ['', Validators.required]
    });

    this.declarationForm = this.fb.group({
      remarks: [''],
      declaration: [false, Validators.requiredTrue]
    });
  }

  submit(): void {
    if (
      this.locationForm.invalid ||
      this.applicantForm.invalid ||
      this.landForm.invalid ||
      this.transactionForm.invalid ||
      this.declarationForm.invalid
    ) {
      return;
    }

    const payload = {
      ...this.locationForm.value,
      ...this.applicantForm.value,
      ...this.landForm.value,
      ...this.transactionForm.value,
      ...this.declarationForm.value,
      deedDate: this.formatDate(this.transactionForm.value.deedDate)
    };

    console.log('Final Payload:', payload);
  }

  private formatDate(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }
}
