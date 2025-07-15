import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
  size?: number;
}

export interface CommentData {
  text: string;
  attachments: Attachment[];
  isPrivate: boolean;
  isAnonymous: boolean;
  mentions: string[];
  hashtags: string[];
}

@Component({
  selector: 'app-comment-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-box.component.html',
  styleUrl: './comment-box.component.css',
})
export class CommentBoxComponent {
  @Input() currentUser!: User;
  @Input() commentType: string = 'Comment';
  @Input() showMentionButton: boolean = true;
  @Input() showHashtagButton: boolean = true;
  @Input() showAnonymousOption: boolean = false;
  @Input() showCancelButton: boolean = false;
  @Input() submitButtonText: string = 'Post';

  @Output() submit = new EventEmitter<CommentData>();
  @Output() cancel = new EventEmitter<void>();
  @Output() textChange = new EventEmitter<string>();

  @ViewChild('commentInput') commentInput!: ElementRef<HTMLTextAreaElement>;

  commentText: string = '';
  attachments: Attachment[] = [];
  isPrivate: boolean = false;
  isAnonymous: boolean = false;

  showEmojiPicker: boolean = false;
  showMentionSuggestions: boolean = false;
  mentionSuggestions: User[] = [];
  selectedMentionIndex: number = 0;

  // Modern icon-based reactions instead of emojis
  reactions: { icon: string; label: string; color: string }[] = [
    { icon: 'ph-heart', label: 'Love', color: '#ff4757' },
    { icon: 'ph-thumbs-up', label: 'Like', color: '#2ed573' },
    { icon: 'ph-star', label: 'Star', color: '#ffa502' },
    { icon: 'ph-fire', label: 'Hot', color: '#ff6348' },
    { icon: 'ph-lightning', label: 'Amazing', color: '#ff9ff3' },
    { icon: 'ph-hands-clapping', label: 'Clap', color: '#54a0ff' },
    { icon: 'ph-rocket', label: 'Awesome', color: '#5f27cd' },
    { icon: 'ph-crown', label: 'Best', color: '#ff9f43' },
    { icon: 'ph-gift', label: 'Gift', color: '#00d2d3' },
    { icon: 'ph-check-circle', label: 'Perfect', color: '#10ac84' },
    { icon: 'ph-smiley', label: 'Happy', color: '#ff9ff3' },
    { icon: 'ph-sunglasses', label: 'Cool', color: '#54a0ff' },
    { icon: 'ph-party-popper', label: 'Celebrate', color: '#ff6348' },
    { icon: 'ph-trophy', label: 'Winner', color: '#ffa502' },
    { icon: 'ph-sparkle', label: 'Sparkle', color: '#ff9ff3' },
    { icon: 'ph-diamond', label: 'Premium', color: '#5f27cd' },
  ];

  get charCount(): number {
    return this.commentText.length;
  }

  get canSubmit(): boolean {
    return this.commentText.trim().length > 0 || this.attachments.length > 0;
  }

  onTextChange() {
    this.textChange.emit(this.commentText);
    this.checkForMentions();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && event.ctrlKey) {
      this.onSubmit();
    }

    if (this.showMentionSuggestions) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this.selectedMentionIndex = Math.min(
          this.selectedMentionIndex + 1,
          this.mentionSuggestions.length - 1
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        this.selectedMentionIndex = Math.max(this.selectedMentionIndex - 1, 0);
      } else if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault();
        if (this.mentionSuggestions[this.selectedMentionIndex]) {
          this.onSelectMention(
            this.mentionSuggestions[this.selectedMentionIndex]
          );
        }
      } else if (event.key === 'Escape') {
        this.showMentionSuggestions = false;
      }
    }
  }

  onAttachImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const attachment: Attachment = {
            id: Date.now().toString(),
            name: file.name,
            url: e.target.result,
            type: 'image',
            size: file.size,
          };
          this.attachments.push(attachment);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  }

  onAttachFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        const attachment: Attachment = {
          id: Date.now().toString(),
          name: file.name,
          url: URL.createObjectURL(file),
          type: 'file',
          size: file.size,
        };
        this.attachments.push(attachment);
      }
    };
    input.click();
  }

  onRemoveAttachment(index: number) {
    this.attachments.splice(index, 1);
  }

  onEmoji() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  onCloseEmoji() {
    this.showEmojiPicker = false;
  }

  onSelectEmoji(emoji: string) {
    const textarea = this.commentInput.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    this.commentText =
      this.commentText.substring(0, start) +
      emoji +
      this.commentText.substring(end);
    this.onTextChange();

    // Set cursor position after emoji
    setTimeout(() => {
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      textarea.focus();
    }, 0);

    this.showEmojiPicker = false;
  }

  onMention() {
    // This would typically open a user search or show recent mentions
    this.commentText += '@';
    this.onTextChange();
  }

  onHashtag() {
    this.commentText += '#';
    this.onTextChange();
  }

  checkForMentions() {
    const lastWord = this.commentText.split(' ').pop() || '';
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      const searchTerm = lastWord.substring(1);
      // Simulate user search - in real app, this would call an API
      this.mentionSuggestions = [
        {
          id: '1',
          name: 'John Doe',
          username: 'johndoe',
          avatar: '/assets/avatars/john.jpg',
        },
        {
          id: '2',
          name: 'Jane Smith',
          username: 'janesmith',
          avatar: '/assets/avatars/jane.jpg',
        },
        {
          id: '3',
          name: 'Bob Johnson',
          username: 'bobjohnson',
          avatar: '/assets/avatars/bob.jpg',
        },
      ].filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.showMentionSuggestions = this.mentionSuggestions.length > 0;
      this.selectedMentionIndex = 0;
    } else {
      this.showMentionSuggestions = false;
    }
  }

  onSelectMention(user: User) {
    const words = this.commentText.split(' ');
    const lastWord = words.pop() || '';
    if (lastWord.startsWith('@')) {
      words.push(`@${user.username}`);
      this.commentText = words.join(' ') + ' ';
      this.onTextChange();
    }
    this.showMentionSuggestions = false;
  }

  onSubmit() {
    if (!this.canSubmit) return;

    const mentions = this.extractMentions();
    const hashtags = this.extractHashtags();

    const commentData: CommentData = {
      text: this.commentText,
      attachments: [...this.attachments],
      isPrivate: this.isPrivate,
      isAnonymous: this.isAnonymous,
      mentions,
      hashtags,
    };

    this.submit.emit(commentData);
    this.reset();
  }

  onCancel() {
    this.cancel.emit();
    this.reset();
  }

  private extractMentions(): string[] {
    const mentions = this.commentText.match(/@(\w+)/g);
    return mentions ? mentions.map((m) => m.substring(1)) : [];
  }

  private extractHashtags(): string[] {
    const hashtags = this.commentText.match(/#(\w+)/g);
    return hashtags ? hashtags.map((h) => h.substring(1)) : [];
  }

  private reset() {
    this.commentText = '';
    this.attachments = [];
    this.isPrivate = false;
    this.isAnonymous = false;
    this.showEmojiPicker = false;
    this.showMentionSuggestions = false;
  }
}
