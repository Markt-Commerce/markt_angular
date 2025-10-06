import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faClock,
  faHeadset,
  faEnvelope,
  faPhone,
  faComments,
  faUsers,
  faBook,
  faArrowRight,
  faCloudUploadAlt,
  faStore
} from '@fortawesome/free-solid-svg-icons';

/**
 * Contact Component - Support Tickets & Contact Page
 * 
 * This component provides a comprehensive contact and support ticket system with:
 * - Hero section with support team background and messaging
 * - Contact form with all necessary fields and validation
 * - File upload functionality with drag and drop
 * - Sidebar with response times, contact info, and support options
 * - Ticket tracking functionality
 * 
 * The design follows the Figma specifications for a professional support interface
 * that makes it easy for users to submit support requests and track their tickets.
 */

interface SupportTicket {
  id: string;
  title: string;
  status: 'In Progress' | 'Resolved' | 'Pending';
  statusColor: string;
}

interface ResponseTime {
  level: string;
  time: string;
  isUrgent?: boolean;
}

interface IssueCategory {
  value: string;
  label: string;
}

interface PriorityLevel {
  value: string;
  label: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule],
  template: `
    <div class="contact-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-background">
          <img 
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/c436e43726-62ab0b7f5743104117d3.png" 
            alt="professional customer service team helping students with support tickets"
            class="hero-image"
          />
        </div>
        <div class="hero-content">
          <h1 class="hero-title">Get Help When You Need It</h1>
          <p class="hero-subtitle">Our support team is here to help you resolve any issues quickly and efficiently.</p>
          
          <div class="hero-features">
            <div class="feature-item">
              <fa-icon [icon]="faClock" class="feature-icon"></fa-icon>
              <span>24-48h Response</span>
            </div>
            <div class="feature-item">
              <fa-icon [icon]="faHeadset" class="feature-icon"></fa-icon>
              <span>Expert Support</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Contact Form Section -->
        <div class="contact-form-section">
          <div class="form-container">
            <div class="form-header">
              <h2 class="form-title">Submit a Support Request</h2>
              <p class="form-subtitle">Fill out the form below and we'll get back to you as soon as possible.</p>
            </div>

            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="contact-form">
              <!-- Name and Email Row -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Full Name *</label>
                  <input 
                    type="text" 
                    class="form-input"
                    placeholder="Enter your full name"
                    formControlName="fullName"
                  >
                  <div *ngIf="contactForm.get('fullName')?.invalid && contactForm.get('fullName')?.touched" 
                       class="error-message">
                    Full name is required
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address *</label>
                  <input 
                    type="email" 
                    class="form-input"
                    placeholder="Enter your email"
                    formControlName="email"
                  >
                  <div *ngIf="contactForm.get('email')?.invalid && contactForm.get('email')?.touched" 
                       class="error-message">
                    Valid email is required
                  </div>
                </div>
              </div>

              <!-- Subject -->
              <div class="form-group">
                <label class="form-label">Subject *</label>
                <input 
                  type="text" 
                  class="form-input"
                  placeholder="Brief description of your issue"
                  formControlName="subject"
                >
                <div *ngIf="contactForm.get('subject')?.invalid && contactForm.get('subject')?.touched" 
                     class="error-message">
                  Subject is required
                </div>
              </div>

              <!-- Category and Priority Row -->
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Issue Category *</label>
                  <select 
                    class="form-input"
                    formControlName="category"
                  >
                    <option value="">Select category</option>
                    <option *ngFor="let category of issueCategories" [value]="category.value">
                      {{ category.label }}
                    </option>
                  </select>
                  <div *ngIf="contactForm.get('category')?.invalid && contactForm.get('category')?.touched" 
                       class="error-message">
                    Please select a category
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">Priority Level *</label>
                  <select 
                    class="form-input"
                    formControlName="priority"
                  >
                    <option value="">Select priority</option>
                    <option *ngFor="let priority of priorityLevels" [value]="priority.value">
                      {{ priority.label }}
                    </option>
                  </select>
                  <div *ngIf="contactForm.get('priority')?.invalid && contactForm.get('priority')?.touched" 
                       class="error-message">
                    Please select a priority level
                  </div>
                </div>
              </div>

              <!-- Issue Description -->
              <div class="form-group">
                <label class="form-label">Issue Description *</label>
                <textarea 
                  rows="6" 
                  class="form-input form-textarea"
                  placeholder="Please describe your issue in detail..."
                  formControlName="description"
                ></textarea>
                <div *ngIf="contactForm.get('description')?.invalid && contactForm.get('description')?.touched" 
                     class="error-message">
                  Please describe your issue
                </div>
              </div>

              <!-- File Upload -->
              <div class="form-group">
                <label class="form-label">Attach Files</label>
                <div class="file-upload-area" 
                     (dragover)="onDragOver($event)" 
                     (dragleave)="onDragLeave($event)" 
                     (drop)="onDrop($event)"
                     (click)="triggerFileInput()"
                     [class.drag-over]="isDragOver">
                  <fa-icon [icon]="faCloudUploadAlt" class="upload-icon"></fa-icon>
                  <p class="upload-text">Drag and drop files here or click to browse</p>
                  <button type="button" class="browse-button">Browse Files</button>
                  <input type="file" 
                         multiple 
                         class="file-input" 
                         #fileInput
                         (change)="onFileSelect($event)">
                </div>
                <div *ngIf="selectedFiles.length > 0" class="selected-files">
                  <div *ngFor="let file of selectedFiles" class="file-item">
                    <span class="file-name">{{ file.name }}</span>
                    <button type="button" class="remove-file" (click)="removeFile(file)">×</button>
                  </div>
                </div>
              </div>

              <!-- Contact Method -->
              <div class="form-group">
                <label class="form-label">Preferred Contact Method</label>
                <div class="radio-group">
                  <label class="radio-option">
                    <input type="radio" 
                           name="contactMethod" 
                           value="email" 
                           formControlName="contactMethod"
                           class="radio-input">
                    <span class="radio-label">Email</span>
                  </label>
                  <label class="radio-option">
                    <input type="radio" 
                           name="contactMethod" 
                           value="phone" 
                           formControlName="contactMethod"
                           class="radio-input">
                    <span class="radio-label">Phone</span>
                  </label>
                  <label class="radio-option">
                    <input type="radio" 
                           name="contactMethod" 
                           value="chat" 
                           formControlName="contactMethod"
                           class="radio-input">
                    <span class="radio-label">Live Chat</span>
                  </label>
                </div>
              </div>

              <!-- Submit Button -->
              <button type="submit" 
                      class="submit-button"
                      [disabled]="contactForm.invalid || isSubmitting">
                <span *ngIf="!isSubmitting">Submit Support Request</span>
                <span *ngIf="isSubmitting">Submitting...</span>
              </button>
            </form>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="sidebar">
          <!-- Response Times -->
          <div class="sidebar-card">
            <h3 class="card-title">Response Times</h3>
            <div class="response-times">
              <div *ngFor="let responseTime of responseTimes" class="response-item">
                <span class="response-level">{{ responseTime.level }}</span>
                <span class="response-time" [class.urgent]="responseTime.isUrgent">
                  {{ responseTime.time }}
                </span>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="sidebar-card">
            <h3 class="card-title">Contact Information</h3>
            <div class="contact-info">
              <div class="contact-item">
                <fa-icon [icon]="faEnvelope" class="contact-icon"></fa-icon>
                <div class="contact-details">
                  <p class="contact-label">Email Support</p>
                  <p class="contact-value">support@markt.com</p>
                </div>
              </div>
              <div class="contact-item">
                <fa-icon [icon]="faPhone" class="contact-icon"></fa-icon>
                <div class="contact-details">
                  <p class="contact-label">Phone Support</p>
                  <p class="contact-value">1-800-MARKT-01</p>
                </div>
              </div>
              <div class="contact-item">
                <fa-icon [icon]="faClock" class="contact-icon"></fa-icon>
                <div class="contact-details">
                  <p class="contact-label">Business Hours</p>
                  <p class="contact-value">Mon-Fri 9AM-6PM EST</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Other Support Options -->
          <div class="sidebar-card">
            <h3 class="card-title">Other Support Options</h3>
            <div class="support-options">
              <button class="support-option" (click)="startLiveChat()">
                <div class="option-content">
                  <fa-icon [icon]="faComments" class="option-icon"></fa-icon>
                  <span class="option-label">Live Chat</span>
                </div>
                <fa-icon [icon]="faArrowRight" class="option-arrow"></fa-icon>
              </button>
              <button class="support-option" (click)="openCommunityForum()">
                <div class="option-content">
                  <fa-icon [icon]="faUsers" class="option-icon"></fa-icon>
                  <span class="option-label">Community Forum</span>
                </div>
                <fa-icon [icon]="faArrowRight" class="option-arrow"></fa-icon>
              </button>
              <button class="support-option" (click)="openHelpCenter()">
                <div class="option-content">
                  <fa-icon [icon]="faBook" class="option-icon"></fa-icon>
                  <span class="option-label">Help Center</span>
                </div>
                <fa-icon [icon]="faArrowRight" class="option-arrow"></fa-icon>
              </button>
            </div>
          </div>

          <!-- Track Your Tickets -->
          <div class="sidebar-card">
            <h3 class="card-title">Track Your Tickets</h3>
            <div class="ticket-list">
              <div *ngFor="let ticket of userTickets" class="ticket-item">
                <div class="ticket-header">
                  <span class="ticket-id">#{{ ticket.id }}</span>
                  <span class="ticket-status" [style.background-color]="ticket.statusColor">
                    {{ ticket.status }}
                  </span>
                </div>
                <p class="ticket-title">{{ ticket.title }}</p>
              </div>
            </div>
            <button class="view-all-tickets" (click)="viewAllTickets()">View All Tickets</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .contact-container {
      min-height: 100vh;
      background: #f8f9fa;
    }

    /* Hero Section */
    .hero-section {
      position: relative;
      background: linear-gradient(135deg, #E94C2A 0%, #E94B26 100%);
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      margin-bottom: 2rem;
    }

    .hero-background {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0.2;
    }

    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .hero-content {
      position: relative;
      z-index: 10;
      text-align: center;
      color: white;
      max-width: 800px;
      padding: 0 2rem;
    }

    .hero-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      line-height: 1.2;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      margin: 0 0 2rem 0;
      opacity: 0.9;
      line-height: 1.5;
    }

    .hero-features {
      display: flex;
      justify-content: center;
      gap: 2rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
    }

    .feature-icon {
      font-size: 1.1rem;
    }

    /* Main Content */
    .main-content {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      margin: 0 auto;
      padding: 0 1rem;
    }

    /* Contact Form */
    .contact-form-section {
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .form-container {
      padding: 2rem;
    }

    .form-header {
      margin-bottom: 2rem;
    }

    .form-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
    }

    .form-subtitle {
      color: #6c757d;
      margin: 0;
    }

    .contact-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-label {
      font-weight: 500;
      color: #2d3748;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }

    .form-input {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #E94C2A;
      box-shadow: 0 0 0 3px rgba(233, 76, 42, 0.1);
    }

    .form-textarea {
      resize: vertical;
      min-height: 120px;
    }

    .error-message {
      color: #e53e3e;
      font-size: 0.8rem;
      margin-top: 0.25rem;
    }

    /* File Upload */
    .file-upload-area {
      border: 2px dashed #e2e8f0;
      border-radius: 8px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .file-upload-area:hover,
    .file-upload-area.drag-over {
      border-color: #E94C2A;
      background: rgba(233, 76, 42, 0.05);
    }

    .upload-icon {
      font-size: 2rem;
      color: #6c757d;
      margin-bottom: 0.5rem;
    }

    .upload-text {
      color: #6c757d;
      margin: 0 0 1rem 0;
    }

    .browse-button {
      color: #E94C2A;
      background: none;
      border: none;
      font-weight: 500;
      cursor: pointer;
      text-decoration: underline;
    }

    .file-input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .selected-files {
      margin-top: 1rem;
    }

    .file-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.5rem;
      background: #f7fafc;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .file-name {
      font-size: 0.9rem;
      color: #2d3748;
    }

    .remove-file {
      background: #e53e3e;
      color: white;
      border: none;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    /* Radio Group */
    .radio-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .radio-option {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .radio-input {
      accent-color: #E94C2A;
    }

    .radio-label {
      color: #2d3748;
      font-size: 0.9rem;
    }

    /* Submit Button */
    .submit-button {
      background: #E94C2A;
      color: white;
      border: none;
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 500;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .submit-button:hover:not(:disabled) {
      background: #d4411f;
    }

    .submit-button:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }

    /* Sidebar */
    .sidebar {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .sidebar-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .card-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem 0;
    }

    /* Response Times */
    .response-times {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .response-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .response-level {
      font-size: 0.9rem;
      color: #6c757d;
    }

    .response-time {
      font-size: 0.9rem;
      font-weight: 500;
      color: #2d3748;
    }

    .response-time.urgent {
      color: #E94C2A;
      font-weight: 600;
    }

    /* Contact Info */
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .contact-icon {
      color: #E94C2A;
      font-size: 1rem;
      margin-top: 0.125rem;
    }

    .contact-details {
      flex: 1;
    }

    .contact-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #2d3748;
      margin: 0 0 0.25rem 0;
    }

    .contact-value {
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0;
    }

    /* Support Options */
    .support-options {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .support-option {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 100%;
    }

    .support-option:hover {
      border-color: #E94C2A;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .option-icon {
      color: #E94C2A;
      font-size: 1rem;
    }

    .option-label {
      font-size: 0.9rem;
      font-weight: 500;
      color: #2d3748;
    }

    .option-arrow {
      color: #6c757d;
      font-size: 0.8rem;
    }

    /* Ticket Tracking */
    .ticket-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .ticket-item {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }

    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .ticket-id {
      font-size: 0.9rem;
      font-weight: 500;
      color: #2d3748;
    }

    .ticket-status {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      color: white;
      font-weight: 500;
    }

    .ticket-title {
      font-size: 0.8rem;
      color: #6c757d;
      margin: 0;
    }

    .view-all-tickets {
      width: 100%;
      color: #E94C2A;
      background: none;
      border: none;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      text-align: center;
    }

    .view-all-tickets:hover {
      text-decoration: underline;
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .main-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .sidebar {
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2rem;
      }

      .hero-subtitle {
        font-size: 1.125rem;
      }

      .hero-features {
        flex-direction: column;
        gap: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .radio-group {
        flex-direction: column;
      }

      .form-container {
        padding: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .hero-section {
        height: 250px;
      }

      .hero-title {
        font-size: 1.75rem;
      }

      .hero-subtitle {
        font-size: 1rem;
      }

      .form-container {
        padding: 1rem;
      }
    }
  `]
})
export class ContactComponent implements OnInit {
  private fb = inject(FormBuilder);

