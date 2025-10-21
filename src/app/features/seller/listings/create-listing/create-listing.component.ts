import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ROUTES_ABSOLUTE } from '../../../../core/config/routes.config';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock, faCloudUploadAlt, faPlus, faLightbulb, faChartLine, faBook, faLaptop, faHome, faInfoCircle, faCamera, faDollarSign, faTags, faTruck, faSave, faEye } from '@fortawesome/free-solid-svg-icons';
import { faClock as faClockRegular } from '@fortawesome/free-regular-svg-icons';

interface FormSection {
  id: string;
  title: string;
  icon: string;
  active: boolean;
}

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, FontAwesomeModule],
  template: `
    <!-- Main Container -->
    <div class="mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Progress Bar -->
      <div class="bg-white rounded-lg shadow-sm border border-border p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-dark">Create New Listing</h1>
          <div class="flex items-center space-x-2 text-sm text-muted">
            <fa-icon [icon]="faClock"></fa-icon>
            <span>{{ autoSaveStatus() }}</span>
          </div>
        </div>
        
        <div class="flex items-center space-x-4">
          <div class="flex items-center" *ngFor="let step of progressSteps(); let i = index">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                 [class]="step.active ? 'bg-primary text-white' : 'bg-gray-300 text-gray-600'">
              {{ step.number }}
            </div>
            <span class="ml-2 text-sm font-medium"
                  [class]="step.active ? 'text-primary' : 'text-gray-600'">
              {{ step.label }}
            </span>
            <div class="flex-1 h-px bg-gray-300" *ngIf="i < progressSteps().length - 1"></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-12 gap-8">
        
        <!-- Sidebar Navigation -->
        <div class="col-span-3">
          <div class="bg-white rounded-lg shadow-sm border border-border p-6 sticky top-24">
            <h3 class="font-semibold text-dark mb-4">Form Sections</h3>
            <nav class="space-y-2">
              <span *ngFor="let section of formSections()" 
                    class="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer transition-colors"
                    [class]="section.active ? 'text-primary bg-light font-medium' : 'text-gray-600 hover:text-primary hover:bg-light'"
                    (click)="scrollToSection(section.id)">
                <fa-icon [icon]="getSectionIcon(section.id)" class="mr-3"></fa-icon>
                {{ section.title }}
              </span>
            </nav>
            
            <div class="mt-6 pt-6 border-t border-border">
              <button type="button" 
                      class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors mb-2"
                      (click)="saveAsDraft()">
                <fa-icon [icon]="faSave" class="mr-2"></fa-icon>
                Save as Draft
              </button>
              <button type="button" 
                      class="w-full bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-secondary transition-colors"
                      (click)="previewListing()">
                <fa-icon [icon]="faEye" class="mr-2"></fa-icon>
                Preview Listing
              </button>
            </div>
          </div>
        </div>

        <!-- Main Form Content -->
        <div class="col-span-9 space-y-8">
          
          <form [formGroup]="listingForm" (ngSubmit)="onSubmit()">
            
            <!-- Basic Information -->
            <div id="basic-info" class="bg-white rounded-lg shadow-sm border border-border p-6">
              <h2 class="text-xl font-semibold text-dark mb-6">Basic Information</h2>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-dark mb-2">Product Title *</label>
                  <input type="text" 
                         formControlName="title"
                         placeholder="Enter a clear, descriptive title for your product" 
                         class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                  <div class="flex justify-between mt-1">
                    <span class="text-xs text-muted">Be specific and include key details</span>
                    <span class="text-xs text-muted">{{ getTitleLength() }}/80 characters</span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-dark mb-2">Brand</label>
                    <input type="text" 
                           formControlName="brand"
                           placeholder="e.g., Apple, Nike, Custom" 
                           class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-dark mb-2">Condition *</label>
                    <select formControlName="condition"
                            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="">Select condition</option>
                      <option value="brand-new">Brand New</option>
                      <option value="like-new">Like New</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="for-parts">For Parts</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-dark mb-2">Description *</label>
                  <textarea rows="6" 
                            formControlName="description"
                            placeholder="Describe your product in detail. Include dimensions, features, condition details, and any flaws..." 
                            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"></textarea>
                  <div class="flex justify-between mt-1">
                    <span class="text-xs text-muted">Include all relevant details buyers need to know</span>
                    <span class="text-xs text-muted">{{ getDescriptionLength() }}/1000 characters</span>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-dark mb-2">Tags & Keywords</label>
                  <input type="text" 
                         formControlName="tags"
                         placeholder="Add tags separated by commas (e.g., textbook, engineering, calculus)" 
                         class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                  <span class="text-xs text-muted">Help buyers find your product with relevant keywords</span>
                </div>
              </div>
            </div>

            <!-- Photos & Media -->
            <div id="photos" class="bg-white rounded-lg shadow-sm border border-border p-6">
              <h2 class="text-xl font-semibold text-dark mb-6">Photos & Media</h2>
              
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-dark mb-2">Primary Photo *</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
                       (click)="triggerPrimaryPhotoUpload()"
                       (dragover)="onDragOver($event)" 
                       (drop)="onDrop($event)">
                    <fa-icon [icon]="faCloudUploadAlt" class="text-4xl text-gray-400 mb-4"></fa-icon>
                    <p class="text-sm text-gray-600 mb-2">Drop your main photo here or click to browse</p>
                    <p class="text-xs text-muted">JPG, PNG up to 10MB</p>
                    <input #primaryPhotoInput type="file" accept="image/*" style="display: none;" (change)="onPrimaryPhotoSelected($event)">
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-dark mb-2">Additional Photos</label>
                  <div class="grid grid-cols-2 gap-3">
                    <div *ngFor="let photo of additionalPhotos(); let i = index" 
                         class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer aspect-square flex flex-col justify-center"
                         (click)="triggerAdditionalPhotoUpload(i)">
                      <fa-icon [icon]="faPlus" class="text-2xl text-gray-400 mb-2"></fa-icon>
                      <span class="text-xs text-muted">Add Photo</span>
                      <input #additionalPhotoInput type="file" accept="image/*" style="display: none;" (change)="onAdditionalPhotoSelected($event, i)">
                    </div>
                  </div>
                  <p class="text-xs text-muted mt-2">Add up to 8 additional photos</p>
                </div>
              </div>

              <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div class="flex items-start">
                  <fa-icon [icon]="faLightbulb" class="text-blue-500 mt-1 mr-3"></fa-icon>
                  <div>
                    <h4 class="text-sm font-medium text-blue-900">Photo Tips</h4>
                    <ul class="text-xs text-blue-700 mt-1 space-y-1">
                      <li>• Use natural lighting for best results</li>
                      <li>• Show different angles and any flaws</li>
                      <li>• Include size references when helpful</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pricing Configuration -->
            <div id="pricing" class="bg-white rounded-lg shadow-sm border border-border p-6">
              <h2 class="text-xl font-semibold text-dark mb-6">Pricing Configuration</h2>
              
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-dark mb-2">Asking Price *</label>
                  <div class="relative">
                    <span class="absolute left-3 top-3 text-gray-500">$</span>
                    <input type="number" 
                           formControlName="price"
                           placeholder="0.00" 
                           class="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                  </div>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-dark mb-2">Pricing Type</label>
                  <select formControlName="pricingType"
                          class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                    <option value="fixed">Fixed Price</option>
                    <option value="best-offer">Best Offer</option>
                    <option value="auction">Auction Style</option>
                  </select>
                </div>
              </div>

              <div class="mt-6 space-y-4">
                <div class="flex items-center">
                  <input type="checkbox" 
                         id="negotiable" 
                         formControlName="allowNegotiations"
                         class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                  <label for="negotiable" class="ml-2 text-sm text-dark">Allow price negotiations</label>
                </div>
                
                <div class="flex items-center">
                  <input type="checkbox" 
                         id="bulk-discount" 
                         formControlName="bulkDiscounts"
                         class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                  <label for="bulk-discount" class="ml-2 text-sm text-dark">Offer bulk discounts for multiple quantities</label>
                </div>
              </div>

              <div class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <div class="flex items-center">
                  <fa-icon [icon]="faChartLine" class="text-green-600 mr-3"></fa-icon>
                  <div>
                    <h4 class="text-sm font-medium text-green-900">Pricing Suggestion</h4>
                    <p class="text-xs text-green-700 mt-1">Similar items on campus sell for $45-65. Consider pricing competitively.</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Category Selection -->
            <div id="category" class="bg-white rounded-lg shadow-sm border border-border p-6">
              <h2 class="text-xl font-semibold text-dark mb-6">Category Selection</h2>
              
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div *ngFor="let category of categories()" 
                     class="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                     [class]="selectedCategory() === category.id ? 'border-primary bg-light' : 'border-gray-300'"
                     (click)="selectCategory(category.id)">
                  <fa-icon [icon]="getCategoryIcon(category.id)" 
                           [class]="selectedCategory() === category.id ? 'text-primary text-2xl mb-2' : 'text-gray-600 text-2xl mb-2'"></fa-icon>
                  <h4 class="font-medium"
                      [class]="selectedCategory() === category.id ? 'text-primary' : 'text-dark'">
                    {{ category.name }}
                  </h4>
                  <p class="text-xs text-muted">{{ category.description }}</p>
                </div>
              </div>

              <div class="border border-primary rounded-lg p-4 bg-light" *ngIf="selectedCategory()">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="font-medium text-primary">{{ getSelectedCategoryName() }} Selected</h4>
                  <button type="button" class="text-xs text-muted hover:text-primary">Change</button>
                </div>
                
                <div class="space-y-3">
                  <div>
                    <label class="block text-sm font-medium text-dark mb-1">Subject Area</label>
                    <select formControlName="subjectArea"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="">Select subject</option>
                      <option value="mathematics">Mathematics</option>
                      <option value="engineering">Engineering</option>
                      <option value="business">Business</option>
                      <option value="science">Science</option>
                      <option value="liberal-arts">Liberal Arts</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-dark mb-1">Course Level</label>
                    <select formControlName="courseLevel"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="">Select level</option>
                      <option value="100">100-level (Freshman)</option>
                      <option value="200">200-level (Sophomore)</option>
                      <option value="300">300-level (Junior)</option>
                      <option value="400">400-level (Senior)</option>
                      <option value="graduate">Graduate Level</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipping & Logistics -->
            <div id="shipping" class="bg-white rounded-lg shadow-sm border border-border p-6">
              <h2 class="text-xl font-semibold text-dark mb-6">Shipping & Logistics</h2>
              
              <div class="space-y-6">
                <div>
                  <label class="block text-sm font-medium text-dark mb-3">Delivery Options *</label>
                  <div class="space-y-3">
                    <label *ngFor="let option of deliveryOptions()" 
                           class="flex items-center p-3 border border-gray-300 rounded-lg hover:border-primary cursor-pointer">
                      <input type="checkbox" 
                             [value]="option.id"
                             formControlName="deliveryOptions"
                             class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded mr-3">
                      <div class="flex-1">
                        <div class="flex items-center justify-between">
                          <span class="font-medium text-dark">{{ option.name }}</span>
                          <span class="text-sm" 
                                [class]="option.price === 'Free' ? 'text-green-600' : 'text-muted'">
                            {{ option.price }}
                          </span>
                        </div>
                        <p class="text-xs text-muted">{{ option.description }}</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-dark mb-2">Item Weight (for shipping)</label>
                    <div class="flex">
                      <input type="number" 
                             formControlName="weight"
                             placeholder="0.0" 
                             class="flex-1 px-4 py-3 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-primary focus:border-transparent">
                      <select formControlName="weightUnit"
                              class="px-4 py-3 border border-l-0 border-gray-300 rounded-r-md focus:ring-2 focus:ring-primary focus:border-transparent">
                        <option value="lbs">lbs</option>
                        <option value="oz">oz</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-dark mb-2">Handling Time</label>
                    <select formControlName="handlingTime"
                            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="same-day">Same day</option>
                      <option value="1-day">1 business day</option>
                      <option value="2-3-days">2-3 business days</option>
                      <option value="1-week">1 week</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- Publishing Options -->
            <div id="publishing" class="bg-white rounded-lg shadow-sm border border-border p-6">
              <h2 class="text-xl font-semibold text-dark mb-6">Publishing Options</h2>
              
              <div class="space-y-6">
                <div class="grid grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium text-dark mb-2">Visibility</label>
                    <select formControlName="visibility"
                            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="public">Public - Anyone can see</option>
                      <option value="campus">Campus Only - Students only</option>
                      <option value="friends">Friends Only - Your connections</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-dark mb-2">Listing Duration</label>
                    <select formControlName="duration"
                            class="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent">
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="until-sold">Until sold</option>
                    </select>
                  </div>
                </div>

                <div class="flex items-center space-x-6">
                  <label class="flex items-center">
                    <input type="checkbox" 
                           formControlName="autoRenew"
                           class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                    <span class="ml-2 text-sm text-dark">Auto-renew when expired</span>
                  </label>
                  
                  <label class="flex items-center">
                    <input type="checkbox" 
                           formControlName="allowOffers"
                           class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded">
                    <span class="ml-2 text-sm text-dark">Allow offers and negotiations</span>
                  </label>
                </div>

                <div class="flex items-center justify-between pt-6 border-t border-border">
                  <div class="flex items-center space-x-4">
                    <button type="button" 
                            class="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                      Save as Draft
                    </button>
                    <button type="button" 
                            class="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                      Preview Listing
                    </button>
                  </div>
                  
                  <button type="submit" 
                          class="px-8 py-3 bg-primary text-white rounded-md hover:bg-secondary transition-colors font-medium"
                          [disabled]="listingForm.invalid || loading()">
                    {{ loading() ? 'Publishing...' : 'Publish Listing' }}
                  </button>
                </div>
              </div>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom Tailwind-like utilities for the component */
    .bg-gray-50 { background-color: #f9fafb; }
    .bg-white { background-color: #ffffff; }
    .bg-primary { background-color: #E94C2A; }
    .bg-secondary { background-color: #E94B26; }
    .bg-light { background-color: #F4F1F0; }
    .bg-blue-50 { background-color: #eff6ff; }
    .bg-green-50 { background-color: #f0fdf4; }
    
    .text-dark { color: #181211; }
    .text-muted { color: #886A63; }
    .text-primary { color: #E94C2A; }
    .text-gray-600 { color: #6b7280; }
    .text-gray-500 { color: #9ca3af; }
    .text-gray-700 { color: #374151; }
    .text-white { color: #ffffff; }
    .text-blue-500 { color: #3b82f6; }
    .text-blue-700 { color: #1d4ed8; }
    .text-blue-900 { color: #1e3a8a; }
    .text-green-600 { color: #16a34a; }
    .text-green-700 { color: #15803d; }
    .text-green-900 { color: #14532d; }
    
    .border-border { border-color: #E5DDDC; }
    .border-gray-300 { border-color: #d1d5db; }
    .border-blue-200 { border-color: #bfdbfe; }
    .border-green-200 { border-color: #bbf7d0; }
    .border-primary { border-color: #E94C2A; }
    
    .max-w-7xl { max-width: 80rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .px-8 { padding-left: 2rem; padding-right: 2rem; }
    .py-8 { padding-top: 2rem; padding-bottom: 2rem; }
    .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .p-4 { padding: 1rem; }
    .p-3 { padding: 0.75rem; }
    .mb-8 { margin-bottom: 2rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mr-3 { margin-right: 0.75rem; }
    .mr-2 { margin-right: 0.5rem; }
    .ml-2 { margin-left: 0.5rem; }
    
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-md { border-radius: 0.375rem; }
    .rounded-l-md { border-top-left-radius: 0.375rem; border-bottom-left-radius: 0.375rem; }
    .rounded-r-md { border-top-right-radius: 0.375rem; border-bottom-right-radius: 0.375rem; }
    
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .border { border-width: 1px; }
    .border-2 { border-width: 2px; }
    .border-dashed { border-style: dashed; }
    .border-t { border-top-width: 1px; }
    .border-l-0 { border-left-width: 0; }
    
    .grid { display: grid; }
    .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
    .grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .col-span-3 { grid-column: span 3 / span 3; }
    .col-span-9 { grid-column: span 9 / span 9; }
    .gap-8 { gap: 2rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-4 { gap: 1rem; }
    .gap-3 { gap: 0.75rem; }
    
    .flex { display: flex; }
    .flex-1 { flex: 1 1 0%; }
    .flex-col { flex-direction: column; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .justify-end { justify-content: flex-end; }
    .space-x-4 > :not([hidden]) ~ :not([hidden]) { margin-left: 1rem; }
    .space-x-6 > :not([hidden]) ~ :not([hidden]) { margin-left: 1.5rem; }
    .space-x-2 > :not([hidden]) ~ :not([hidden]) { margin-left: 0.5rem; }
    .space-y-6 > :not([hidden]) ~ :not([hidden]) { margin-top: 1.5rem; }
    .space-y-3 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.75rem; }
    .space-y-1 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.25rem; }
    .space-y-2 > :not([hidden]) ~ :not([hidden]) { margin-top: 0.5rem; }
    
    .w-full { width: 100%; }
    .w-8 { width: 2rem; }
    .h-8 { height: 2rem; }
    .h-4 { height: 1rem; }
    .h-px { height: 1px; }
    .aspect-square { aspect-ratio: 1 / 1; }
    
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-medium { font-weight: 500; }
    
    .block { display: block; }
    .sticky { position: sticky; }
    .top-24 { top: 6rem; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .left-3 { left: 0.75rem; }
    .top-3 { top: 0.75rem; }
    
    .cursor-pointer { cursor: pointer; }
    .transition-colors { transition-property: color, background-color, border-color, text-decoration-color, fill, stroke; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms; }
    
    .focus\\:ring-2:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
    .focus\\:ring-primary:focus { --tw-ring-color: #E94C2A; }
    .focus\\:border-transparent:focus { border-color: transparent; }
    
    .hover\\:border-primary:hover { border-color: #E94C2A; }
    .hover\\:bg-gray-50:hover { background-color: #f9fafb; }
    .hover\\:bg-gray-200:hover { background-color: #e5e7eb; }
    .hover\\:bg-secondary:hover { background-color: #E94B26; }
    .hover\\:text-primary:hover { color: #E94C2A; }
    
    .disabled\\:opacity-50:disabled { opacity: 0.5; }
    
    /* Custom styles for better UX */
    input, select, textarea {
      font-family: inherit;
    }
    
    input:focus, select:focus, textarea:focus {
      outline: none;
    }
    
    /* Responsive adjustments */
    @media (max-width: 768px) {
      .grid-cols-12 {
        grid-template-columns: 1fr;
      }
      .col-span-3, .col-span-9 {
        grid-column: span 1 / span 1;
      }
      .grid-cols-2, .grid-cols-3 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CreateListingComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  // FontAwesome icons
  faClock = faClockRegular;
  faCloudUploadAlt = faCloudUploadAlt;
  faPlus = faPlus;
  faLightbulb = faLightbulb;
  faChartLine = faChartLine;
  faBook = faBook;
  faLaptop = faLaptop;
  faHome = faHome;
  faInfoCircle = faInfoCircle;
  faCamera = faCamera;
  faDollarSign = faDollarSign;
  faTags = faTags;
  faTruck = faTruck;
  faSave = faSave;
  faEye = faEye;

  // Signals for reactive state
  loading = signal(false);
  selectedCategory = signal<string>('textbooks');
  autoSaveStatus = signal('Auto-saved 2 min ago');
  additionalPhotos = signal<File[]>([]);
  
  // Form
  listingForm!: FormGroup;

  // Progress steps
  progressSteps = signal([
    { number: 1, label: 'Product Info', active: true },
    { number: 2, label: 'Photos & Media', active: false },
    { number: 3, label: 'Pricing', active: false },
    { number: 4, label: 'Publish', active: false }
  ]);

  // Form sections for sidebar navigation
  formSections = signal<FormSection[]>([
    { id: 'basic-info', title: 'Basic Information', icon: 'info-circle', active: true },
    { id: 'photos', title: 'Photos & Media', icon: 'camera', active: false },
    { id: 'pricing', title: 'Pricing', icon: 'dollar-sign', active: false },
    { id: 'category', title: 'Category', icon: 'tags', active: false },
    { id: 'shipping', title: 'Shipping', icon: 'truck', active: false }
  ]);

  // Categories
  categories = signal([
    { 
      id: 'textbooks', 
      name: 'Textbooks', 
      icon: 'book', 
      description: 'Course materials, study guides' 
    },
    { 
      id: 'electronics', 
      name: 'Electronics', 
      icon: 'laptop', 
      description: 'Computers, phones, accessories' 
    },
    { 
      id: 'dorm-living', 
      name: 'Dorm & Living', 
      icon: 'home', 
      description: 'Furniture, decor, appliances' 
    }
  ]);

  // Delivery options
  deliveryOptions = signal([
    { id: 'campus-pickup', name: 'Campus Pickup', price: 'Free', description: 'Meet on campus at agreed location' },
    { id: 'local-delivery', name: 'Local Delivery', price: '$5-15', description: 'Deliver within 5 miles of campus' },
    { id: 'shipping', name: 'Shipping', price: 'Calculated', description: 'Ship anywhere in the US' }
  ]);

  ngOnInit(): void {
    this.initForm();
    this.startAutoSave();
  }

  private initForm(): void {
    this.listingForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(80)]],
      brand: [''],
      condition: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      tags: [''],
      price: ['', [Validators.required, Validators.min(0)]],
      pricingType: ['fixed'],
      allowNegotiations: [false],
      bulkDiscounts: [false],
      category: ['textbooks'],
      subjectArea: [''],
      courseLevel: [''],
      deliveryOptions: this.fb.array([]),
      weight: [''],
      weightUnit: ['lbs'],
      handlingTime: ['same-day'],
      visibility: ['public'],
      duration: ['30'],
      autoRenew: [false],
      allowOffers: [false]
    });
  }

  // Character counters
  getTitleLength(): number {
    return this.listingForm.get('title')?.value?.length || 0;
  }

  getDescriptionLength(): number {
    return this.listingForm.get('description')?.value?.length || 0;
  }

  // Auto-save functionality
  private startAutoSave(): void {
    setInterval(() => {
      const now = new Date();
      const minutes = now.getMinutes();
      this.autoSaveStatus.set(`Auto-saved ${minutes} min ago`);
    }, 60000);
  }

  // Category selection
  selectCategory(categoryId: string): void {
    this.selectedCategory.set(categoryId);
    this.listingForm.patchValue({ category: categoryId });
  }

  getSelectedCategoryName(): string {
    const category = this.categories().find(c => c.id === this.selectedCategory());
    return category?.name || '';
  }

  // Icon helper methods
  getSectionIcon(sectionId: string): any {
    const iconMap: { [key: string]: any } = {
      'info-circle': this.faInfoCircle,
      'camera': this.faCamera,
      'dollar-sign': this.faDollarSign,
      'tags': this.faTags,
      'truck': this.faTruck
    };
    return iconMap[sectionId] || this.faInfoCircle;
  }

  getCategoryIcon(categoryId: string): any {
    const iconMap: { [key: string]: any } = {
      'book': this.faBook,
      'laptop': this.faLaptop,
      'home': this.faHome
    };
    return iconMap[categoryId] || this.faBook;
  }

  // Photo upload handlers
  triggerPrimaryPhotoUpload(): void {
    // Implementation for primary photo upload
  }

  triggerAdditionalPhotoUpload(index: number): void {
    // Implementation for additional photo upload
  }

  onPrimaryPhotoSelected(event: any): void {
    // Handle primary photo selection
  }

  onAdditionalPhotoSelected(event: any, index: number): void {
    // Handle additional photo selection
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    // Handle file drop
  }

  // Navigation
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      
      // Update active section
      this.formSections.update(sections => 
        sections.map(section => ({
          ...section,
          active: section.id === sectionId
        }))
      );
    }
  }

  // Actions
  saveAsDraft(): void {
    this.loading.set(true);
    // Save as draft logic
    setTimeout(() => {
      this.loading.set(false);
    }, 1000);
  }

  previewListing(): void {
    // Navigate to preview or open modal
  }

  onSubmit(): void {
    if (this.listingForm.valid) {
      this.loading.set(true);
      
      const formData = this.listingForm.value;
      
      // Simulate API call
      setTimeout(() => {
        this.loading.set(false);
        this.router.navigate([ROUTES_ABSOLUTE.APP.SELLER.LISTINGS]);
      }, 2000);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.listingForm.controls).forEach(key => {
        this.listingForm.get(key)?.markAsTouched();
      });
    }
  }
} 