import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AdvancedSettingsService } from 'src/app/core/services/advanced-settings.service';

export interface DocumentAvailable {
  documentId?: number;
  title: string;
  filePath: string;
  publishedOn?: string;
}

@Component({
  selector: 'app-documents-available',
  templateUrl: './documents-available.component.html',
  styleUrls: ['./documents-available.component.scss'],
})
export class DocumentsAvailableComponent implements OnInit, AfterViewInit {

  displayedColumns = ['icon', 'title', 'publishedOn', 'document', 'actions'];
  dataSource = new MatTableDataSource<DocumentAvailable>([]);

  form: FormGroup;
  saving = false;
  editMode = false;
  editId: number | null = null;

  uploadType: 'file' | 'url' = 'file';
  selectedFile: File | null = null;

  maxFileSize = 10 * 1024 * 1024; // 10MB

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private service: AdvancedSettingsService,
    private snack: MatSnackBar
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      uploadType: ['file'],
      url: ['', [Validators.pattern('https?://.+')]]
    });
  }

  /* ================= INIT ================= */

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /* ================= LOAD ================= */

  loadData(): void {
    this.service.getAllDocumentsAvailable().subscribe({
      next: (res) => {
        this.dataSource.data = res?.data ?? [];
      },
      error: () => {
        this.snack.open('Failed to load documents', 'Close', { duration: 3000 });
      }
    });
  }

  /* ================= UPLOAD TYPE CHANGE ================= */

  onUploadTypeChange(): void {
    this.uploadType = this.form.value.uploadType;
    this.selectedFile = null;

    if (this.uploadType === 'url') {
      this.form.get('url')?.setValidators([
        Validators.required,
        Validators.pattern('https?://.+')
      ]);
    } else {
      this.form.get('url')?.clearValidators();
    }

    this.form.get('url')?.updateValueAndValidity();
  }

  /* ================= FILE SELECT ================= */

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > this.maxFileSize) {
      this.snack.open('File size exceeds 10MB', 'Close', { duration: 3000 });
      return;
    }

    this.selectedFile = file;
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  /* ================= FILE HELPERS ================= */

  getFileIcon(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();

    switch (ext) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'png':
      case 'jpg':
      case 'jpeg': return 'image';
      default: return 'insert_drive_file';
    }
  }

  formatFileSize(size: number): string {
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
    return (size / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /* ================= TABLE ICON HELPERS ================= */

  getDocumentIcon(url: string): string {
    const ext = url?.split('.').pop()?.toLowerCase()?.split('?')[0];

    switch (ext) {
      case 'pdf': return 'picture_as_pdf';
      case 'doc':
      case 'docx': return 'description';
      case 'png':
      case 'jpg':
      case 'jpeg': return 'image';
      default: return 'insert_drive_file';
    }
  }

  isPDF(url: string): boolean {
    return url?.toLowerCase().includes('.pdf');
  }

  /* ================= SAVE ================= */

  save(): void {
    if (this.form.invalid) {
      this.snack.open('Please fill required fields', 'Close', { duration: 3000 });
      return;
    }

    if (this.uploadType === 'file' && !this.selectedFile && !this.editMode) {
      this.snack.open('Please select a file', 'Close', { duration: 3000 });
      return;
    }

    this.saving = true;

    const formData = new FormData();
    formData.append('title', this.form.value.title);

    if (this.uploadType === 'file' && this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    if (this.uploadType === 'url') {
      formData.append('filePath', this.form.value.url);
    }

    if (this.editMode && this.editId) {
      this.service.updateDocumentsAvailable(this.editId, formData).subscribe({
        next: () => this.afterSave('Document updated successfully'),
        error: () => this.handleError('Failed to update document')
      });
    } else {
      this.service.createDocumentsAvailable(formData).subscribe({
        next: () => this.afterSave('Document created successfully'),
        error: () => this.handleError('Failed to create document')
      });
    }
  }

  /* ================= EDIT ================= */

  edit(element: DocumentAvailable): void {
    this.editMode = true;
    this.editId = element.documentId ?? null;

    this.form.patchValue({
      title: element.title,
      uploadType: 'url',
      url: element.filePath
    });

    this.uploadType = 'url';

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ================= DELETE ================= */

  delete(id: number): void {
    if (!confirm('Are you sure you want to delete this document?')) return;

    this.service.deleteDocumentsAvailable(id).subscribe({
      next: () => {
        this.snack.open('Document deleted successfully', 'Close', { duration: 3000 });
        this.loadData();
      },
      error: () => {
        this.snack.open('Failed to delete document', 'Close', { duration: 3000 });
      }
    });
  }

  /* ================= RESET ================= */

  resetForm(): void {
    this.form.reset({ uploadType: 'file' });
    this.uploadType = 'file';
    this.selectedFile = null;
    this.editMode = false;
    this.editId = null;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  /* ================= COMMON HELPERS ================= */

  afterSave(message: string): void {
    this.saving = false;
    this.snack.open(message, 'Close', { duration: 3000 });
    this.resetForm();
    this.loadData();
  }

  handleError(message: string): void {
    this.saving = false;
    this.snack.open(message, 'Close', { duration: 3000 });
  }
}