  // FontAwesome icons
  faClock = faClock;
  faHeadset = faHeadset;
  faEnvelope = faEnvelope;
  faPhone = faPhone;
  faComments = faComments;
  faUsers = faUsers;
  faBook = faBook;
  faArrowRight = faArrowRight;
  faCloudUploadAlt = faCloudUploadAlt;
  faStore = faStore;

  // Form and component state
  contactForm: FormGroup;
  isSubmitting = false;
  isDragOver = false;
  selectedFiles: File[] = [];

  // Issue categories for dropdown
  issueCategories: IssueCategory[] = [
    { value: 'account', label: 'Account & Login' },
    { value: 'payment', label: 'Payment & Billing' },
    { value: 'order', label: 'Order & Shipping' },
    { value: 'technical', label: 'Technical Issues' },
    { value: 'community', label: 'Community & Social' },
    { value: 'verification', label: 'Seller Verification' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'bug', label: 'Bug Report' }
  ];

  // Priority levels for dropdown
  priorityLevels: PriorityLevel[] = [
    { value: 'low', label: 'Low - General Questions' },
    { value: 'medium', label: 'Medium - Account Issues' },
    { value: 'high', label: 'High - Payment Problems' },
    { value: 'urgent', label: 'Urgent - Security Concerns' },
    { value: 'critical', label: 'Critical - System Outages' }
  ];

