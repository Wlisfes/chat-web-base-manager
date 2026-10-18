import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/srm/supplier',
        name: 'SrmSupplier',
        meta: { title: '我的供应商', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/srm/supplier/index.vue')
    }
]

export default routes
