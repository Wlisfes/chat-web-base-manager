<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useSelectService, useChunkService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { fetchNormalizeTreeChildren } from '@/utils'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemUser',
    setup(props, ctx) {
        /**部门树结构**/
        const deptOptions = useSelectService(e => Service.httpBaseAccountOrganizationTreeStructure(), {
            immediate: true,
            transform: fetchNormalizeTreeChildren
        })
        /**账号静态枚举**/
        const { chunkOptions, chunkState } = useChunkService(e => Service.httpBaseAccountUserEnums(), {
            immediate: true
        })
        /**表格实例**/
        const { formRef, formState, state, instOptions, fetchRequest, fetchRestore, fetchRefresh } = useColumnService(
            (base, payload) => Service.httpBaseAccountColumnUser({ ...payload, page: base.page, size: base.size }),
            {
                keyName: 'chat:deploy:system:user',
                formState: {
                    /**工号/姓名/手机号/邮箱**/
                    vague: undefined,
                    /**状态**/
                    status: undefined,
                    /**归属部门**/
                    organizationKeyIds: []
                },
                actions: [
                    { title: '新增', key: 'chat:deploy:system:user:create' },
                    { title: '编辑', key: 'chat:deploy:system:user:update' },
                    { title: '重置密码', key: 'chat:deploy:system:user:password:reset' }
                ],
                columns: [
                    { title: '头像', key: 'avatar', width: 50, align: 'center', disabled: true },
                    { title: '名称', key: 'name', width: 120, disabled: true },
                    { title: '状态', key: 'status', width: 100 },
                    { title: '手机号', key: 'phone', width: 140 },
                    { title: '邮箱', key: 'email', width: 200 },
                    { title: '职级', key: 'levels', width: 100 },
                    { title: '岗位', key: 'posts', width: 160 },
                    { title: '归属部门', key: 'organizations', minWidth: 160 },
                    { title: '关联角色', key: 'roles', minWidth: 200 },
                    { title: '入职时间', key: 'createTime', width: 160 }
                ]
            }
        )

        /**新增账号**/
        async function fetchCreateDeploySystemUser() {
            return await feedback.fetchDeploySystemUser({
                title: '新增账号',
                command: 'CREATE',
                onSubmit: () => fetchRefresh()
            })
        }

        /**编辑账号**/
        async function fetchUpdateDeploySystemUser(node: Omix) {
            return await feedback.fetchDeploySystemUser({
                title: '编辑账号',
                command: 'UPDATE',
                node,
                onSubmit: () => fetchRefresh()
            })
        }

        /**禁用账号**/
        async function fetchBaseAccountUpdateUser(node: Omix, status: string) {
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认${['enabled'].includes(status) ? '启用' : '禁用'}账号【${node.name}】吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseAccountUpdateUser({ uid: node.uid, status })
                            return await done({ visible: false }).then(async () => {
                                await fetchNotifyService({ title: '操作成功' })
                                return await fetchRefresh()
                            })
                        } catch (err) {
                            return await done({ loading: false }).then(async () => {
                                return await fetchNotifyService({ type: 'error', title: err.message })
                            })
                        }
                    })
                }
            })
        }

        /**重置密码**/
        async function fetchBaseAccountResetUserPassword(node: Omix) {
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认将账号【${node.name}】的密码重置为默认密码吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseAccountResetUserPassword({ uid: node.uid, password: '123456' })
                            return await done({ visible: false }).then(async () => {
                                return await fetchNotifyService({ title: '密码重置成功' })
                            })
                        } catch (err) {
                            return await done({ loading: false }).then(async () => {
                                return await fetchNotifyService({ type: 'error', title: err.message })
                            })
                        }
                    })
                }
            })
        }

        return () => (
            <layout-common-container initialize={state.initialize}>
                <common-database-search
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'deploy', 'abstract']}
                    ref={formRef}
                    limit={state.limit}
                    v-model:loading={state.loading}
                    v-model:when={state.when}
                    v-model:database={state.database}
                    v-model:formState={formState.value}
                    on-update:database={instOptions.fetchUpdateDatabase}
                    on-restore={fetchRestore}
                    on-submit={fetchRequest}
                >
                    <common-database-search-function abstract class="flex gap-col-10">
                        <common-base-authorize key-name={state.actions[0].key}>
                            <common-base-button type="primary" onClick={fetchCreateDeploySystemUser}>
                                新增
                            </common-base-button>
                        </common-base-authorize>
                    </common-database-search-function>
                    <common-database-search-column disabled prop="vague" label="关键词">
                        <form-base-input
                            clearable
                            placeholder="工号/姓名/手机号/邮箱"
                            v-model:value={formState.value.vague}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                    <common-database-search-column prop="organizationKeyIds" label="归属部门">
                        <form-base-tree-select
                            multiple
                            checkable
                            clearable
                            cascade={false}
                            label-field="name"
                            label-value="keyId"
                            children-field="children"
                            placeholder="请选择归属部门"
                            v-model:value={formState.value.organizationKeyIds}
                            loading={deptOptions.loading.value}
                            options={deptOptions.dataSource.value}
                        ></form-base-tree-select>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="状态">
                        <form-base-select
                            clearable
                            placeholder="请选择状态"
                            loading={chunkState.loading}
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    show-command
                    show-settings
                    limit={state.limit}
                    total={state.total}
                    columns={state.columns}
                    v-model:page={state.page}
                    v-model:size={state.size}
                    v-model:select={state.select}
                    v-model:data={state.dataSource}
                    v-model:loading={state.loading}
                    v-model:initialize={state.initialize}
                    v-model:customize={state.customize}
                    on-update:customize={instOptions.fetchUpdateCustomize}
                    on-update:page={(page: number) => fetchRefresh({ page })}
                    on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                >
                    {{
                        col_name: (data: Omix) => {
                            return <common-base-user element="text" data={data}></common-base-user>
                        },
                        col_avatar: (data: Omix) => {
                            return <common-base-user element="avatar" data={data}></common-base-user>
                        },
                        col_organizations: (data: Omix) => {
                            return <common-base-content value={data.organizations}></common-base-content>
                        },
                        col_levels: (data: Omix) => {
                            return <common-base-content bit="/" value={data.levels}></common-base-content>
                        },
                        col_posts: (data: Omix) => {
                            return <common-base-content value={data.posts}></common-base-content>
                        },
                        col_ranks: (data: Omix) => {
                            return <common-base-content value={data.ranks}></common-base-content>
                        },
                        col_roles: (data: Omix) => {
                            return <common-base-content value={data.roles}></common-base-content>
                        },
                        col_status: (data: Omix) => (
                            <common-base-chunk bordered value={data.status} items={chunkOptions.value.statusOptions}></common-base-chunk>
                        ),
                        col_command: (data: Omix) => (
                            <common-base-authorize
                                element
                                empty="-"
                                key-name={[state.actions[1].key, state.actions[2].key]}
                                class-name="flex items-center gap-x-10 overflow-hidden"
                            >
                                <common-base-authorize key-name={state.actions[1].key}>
                                    <common-base-button
                                        text
                                        title="编辑"
                                        type="info"
                                        onClick={(e: MouseEvent) => fetchUpdateDeploySystemUser(data)}
                                    >
                                        编辑
                                    </common-base-button>
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[1].key}>
                                    {['enabled'].includes(data.status) ? (
                                        <common-base-button
                                            text
                                            title="禁用"
                                            type="error"
                                            onClick={(e: MouseEvent) => fetchBaseAccountUpdateUser(data, 'disabled')}
                                        >
                                            禁用
                                        </common-base-button>
                                    ) : (
                                        <common-base-button
                                            text
                                            title="启用"
                                            type="success"
                                            onClick={(e: MouseEvent) => fetchBaseAccountUpdateUser(data, 'enabled')}
                                        >
                                            启用
                                        </common-base-button>
                                    )}
                                </common-base-authorize>
                                <common-base-authorize key-name={state.actions[2].key}>
                                    <common-base-button
                                        text
                                        title="重置密码"
                                        type="warning"
                                        onClick={(e: MouseEvent) => fetchBaseAccountResetUserPassword(data)}
                                    >
                                        重置密码
                                    </common-base-button>
                                </common-base-authorize>
                            </common-base-authorize>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
