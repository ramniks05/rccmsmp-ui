import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { WorkflowService } from '../../core/services/workflow.service';
import type { TransitionWithChecklist } from '../../core/models/workflow-condition.types';

@Component({
  selector: 'app-available-actions',
  templateUrl: './available-actions.component.html',
  styleUrls: ['./available-actions.component.scss']
})
export class AvailableActionsComponent implements OnInit, OnChanges {
  @Input() caseId!: number;

  transitions: TransitionWithChecklist[] = [];
  isLoading = false;
  loadError: string | null = null;

  constructor(private workflowService: WorkflowService) {}

  ngOnInit(): void {
    if (this.caseId) {
      this.loadTransitions();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['caseId'] && this.caseId) {
      this.loadTransitions();
    }
  }

  loadTransitions(): void {
    if (!this.caseId) {
      return;
    }
    this.isLoading = true;
    this.loadError = null;
    this.workflowService.getCaseTransitions(this.caseId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.transitions = res.data;
        } else {
          this.loadError = res.message ?? 'Failed to load actions';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.loadError = err?.error?.message ?? err?.message ?? 'Failed to load actions';
      }
    });
  }

  blockingReasons(t: TransitionWithChecklist): string[] {
    if (!t.blockingConditions) {
      return [];
    }
    return t.blockingConditions.filter((c) => !c.passed).map((c) => c.label);
  }

  tooltipText(t: TransitionWithChecklist): string {
    if (!t.blockingConditions?.length) {
      return t.transitionName;
    }
    const total = t.blockingConditions.length;
    const met = t.blockingConditions.filter((c) => c.passed).length;
    const lines = t.blockingConditions.map(
      (c) => `${c.passed ? '✓' : '✗'} ${c.label}`
    );
    return [t.transitionName, '', `${met} of ${total} conditions met`, '', ...lines].join('\n');
  }
}
