import { createApp } from 'vue'
import { setupStore } from '@/store'
import { setupRouter } from '@/router'
import { VueDraggable } from 'vue-draggable-plus'
import App from '@/App.vue'

export function createBootstrap(props: Omix = {}) {
    const app = createApp(<App {...props} />)
    app.component('common-element-draggable', VueDraggable)
    setupStore(app)
    setupRouter(app, { interceptor: true })
    return { app }
}
