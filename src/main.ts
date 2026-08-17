import '@unocss/reset/normalize.css'
import '@/styles/index.scss'
import 'uno.css'
import { createBootstrap } from '@/utils'

async function bootstrap() {
    const { app } = createBootstrap()
    app.mount('#app')
}
bootstrap()
