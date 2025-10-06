import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faFileLines, faClock } from '@fortawesome/free-regular-svg-icons';
import { faSearch as faSearchSolid, faPrint as faPrintSolid, faDownload as faDownloadSolid, faShare as faShareSolid, faCheckCircle as faCheckCircleSolid } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, NgOptimizedImage],
  template: `
    <section class="hero" role="banner" aria-label="Terms hero">
      <img 
        ngSrc="https://storage.googleapis.com/uxpilot-auth.appspot.com/8d5e315f02-d96d6a9184fd4982fcb3.png" 
        width="1600" height="400" priority 
        alt="professional legal documents on desk" class="hero-bg">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <h1 class="hero-title">Terms & Conditions</h1>
        <p class="hero-sub">Legal terms and user agreement for the Markt platform</p>
        <div class="hero-meta" aria-label="Document meta">
          <span><fa-icon [icon]="faCalendar"></fa-icon> Last updated: December 15, 2024</span>
          <span><fa-icon [icon]="faFileLines"></fa-icon> Version 2.1</span>
          <span><fa-icon [icon]="faClock"></fa-icon> 15 min read</span>
        </div>
      </div>
    </section>

    <div class="container">
      <aside class="toc" aria-label="Table of contents">
        <div class="card sticky">
          <div class="card-head">
            <h3>Table of Contents</h3>
            <button class="icon-btn" (click)="toggleSearch()" aria-label="Toggle search">
              <fa-icon [icon]="faSearchSolid"></fa-icon>
            </button>
          </div>
          <div class="search" [class.hidden]="!showSearch">
            <input type="text" class="input" placeholder="Search terms..." [(ngModel)]="query" (input)="onSearch()" aria-label="Search terms">
          </div>
          <nav class="toc-list">
            <a class="toc-link" href="#s1" (click)="scrollTo($event, 's1')">1. Acceptance of Terms</a>
            <a class="toc-link" href="#s2" (click)="scrollTo($event, 's2')">2. Definitions</a>
            <a class="toc-link" href="#s3" (click)="scrollTo($event, 's3')">3. User Accounts</a>
            <a class="toc-link" href="#s4" (click)="scrollTo($event, 's4')">4. Platform Usage</a>
            <a class="toc-link" href="#s5" (click)="scrollTo($event, 's5')">5. Prohibited Activities</a>
            <a class="toc-link" href="#s6" (click)="scrollTo($event, 's6')">6. Intellectual Property</a>
            <a class="toc-link" href="#s7" (click)="scrollTo($event, 's7')">7. Payment Terms</a>
          </nav>
          <div class="progress">
            <div class="label">Reading Progress</div>
            <div class="bar"><div class="bar-fill" [style.width.%]="progress"></div></div>
          </div>
        </div>
      </aside>

      <main class="content" aria-label="Terms content">
        <div class="card">
          <div class="action-bar">
            <div class="left">
              <span class="muted">Version 2.1 • Effective December 15, 2024</span>
              <span class="pill success">Current Version</span>
            </div>
            <div class="right">
              <button class="btn" (click)="print()"><fa-icon [icon]="faPrintSolid"></fa-icon><span>Print</span></button>
              <button class="btn" (click)="downloadPdf()"><fa-icon [icon]="faDownloadSolid"></fa-icon><span>PDF</span></button>
              <button class="btn" (click)="share()"><fa-icon [icon]="faShareSolid"></fa-icon><span>Share</span></button>
            </div>
          </div>

          <div class="prose">
            <section id="s1">
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing or using the Markt platform, you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of these terms, you may not access the service.</p>
              <p>These Terms apply to all visitors, users, and others who access or use the service, including students, sellers, and campus community members.</p>
            </section>

            <section id="s2">
              <h2>2. Definitions</h2>
              <div class="note">
                <ul>
                  <li><strong>"Platform"</strong> refers to the Markt social e-commerce platform</li>
                  <li><strong>"User"</strong> means any person who accesses or uses our platform</li>
                  <li><strong>"Seller"</strong> refers to users who list products or services for sale</li>
                  <li><strong>"Buyer"</strong> refers to users who purchase products or services</li>
                  <li><strong>"Content"</strong> includes all text, images, videos, and other materials</li>
                </ul>
              </div>
            </section>

            <section id="s3">
              <h2>3. User Accounts</h2>
              <p>To access certain features of the platform, you must register for an account. You are responsible for:</p>
              <ul>
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>Notifying us of any unauthorized access</li>
                <li>Being responsible for all activities under your account</li>
              </ul>
            </section>

            <section id="s4">
              <h2>4. Platform Usage</h2>
              <p>You may use our platform for lawful purposes only. You agree to comply with all applicable laws and regulations when using our services.</p>
              <div class="callout">
                <p><strong>Campus Community Guidelines:</strong> As a platform designed for students and campus communities, we expect all users to maintain respectful and professional interactions.</p>
              </div>
            </section>

            <section id="s5">
              <h2>5. Prohibited Activities</h2>
              <p>You are prohibited from:</p>
              <div class="grid-2">
                <div class="danger">
                  <h4>Content Violations</h4>
                  <ul>
                    <li>Posting illegal or harmful content</li>
                    <li>Sharing copyrighted materials</li>
                    <li>Spreading misinformation</li>
                  </ul>
                </div>
                <div class="danger">
                  <h4>Platform Abuse</h4>
                  <ul>
                    <li>Creating fake accounts</li>
                    <li>Manipulating reviews or ratings</li>
                    <li>Engaging in fraudulent activities</li>
                  </ul>
                </div>
              </div>
            </section>

            <section id="s6">
              <h2>6. Intellectual Property Rights</h2>
              <p>The platform and its original content, features, and functionality are owned by Markt and are protected by international copyright, trademark, and other intellectual property laws.</p>
            </section>

            <section id="s7">
              <h2>7. Payment Terms</h2>
              <p>All transactions are processed securely through our payment partners. Fees and charges will be clearly displayed before completion of any transaction.</p>
            </section>
          </div>

          <div class="accept">
            <h3>Terms Acceptance</h3>
            <p>By continuing to use Markt, you acknowledge that you have read and agree to these terms.</p>
            <div class="accept-row">
              <span class="accepted"><fa-icon [icon]="faCheckCircleSolid"></fa-icon> Accepted on December 10, 2024</span>
              <button class="primary" (click)="viewAcceptanceHistory()">View Acceptance History</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host { display: block; background: #f9fafb; }
    .hero { position: relative; height: 400px; background: linear-gradient(90deg,#181211,#111827); overflow: hidden; }
    .hero-bg { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; opacity:.2; }
    .hero-overlay { position:absolute; inset:0; background: linear-gradient(90deg, rgba(24,18,17,.8), rgba(17,24,39,.6)); }
    .hero-content { position:relative; z-index:1; height:100%;  margin:0 auto; padding:0 1rem; display:flex; flex-direction:column; justify-content:center; color:#fff; }
    .hero-title { font-size:2.5rem; font-weight:700; margin:0 0 .5rem 0; }
    .hero-sub { font-size:1.125rem; color:#d1d5db; margin:0 0 1rem 0; }
    .hero-meta { display:flex; gap:1rem; color:#9ca3af; font-size:.9rem; flex-wrap:wrap; }

    .container {  margin:0 auto; padding:2rem 1rem; display:grid; grid-template-columns: 280px 1fr; gap:2rem; }
    .card { background:#fff; border:1px solid #e5dddc; border-radius:12px; }
    .sticky { position: sticky; top:96px; }
    .card-head { display:flex; align-items:center; justify-content:space-between; padding:1rem; border-bottom:1px solid #e5dddc; }
    .icon-btn { border:0; background:none; color:#E94C2A; cursor:pointer; }
    .search { padding:0 1rem 1rem; }
    .search.hidden { display:none; }
    .input { width:100%; border:1px solid #e5dddc; border-radius:8px; padding:.5rem .75rem; font-size:.9rem; }
    .toc-list { display:flex; flex-direction:column; gap:.25rem; padding:0 1rem 1rem; }
    .toc-link { color:#886A63; text-decoration:none; font-size:.9rem; padding:.25rem 0; }
    .toc-link:hover { color:#E94C2A; }
    .progress { border-top:1px solid #e5dddc; padding:1rem; }
    .label { font-size:.75rem; color:#886A63; margin-bottom:.5rem; }
    .bar { width:100%; height:6px; background:#e5e7eb; border-radius:9999px; }
    .bar-fill { height:6px; background:#E94C2A; border-radius:9999px; width:0%; }

    .content .action-bar { display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e5dddc; padding:1rem; }
    .left { display:flex; gap:.75rem; align-items:center; flex-wrap:wrap; }
    .muted { color:#6b7280; font-size:.9rem; }
    .pill { padding:.25rem .5rem; font-size:.75rem; border-radius:9999px; border:1px solid #d1fae5; }
    .success { background:#ecfdf5; color:#065f46; }
    .right { display:flex; gap:.5rem; }
    .btn { display:inline-flex; gap:.4rem; align-items:center; border:1px solid #e5dddc; background:#fff; padding:.4rem .6rem; border-radius:8px; cursor:pointer; }
    .btn:hover { background:#f9fafb; }

    .prose { padding:2rem; color:#374151; }
    .prose h2 { color:#181211; font-size:1.5rem; margin:.5rem 0 1rem; }
    .note { background:#F4F1F0; border-radius:8px; padding:1rem; }
    .callout { background:#fffbeb; border-left:4px solid #f59e0b; padding:1rem; border-radius:6px; }
    .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:1rem; }
    .danger { background:#fef2f2; border-radius:8px; padding:1rem; }
    .danger h4 { margin:0 0 .5rem 0; color:#991b1b; }

    .accept { border-top:1px solid #e5dddc; padding:1.25rem; background:#f9fafb; text-align:center; }
    .accept-row { display:flex; gap:1rem; justify-content:center; align-items:center; flex-wrap:wrap; }
    .accepted { color:#059669; font-size:.9rem; display:inline-flex; gap:.4rem; align-items:center; }
    .primary { background:#E94C2A; color:#fff; border:0; padding:.5rem .9rem; border-radius:8px; cursor:pointer; }
    .primary:hover { background:#E94B26; }

    
  `]
})
export class TermsComponent implements OnInit, AfterViewInit {
  faCalendar = faCalendar;
  faFileLines = faFileLines;
  faClock = faClock;
  faSearchSolid = faSearchSolid;
  faPrintSolid = faPrintSolid;
  faDownloadSolid = faDownloadSolid;
  faShareSolid = faShareSolid;
  faCheckCircleSolid = faCheckCircleSolid;

