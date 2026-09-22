<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService, useChunkService } from '@/hooks'
import { fetchNormalizeTreeChildren } from '@/utils'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeploySystemFeedbackDept',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作指令**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**部门树结构**/
        const deptOptions = useSelectService(Service.httpBaseAccountOrganizationTreeStructure, {
            transform: fetchNormalizeTreeChildren,
            immediate: false
        })
        /**负责人账号列表**/
        const leaderOptions = useSelectService(Service.httpBaseAccountSelectUser, {
            immediate: false
        })
        /**后端部门枚举**/
        const { chunkOptions, fetchChunk } = useChunkService(Service.httpBaseAccountOrganizationEnums, {
            immediate: false
        })
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseSystemDeptResolver,
            formState: {
                /**部门名称**/
                name: props.node.name,
                /**部门编码**/
                code: props.node.code,
                /**上级部门**/
                parentKeyId: props.node.parentKeyId,
                /**部门类型**/
                type: props.node.type ?? 'department',
                /**负责人**/
                leaderUserUid: props.node.leaderUserUid,
                /**排序**/
                sort: props.node.sort ?? 10,
                /**状态**/
                status: props.node.status ?? 'enabled'
            },
            rules: {
                name: { required: true, message: '请输入部门名称', trigger: 'blur' },
                code: { required: true, message: '请输入部门编码', trigger: 'blur' },
                type: { required: true, message: '请选择部门类型', trigger: 'change' },
                status: { required: true, message: '请选择部门状态', trigger: 'change' },
                leaderUserUid: { required: true, message: '请选择负责人', trigger: 'change' },
                sort: { required: true, type: 'number', message: '请输入排序号', trigger: 'blur' }
            }
        })

        /**部门详情**/
        async function fetchBaseSystemDeptResolver() {
            const taskNames = [fetchChunk(), deptOptions.fetchRequest(), leaderOptions.fetchRequest()]
            if (['CREATE'].includes(props.command)) {
                return await Promise.all(taskNames).then(async () => {
                    return await setState({ initialize: false })
                })
            } else {
                taskNames.unshift(Service.httpBaseAccountOrganizationResolver({ keyId: props.node.keyId }))
            }
            return await Promise.all(taskNames).then(async ([{ data }]) => {
                try {
                    return await setForm(fetchReste(data)).then(async () => {
                        return await setState({ initialize: false })
                    })
                } catch (err) {
                    return await setState({ initialize: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseAccountCreateOrganization(formState.value)
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseAccountUpdateOrganization({
                            ...formState.value,
                            keyId: props.node.keyId
                        })
                    }
                    return await setState({ visible: false }).then(async () => {
                        await emit('submit', { done: setState })
                        return await fetchNotifyService({ title: '操作成功' })
                    })
                } catch (err) {
                    return await setState({ loading: false, disabled: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={750}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-base-container
                    require-mark-placement="left"
                    size="medium"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                >
                    <common-base-columns-template class="gap-x-20" type="auto-fit" number={320}>
                        <form-base-column label="上级部门" path="parentKeyId">
                            <form-base-cascader
                                v-model:value={formState.value.parentKeyId}
                                label-field="name"
                                label-value="keyId"
                                children-field="children"
                                placeholder="请选择上级部门"
                                expand-trigger="click"
                                options={deptOptions.dataSource.value}
                            ></form-base-cascader>
                        </form-base-column>
                        <form-base-column label="部门名称" path="name">
                            <form-base-input
                                maxlength={32}
                                placeholder="请输入部门名称"
                                v-model:value={formState.value.name}
                            ></form-base-input>
                        </form-base-column>
                        <form-base-column label="部门编码" path="code">
                            <form-base-input
                                maxlength={64}
                                placeholder="例如 RD 或 PRODUCT_TEAM"
                                v-model:value={formState.value.code}
                            ></form-base-input>
                        </form-base-column>
                        <form-base-column label="部门类型" path="type">
                            <form-base-select
                                placeholder="请选择部门类型"
                                options={chunkOptions.value.typeOptions}
                                v-model:value={formState.value.type}
                            ></form-base-select>
                        </form-base-column>
                        <form-base-column label="负责人" path="leaderUserUid">
                            <form-base-select
                                filterable
                                label-value="uid"
                                label-field="showName"
                                placeholder="请选择负责人"
                                options={leaderOptions.dataSource.value}
                                v-model:value={formState.value.leaderUserUid}
                            ></form-base-select>
                        </form-base-column>
                        <form-base-column label="排序号" path="sort">
                            <n-input-number class="w-full" min={0} precision={0} v-model:value={formState.value.sort} />
                        </form-base-column>
                        <form-base-column label="部门状态" path="status">
                            <form-base-select
                                placeholder="请选择部门状态"
                                options={chunkOptions.value.statusOptions}
                                v-model:value={formState.value.status}
                            ></form-base-select>
                        </form-base-column>
                    </common-base-columns-template>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
