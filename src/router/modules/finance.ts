import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/finance/base/brand',
        name: 'FinanceBaseBrand',
        meta: { title: '品牌管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/base/brand/index.vue')
    },
    {
        path: '/finance/base/currency',
        name: 'FinanceBaseCurrency',
        meta: { title: '币种管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/base/currency/index.vue')
    },
    {
        path: '/finance/base/exchange',
        name: 'FinanceBaseExchange',
        meta: { title: '汇率管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/base/exchange/index.vue')
    },
    {
        path: '/finance/frozen/sms',
        name: 'FinanceFrozenSmsManager',
        meta: { title: '短信基础价格', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/frozen/sms/index.vue')
    },
    {
        path: '/finance/frozen/simbank',
        name: 'FinanceFrozenSimbankManager',
        meta: { title: 'simbank成本价格', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/frozen/simbank/index.vue')
    },
    {
        path: '/finance/account/consumer',
        name: 'FinanceAccountConsumer',
        meta: { title: '消费用户', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/account/consumer/index.vue')
    }
]

export default routes
