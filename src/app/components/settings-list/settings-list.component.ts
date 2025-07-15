import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SettingOption {
  id: string;
  icon?: string;
  label: string;
  description?: string;
  type: 'toggle' | 'link' | 'action';
  value?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-settings-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-list.component.html',
  styleUrl: './settings-list.component.css',
})
export class SettingsListComponent {
  @Input() options: SettingOption[] = [];
  @Output() optionClick = new EventEmitter<SettingOption>();
  @Output() toggleChange = new EventEmitter<{ id: string; value: boolean }>();

  onOptionClick(option: SettingOption) {
    if (option.type === 'link' || option.type === 'action') {
      this.optionClick.emit(option);
    }
  }

  onToggle(option: SettingOption) {
    if (option.type === 'toggle' && !option.disabled) {
      option.value = !option.value;
      this.toggleChange.emit({ id: option.id, value: !!option.value });
    }
  }
}
