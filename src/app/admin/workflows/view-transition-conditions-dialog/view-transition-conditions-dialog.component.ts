import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WorkflowConfigService } from '../../services/workflow-config.service';
import type { WorkflowCondition } from '../../../core/models/workflow-condition.types';
import type { WorkflowTransition } from '../../services/workflow-config.service';

export interface ViewTransitionConditionsData {
  transition: WorkflowTransition;
  fromStateName?: string;
  toStateName?: string;
}

@Component({
  selector: 'app-view-transition-conditions-dialog',
  templateUrl: './view-transition-conditions-dialog.component.html',
  styleUrls: ['./view-transition-conditions-dialog.component.scss']
})
export class ViewTransitionConditionsDialogComponent implements OnInit {
  conditions: WorkflowCondition[] = [];
  isLoading = true;

  constructor(
    private workflowService: WorkflowConfigService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ViewTransitionConditionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ViewTransitionConditionsData
  ) {}

  ngOnInit(): void {
    const id = this.data.transition?.id;
    if (!id) {
      this.isLoading = false;
      return;
    }
    this.workflowService.getTransitionConditions(id).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.conditions = res.data ?? [];
        } else {
          this.snackBar.open(res.message ?? 'Failed to load conditions', 'Close', { duration: 5000 });
        }
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.message ?? err?.message ?? 'Failed to load conditions';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }

  formatCondition(c: WorkflowCondition): string {
    if (c.conditionType === 'WORKFLOW_FLAG' && c.flagName) {
      return c.displayLabel || c.flagName;
    }
    if (c.conditionType === 'FORM_FIELD' && c.moduleType && c.fieldName) {
      return c.displayLabel || `${c.moduleType} → ${c.fieldName}`;
    }
    return c.displayLabel || c.conditionType;
  }
}
