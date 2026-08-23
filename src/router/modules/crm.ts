import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/crm/consumer',
        name: 'CrmConsumer',
        meta: { title: '我的客户', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/consumer/index.vue')
    },
    {
        path: '/crm/partner',
        name: 'CrmPartner',
        meta: { title: '合作伙伴', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/partner/index.vue')
    },
    {
        path: '/crm/consumer/context',
        name: 'CrmConsumerContext',
        meta: { title: '客户详情', AUTH: 'AUTH' },
        props: (route: Omix) => ({ keyId: route.query.keyId }),
        component: () => import('@/components/crm/consumer/context/crm-consumer-context-decomposer.vue')
    },
    {
        path: '/crm/sms/quote/create',
        name: 'CrmSmsQuoteCreate',
        meta: { title: '短信报价', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/sms-quote/create/index.vue')
    },
    {
        path: '/crm/sms/quote',
        name: 'CrmSmsQuote',
        meta: { title: '报价查询', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/sms-quote/list/index.vue')
    }
]

export default routes