  showSearch = false;
  query = '';
  progress = 0;

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    window.addEventListener('scroll', this.updateProgress, { passive: true });
    this.updateProgress();
  }

  toggleSearch(): void { this.showSearch = !this.showSearch; }

  onSearch(): void {
    // Simple client-side highlight: rely on CSS class applied to matches if needed
    // Keeping minimal for performance; template text kept as-is per design
  }

  scrollTo(event: Event, id: string): void {
    event.preventDefault();
    const el = document.getElementById(id);
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  }

  updateProgress = (): void => {
    const content = document.querySelector('.prose') as HTMLElement | null;
    if (!content) { this.progress = 0; return; }
    const rect = content.getBoundingClientRect();
    const total = content.offsetHeight - window.innerHeight;
    const scrolled = Math.min(Math.max(window.scrollY - (content.offsetTop - 0), 0), Math.max(total, 1));
    this.progress = Math.max(0, Math.min(100, (scrolled / Math.max(total, 1)) * 100));
  };

  print(): void { window.print(); }
  downloadPdf(): void { /* placeholder for server-generated PDF */ }
  share(): void { navigator.share?.({ title: 'Markt Terms', url: window.location.href }).catch(() => {}); }
  viewAcceptanceHistory(): void { /* navigate to history when available */ }
}


