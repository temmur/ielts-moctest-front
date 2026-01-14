<template>
  <div class="header__center">
    <div class="header__text-controls">
      <span class="header__text-controls-label">Text Size:</span>
      <div class="header__size-controls">
        <button
            class="header__size-btn"
            :disabled="textSizeStore.isMinSize"
            @click="textSizeStore.decreaseSize"
            :title="`Decrease text size (Current: ${textSizeStore.currentLevel}/3)`"
            aria-label="Decrease text size"
        >
          <span class="header__size-text">A-</span>
        </button>
        {{textSizeStore.currentLevel}}
        <div class="header__size-display">
              <span class="header__size-indicator">
                <span
                    v-for="n in 3"
                    :key="n"
                    class="header__size-dot"
                    :class="{ 'header__size-dot--active': n <= textSizeStore.currentLevel }"
                ></span>
              </span>
        </div>

        <button
            class="header__size-btn"
            :disabled="textSizeStore.isMaxSize"
            @click="textSizeStore.increaseSize"
            :title="`Increase text size (Current: ${textSizeStore.currentLevel}/3)`"
            aria-label="Increase text size"
        >
          <span class="header__size-text">A+</span>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useTextSizeStore } from '@/stores/textSizeStore'
const textSizeStore = useTextSizeStore()
</script>
