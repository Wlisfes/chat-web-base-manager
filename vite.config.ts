import { defineConfig, ConfigEnv, UserConfig } from 'vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import SvgLoader from 'vite-svg-loader'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import path from 'path'

export default defineConfig(({ command, mode }: ConfigEnv): UserConfig => {
    const accountProxyTarget = process.env.VITE_ACCOUNT_PROXY_TARGET || 'http://localhost:3999'
    const accountProxyDirect = process.env.VITE_ACCOUNT_PROXY_DIRECT === 'true'
    return {
        build: {
            outDir: 'dist',
            assetsDir: 'static'
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src')
            }
        },
        plugins: [
            Vue(),
            VueJsx(),
            SvgLoader(),
            AutoImport({
                resolvers: [NaiveUiResolver(), IconsResolver()]
            }),
            Components({
                dts: true,
                deep: true,
                extensions: ['vue'],
                include: [/\.vue$/, /\.vue\?vue/, /\.tsx$/],
                dirs: ['src/components'],
                resolvers: [NaiveUiResolver(), IconsResolver({ prefix: false, enabledCollections: ['local'] })]
            }),
            Icons({
                scale: 1.2,
                autoInstall: true,
                compiler: 'vue3',
                customCollections: {
                    local: FileSystemIconLoader('./src/assets/icons')
                }
            }),
            UnoCSS()
        ],
        server: {
            hmr: true,
            port: 4680,
            host: '0.0.0.0',
            proxy: {
                [`/api/account`]: {
                    target: accountProxyTarget,
                    ws: true,
                    changeOrigin: true,
                    rewrite: accountProxyDirect ? path => path.replace(/^\/api\/account/, '') : undefined
                },
                [`/api/windows`]: {
                    target: `http://localhost:5100`,
                    ws: true,
                    changeOrigin: true
                }
            }
        }
    }
})
