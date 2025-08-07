import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { 
  faUsers, 
  faSearch, 
  faDollarSign, 
  faComments,
  faShoppingBag,
  faArrowRight,
  faStar,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, FontAwesomeModule, HeaderComponent],
  template: `
    <div class="relative flex min-h-screen flex-col bg-white overflow-x-hidden font-sans">
      <!-- Background Pattern -->
      <div class="absolute inset-0 bg-gradient-to-br from-markt-light/30 via-white to-markt-accent/10"></div>
      
      <div class="relative layout-container flex h-full grow flex-col">
        <!-- Enhanced Header -->
        <app-header></app-header>

        <!-- Enhanced Main Content -->
        <div class="flex flex-1 justify-center ">
          <div class="layout-content-container flex flex-col w-full max-w-none flex-1">
            
            <!-- Enhanced Hero Section -->
            <div class="w-full">
              <div class="w-full">
                <div
                  class="relative flex h-screen flex-col gap-8 bg-cover bg-center bg-no-repeat items-center justify-center overflow-hidden group"
                  style='background-image: linear-gradient(135deg, rgba(233, 76, 42, 0.9) 0%, rgba(233, 75, 38, 0.8) 50%, rgba(224, 117, 117, 0.7) 100%), url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80");'
                >
                  <!-- Floating Elements -->
                  <div class="absolute top-8 left-8 w-16 h-16 bg-white/20 rounded-full blur-xl animate-pulse"></div>
                  <div class="absolute bottom-8 right-8 w-20 h-20 bg-markt-accent/30 rounded-full blur-xl animate-pulse delay-1000"></div>
                  
                  <div class="flex flex-col gap-6 text-center max-w-4xl">
                    <h1
                      class="text-white text-4xl lg:text-6xl xl:text-7xl font-black leading-tight tracking-[-0.033em] animate-fade-in-up"
                    >
                      Where Social Meets Shopping
          </h1>
                    <h2 class="text-white/90 text-lg lg:text-xl font-normal leading-relaxed max-w-3xl mx-auto animate-fade-in-up delay-200">
                      Markt is a social-first e-commerce platform that combines the best of social media with online shopping. Discover unique products, connect with sellers, and build your community.
                    </h2>
                  </div>
                  <div class="flex flex-wrap gap-4 justify-center animate-fade-in-up delay-300">
                    <button
                      class="group flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 lg:h-14 px-6 lg:px-8 bg-white text-markt-primary text-base lg:text-lg font-bold leading-normal tracking-[0.015em] shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              [routerLink]="['/app/marketplace']"
            >
                      <span class="truncate">I'm a Buyer</span>
                      <fa-icon [icon]="faArrowRight" class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"></fa-icon>
                    </button>
                    <button
                      class="group flex min-w-[160px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 lg:h-14 px-6 lg:px-8 bg-markt-light/90 text-markt-dark text-base lg:text-lg font-bold leading-normal tracking-[0.015em] border-2 border-white/50 hover:bg-white hover:text-markt-primary shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                      [routerLink]="['/app/seller']"
                    >
                      <span class="truncate">I'm a Seller</span>
                      <fa-icon [icon]="faArrowRight" class="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"></fa-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Features Section -->
            <div class="mb-20 mt-20 px-10">
              <div class="text-center mb-12">
             
                <h3 class="text-markt-dark text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em] max-w-4xl mx-auto mb-6">
                  Explore the Features
                </h3>
                <p class="text-markt-muted text-lg lg:text-xl font-normal leading-relaxed max-w-3xl mx-auto">
                  Markt offers a range of features designed to enhance your shopping and selling experience.
                </p>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                <div class="group flex flex-col gap-6 rounded-2xl border border-markt-border/50 bg-white p-6 lg:p-8 hover:shadow-xl hover:border-markt-primary/30 transform hover:-translate-y-2 transition-all duration-300">
                  <div class="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-markt-primary/10 to-markt-accent/10 group-hover:from-markt-primary/20 group-hover:to-markt-accent/20 transition-all duration-300">
                    <fa-icon [icon]="faUsers" class="w-8 h-8 lg:w-10 lg:h-10 text-markt-primary group-hover:scale-110 transition-transform duration-300"></fa-icon>
                  </div>
                  <div class="flex flex-col gap-3">
                    <h4 class="text-markt-dark text-xl lg:text-2xl font-bold leading-tight">Social Feed</h4>
                    <p class="text-markt-muted text-base lg:text-lg font-normal leading-relaxed">
                      Browse a curated feed of products from sellers you follow and discover new items based on your interests.
                    </p>
                  </div>
                </div>
                
                <div class="group flex flex-col gap-6 rounded-2xl border border-markt-border/50 bg-white p-6 lg:p-8 hover:shadow-xl hover:border-markt-primary/30 transform hover:-translate-y-2 transition-all duration-300">
                  <div class="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-markt-primary/10 to-markt-accent/10 group-hover:from-markt-primary/20 group-hover:to-markt-accent/20 transition-all duration-300">
                    <fa-icon [icon]="faSearch" class="w-8 h-8 lg:w-10 lg:h-10 text-markt-primary group-hover:scale-110 transition-transform duration-300"></fa-icon>
                  </div>
                  <div class="flex flex-col gap-3">
                    <h4 class="text-markt-dark text-xl lg:text-2xl font-bold leading-tight">Buyer Requests</h4>
                    <p class="text-markt-muted text-base lg:text-lg font-normal leading-relaxed">
                      Post requests for specific items you're looking for and let sellers respond with offers.
                    </p>
                  </div>
                </div>
                
                <div class="group flex flex-col gap-6 rounded-2xl border border-markt-border/50 bg-white p-6 lg:p-8 hover:shadow-xl hover:border-markt-primary/30 transform hover:-translate-y-2 transition-all duration-300">
                  <div class="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-markt-primary/10 to-markt-accent/10 group-hover:from-markt-primary/20 group-hover:to-markt-accent/20 transition-all duration-300">
                    <fa-icon [icon]="faDollarSign" class="w-8 h-8 lg:w-10 lg:h-10 text-markt-primary group-hover:scale-110 transition-transform duration-300"></fa-icon>
          </div>
                  <div class="flex flex-col gap-3">
                    <h4 class="text-markt-dark text-xl lg:text-2xl font-bold leading-tight">Seller Tools</h4>
                    <p class="text-markt-muted text-base lg:text-lg font-normal leading-relaxed">
                      Manage your listings, track sales, and connect with buyers through our intuitive seller dashboard.
                    </p>
        </div>
        </div>
                
                <div class="group flex flex-col gap-6 rounded-2xl border border-markt-border/50 bg-white p-6 lg:p-8 hover:shadow-xl hover:border-markt-primary/30 transform hover:-translate-y-2 transition-all duration-300">
                  <div class="flex items-center justify-center w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-markt-primary/10 to-markt-accent/10 group-hover:from-markt-primary/20 group-hover:to-markt-accent/20 transition-all duration-300">
                    <fa-icon [icon]="faComments" class="w-8 h-8 lg:w-10 lg:h-10 text-markt-primary group-hover:scale-110 transition-transform duration-300"></fa-icon>
                  </div>
                  <div class="flex flex-col gap-3">
                    <h4 class="text-markt-dark text-xl lg:text-2xl font-bold leading-tight">Real-time Chat</h4>
                    <p class="text-markt-muted text-base lg:text-lg font-normal leading-relaxed">
                      Communicate directly with buyers and sellers in real-time to ask questions, negotiate prices, and finalize transactions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced How it Works Section -->
            <div class="mb-20 px-10">
              <div class="text-center mb-12">
                <h2 class="text-markt-dark text-3xl lg:text-4xl font-bold leading-tight tracking-[-0.015em] mb-4">How it Works</h2>
                <p class="text-markt-muted text-lg font-normal leading-relaxed max-w-2xl mx-auto">
                  Get started with Markt in three simple steps
                </p>
              </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                <div class="group relative">
                  <div class="flex flex-col items-center text-center">
                    <div class="flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-markt-primary to-markt-secondary text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                      <fa-icon [icon]="faSearch" class="w-10 h-10 lg:w-12 lg:h-12"></fa-icon>
                    </div>
                    <h4 class="text-markt-dark text-xl lg:text-2xl font-bold leading-tight mb-4">Browse & Discover</h4>
                    <p class="text-markt-muted text-base lg:text-lg font-normal leading-relaxed">
                      Explore a diverse marketplace of unique products and sellers.
                    </p>
                  </div>
                  <div class="hidden lg:block absolute top-10 left-full w-12 h-0.5 bg-gradient-to-r from-markt-primary to-markt-accent transform translate-x-6"></div>
                </div>
                
                <div class="group relative">
                  <div class="flex flex-col items-center text-center">
                    <div class="flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-markt-primary to-markt-secondary text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                      <fa-icon [icon]="faUsers" class="w-10 h-10 lg:w-12 lg:h-12"></fa-icon>
                    </div>
                    <h4 class="text-markt-dark text-xl lg:text-2xl font-bold leading-tight mb-4">Connect & Engage</h4>
                    <p class="text-markt-muted text-base lg:text-lg font-normal leading-relaxed">
                      Interact with sellers, ask questions, and build relationships within the community.
                    </p>
                  </div>
                  <div class="hidden lg:block absolute top-10 left-full w-12 h-0.5 bg-gradient-to-r from-markt-primary to-markt-accent transform translate-x-6"></div>
                </div>
                
                <div class="group">
                  <div class="flex flex-col items-center text-center">
                    <div class="flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-markt-primary to-markt-secondary text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                      <fa-icon [icon]="faShoppingBag" class="w-10 h-10 lg:w-12 lg:h-12"></fa-icon>
                    </div>
                    <h4 class="text-markt-dark text-xl lg:text-2xl font-bold leading-tight mb-4">Buy & Sell</h4>
                    <p class="text-markt-muted text-base lg:text-lg font-normal leading-relaxed">
                      Seamlessly buy and sell items with secure payment processing and integrated shipping tools.
                    </p>
                  </div>
                </div>
          </div>
            </div>

            <!-- Enhanced Social Proof Section -->
            <div class="mb-20 px-10">
              <div class="text-center mb-12">
                <h2 class="text-markt-dark text-3xl lg:text-4xl font-bold leading-tight tracking-[-0.015em] mb-4">Social Proof</h2>
                <p class="text-markt-muted text-lg font-normal leading-relaxed max-w-2xl mx-auto">
                  See what our community members are saying
                </p>
              </div>
              
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="group bg-gradient-to-br from-markt-light/50 to-white rounded-2xl p-8 lg:p-10 border border-markt-border/30 hover:shadow-xl transition-all duration-300">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="flex items-center gap-2">
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                    </div>
                    <span class="text-markt-muted text-sm font-medium">Buyer</span>
                  </div>
                  <blockquote class="text-markt-dark text-lg lg:text-xl font-normal leading-relaxed mb-6">
                    "I found exactly what I was looking for at a great price! I love the social aspect of Markt. It's like shopping with friends!"
                  </blockquote>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-markt-primary to-markt-accent flex items-center justify-center text-white font-bold text-lg">
                        SR
                      </div>
                      <div>
                        <p class="text-markt-dark font-semibold">Sophia R.</p>
                        <p class="text-markt-muted text-sm">Verified Buyer</p>
                      </div>
                    </div>
                    <fa-icon [icon]="faHeart" class="w-6 h-6 text-markt-primary group-hover:scale-110 transition-transform duration-300"></fa-icon>
                  </div>
                </div>
                
                <div class="group bg-gradient-to-br from-markt-light/50 to-white rounded-2xl p-8 lg:p-10 border border-markt-border/30 hover:shadow-xl transition-all duration-300">
                  <div class="flex items-center gap-4 mb-6">
                    <div class="flex items-center gap-2">
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                      <fa-icon [icon]="faStar" class="w-5 h-5 text-yellow-400"></fa-icon>
                    </div>
                    <span class="text-markt-muted text-sm font-medium">Seller</span>
                  </div>
                  <blockquote class="text-markt-dark text-lg lg:text-xl font-normal leading-relaxed mb-6">
                    "Markt has helped me reach a whole new audience of buyers. The seller tools are easy to use, and the community is incredibly supportive."
                  </blockquote>
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-markt-primary to-markt-accent flex items-center justify-center text-white font-bold text-lg">
                        EL
                      </div>
                      <div>
                        <p class="text-markt-dark font-semibold">Ethan L.</p>
                        <p class="text-markt-muted text-sm">Verified Seller</p>
                      </div>
                    </div>
                    <fa-icon [icon]="faHeart" class="w-6 h-6 text-markt-primary group-hover:scale-110 transition-transform duration-300"></fa-icon>
                  </div>
                </div>
          </div>
            </div>

            <!-- Enhanced Stats Section -->
            <div class="mb-20 px-10">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="text-center group">
                  <div class="bg-gradient-to-br from-markt-primary/10 to-markt-accent/10 rounded-2xl p-8 lg:p-10 border border-markt-border/30 hover:shadow-xl transition-all duration-300">
                    <div class="text-4xl lg:text-5xl font-black text-markt-primary mb-4 group-hover:scale-110 transition-transform duration-300">10K+</div>
                    <h4 class="text-markt-dark text-xl lg:text-2xl font-bold leading-tight mb-2">Active Users</h4>
                    <p class="text-markt-muted text-base">Growing community</p>
                  </div>
                </div>
                
                <div class="text-center group">
                  <div class="bg-gradient-to-br from-markt-primary/10 to-markt-accent/10 rounded-2xl p-8 lg:p-10 border border-markt-border/30 hover:shadow-xl transition-all duration-300">
                    <div class="text-4xl lg:text-5xl font-black text-markt-primary mb-4 group-hover:scale-110 transition-transform duration-300">50K+</div>
                    <h4 class="text-markt-dark text-xl lg:text-2xl font-bold leading-tight mb-2">Products Listed</h4>
                    <p class="text-markt-muted text-base">Unique items</p>
          </div>
        </div>
                
                <div class="text-center group">
                  <div class="bg-gradient-to-br from-markt-primary/10 to-markt-accent/10 rounded-2xl p-8 lg:p-10 border border-markt-border/30 hover:shadow-xl transition-all duration-300">
                    <div class="text-4xl lg:text-5xl font-black text-markt-primary mb-4 group-hover:scale-110 transition-transform duration-300">20K+</div>
                    <h4 class="text-markt-dark text-xl lg:text-2xl font-bold leading-tight mb-2">Transactions</h4>
                    <p class="text-markt-muted text-base">Successful sales</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Final CTA -->
            <div class="text-center mb-20 px-10">
              <div class="bg-gradient-to-br from-markt-primary/5 to-markt-accent/5 rounded-3xl p-12 lg:p-16 border border-markt-border/30">
                <h3 class="text-markt-dark text-3xl lg:text-4xl font-bold leading-tight mb-6">Ready to Get Started?</h3>
                <p class="text-markt-muted text-lg lg:text-xl font-normal leading-relaxed mb-8 max-w-2xl mx-auto">
                  Join thousands of users who are already buying and selling on Markt
                </p>
                <div class="flex flex-wrap gap-4 justify-center">
                  <button
                    class="group flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 bg-gradient-to-r from-markt-primary to-markt-secondary text-white text-lg font-bold leading-normal tracking-[0.015em] shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
                    [routerLink]="['/auth/register']"
                  >
                    <span class="truncate">I'm a Buyer</span>
                    <fa-icon [icon]="faArrowRight" class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"></fa-icon>
                  </button>
                  <button
                    class="group flex min-w-[180px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-8 bg-markt-light text-markt-dark text-lg font-bold leading-normal tracking-[0.015em] border-2 border-markt-border hover:bg-white hover:border-markt-primary shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            [routerLink]="['/auth/register']"
          >
                    <span class="truncate">I'm a Seller</span>
                    <fa-icon [icon]="faArrowRight" class="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200"></fa-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Footer -->
        <footer class="bg-markt-dark text-white py-12 lg:py-16">
          <div class="container mx-auto px-4 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
              <div class="col-span-1 md:col-span-2">
                <div class="flex items-center gap-4 mb-6">
                  <div class="size-14 lg:size-16 xl:size-18">
                    <img src="/markt-text-logo.png" alt="Markt" class="w-full h-full object-contain invert">
                  </div>
                  <h3 class="text-white text-3xl lg:text-4xl xl:text-5xl font-bold">Markt</h3>
                </div>
                <p class="text-gray-300 text-base leading-relaxed max-w-md">
                  The social-first e-commerce platform where communities connect, discover, and transact.
                </p>
              </div>
              
              <div>
                <h4 class="text-white font-semibold mb-4">Company</h4>
                <ul class="space-y-2">
                  <li><a href="#" class="text-gray-300 hover:text-white transition-colors duration-200">About</a></li>
                  <li><a href="#" class="text-gray-300 hover:text-white transition-colors duration-200">Contact</a></li>
                  <li><a href="#" class="text-gray-300 hover:text-white transition-colors duration-200">Careers</a></li>
                </ul>
              </div>
              
              <div>
                <h4 class="text-white font-semibold mb-4">Legal</h4>
                <ul class="space-y-2">
                  <li><a href="#" class="text-gray-300 hover:text-white transition-colors duration-200">Terms of Service</a></li>
                  <li><a href="#" class="text-gray-300 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
                  <li><a href="#" class="text-gray-300 hover:text-white transition-colors duration-200">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
            
            <div class="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p class="text-gray-300 text-sm">© 2024 Markt. All rights reserved.</p>
              <div class="flex gap-4 mt-4 md:mt-0">
                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-200">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-200">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/></svg>
                </a>
                <a href="#" class="text-gray-300 hover:text-white transition-colors duration-200">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .animate-fade-in-up {
      animation: fade-in-up 0.6s ease-out forwards;
    }
    
    .animate-fade-in-up.delay-200 {
      animation-delay: 0.2s;
    }
    
    .animate-fade-in-up.delay-300 {
      animation-delay: 0.3s;
    }
  `]
})
export class LandingComponent implements OnInit {
  private apiService = inject(ApiService);

