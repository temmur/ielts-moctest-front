<template>
  <div class="rounded-2xl border bg-white p-4 shadow-sm ">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="text-sm font-semibold text-gray-900">Audio</div>
        <div class="text-xs text-gray-500">{{ statusText }}</div>
      </div>

      <div class="flex items-center gap-2">
        <button
            type="button"
            class="px-3 py-2 rounded-xl text-sm font-semibold border bg-gray-50 hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="!canPlay || loading"
            @click="toggle"
        >
          <span v-if="!isPlaying">Play</span>
          <span v-else>Pause</span>
        </button>
      </div>
    </div>

    <div class="mt-4">
      <div class="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div class="h-full bg-gray-900 transition-[width] duration-200" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ duration ? formatTime(duration) : "--:--" }}</span>
      </div>
    </div>

    <audio
        ref="audioRef"
        class="hidden"
        preload="metadata"
        playsinline
        @loadedmetadata="onLoadedMeta"
        @canplay="onCanPlay"
        @timeupdate="onTimeUpdate"
        @playing="isPlaying = true"
        @pause="isPlaying = false"
        @ended="onEnded"
        @seeking="onSeeking"
        @seeked="onSeeking"
        @error="onError"
    >
      <source :src="src" :type="mime || undefined" />
    </audio>

    <div v-if="error" class="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  src: { type: String, required: true },
  mime: { type: String, default: "" },
  lockSeeking: { type: Boolean, default: true },
  allowReplay: { type: Boolean, default: true },
});

const emit = defineEmits(["ready", "error", "ended", "play", "pause"]);

const audioRef = ref(null);

const loading = ref(true);
const canPlay = ref(false);
const error = ref("");

const isPlaying = ref(false);
const duration = ref(0);
const currentTime = ref(0);

const lastGoodTime = ref(0);

const progress = computed(() => {
  if (!duration.value) return 0;
  return Math.min(100, Math.max(0, (currentTime.value / duration.value) * 100));
});

const statusText = computed(() => {
  if (error.value) return "Audio error";
  if (loading.value) return "⌛ Loading audio…";
  if (!canPlay.value) return "Preparing…";
  return props.lockSeeking ? "Seeking disabled" : "Ready";
});

function resetState() {
  loading.value = true;
  canPlay.value = false;
  error.value = "";
  isPlaying.value = false;
  duration.value = 0;
  currentTime.value = 0;
  lastGoodTime.value = 0;
}

watch(
    () => props.src,
    () => {
      const el = audioRef.value;
      resetState();
      if (el) el.load();
    },
    { immediate: true }
);

function formatTime(sec) {
  const s = Math.floor(sec || 0);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function onLoadedMeta() {
  const el = audioRef.value;
  if (!el) return;
  duration.value = Number.isFinite(el.duration) ? el.duration : 0;
}

function onCanPlay() {
  loading.value = false;
  canPlay.value = true;
  error.value = "";
  emit("ready");
}

function onTimeUpdate() {
  const el = audioRef.value;
  if (!el) return;

  currentTime.value = el.currentTime;

  if (!el.seeking) {
    lastGoodTime.value = el.currentTime;
  }
}

function onSeeking() {
  if (!props.lockSeeking) return;

  const el = audioRef.value;
  if (!el) return;

  const diff = Math.abs(el.currentTime - lastGoodTime.value);
  if (diff > 0.25) {
    el.currentTime = lastGoodTime.value;
  }
}

function onEnded() {
  isPlaying.value = false;
  emit("ended");

  if (!props.allowReplay) {
    const el = audioRef.value;
    if (el) {
      el.currentTime = 0;
      lastGoodTime.value = 0;
      currentTime.value = 0;
    }
  }
}

function onError() {
  loading.value = false;
  canPlay.value = false;

  const el = audioRef.value;
  const mediaErr = el?.error;

  error.value =
      mediaErr?.message ||
      "MEDIA_ELEMENT_ERROR: Audio cannot be played (format/CORS/url issue).";

  emit("error", error.value);
}

async function play() {
  const el = audioRef.value;
  if (!el) return;

  error.value = "";
  try {
    await el.play();
    emit("play");
  } catch (e) {
    error.value = e?.message || "Autoplay blocked. Click Play.";
    emit("error", error.value);
    throw e;
  }
}

function pause() {
  const el = audioRef.value;
  if (!el) return;
  el.pause();
  emit("pause");
}

function toggle() {
  if (isPlaying.value) pause();
  else play();
}

defineExpose({
  play,
  pause,
  toggle,
  getEl: () => audioRef.value,
});
</script>
