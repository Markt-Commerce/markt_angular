import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' | 'textarea';
export type InputSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="input-container" [class]="containerClasses">
      <label *ngIf="label" [for]="id" class="input-label">
        {{ label }}
        <span *ngIf="required" class="required-indicator">*</span>
      </label>
      
      <div class="input-wrapper">
        <textarea
          *ngIf="type === 'textarea'"
          [id]="id"
          [name]="name"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [attr.required]="required"
          [attr.maxlength]="maxlength"
          [attr.minlength]="minlength"
          [rows]="rows"
          [class]="inputClasses"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [attr.aria-describedby]="ariaDescribedby"
          [attr.aria-invalid]="hasError"
        ></textarea>
        
        <input
          *ngIf="type !== 'textarea'"
          [id]="id"
          [name]="name"
          [type]="type"
          [placeholder]="placeholder"
          [disabled]="disabled"
          [readonly]="readonly"
          [attr.required]="required"
          [attr.maxlength]="maxlength"
          [attr.minlength]="minlength"
          [min]="min"
          [max]="max"
          [step]="step"
          [class]="inputClasses"
          [value]="value"
          (input)="onInput($event)"
          (blur)="onBlur()"
          (focus)="onFocus()"
          [attr.aria-describedby]="ariaDescribedby"
          [attr.aria-invalid]="hasError"
        />
        
        <div *ngIf="loading" class="input-loading">
          <span class="loading-spinner"></span>
        </div>
        
        <div *ngIf="icon" class="input-icon">
          <span [innerHTML]="icon"></span>
        </div>
      </div>
      
      <div *ngIf="hint" class="input-hint" [id]="hintId">
        {{ hint }}
      </div>
      
      <div *ngIf="errorMessage" class="input-error" [id]="errorId">
        {{ errorMessage }}
      </div>
    </div>
  `,
  styles: [`
    .input-container {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .input-label {
      font-weight: var(--font-weight-medium);
      color: var(--text-primary);
      font-size: var(--font-size-sm);
    }

    .required-indicator {
      color: var(--error-color);
      margin-left: 0.25rem;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    input, textarea {
      width: 100%;
      padding: var(--spacing-sm) var(--spacing-md);
      border: 1px solid var(--border-primary);
      border-radius: var(--radius-md);
      background: var(--bg-primary);
      color: var(--text-primary);
      font-size: var(--font-size-base);
      transition: all var(--transition-normal);
      font-family: inherit;
    }

    input:focus, textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(233, 76, 42, 0.1);
    }

    input:disabled, textarea:disabled {
      background: var(--bg-secondary);
      color: var(--text-muted);
      cursor: not-allowed;
    }

    input:read-only, textarea:read-only {
      background: var(--bg-secondary);
      color: var(--text-muted);
    }

    /* Size variants */
    .input-sm input, .input-sm textarea {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-size-sm);
    }

    .input-lg input, .input-lg textarea {
      padding: var(--spacing-md) var(--spacing-lg);
      font-size: var(--font-size-lg);
    }

    /* Error state */
    .input-error input, .input-error textarea {
      border-color: var(--error-color);
    }

    .input-error input:focus, .input-error textarea:focus {
      border-color: var(--error-color);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    /* Success state */
    .input-success input, .input-success textarea {
      border-color: var(--success-color);
    }

    .input-success input:focus, .input-success textarea:focus {
      border-color: var(--success-color);
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    /* Loading state */
    .input-loading {
      position: absolute;
      right: var(--spacing-sm);
      display: flex;
      align-items: center;
    }

    .loading-spinner {
      width: 1rem;
      height: 1rem;
      border: 2px solid transparent;
      border-top: 2px solid var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Icon */
    .input-icon {
      position: absolute;
      right: var(--spacing-sm);
      display: flex;
      align-items: center;
      color: var(--text-muted);
      pointer-events: none;
    }

    .input-with-icon input, .input-with-icon textarea {
      padding-right: 2.5rem;
    }

    /* Hint and error messages */
    .input-hint {
      font-size: var(--font-size-sm);
      color: var(--text-muted);
    }

    .input-error {
      font-size: var(--font-size-sm);
      color: var(--error-color);
    }

    /* Full width */
    .input-full {
      width: 100%;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent implements ControlValueAccessor {
  @Input() id?: string;
  @Input() name?: string;
  @Input() type: InputType = 'text';
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() hint?: string;
  @Input() errorMessage?: string;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() loading = false;
  @Input() icon?: string;
  @Input() size: InputSize = 'md';
  @Input() fullWidth = false;
  @Input() maxlength?: number;
  @Input() minlength?: number;
  @Input() min?: number;
  @Input() max?: number;
  @Input() step?: number;
  @Input() rows = 3;
  @Input() ariaDescribedby?: string;

  @Output() valueChange = new EventEmitter<string>();
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();

  value = '';
  hasError = false;

  private onChange = (value: string) => {};
  private onTouched = () => {};

  get containerClasses(): string {
    const classes = [`input-${this.size}`];
    
    if (this.fullWidth) {
      classes.push('input-full');
    }
    
    if (this.hasError) {
      classes.push('input-error');
    }
    
    if (this.icon) {
      classes.push('input-with-icon');
    }
    
    return classes.join(' ');
  }

  get inputClasses(): string {
    return 'input-field';
  }

  get hintId(): string {
    return this.id ? `${this.id}-hint` : '';
  }

  get errorId(): string {
    return this.id ? `${this.id}-error` : '';
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onFocus(): void {
    this.onTouched();
    this.focus.emit();
  }

  onBlur(): void {
    this.onTouched();
    this.blur.emit();
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  setErrorState(hasError: boolean): void {
    this.hasError = hasError;
  }
} 