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
    },
    {
        path: '/srm/simbank/quote',
        name: 'SrmSimbankQuoteManager',
        meta: { title: 'simbank 报价', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/srm/simbank/quote/index.vue')
    },
    {
        path: '/srm/simbank/quote/wrapper',
        name: 'SrmSimbankQuoteContextWrapper',
        meta: { title: '新增 simbank 报价', AUTH: 'AUTH', keepAlive: true, router: '/srm/simbank/quote' },
        props: route => ({ router: route.fullPath }),
        component: () => import('@/components/srm/simbank/quote/context/srm-simbank-quote-context-wrapper.vue')
    }
]

export default routes
