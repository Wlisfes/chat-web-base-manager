import { createComponent, PropsState } from '@/utils'

/**新增、编辑菜单/按钮**/
export async function fetchDeploySystemSheet(props: PropsState<Omix>) {
    return await import('@/components/deploy/system/feedback/deploy-system-feedback-sheet.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**新增、编辑角色**/
export async function fetchDeploySystemRole(props: PropsState<Omix>) {
    return await import('@/components/deploy/system/feedback/deploy-system-feedback-role.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**新增、编辑部门**/
export async function fetchDeploySystemDepartment(props: PropsState<Omix>) {
    return await import('@/components/deploy/system/feedback/deploy-system-feedback-dept.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**部门关联账号列表**/
export async function fetchDeploySystemDeptAccount(props: PropsState<Omix>) {
    return await import('@/components/deploy/system/feedback/deploy-system-feedback-dept-account.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**角色关联用户**/
export async function fetchDeploySystemRoleAccount(props: PropsState<Omix>) {
    return await import('@/components/deploy/system/feedback/deploy-system-feedback-role-account.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**新增账号**/
export async function fetchDeploySystemAccount(props: PropsState<Omix>) {
    return await import('@/components/deploy/system/feedback/deploy-system-feedback-account.vue').then(component => {
        return createComponent(component.default, props)
    })
}

/**新增、编辑职位**/
export async function fetchDeploySystemPosition(props: PropsState<Omix>) {
    return await import('@/components/deploy/system/feedback/deploy-system-feedback-position.vue').then(component => {
        return createComponent(component.default, props)
    })
}
