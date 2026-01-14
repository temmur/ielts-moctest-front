export default {
    install(app) {
        const textSize = {
            current: 1,
            sizes: {
                0: { name: 'small', scale: 0.9, fontSize: '14px' },
                1: { name: 'medium', scale: 1, fontSize: '16px' },
                2: { name: 'large', scale: 1.15, fontSize: '18px' }
            },

            setSize(size) {
                if (size >= 0 && size <= 2) {
                    this.current = size
                    const config = this.sizes[size]

                    // Update CSS variables
                    document.documentElement.style.setProperty('--text-scale', config.scale)
                    document.documentElement.style.setProperty('--base-font-size', config.fontSize)

                    // Update class
                    document.documentElement.className = `text-size-${config.name}`

                    // Save to localStorage
                    localStorage.setItem('ielts-text-size', size.toString())

                    return true
                }
                return false
            },

            getSize() {
                return this.current
            },

            increase() {
                if (this.current < 2) {
                    return this.setSize(this.current + 1)
                }
                return false
            },

            decrease() {
                if (this.current > 0) {
                    return this.setSize(this.current - 1)
                }
                return false
            },

            loadSavedSize() {
                const saved = localStorage.getItem('ielts-text-size')
                if (saved !== null) {
                    const size = parseInt(saved)
                    if (size >= 0 && size <= 2) {
                        this.setSize(size)
                    }
                }
            }
        }

        // Load saved size on plugin initialization
        textSize.loadSavedSize()

        // Make it available globally
        app.config.globalProperties.$textSize = textSize

        // Provide for Composition API
        app.provide('textSize', textSize)
    }
}
