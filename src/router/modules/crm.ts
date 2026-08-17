export default [
    {
        path: '/crm/client/consumer',
        name: 'CrmClientConsumer',
        meta: { title: '我的客户', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/client/index.vue')
    },
    {
        path: '/crm/client/partner',
        name: 'CrmClientPartner',
        meta: { title: '合作伙伴', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/partner/index.vue')
    },
    {
        path: '/crm/client/context/:keyId',
        name: 'CrmClientContextDecomposer',
        meta: { title: '客户详情', AUTH: 'AUTH' },
        props: (route: Omix) => route.params,
        component: () => import('@/components/crm/client/context/crm-client-context-decomposer.vue')
    },
    {
        path: '/crm/client/formosan/sms',
        name: 'CrmClientFormosanSms',
        meta: { title: '短信报价', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/formosan/sms/index.vue')
    },
    {
        path: '/crm/client/saturation/sms',
        name: 'CrmClientSaturationSms',
        meta: { title: '报价查询', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/crm/saturation/sms/index.vue')
    }
]
