import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="toggle-switch-container" [class.disabled]="disabled">
      <input
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onToggle($event)"
        class="toggle-switch-input"
        [attr.aria-label]="ariaLabel"
      />
      <span class="toggle-switch-slider" [class.checked]="checked"></span>
    </label>
  `,
  styles: [`
    .toggle-switch-container {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
      cursor: pointer;
    }

    .toggle-switch-container.disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .toggle-switch-input {
      opacity: 0;
      width: 0;
      height: 0;
      position: absolute;
    }

    .toggle-switch-slider {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #e5e7eb;
      border-radius: 24px;
      transition: all 0.3s ease;
      cursor: pointer;
    }

    .toggle-switch-slider:before {
      content: '';
      position: absolute;
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      border-radius: 50%;
      transition: transform 0.3s ease;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toggle-switch-slider.checked {
      background-color: #E94C2A;
    }

    .toggle-switch-slider.checked:before {
      transform: translateX(20px);
    }

    .toggle-switch-container:hover .toggle-switch-slider:not(.checked) {
      background-color: #d1d5db;
    }

    .toggle-switch-container:hover .toggle-switch-slider.checked {
      background-color: #d43a1a;
    }

    .toggle-switch-container.disabled:hover .toggle-switch-slider {
      background-color: #e5e7eb;
    }

    .toggle-switch-container.disabled:hover .toggle-switch-slider.checked {
      background-color: #E94C2A;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleSwitchComponent),
      multi: true
    }
  ]
})
export class ToggleSwitchComponent implements ControlValueAccessor {
  @Input() disabled = false;
  @Input() ariaLabel?: string;
  @Output() toggleChange = new EventEmitter<boolean>();

  checked = false;
  private onChange = (value: boolean) => {};
  private onTouched = () => {};

  onToggle(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.toggleChange.emit(this.checked);
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}


