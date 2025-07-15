import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';

export interface OfferFormData {
  price: number;
  quantity: number;
  description: string;
  deliveryTime: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  isNegotiable: boolean;
}

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './offer-form.component.html',
  styleUrl: './offer-form.component.css',
})
export class OfferFormComponent {
  @Input() initialData?: Partial<OfferFormData>;
  @Input() isEditing = false;
  @Input() loading = false;
  @Output() submitOffer = new EventEmitter<OfferFormData>();
  @Output() cancel = new EventEmitter<void>();

  offerForm: FormGroup;
  conditions = [
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
  ];

  deliveryTimes = [
    { value: 'same-day', label: 'Same Day' },
    { value: 'next-day', label: 'Next Day' },
    { value: '2-3-days', label: '2-3 Days' },
    { value: '1-week', label: '1 Week' },
    { value: 'negotiable', label: 'Negotiable' },
  ];

  constructor(private fb: FormBuilder) {
    this.offerForm = this.fb.group({
      price: [0, [Validators.required, Validators.min(0.01)]],
      quantity: [1, [Validators.required, Validators.min(1)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      deliveryTime: ['2-3-days', Validators.required],
      condition: ['good', Validators.required],
      isNegotiable: [false],
    });
  }

  ngOnInit() {
    if (this.initialData) {
      this.offerForm.patchValue(this.initialData);
    }
  }

  onSubmit() {
    if (this.offerForm.valid) {
      this.submitOffer.emit(this.offerForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  private markFormGroupTouched() {
    Object.keys(this.offerForm.controls).forEach((key) => {
      const control = this.offerForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.offerForm.get(controlName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['min'])
        return `Minimum value is ${control.errors['min'].min}`;
      if (control.errors['minlength'])
        return `Minimum length is ${control.errors['minlength'].requiredLength} characters`;
    }
    return '';
  }
}
