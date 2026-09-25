export default [
    {
        path: '/deploy/chunk/system',
        name: 'DeployChunkSystem',
        meta: { title: '系统枚举设置', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/deploy/chunk/system/index.vue')
    },
    {
        path: '/deploy/chunk/system/item',
        name: 'DeployChunkSystemItem',
        meta: { title: '系统枚举明细', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/deploy/chunk/system/item.vue'),
        beforeEnter(to: Omix) {
            const name = String(to.query.name ?? '').trim()
            if (name) to.meta.title = name
        }
    },
    {
        path: '/deploy/datetask/system',
        name: 'DeployDatetaskSystem',
        meta: { title: '系统任务管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/deploy/datetask/system/index.vue')
    },
    {
        path: '/deploy/system/sheet',
        name: 'DeploySystemSheet',
        meta: { title: '菜单管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/deploy/system/sheet/index.vue')
    },
    {
        path: '/deploy/system/role',
        name: 'DeploySystemRole',
        meta: { title: '角色管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/deploy/system/role/index.vue')
    },
    {
        path: '/deploy/system/user',
        name: 'DeploySystemUser',
        meta: { title: '用户管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/deploy/system/user/index.vue')
    },
    {
        path: '/deploy/system/dept',
        name: 'DeploySystemDepartment',
        meta: { title: '部门组织', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/deploy/system/dept/index.vue')
    },
    {
        path: '/deploy/system/position',
        name: 'DeploySystemPosition',
        meta: { title: '职位管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/deploy/system/position/index.vue')
    }
]
