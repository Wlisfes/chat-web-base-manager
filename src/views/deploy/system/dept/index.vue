<script lang="tsx">
import { defineComponent, h } from 'vue'
import { useColumnService, useSelectService } from '@/hooks'
import { fetchDialogService, fetchNotifyService } from '@/plugins'
import { SendFilled } from '@vicons/carbon'
import * as feedback from '@/components/deploy/hooks'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemDepartment',
    setup(props, ctx) {
        /**部门树结构**/
        const deptOptions = useSelectService(e => Service.httpBaseSystemDepartmentTreeStructure(), {
            immediate: true,
            options: { pattern: undefined, selectedKeys: [], expandedKeys: [] },
            callback: fetchReadyCallback
        })
        /**表格实例**/
        const { formRef, formState, state, instState, instOptions, setForm, fetchRequest, fetchRestore, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpBaseSystemColumnDepartment(payload),
            keyName: 'chatbok:deploy:system:dept',
            immediate: false,
            formState: {
                pid: undefined, //父级ID
                name: undefined, //部门名称
                alias: undefined //别名简称
            },
            columns: [
                { title: '部门ID', key: 'keyId', width: 120, check: true },
                { title: '部门名称', key: 'name', minWidth: 240, disabled: true },
                { title: '别名简称', key: 'alias', width: 120, check: true },
                { title: '关联账号', key: 'accountCount', align: 'center', width: 100, check: true },
                { title: '管理员', key: 'admin', width: 120, check: true },
                { title: '子管理员', key: 'subAdmins', width: 160, check: true },
                { title: '创建人', key: 'createBy', width: 120, check: true },
                { title: '创建时间', key: 'createTime', width: 160, check: true },
                { title: '更新人', key: 'modifyBy', width: 120, check: true },
                { title: '更新时间', key: 'modifyTime', width: 160, check: true }
            ]
        })

        /**初始化回调**/
        async function fetchReadyCallback(data: Omix) {
            if (deptOptions.selectedKeys.value.length > 0) {
                return false
            }
            const items = data.dataSource.map((item: Omix) => item.keyId)
            const selecteds = items.filter((e: Omix, index: number) => index === 0)
            const expandeds = items.filter((e: Omix, index: number) => index === 0)
            return await deptOptions.setState({ selectedKeys: selecteds, expandedKeys: expandeds }).then(async () => {
                return await setForm({ pid: selecteds[0] ?? undefined }).then(async () => {
                    return await fetchRequest()
                })
            })
        }
        /**左侧树展开变更回调**/
        async function fetchUpdateExpanded(keys: Array<string>) {
            return await deptOptions.setState({ expandedKeys: keys as never })
        }
        /**左侧树选中变更回调**/
        async function fetchUpdateSelected(keys: Array<string>) {
            await deptOptions.setState({ selectedKeys: keys as never })
            return await setForm({ pid: keys[0] as never }).then(() => {
                return fetchRefresh({ page: 1, size: state.size })
            })
        }
        /**部门关联账号列表**/
        async function fetchDeploySystemDeptAccount(data: Omix) {
            return await feedback.fetchDeploySystemDeptAccount({
                title: `${data.name} - 关联账号`,
                node: data
            })
        }
        /**新增部门**/
        async function fetchDeployDepartmentCreate() {
            return await feedback.fetchDeploySystemDepartment({
                title: '新增部门',
                command: 'CREATE',
                async onSubmit() {
                    return await Promise.all([deptOptions.fetchRequest(), fetchRefresh()])
                }
            })
        }

        /**编辑部门**/
        async function fetchDeployDepartmentUpdate() {
            return await feedback.fetchDeploySystemDepartment({
                title: '编辑部门',
                command: 'UPDATE',
                node: state.select[0],
                async onSubmit() {
                    return await Promise.all([deptOptions.fetchRequest(), fetchRefresh()])
                }
            })
        }

        /**删除部门**/
        async function fetchDeployDepartmentDelete() {
            const node = state.select[0]
            return await fetchDialogService({
                title: '提示',
                type: 'warning',
                content: `确认删除部门【${node.name}】吗？删除后将同时删除子部门，且无法恢复！`,
                async onSubmit(done: Function) {
                    return await done({ loading: true }).then(async () => {
                        try {
                            await Service.httpBaseSystemDeleteDepartment({ keyId: node.keyId })
                            await Promise.all([deptOptions.fetchRequest(), fetchRefresh()])
                            return await done({ visible: false })
                        } catch (err) {
                            await done({ loading: false })
                            return await fetchNotifyService({ type: 'error', title: err.message })
                        }
                    })
                }
            })
        }

        return () => (
            <n-layout has-sider position="absolute" class="flex flex-col bg-transparent" content-class="flex-1 overflow-hidden">
                <n-layout-sider
                    width={280}
                    collapsed-width={0}
                    show-collapsed-content={false}
                    class="flex flex-col bg-transparent"
                    content-class="flex flex-col flex-1 overflow-hidden! p-block-14 p-is-14"
                >
                    <n-card class="flex-1 overflow-hidden" content-class="flex flex-col flex-1 p-inline-0! p-block-14! overflow-hidden">
                        <common-element-wrapper opacity={0} loading={deptOptions.state.loading}>
                            <n-scrollbar trigger="none" class="flex-1 overflow-hidden">
                                <n-element class="p-inline-14">
                                    <n-tree
                                        block-line
                                        cancelable={false}
                                        key-field="keyId"
                                        label-field="name"
                                        children-field="children"
                                        pattern={deptOptions.state.pattern}
                                        selected-keys={deptOptions.state.selectedKeys}
                                        expanded-keys={deptOptions.state.expandedKeys}
                                        data={deptOptions.dataSource.value}
                                        render-switcher-icon={() => h(SendFilled)}
                                        on-update:selected-keys={fetchUpdateSelected}
                                        on-update:expanded-keys={fetchUpdateExpanded}
                                        filter={(vague: string, node: Omix) => node.name.includes(vague)}
                                    />
                                </n-element>
                            </n-scrollbar>
                        </common-element-wrapper>
                    </n-card>
                </n-layout-sider>
                <n-layout class="bg-transparent" content-class="flex flex-col flex-1 p-14 gap-14 overflow-hidden">
                    <n-layout-header class="bg-transparent">
                        <common-database-search
                            class="p-0!"
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
                                <common-element-button type="primary" onClick={fetchDeployDepartmentCreate}>
                                    新增
                                </common-element-button>
                                <common-element-button
                                    dashed
                                    type="primary"
                                    disabled={instState.value.isUpdate}
                                    onClick={fetchDeployDepartmentUpdate}
                                >
                                    编辑
                                </common-element-button>
                                <common-element-button
                                    dashed
                                    type="error"
                                    disabled={instState.value.isDelete}
                                    onClick={fetchDeployDepartmentDelete}
                                >
                                    删除
                                </common-element-button>
                            </common-database-search-function>
                            <common-database-search-column disabled prop="name" label="部门名称">
                                <form-common-column-input
                                    clearable
                                    placeholder="请输入部门名称"
                                    v-model:value={formState.value.name}
                                    on-submit={fetchRefresh}
                                ></form-common-column-input>
                            </common-database-search-column>
                            <common-database-search-column prop="alias" label="别名简称">
                                <form-common-column-input
                                    clearable
                                    placeholder="请输入别名简称"
                                    v-model:value={formState.value.alias}
                                    on-submit={fetchRefresh}
                                ></form-common-column-input>
                            </common-database-search-column>
                        </common-database-search>
                    </n-layout-header>
                    <n-layout-content class="flex flex-col flex-1 bg-transparent" content-class="flex flex-col flex-1">
                        <common-database-table
                            class="p-0!"
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
                                col_accountCount: (data: Omix) => (
                                    <n-text underline type="info" class="cursor-pointer" onClick={() => fetchDeploySystemDeptAccount(data)}>
                                        {data.accountCount ?? 0}
                                    </n-text>
                                ),
                                col_admin: (data: Omix) => (
                                    <common-database-table-user element="text" data={data.admin}></common-database-table-user>
                                ),
                                col_subAdmins: (data: Omix) => (
                                    <common-database-table-content
                                        value={(data.subAdmins ?? []).map((item: Omix) => `${item.name} ${item.number}`)}
                                    ></common-database-table-content>
                                ),
                                col_createBy: (data: Omix) => (
                                    <common-database-table-user element="text" data={data.createByOptions}></common-database-table-user>
                                ),
                                col_modifyBy: (data: Omix) => (
                                    <common-database-table-user element="text" data={data.modifyByOptions}></common-database-table-user>
                                )
                            }}
                        </common-database-table>
                    </n-layout-content>
                </n-layout>
            </n-layout>
        )
    }
})
</script>
