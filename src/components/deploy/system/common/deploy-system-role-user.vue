<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { useColumnService } from '@/hooks'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemRoleUser',
    props: {
        /**角色ID**/
        roleId: { type: Number as PropType<number> }
    },
    setup(props, ctx) {
        /**表格实例**/
        const { formRef, formState, state, instOptions, fetchRequest, fetchRestore, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseAccountColumnUser({ ...payload, page: base.page, size: base.size }),
            keyName: 'chat:deploy:system:role:user',
            immediate: true,
            formState: { roleKeyId: props.roleId, vague: undefined },
            columns: [
                { title: '头像', key: 'avatar', width: 50, align: 'center', disabled: true },
                { title: '名称', key: 'name', width: 120, disabled: true },
                { title: '手机号', key: 'phone', width: 140 },
                { title: '邮箱', key: 'email', width: 200 },
                { title: '职级', key: 'levels', width: 100 },
                { title: '岗位', key: 'posts', width: 160 },
                { title: '归属部门', key: 'organizations', minWidth: 160 },
                { title: '关联角色', key: 'roles', minWidth: 200 },
                { title: '入职时间', key: 'createTime', width: 160 }
            ]
        })

        /**添加关联用户弹窗**/
        async function fetchDeployRoleUser(event: MouseEvent) {
            return await feedback.fetchDeploySystemRoleUser({
                title: '添加关联用户',
                roleId: props.roleId,
                onSubmit: () => fetchRefresh()
            })
        }

        /**移除关联用户**/
        async function fetchBaseAccountRoleUnlinkUser(node: Omix) {
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认移除【${node.name}】账号角色吗？`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseAccountRoleUnlinkUser({ keyId: props.roleId, uids: [node.uid] })
                            return await done({ visible: false }).then(async () => {
                                await fetchNotifyService({ title: '操作成功' })
                                return await fetchRefresh({ page: 1 })
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
            <n-element class="deploy-system-role-user h-full flex flex-col gap-14 overflow-hidden">
                <common-database-search
                    class="p-0!"
                    function-class="justify-end"
                    function={['search', 'restore', 'collapse', 'abstract']}
                    square={['l-t', 'r-t']}
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
                        <common-base-authorize key-name="chat:deploy:system:role:link:user">
                            <common-base-button dashed type="primary" onClick={fetchDeployRoleUser}>
                                关联用户
                            </common-base-button>
                        </common-base-authorize>
                    </common-database-search-function>
                    <common-database-search-column prop="vague" label="关键字">
                        <form-base-input
                            clearable
                            placeholder="请输入姓名/工号/手机号/邮箱"
                            v-model:value={formState.value.vague}
                            on-submit={fetchRefresh}
                        ></form-base-input>
                    </common-database-search-column>
                </common-database-search>
                <common-database-table
                    class="p-0!"
                    show-command
                    show-settings
                    bordered={false}
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
                        col_command: (data: Omix) => (
                            <common-base-authorize
                                element
                                empty="-"
                                key-name="chat:deploy:system:role:unlink:user"
                                class="flex items-center gap-x-10 overflow-hidden"
                            >
                                <common-base-button
                                    text
                                    type="error"
                                    title="移除用户关联角色"
                                    onClick={(e: MouseEvent) => fetchBaseAccountRoleUnlinkUser(data)}
                                >
                                    移除用户
                                </common-base-button>
                            </common-base-authorize>
                        )
                    }}
                </common-database-table>
            </n-element>
        )
    }
})
</script>
