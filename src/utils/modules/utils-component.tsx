import { createApp, render, createVNode, nextTick, App, Component, getCurrentInstance } from 'vue'
import { setupStore } from '@/store'
import { setupRouter } from '@/router'
import * as utils from '@/utils'

export interface RestComponent {
    element: HTMLElement
    app: App<Element>
    unmount: (delay: number) => Promise<Omix>
}

export interface OptsComponent {
    destroy?: boolean
}

export type PropsState<T> = Omix<T> & {
    onClose?: (e: Omix<{ done: Function }>) => void | any | Promise<any> | Promise<Omix>
    onSubmit?: (e: Omix<{ done: Function }>) => void | any | Promise<any> | Promise<Omix>
}

/**创建组件实例**/
export async function createComponent<T extends Omix>(
    Component: Parameters<typeof createApp>['0'],
    props: PropsState<T>,
    opts: OptsComponent = {}
): Promise<RestComponent> {
    const element = document.createElement('div')
    const app = createApp(<layout-common-provider>{createVNode(Component, { ...props, onSubmit, onClose })}</layout-common-provider>)

    /**组件挂载**/
    async function mounte(): Promise<Omix> {
        return app.mount(element, true)
    }

    /**组件销毁**/
    async function unmount(delay: number = 300): Promise<Omix> {
        return await utils.fetchDelay(delay, async () => {
            app.unmount()
            return element.remove()
        })
    }

    /**组件关闭事件**/
    async function onClose(scope: Omix<{ done: Function }>): Promise<Omix> {
        if ((opts.destroy ?? true) || utils.isEmpty(props.onClose)) {
            return await scope.done({ visible: false }).then(async () => {
                return await unmount()
            })
        }
        return await props.onClose!({ ...scope, unmount })
    }

    /**组件提交表单事件**/
    async function onSubmit(scope: Omix<{ done: Function }>): Promise<Omix> {
        return await utils.fetchHandler(Boolean(props.onSubmit), async () => {
            return props.onSubmit!({ ...scope, unmount })
        })
    }

    setupStore(app)
    setupRouter(app, { interceptor: true })
    nextTick(async () => {
        await mounte()
    })

    return { element, app, unmount }
}

/**创建虚拟DOM实例**/
export function fetchCreateVNode(Component: Parameters<typeof createVNode>['0']) {
    const vnode = createVNode(Component)
    const instance = getCurrentInstance()
    if (instance && instance.appContext) {
        vnode.appContext = instance.appContext
    }
    return vnode
}

/**把本地 svg 字符串或 @vicons 组件转成 Balkan controls.icon 可用的 svg 字符串**/
export function fetchCreateSvgIcon(source: string | Component, size = 16, color = '#7A7A7A', padding = 2) {
    const holder = document.createElement('div')
    holder.style.cssText = 'position:fixed;left:-9999px;top:-9999px;pointer-events:none;'
    document.body.appendChild(holder)
    if (typeof source !== 'string') {
        render(createVNode(source), holder)
    } else {
        holder.innerHTML = source
    }
    const svgEl = holder.querySelector('svg')
    if (!svgEl) {
        if (typeof source !== 'string') {
            render(null, holder)
        }
        holder.remove()
        return String(source)
    }
    svgEl.setAttribute('width', String(size))
    svgEl.setAttribute('height', String(size))
    const bbox = svgEl.getBBox()
    if (bbox.width > 0 && bbox.height > 0) {
        const maxSide = Math.max(bbox.width, bbox.height)
        const inner = Math.max(size - padding * 2, 1)
        const viewSize = (maxSide * size) / inner
        const x = bbox.x + (bbox.width - viewSize) / 2
        const y = bbox.y + (bbox.height - viewSize) / 2
        svgEl.setAttribute('viewBox', `${x} ${y} ${viewSize} ${viewSize}`)
    }
    const html = svgEl.outerHTML.replace(/currentColor/g, color)
    if (typeof source !== 'string') {
        render(null, holder)
    }
    holder.remove()
    return html
}

/**异步返回VNode**/
export function fetchRender(Component: Parameters<typeof createApp>['0']) {
    return () => createVNode(Component)
}

// /**通知弹窗二次封装**/
// export function fetchNotice(
//     option: Omit<NotificationOptions, 'onLeave' | 'onClose' | 'onAfterLeave' | 'onAfterEnter'> & {
//         duration?: number
//         type?: NotificationOptions['type']
//         onAfterEnter?: (x: NotificationReactive) => void | any | undefined
//         onAfterLeave?: (x: NotificationReactive) => void | any | undefined
//         onClose?: (x: NotificationReactive) => boolean | Promise<boolean>
//         onLeave?: (x: NotificationReactive) => void | any | undefined
//     }
// ): Promise<NotificationReactive> {
//     return new Promise(resolve => {
//         const vm = window.$notification.create({
//             ...option,
//             type: option.type ?? 'success',
//             duration: option.duration ?? 2500,
//             keepAliveOnHover: option.keepAliveOnHover ?? true,
//             onAfterEnter: ((e: HTMLElement) => {
//                 return option.onAfterEnter ? option.onAfterEnter(vm) : undefined
//             }) as NotificationOptions['onAfterEnter'],
//             onAfterLeave: () => {
//                 return option.onAfterLeave ? option.onAfterLeave(vm) : undefined
//             },
//             onClose: () => {
//                 return option.onClose ? option.onClose(vm) : true
//             },
//             onLeave: () => {
//                 return option.onLeave ? option.onLeave(vm) : undefined
//             }
//         })
//         resolve(vm)
//     })
// }
