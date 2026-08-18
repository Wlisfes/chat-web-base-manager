<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService } from '@/hooks'
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
        const deptOptions = useSelectService(() => Service.httpBaseSystemDepartmentTreeStructure(), {
            immediate: false
        })
        /**负责人账号列表**/
        const accountOptions = useSelectService(() => Service.httpBaseSystemSelectAccount(), {
            immediate: false
        })
        const typeOptions = [
            { label: '公司', name: '公司', value: 'company' },
            { label: '部门', name: '部门', value: 'department' },
            { label: '团队', name: '团队', value: 'team' }
        ]
        const statusOptions = [
            { label: '启用', name: '启用', value: 'enabled' },
            { label: '禁用', name: '禁用', value: 'disabled' }
        ]
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseSystemDeptResolver,
            formState: {
                name: props.node.name, //部门名称
                alias: props.node.alias, //别名简称
                pid: props.node.pid, //上级部门
                type: props.node.type ?? 'department', //组织类型
                leaderUserUid: props.node.leaderUserUid, //负责人
                sort: props.node.sort ?? 10, //排序
                status: props.node.status ?? 'enabled' //状态
            },
            rules: {
                name: { required: true, message: '请输入部门名称', trigger: 'blur' },
                alias: { required: true, message: '请输入组织编码', trigger: 'blur' },
                type: { required: true, message: '请选择组织类型', trigger: 'change' },
                status: { required: true, message: '请选择组织状态', trigger: 'change' },
                sort: { required: true, type: 'number', message: '请输入排序号', trigger: 'blur' }
            }
        })

        /**部门详情**/
        async function fetchBaseSystemDeptResolver() {
            return await Promise.all([deptOptions.fetchRequest(), accountOptions.fetchRequest()]).then(async () => {
                if (['CREATE'].includes(props.command)) {
                    return await setState({ initialize: false })
                }
                try {
                    const deptRes = await Service.httpBaseSystemDepartmentResolver({ keyId: props.node.keyId })
                    return await setForm(fetchReste(deptRes.data)).then(async () => {
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
                        await Service.httpBaseSystemCreateDepartment(formState.value)
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseSystemUpdateDepartment({
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
                width={540}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <form-common-container
                    require-mark-placement="left"
                    size="medium"
                    ref={formRef}
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                >
                    <form-common-column label="上级部门" path="pid">
                        <form-common-column-cascader
                            v-model:value={formState.value.pid}
                            placeholder="请选择上级部门"
                            expand-trigger="click"
                            options={deptOptions.dataSource.value}
                        ></form-common-column-cascader>
                    </form-common-column>
                    <form-common-column label="部门名称" path="name">
                        <form-common-column-input
                            maxlength={32}
                            placeholder="请输入部门名称"
                            v-model:value={formState.value.name}
                        ></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="组织编码" path="alias">
                        <form-common-column-input
                            maxlength={64}
                            placeholder="例如 RD 或 PRODUCT_TEAM"
                            v-model:value={formState.value.alias}
                        ></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="组织类型" path="type">
                        <form-common-column-select
                            placeholder="请选择组织类型"
                            options={typeOptions}
                            v-model:value={formState.value.type}
                        ></form-common-column-select>
                    </form-common-column>
                    <form-common-column label="负责人" path="leaderUserUid">
                        <form-common-column-select
                            clearable
                            filterable
                            placeholder="请选择负责人"
                            options={accountOptions.dataSource.value}
                            v-model:value={formState.value.leaderUserUid}
                        ></form-common-column-select>
                    </form-common-column>
                    <form-common-column label="排序号" path="sort">
                        <n-input-number class="w-full" min={0} precision={0} v-model:value={formState.value.sort} />
                    </form-common-column>
                    <form-common-column label="组织状态" path="status">
                        <form-common-column-select
                            placeholder="请选择组织状态"
                            options={statusOptions}
                            v-model:value={formState.value.status}
                        ></form-common-column-select>
                    </form-common-column>
                </form-common-container>
            </common-dialog-provider>
        )
    }
})
</script>
