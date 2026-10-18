import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/srm/supplier',
        name: 'SrmSupplier',
        meta: { title: '我的供应商', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/srm/supplier/index.vue')
    },
    {
        path: '/srm/supplier/context/:keyId',
        name: 'SrmSupplierContextDecomposer',
        meta: { title: '供应商详情', AUTH: 'AUTH', keepAlive: true, router: '/srm/supplier' },
        props: (route: Omix) => ({ keyId: route.params.keyId }),
        component: () => import('@/components/srm/supplier/context/srm-supplier-context-decomposer.vue')
    }
]

export default routes
