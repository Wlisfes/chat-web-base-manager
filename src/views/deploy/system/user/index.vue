<script lang="tsx">
import { defineComponent } from 'vue'
import { useColumnService, useSelectService } from '@/hooks'
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
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, setForm, fetchRequest, fetchRestore, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseAccountColumnUser({ ...payload, page: base.page, size: base.size }),
            keyName: 'chat:deploy:system:user',
            formState: {
                /**工号/姓名/手机号/邮箱**/
                vague: undefined,
                /**状态**/
                status: undefined,
                /**归属部门**/
                organizationKeyIds: []
            },
            columns: [
                { title: '头像', key: 'avatar', width: 50, align: 'center', disabled: true },
                { title: '名称', key: 'name', width: 120, disabled: true },
                { title: '状态', key: 'status', width: 100 },
                { title: '手机号', key: 'phone', width: 140 },
                { title: '邮箱', key: 'email', width: 200 },
                { title: '职级', key: 'ranks', width: 100 },
                { title: '职位', key: 'positions', width: 160 },
                { title: '归属部门', key: 'organizations', minWidth: 200 },
                { title: '关联角色', key: 'roles', minWidth: 160 },
                { title: '入职时间', key: 'createTime', width: 160 }
            ]
        })

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
        async function fetchBaseAccountUpdateUser(node: Omix) {
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认禁用账号【${node.name}】吗？禁用后该账号将无法登录。`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseAccountUpdateUser({ uid: node.uid, status: 'disabled' })
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
        async function fetchDeployAccountResetPassword() {
            const node = state.select[0]
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
                        <common-base-button type="primary" onClick={fetchCreateDeploySystemUser}>
                            新增
                        </common-base-button>
                        <common-base-button
                            dashed
                            type="primary"
                            disabled={instState.value.isUpdate}
                            onClick={() => fetchUpdateDeploySystemUser(state.select[0])}
                        >
                            编辑
                        </common-base-button>
                        <common-base-button
                            dashed
                            type="error"
                            disabled={instState.value.isDelete}
                            onClick={() => fetchBaseAccountUpdateUser(state.select[0])}
                        >
                            禁用
                        </common-base-button>
                        <common-base-button
                            dashed
                            type="warning"
                            disabled={instState.value.isUpdate}
                            onClick={fetchDeployAccountResetPassword}
                        >
                            重置密码
                        </common-base-button>
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
                            cascade={false}
                            label-field="name"
                            label-value="keyId"
                            children-field="children"
                            placeholder="请选择归属部门"
                            v-model:value={formState.value.organizationKeyIds}
                            options={deptOptions.dataSource.value}
                        ></form-base-tree-select>
                    </common-database-search-column>
                    <common-database-search-column prop="status" label="状态">
                        <form-base-select
                            clearable
                            placeholder="请选择状态"
                            //options={chunkOptions.CHUNK_ACCOUNT_STATUS.value}
                            v-model:value={formState.value.status}
                            on-change:value={fetchRefresh}
                        ></form-base-select>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    show-select
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
                            return <common-database-table-user element="text" data={data}></common-database-table-user>
                        },
                        col_avatar: (data: Omix) => {
                            return <common-database-table-user element="avatar" data={data}></common-database-table-user>
                        },
                        col_organizations: (data: Omix) => {
                            return (
                                <common-database-table-content
                                    value={(data.organizations ?? []).map((item: Omix) => item.name)}
                                ></common-database-table-content>
                            )
                        },
                        col_positions: (data: Omix) => (
                            <common-database-table-content
                                value={(data.positions ?? []).map((item: Omix) => item.name)}
                            ></common-database-table-content>
                        ),
                        col_ranks: (data: Omix) => (
                            <common-database-table-content
                                value={(data.ranks ?? []).map((item: Omix) => item.name)}
                            ></common-database-table-content>
                        ),
                        col_roles: (data: Omix) => {
                            return (
                                <common-database-table-content
                                    value={(data.roles ?? []).map((item: Omix) => item.name)}
                                ></common-database-table-content>
                            )
                        },
                        col_status: (data: Omix) => (
                            <common-database-table-chunk
                                element="chunk"
                                value={data.status}
                                //options={chunkOptions.CHUNK_ACCOUNT_STATUS.value}
                            ></common-database-table-chunk>
                        )
                    }}
                </common-database-table>
            </layout-common-container>
        )
    }
})
</script>
