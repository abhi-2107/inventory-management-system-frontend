import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen flex bg-surface-950 relative overflow-hidden">
      <!-- Background Mesh -->
      <div class="absolute inset-0 pointer-events-none">
        <div
          class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[120px] animate-pulse-slow"
        ></div>
        <div
          class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-600/10 rounded-full blur-[120px] animate-pulse-slow"
          style="animation-delay: 1.5s"
        ></div>
      </div>

      <!-- Left Panel - Branding -->
      <div
        class="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative z-10 border-r border-surface-800/50"
      >
        <div>
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary-600/20"
            >
              <span class="text-2xl font-black text-white italic">I</span>
            </div>
            <span class="text-3xl font-black tracking-tighter text-white">INVENTRACK</span>
          </div>
        </div>

        <div>
          <h1 class="text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
            The next generation of <br />
            <span class="text-gradient">inventory intelligence.</span>
          </h1>
          <p class="text-xl text-surface-400 max-w-lg leading-relaxed">
            Stop guessing and start growing. Our platform gives you the real-time visibility needed
            to scale your operations with absolute confidence.
          </p>

          <div class="mt-12 grid grid-cols-3 gap-8 max-w-md">
            <div>
              <p class="text-3xl font-bold text-white tabular-nums">99.9%</p>
              <p class="text-xs uppercase tracking-widest font-semibold text-surface-500 mt-1">
                Uptime
              </p>
            </div>
            <div>
              <p class="text-3xl font-bold text-white tabular-nums">24/7</p>
              <p class="text-xs uppercase tracking-widest font-semibold text-surface-500 mt-1">
                Support
              </p>
            </div>
            <div>
              <p class="text-3xl font-bold text-white tabular-nums">1M+</p>
              <p class="text-xs uppercase tracking-widest font-semibold text-surface-500 mt-1">
                Updates
              </p>
            </div>
          </div>
        </div>

        <div>
          <div class="flex items-center gap-4">
            <div class="flex -space-x-2">
              <div
                class="w-8 h-8 rounded-full border-2 border-surface-950 bg-surface-800 flex items-center justify-center text-[10px] font-bold"
              >
                JD
              </div>
              <div
                class="w-8 h-8 rounded-full border-2 border-surface-950 bg-primary-600 flex items-center justify-center text-[10px] font-bold text-white"
              >
                AS
              </div>
              <div
                class="w-8 h-8 rounded-full border-2 border-surface-950 bg-accent-600 flex items-center justify-center text-[10px] font-bold text-white"
              >
                MK
              </div>
            </div>
            <p class="text-sm text-surface-500">
              Trusted by <span class="text-surface-300 font-medium">500+ teams</span> worldwide
            </p>
          </div>
        </div>
      </div>

      <!-- Right Panel - Form -->
      <div
        class="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 bg-surface-950/40 backdrop-blur-3xl"
      >
        <div class="w-full max-w-md">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AuthLayoutComponent {}
