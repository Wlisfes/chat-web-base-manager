import { concat } from '@/utils'
import crm from '@/router/modules/crm'
import deploy from '@/router/modules/deploy'
import finance from '@/router/modules/finance'

/**路由列表配置**/
export function fetchSetupRouter() {
    return concat(crm, finance, deploy, [
        {
            path: '/manager',
            name: 'Manager',
            meta: { title: '工作台', AUTH: 'AUTH', keepAlive: true } as any,
            component: () => import('@/views/main/manager/manager.vue')
        }
    ])
}
