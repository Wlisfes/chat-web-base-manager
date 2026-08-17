export default [
    {
        path: '/deploy/datetask/system',
        name: 'DeployDatetaskSystem',
        meta: { title: '定时任务管理', AUTH: 'AUTH', keepAlive: true },
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
        path: '/deploy/system/account',
        name: 'DeploySystemAccount',
        meta: { title: '账号管理', AUTH: 'AUTH', keepAlive: true },
        component: () => import('@/views/deploy/system/account/index.vue')
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
