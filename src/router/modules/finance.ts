export default [
    {
        path: '/finance/deploy/brand',
        name: 'FinanceDeployBrand',
        meta: { title: '品牌管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/deploy/brand/index.vue')
    },
    {
        path: '/finance/deploy/currency',
        name: 'FinanceDeployCurrency',
        meta: { title: '币种管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/deploy/currency/index.vue')
    },
    {
        path: '/finance/deploy/exchange',
        name: 'FinanceDeployExchange',
        meta: { title: '汇率管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/deploy/exchange/index.vue')
    },
    {
        path: '/finance/deploy/country',
        name: 'FinanceDeployCountry',
        meta: { title: '国家/地区管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/deploy/country/index.vue')
    },
    {
        path: '/finance/account/consumer',
        name: 'FinanceAccountConsumer',
        meta: { title: '消费用户', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/account/consumer/index.vue')
    },
    {
        path: '/finance/rates/sms',
        name: 'FinanceRatesSms',
        meta: { title: '短信基础价格', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/finance/rates/sms/index.vue')
    }
]
