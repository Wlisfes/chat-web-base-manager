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
        name: 'NexusSimbankPort',
        meta: { title: 'simbank端口', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/nexus/simbank/port/index.vue')
    },
    {
        path: '/nexus/simbank/message',
        name: 'NexusSimbankMessage',
        meta: { title: 'simbank消息', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/nexus/simbank/message/index.vue')
    },
    {
        path: '/nexus/sms/channel',
        name: 'NexusSmsChannel',
        meta: { title: '短信通道', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/nexus/sms/channel/index.vue')
    },
    {
        path: '/nexus/sms/route',
        name: 'NexusSmsRoute',
        meta: { title: '短信路由', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/nexus/sms/route/index.vue')
    },
    {
        path: '/nexus/sms/rule',
        name: 'NexusSmsRule',
        meta: { title: '路由规则', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/nexus/sms/rule/index.vue')
    }
]

export default routes
