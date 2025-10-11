// vite.config.ts
import { defineConfig } from "file:///mnt/c/Users/brand/Development/Project_Workspace/active-development/california_puzzle_game/node_modules/vite/dist/node/index.js";
import react from "file:///mnt/c/Users/brand/Development/Project_Workspace/active-development/california_puzzle_game/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve } from "path";
import { visualizer } from "file:///mnt/c/Users/brand/Development/Project_Workspace/active-development/california_puzzle_game/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
var __vite_injected_original_dirname = "/mnt/c/Users/brand/Development/Project_Workspace/active-development/california_puzzle_game";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "./dist/stats.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
      template: "treemap"
      // 'sunburst', 'treemap', 'network'
    })
  ],
  base: "/california_puzzle_game/",
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  },
  server: {
    port: 3e3,
    open: true
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 500,
    // Set to 500kb
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - Core libraries
          "vendor-react": ["react", "react-dom"],
          "vendor-ui": ["@dnd-kit/core", "lucide-react", "framer-motion"],
          "vendor-geo": ["d3", "d3-geo", "d3-selection", "d3-zoom", "d3-drag"],
          "vendor-storage": ["zustand"],
          // Feature chunks - Large components
          "map-components": [
            "./src/components/map/CaliforniaMapFixed.tsx",
            "./src/components/map/CaliforniaMapCanvas.tsx",
            "./src/components/map/CaliforniaMapSimple.tsx",
            "./src/components/map/StudyModeMap.tsx"
          ],
          "study-mode": [
            "./src/components/study/StudyMode.tsx",
            "./src/components/study/EnhancedStudyMode.tsx",
            "./src/components/study/StudyModeCard.tsx"
          ],
          "achievements": [
            "./src/components/game/achievements/AchievementGallery.tsx",
            "./src/components/game/achievements/AchievementNotification.tsx"
          ],
          "game-features": [
            "./src/components/game/GameModeSelector.tsx",
            "./src/components/game/DifficultySystem.tsx",
            "./src/components/game/ProgressionSystem.tsx"
          ]
        }
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "tests/setup.ts",
        "**/*.d.ts",
        "**/*.config.ts",
        "dist/",
        "public/"
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    include: ["tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["node_modules", "dist", ".idea", ".git", ".cache"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvbW50L2MvVXNlcnMvYnJhbmQvRGV2ZWxvcG1lbnQvUHJvamVjdF9Xb3Jrc3BhY2UvYWN0aXZlLWRldmVsb3BtZW50L2NhbGlmb3JuaWFfcHV6emxlX2dhbWVcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9tbnQvYy9Vc2Vycy9icmFuZC9EZXZlbG9wbWVudC9Qcm9qZWN0X1dvcmtzcGFjZS9hY3RpdmUtZGV2ZWxvcG1lbnQvY2FsaWZvcm5pYV9wdXp6bGVfZ2FtZS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vbW50L2MvVXNlcnMvYnJhbmQvRGV2ZWxvcG1lbnQvUHJvamVjdF9Xb3Jrc3BhY2UvYWN0aXZlLWRldmVsb3BtZW50L2NhbGlmb3JuaWFfcHV6emxlX2dhbWUvdml0ZS5jb25maWcudHNcIjsvKipcclxuICogVml0ZSBDb25maWd1cmF0aW9uXHJcbiAqXHJcbiAqIFB1cnBvc2U6IE1haW4gYnVpbGQgY29uZmlndXJhdGlvbiBmb3IgcHJvZHVjdGlvbiBhbmQgZGV2ZWxvcG1lbnRcclxuICogVXNlZCBieTogVml0ZSBidWlsZCB0b29sIGFuZCBWaXRlc3QgdGVzdCBydW5uZXJcclxuICogRG9jdW1lbnRhdGlvbjogZG9jcy9DT05GSUdVUkFUSU9OX0dVSURFLm1kLCBkb2NzL0NPREVfU1BMSVRUSU5HLm1kXHJcbiAqXHJcbiAqIExhc3QgdXBkYXRlZDogMjAyNS0xMC0wNFxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXHJcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInXHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gIHBsdWdpbnM6IFtcclxuICAgIHJlYWN0KCksXHJcbiAgICB2aXN1YWxpemVyKHtcclxuICAgICAgZmlsZW5hbWU6ICcuL2Rpc3Qvc3RhdHMuaHRtbCcsXHJcbiAgICAgIG9wZW46IGZhbHNlLFxyXG4gICAgICBnemlwU2l6ZTogdHJ1ZSxcclxuICAgICAgYnJvdGxpU2l6ZTogdHJ1ZSxcclxuICAgICAgdGVtcGxhdGU6ICd0cmVlbWFwJywgLy8gJ3N1bmJ1cnN0JywgJ3RyZWVtYXAnLCAnbmV0d29yaydcclxuICAgIH0pLFxyXG4gIF0sXHJcbiAgYmFzZTogJy9jYWxpZm9ybmlhX3B1enpsZV9nYW1lLycsXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgJ0AnOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYycpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIHNlcnZlcjoge1xyXG4gICAgcG9ydDogMzAwMCxcclxuICAgIG9wZW46IHRydWUsXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICBzb3VyY2VtYXA6IHRydWUsXHJcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDUwMCwgLy8gU2V0IHRvIDUwMGtiXHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgLy8gVmVuZG9yIGNodW5rcyAtIENvcmUgbGlicmFyaWVzXHJcbiAgICAgICAgICAndmVuZG9yLXJlYWN0JzogWydyZWFjdCcsICdyZWFjdC1kb20nXSxcclxuICAgICAgICAgICd2ZW5kb3ItdWknOiBbJ0BkbmQta2l0L2NvcmUnLCAnbHVjaWRlLXJlYWN0JywgJ2ZyYW1lci1tb3Rpb24nXSxcclxuICAgICAgICAgICd2ZW5kb3ItZ2VvJzogWydkMycsICdkMy1nZW8nLCAnZDMtc2VsZWN0aW9uJywgJ2QzLXpvb20nLCAnZDMtZHJhZyddLFxyXG4gICAgICAgICAgJ3ZlbmRvci1zdG9yYWdlJzogWyd6dXN0YW5kJ10sXHJcblxyXG4gICAgICAgICAgLy8gRmVhdHVyZSBjaHVua3MgLSBMYXJnZSBjb21wb25lbnRzXHJcbiAgICAgICAgICAnbWFwLWNvbXBvbmVudHMnOiBbXHJcbiAgICAgICAgICAgICcuL3NyYy9jb21wb25lbnRzL21hcC9DYWxpZm9ybmlhTWFwRml4ZWQudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL2NvbXBvbmVudHMvbWFwL0NhbGlmb3JuaWFNYXBDYW52YXMudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL2NvbXBvbmVudHMvbWFwL0NhbGlmb3JuaWFNYXBTaW1wbGUudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL2NvbXBvbmVudHMvbWFwL1N0dWR5TW9kZU1hcC50c3gnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgICdzdHVkeS1tb2RlJzogW1xyXG4gICAgICAgICAgICAnLi9zcmMvY29tcG9uZW50cy9zdHVkeS9TdHVkeU1vZGUudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL2NvbXBvbmVudHMvc3R1ZHkvRW5oYW5jZWRTdHVkeU1vZGUudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL2NvbXBvbmVudHMvc3R1ZHkvU3R1ZHlNb2RlQ2FyZC50c3gnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgICdhY2hpZXZlbWVudHMnOiBbXHJcbiAgICAgICAgICAgICcuL3NyYy9jb21wb25lbnRzL2dhbWUvYWNoaWV2ZW1lbnRzL0FjaGlldmVtZW50R2FsbGVyeS50c3gnLFxyXG4gICAgICAgICAgICAnLi9zcmMvY29tcG9uZW50cy9nYW1lL2FjaGlldmVtZW50cy9BY2hpZXZlbWVudE5vdGlmaWNhdGlvbi50c3gnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICAgICdnYW1lLWZlYXR1cmVzJzogW1xyXG4gICAgICAgICAgICAnLi9zcmMvY29tcG9uZW50cy9nYW1lL0dhbWVNb2RlU2VsZWN0b3IudHN4JyxcclxuICAgICAgICAgICAgJy4vc3JjL2NvbXBvbmVudHMvZ2FtZS9EaWZmaWN1bHR5U3lzdGVtLnRzeCcsXHJcbiAgICAgICAgICAgICcuL3NyYy9jb21wb25lbnRzL2dhbWUvUHJvZ3Jlc3Npb25TeXN0ZW0udHN4JyxcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgfSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgfSxcclxuICB0ZXN0OiB7XHJcbiAgICBnbG9iYWxzOiB0cnVlLFxyXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXHJcbiAgICBzZXR1cEZpbGVzOiBbJy4vdGVzdHMvc2V0dXAudHMnXSxcclxuICAgIGNvdmVyYWdlOiB7XHJcbiAgICAgIHByb3ZpZGVyOiAndjgnLFxyXG4gICAgICByZXBvcnRlcjogWyd0ZXh0JywgJ2pzb24nLCAnaHRtbCddLFxyXG4gICAgICBleGNsdWRlOiBbXHJcbiAgICAgICAgJ25vZGVfbW9kdWxlcy8nLFxyXG4gICAgICAgICd0ZXN0cy9zZXR1cC50cycsXHJcbiAgICAgICAgJyoqLyouZC50cycsXHJcbiAgICAgICAgJyoqLyouY29uZmlnLnRzJyxcclxuICAgICAgICAnZGlzdC8nLFxyXG4gICAgICAgICdwdWJsaWMvJ1xyXG4gICAgICBdLFxyXG4gICAgICB0aHJlc2hvbGRzOiB7XHJcbiAgICAgICAgZ2xvYmFsOiB7XHJcbiAgICAgICAgICBicmFuY2hlczogODAsXHJcbiAgICAgICAgICBmdW5jdGlvbnM6IDgwLFxyXG4gICAgICAgICAgbGluZXM6IDgwLFxyXG4gICAgICAgICAgc3RhdGVtZW50czogODBcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBpbmNsdWRlOiBbJ3Rlc3RzLyoqLyoue3Rlc3Qsc3BlY30ue2pzLG1qcyxjanMsdHMsbXRzLGN0cyxqc3gsdHN4fSddLFxyXG4gICAgZXhjbHVkZTogWydub2RlX21vZHVsZXMnLCAnZGlzdCcsICcuaWRlYScsICcuZ2l0JywgJy5jYWNoZSddXHJcbiAgfSxcclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBVUEsU0FBUyxvQkFBb0I7QUFDN0IsT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixTQUFTLGtCQUFrQjtBQWIzQixJQUFNLG1DQUFtQztBQWdCekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLE1BQ1QsVUFBVTtBQUFBLE1BQ1YsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLE1BQ1YsWUFBWTtBQUFBLE1BQ1osVUFBVTtBQUFBO0FBQUEsSUFDWixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsTUFBTTtBQUFBLEVBQ04sU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUMvQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixXQUFXO0FBQUEsSUFDWCx1QkFBdUI7QUFBQTtBQUFBLElBQ3ZCLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQTtBQUFBLFVBRVosZ0JBQWdCLENBQUMsU0FBUyxXQUFXO0FBQUEsVUFDckMsYUFBYSxDQUFDLGlCQUFpQixnQkFBZ0IsZUFBZTtBQUFBLFVBQzlELGNBQWMsQ0FBQyxNQUFNLFVBQVUsZ0JBQWdCLFdBQVcsU0FBUztBQUFBLFVBQ25FLGtCQUFrQixDQUFDLFNBQVM7QUFBQTtBQUFBLFVBRzVCLGtCQUFrQjtBQUFBLFlBQ2hCO0FBQUEsWUFDQTtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFVBQ0EsY0FBYztBQUFBLFlBQ1o7QUFBQSxZQUNBO0FBQUEsWUFDQTtBQUFBLFVBQ0Y7QUFBQSxVQUNBLGdCQUFnQjtBQUFBLFlBQ2Q7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFVBQ0EsaUJBQWlCO0FBQUEsWUFDZjtBQUFBLFlBQ0E7QUFBQSxZQUNBO0FBQUEsVUFDRjtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVksQ0FBQyxrQkFBa0I7QUFBQSxJQUMvQixVQUFVO0FBQUEsTUFDUixVQUFVO0FBQUEsTUFDVixVQUFVLENBQUMsUUFBUSxRQUFRLE1BQU07QUFBQSxNQUNqQyxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsTUFDRjtBQUFBLE1BQ0EsWUFBWTtBQUFBLFFBQ1YsUUFBUTtBQUFBLFVBQ04sVUFBVTtBQUFBLFVBQ1YsV0FBVztBQUFBLFVBQ1gsT0FBTztBQUFBLFVBQ1AsWUFBWTtBQUFBLFFBQ2Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUyxDQUFDLHdEQUF3RDtBQUFBLElBQ2xFLFNBQVMsQ0FBQyxnQkFBZ0IsUUFBUSxTQUFTLFFBQVEsUUFBUTtBQUFBLEVBQzdEO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