  // Font Awesome icons
  faUsers = faUsers;
  faSearch = faSearch;
  faDollarSign = faDollarSign;
  faComments = faComments;
  faShoppingBag = faShoppingBag;
  faArrowRight = faArrowRight;
  faStar = faStar;
  faHeart = faHeart;

  // Data properties
  loading = false;
  featuredProducts: any[] = [];
  trendingRequests: any[] = [];
  communityHighlights: any[] = [];

  ngOnInit(): void {
    this.loadLandingData();
  }

  private loadLandingData(): void {
    this.loading = true;
    
    // Load featured products
    this.apiService.getFeaturedProducts().subscribe({
      next: (response) => {
        this.featuredProducts = response.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading featured products:', error);
        this.featuredProducts = [];
        this.loading = false;
      }
    });

    // Load trending requests
    this.apiService.getTrendingRequests().subscribe({
      next: (response) => {
        this.trendingRequests = response.data || [];
      },
      error: (error) => {
        console.error('Error loading trending requests:', error);
        this.trendingRequests = [];
      }
    });

    // Load community highlights
    this.apiService.getCommunityHighlights().subscribe({
      next: (response) => {
        this.communityHighlights = response.data || [];
      },
      error: (error) => {
        console.error('Error loading community highlights:', error);
        this.communityHighlights = [];
      }
    });
  }
} 