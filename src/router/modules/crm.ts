import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/crm/consumer',
        name: 'CrmConsumer',
        meta: { title: '我的客户', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/consumer/index.vue')
    },
    {
        path: '/crm/consumer/context/:keyId',
        name: 'CrmConsumerContextDecomposer',
        meta: { title: '客户详情', AUTH: 'AUTH', keepAlive: true, router: '/crm/consumer' },
        props: (route: Omix) => ({ keyId: route.params.keyId }),
        component: () => import('@/components/crm/consumer/context/crm-consumer-context-decomposer.vue')
    },
    {
        path: '/crm/partner',
        name: 'CrmPartner',
        meta: { title: '合作伙伴', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/partner/index.vue')
    },
    {
        path: '/crm/sms/quote',
        name: 'CrmSmsQuoteManager',
        meta: { title: '短信报价', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/sms/quote/index.vue')
    },
    {
        path: '/crm/sms/quote/wrapper',
        name: 'CrmSmsQuoteContextWrapper',
        meta: { title: '新增短信报价', AUTH: 'AUTH', keepAlive: true, router: '/crm/sms/quote' },
        props: route => ({ router: route.fullPath }),
        component: () => import('@/components/crm/sms/quote/context/crm-sms-quote-context-wrapper.vue')
    }
]

export default routes
