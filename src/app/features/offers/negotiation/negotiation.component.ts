import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock, faChevronRight, faBell, faPaperPlane, faPaperclip, faImage, faLightbulb, faCheck } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../../core/services/api.service';

interface NegotiationStats {
  askingPrice: number;
  marketAverage: number;
  timeLeftLabel: string;
  yourOffer: number;
}

interface MessageItem {
  id: string;
  from: 'me' | 'other';
  text: string;
  timestamp: string; // ISO
  avatarUrl: string;
}

@Component({
  selector: 'app-negotiation',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, NgOptimizedImage],
  template: `
    <div class="bg-gray-50 min-h-screen">
      <main class=" mx-auto px-6 py-8">
        <div class="grid grid-cols-12 gap-8">
          <!-- Left: Details + Chat -->
          <div class="col-span-12 lg:col-span-8">
            <!-- Offer Header Card -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h1 class="text-2xl font-bold text-gray-900 mb-2">{{ title() }}</h1>
                  <div class="flex items-center space-x-4">
                    <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center">
                      <fa-icon [icon]="faClock" class="mr-1"></fa-icon>
                      Negotiating
                    </span>
                    <span class="text-gray-600 text-sm">Offer ID: {{ offerId() }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-3xl font-bold text-gray-900">{{ stats().yourOffer | currency }}</div>
                  <div class="text-sm text-gray-500">Your offer</div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900">{{ stats().askingPrice | currency }}</div>
                  <div class="text-sm text-gray-500">Asking Price</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-green-600">{{ stats().marketAverage | currency }}</div>
                  <div class="text-sm text-gray-500">Market Average</div>
                </div>
                <div class="text-center">
                  <div class="text-lg font-semibold text-gray-900">{{ stats().timeLeftLabel }}</div>
                  <div class="text-sm text-gray-500">Time Left</div>
                </div>
              </div>
            </div>

            <!-- Chat -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200">
              <div class="p-6 border-b border-gray-200">
                <div class="flex items-center justify-between">
                  <h2 class="text-lg font-semibold text-gray-900">Negotiation Chat</h2>
                  <div class="flex items-center space-x-2 text-sm text-gray-500">
                    <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{{ counterpartName() }} is online</span>
                  </div>
                </div>
              </div>

              <div class="h-96 overflow-y-auto p-6 space-y-4">
                <!-- Other -->
                <div class="flex items-start space-x-3" *ngFor="let m of messages(); trackBy: trackByMessageId">
                  <ng-container [ngSwitch]="m.from">
                    <ng-container *ngSwitchCase="'other'">
                      <img [ngSrc]="m.avatarUrl" width="32" height="32" alt="counterpart" class="w-8 h-8 rounded-full" />
                      <div class="flex-1">
                        <div class="bg-gray-100 rounded-2xl rounded-tl-md p-4 max-w-md">
                          <p class="text-gray-900">{{ m.text }}</p>
                        </div>
                        <span class="text-xs text-gray-500 mt-1 block">{{ relativeTime(m.timestamp) }}</span>
                      </div>
                    </ng-container>
                    <ng-container *ngSwitchCase="'me'">
                      <div class="flex-1 flex justify-end">
                        <div class="bg-[#E94C2A] text-white rounded-2xl rounded-tr-md p-4 max-w-md">
                          <p>{{ m.text }}</p>
                        </div>
                      </div>
                      <img [ngSrc]="m.avatarUrl" width="32" height="32" alt="me" class="w-8 h-8 rounded-full" />
                    </ng-container>
                  </ng-container>
                </div>
              </div>

              <div class="p-6 border-t border-gray-200">
                <div class="flex items-end space-x-3">
                  <div class="flex-1">
                    <textarea [ngModel]="draftMessage()" (ngModelChange)="draftMessage.set($event)" placeholder="Type your message..." class="w-full p-3 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-[#E94C2A] focus:border-transparent" rows="2"></textarea>
                  </div>
                  <button (click)="send()" class="bg-[#E94C2A] text-white p-3 rounded-xl hover:bg-[#ff6b47] transition-colors" [disabled]="!draftMessage().trim()">
                    <fa-icon [icon]="faPaperPlane"></fa-icon>
                  </button>
                </div>
                <div class="flex items-center justify-between mt-3">
                  <div class="flex items-center space-x-3 text-gray-500">
                    <button class="hover:text-gray-700" type="button"><fa-icon [icon]="faPaperclip"></fa-icon></button>
                    <button class="hover:text-gray-700" type="button"><fa-icon [icon]="faImage"></fa-icon></button>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium" type="button" (click)="acceptCurrent()">Accept {{ counterPrice() | currency }}</button>
                    <button class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium" type="button" (click)="counter()">Counter Offer</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Sidebar -->
          <div class="col-span-12 lg:col-span-4 space-y-6">
            <!-- Product Details -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
              <div class="space-y-4">
                <img class="w-full h-48 object-cover rounded-lg" [ngSrc]="productImage()" width="640" height="320" alt="product" />
                <div class="space-y-3">
                  <div class="flex justify-between"><span class="text-gray-600">Condition</span><span class="font-medium text-gray-900">Like New</span></div>
                  <div class="flex justify-between"><span class="text-gray-600">Storage</span><span class="font-medium text-gray-900">512GB SSD</span></div>
                  <div class="flex justify-between"><span class="text-gray-600">Memory</span><span class="font-medium text-gray-900">16GB RAM</span></div>
                  <div class="flex justify-between"><span class="text-gray-600">Warranty</span><span class="font-medium text-gray-900">18 months</span></div>
                </div>
              </div>
            </div>

            <!-- Seller Profile -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Seller Profile</h3>
              <div class="flex items-center space-x-3 mb-4">
                <img [ngSrc]="sellerAvatar()" width="48" height="48" alt="seller" class="w-12 h-12 rounded-full" />
                <div>
                  <div class="font-medium text-gray-900">{{ counterpartName() }}</div>
                  <div class="text-sm text-gray-500">Computer Science Student</div>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-gray-600">Rating</span>
                  <div class="flex items-center space-x-1">
                    <span class="text-sm text-gray-600">4.9</span>
                  </div>
                </div>
                <div class="flex justify-between"><span class="text-gray-600">Sales</span><span class="font-medium text-gray-900">23 completed</span></div>
                <div class="flex justify-between"><span class="text-gray-600">Response Time</span><span class="font-medium text-gray-900">< 1 hour</span></div>
              </div>
            </div>

            <!-- Timeline -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Negotiation Timeline</h3>
              <div class="space-y-4">
                <div class="flex items-start space-x-3">
                  <div class="w-3 h-3 bg-green-600 rounded-full mt-1"></div>
                  <div class="flex-1"><div class="font-medium text-gray-900">Counter offer received</div><div class="text-sm text-gray-500">{{ counterPrice() | currency }} - 1 hour ago</div></div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-3 h-3 bg-[#E94C2A] rounded-full mt-1"></div>
                  <div class="flex-1"><div class="font-medium text-gray-900">Your counter offer</div><div class="text-sm text-gray-500">{{ yourCounterPrice() | currency }} - 2 hours ago</div></div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="w-3 h-3 bg-gray-300 rounded-full mt-1"></div>
                  <div class="flex-1"><div class="font-medium text-gray-900">Initial offer</div><div class="text-sm text-gray-500">{{ stats().yourOffer | currency }} - 3 hours ago</div></div>
                </div>
              </div>
            </div>

            <!-- Tips -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">
                <fa-icon [icon]="faLightbulb" class="text-yellow-500 mr-2"></fa-icon>
                Negotiation Tips
              </h3>
              <ul class="space-y-2 text-sm text-gray-700">
                <li class="flex items-start space-x-2"><fa-icon [icon]="faCheck" class="text-green-600 text-xs mt-1"></fa-icon><span>Be respectful and professional</span></li>
                <li class="flex items-start space-x-2"><fa-icon [icon]="faCheck" class="text-green-600 text-xs mt-1"></fa-icon><span>Research market prices first</span></li>
                <li class="flex items-start space-x-2"><fa-icon [icon]="faCheck" class="text-green-600 text-xs mt-1"></fa-icon><span>Consider pickup/delivery options</span></li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [``]
})
export class NegotiationComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  // icons
  faClock = faClock;
  faChevronRight = faChevronRight;
  faBell = faBell;
  faPaperPlane = faPaperPlane;
  faPaperclip = faPaperclip;
  faImage = faImage;
  faLightbulb = faLightbulb;
  faCheck = faCheck;

  // state (signals for performance)
  offerId = signal<string>('');
  title = signal<string>('MacBook Pro 16\" M2 - Like New');
  counterpartName = signal<string>('Sarah Chen');
  sellerAvatar = signal<string>('https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg');
  productImage = signal<string>('https://storage.googleapis.com/uxpilot-auth.appspot.com/d1e9d67cc1-fea7b5e3f599c4761ef7.png');
  stats = signal<NegotiationStats>({ askingPrice: 2300, marketAverage: 2200, timeLeftLabel: '4 hours', yourOffer: 2100 });
  counterPrice = signal<number>(2175);
  yourCounterPrice = signal<number>(2150);
  messages = signal<MessageItem[]>([
    { id: 'm1', from: 'other', text: `Hi! Thanks for your interest in my MacBook. I see you've offered $2,100. The laptop is in excellent condition with minimal usage.`, timestamp: new Date(Date.now() - 2*60*60*1000).toISOString(), avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' },
    { id: 'm2', from: 'me', text: `Hi Sarah! I've been looking for this exact model. Would you consider $2,150? I can pick it up today if we agree.`, timestamp: new Date(Date.now() - 2*60*60*1000 + 5*60*1000).toISOString(), avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' },
    { id: 'm3', from: 'other', text: `That's closer! I was hoping to get at least $2,200 since it's barely 6 months old and includes the original box and charger. How about we meet at $2,175?`, timestamp: new Date(Date.now() - 60*60*1000).toISOString(), avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' },
  ]);
  draftMessage = signal<string>('');

  constructor() {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.offerId.set(id);
    // Integrate ApiService here as backend becomes available; keep demo state for UI parity
  }

  trackByMessageId(_index: number, item: MessageItem): string { return item.id; }

  relativeTime(iso: string): string {
    const date = new Date(iso); const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours < 1) { const mins = Math.max(1, Math.floor(diffMs / (1000 * 60))); return `${mins} min ago`; }
    if (hours < 24) { return `${hours} hours ago`; }
    return `${Math.floor(hours/24)} days ago`;
  }

  send(): void {
    const text = this.draftMessage().trim();
    if (!text) return;
    const newMsg: MessageItem = { id: `m${Date.now()}`, from: 'me', text, timestamp: new Date().toISOString(), avatarUrl: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' };
    this.messages.set([...this.messages(), newMsg]);
    this.draftMessage.set('');
  }

  acceptCurrent(): void {
    // Wire to ApiService when backend is ready
  }

  counter(): void {
    // Wire to ApiService when backend is ready
  }
}


