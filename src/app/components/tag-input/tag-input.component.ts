import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tag-input.component.html',
  styleUrls: ['./tag-input.component.css'],
})
export class TagInputComponent {
  @Input() tags: string[] = [];
  @Output() tagsChange = new EventEmitter<string[]>();
  @Input() placeholder = 'Agregar tag y presioná Enter...';

  draftTag: string = '';

  onInputChange(value: string) {
    if (value.includes(',')) {
      const parts = value.split(',');
      parts.slice(0, -1).forEach((part) => this.addTag(part));
      this.draftTag = parts[parts.length - 1];
      return;
    }
    this.draftTag = value;
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag(this.draftTag);
      this.draftTag = '';
    } else if (event.key === 'Backspace' && !this.draftTag && this.tags.length > 0) {
      this.removeTag(this.tags[this.tags.length - 1]);
    }
  }

  removeTag(tag: string) {
    this.tags = this.tags.filter((t) => t !== tag);
    this.tagsChange.emit(this.tags);
  }

  private addTag(raw: string) {
    const tag = raw.trim();
    if (!tag) return;
    if (this.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    this.tags = [...this.tags, tag];
    this.tagsChange.emit(this.tags);
  }
}