  // Response times for sidebar
  responseTimes: ResponseTime[] = [
    { level: 'Standard', time: '24-48 hours' },
    { level: 'High Priority', time: '4-8 hours' },
    { level: 'Urgent', time: '1-2 hours' },
    { level: 'Critical', time: 'Immediate', isUrgent: true }
  ];

  // Sample user tickets
  userTickets: SupportTicket[] = [
    {
      id: '12345',
      title: 'Payment issue with order',
      status: 'In Progress',
      statusColor: '#fbbf24'
    },
    {
      id: '12344',
      title: 'Account verification help',
      status: 'Resolved',
      statusColor: '#10b981'
    }
  ];

  constructor() {
    this.contactForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      category: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      description: ['', [Validators.required]],
      contactMethod: ['email']
    });
  }

  ngOnInit(): void {
    console.log('Contact component initialized');
  }

  /**
   * Handles form submission
   * In a real implementation, this would send data to a backend service
   */
  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      const formData = {
        ...this.contactForm.value,
        files: this.selectedFiles,
        timestamp: new Date().toISOString()
      };

      console.log('Submitting support request:', formData);
      
      // Simulate API call
      setTimeout(() => {
        this.isSubmitting = false;
        alert('Support request submitted successfully! Ticket #' + Math.floor(Math.random() * 100000) + ' has been created.');
        this.contactForm.reset();
        this.selectedFiles = [];
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Handles drag over event for file upload
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  /**
   * Handles drag leave event for file upload
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  /**
   * Handles drop event for file upload
   */
  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  /**
   * Triggers file input click
   */
  triggerFileInput(): void {
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    fileInput?.click();
  }

  /**
   * Handles file selection from input
   */
  onFileSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      this.addFiles(Array.from(target.files));
    }
  }

  /**
   * Adds files to the selected files array
   */
  private addFiles(files: File[]): void {
    // Filter out duplicates and add new files
    const newFiles = files.filter(file => 
      !this.selectedFiles.some(existing => existing.name === file.name)
    );
    this.selectedFiles = [...this.selectedFiles, ...newFiles];
  }

  /**
   * Removes a file from the selected files array
   */
  removeFile(file: File): void {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
  }

  /**
   * Starts live chat support
   */
  startLiveChat(): void {
    console.log('Starting live chat');
    // TODO: Implement live chat functionality
    alert('Live chat feature coming soon!');
  }

  /**
   * Opens community forum
   */
  openCommunityForum(): void {
    console.log('Opening community forum');
    // TODO: Navigate to community forum
    alert('Community forum feature coming soon!');
  }

  /**
   * Opens help center
   */
  openHelpCenter(): void {
    console.log('Opening help center');
    // TODO: Navigate to help center
    alert('Help center feature coming soon!');
  }

  /**
   * Views all tickets
   */
  viewAllTickets(): void {
    console.log('Viewing all tickets');
    // TODO: Navigate to tickets page
    alert('Ticket management feature coming soon!');
  }
}
