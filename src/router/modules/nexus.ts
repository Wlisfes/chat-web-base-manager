import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/nexus/simbank/manager',
        name: 'NexusSimbankManager',
        meta: { title: 'simbank设备', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/nexus/simbank/manager/index.vue')
    },
    {
        path: '/nexus/simbank/port',
        name: 'SrmSupplierContextDecomposer1',
        meta: { title: 'simbank端口', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/nexus/simbank/manager/index.vue')
    }
]

export default routes
