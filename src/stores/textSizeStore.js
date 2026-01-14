import {defineStore} from "pinia";
import {ref, computed} from "vue";

export const useTextSizeStore = defineStore('textSize', ()=> {
    const textSize = ref(1)

    const textSizeConfig = {
        0: { name: 'small', scale: 0.9, fontSize: '14px' },
        1: { name: 'medium', scale: 1, fontSize: '16px' },
        2: { name: 'large', scale: 1.15, fontSize: '18px' }
    }

    const currentConfig = computed(()=> textSizeConfig[textSize.value])
    const isMinSize = computed(()=> textSize.value === 0)
    const isMaxSize = computed(()=> textSize.value = 2)
    const currentLevel = computed(()=> textSize.value + 1)

  const setTextSize =(size)=> {
        if(size >= 0 && size <=2){
            textSize.value = size
            applyGlobalTextSize(size)
            return true
        }
      return false
  }
    const increaseSize = () => {
        if (textSize.value < 2) {
            textSize.value++
            applyGlobalTextSize(textSize.value)
            return true
        }
        return false
    }

    const decreaseSize = () => {
        if (textSize.value > 0) {
            textSize.value--
            applyGlobalTextSize(textSize.value)
            return true
        }
        return false
    }

    const loadSavedSize = () => {
        const saved = localStorage.getItem('ielts-text-size')
        if (saved !== null) {
            const size = parseInt(saved)
            if (size >= 0 && size <= 2) {
                setTextSize(size)
            }
        }
    }

    const applyGlobalTextSize = (size) => {
        const config = textSizeConfig[size]

        // Set CSS custom properties on :root
        document.documentElement.style.setProperty('--text-scale', config.scale)
        document.documentElement.style.setProperty('--base-font-size', config.fontSize)

        // Update class for CSS selectors
        document.documentElement.className = `text-size-${config.name}`

        // Save to localStorage
        localStorage.setItem('ielts-text-size', size.toString())
    }
    loadSavedSize()

    return {
        // State
        textSize,

        // Getters
        currentConfig,
        isMinSize,
        isMaxSize,
        currentLevel,

        // Actions
        setTextSize,
        increaseSize,
        decreaseSize,
        loadSavedSize
    }
})
