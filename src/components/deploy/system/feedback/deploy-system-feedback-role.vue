<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useSelectService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import { httpBaseSystemDepartmentTreeStructure } from '@/api/modules/deploy/modules/dept.service'
import * as Service from '@/api/modules/deploy/modules/role.service'

export default defineComponent({
    name: 'DeploySystemFeedbackRole',
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
        /**通用字典枚举**/
        const chunkOptions = useChunkService({
            immediate: false,
            type: ['CHUNK_ROLE_MODEL', 'CHUNK_ROLE_CHUNK']
        })
        /**部门树结构（仅部门角色需要）**/
        const deptOptions = useSelectService(() => httpBaseSystemDepartmentTreeStructure(), {
            immediate: false
        })

        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseSystemRoleResolver,
            formState: {
                name: props.node.name, //角色名称
                comment: props.node.comment, //角色描述
                sort: props.node.sort ?? 10, //排序号
                model: props.node.model //数据权限
            },
            rules: {
                name: { required: true, message: '请输入角色名称', trigger: 'blur' },
                model: { required: true, message: '请选择数据权限', trigger: 'blur' },
                sort: { required: true, type: 'number', message: '请输入排序号', trigger: 'blur' }
            }
        })
        /**角色详情**/
        async function fetchBaseSystemRoleResolver() {
            return await Promise.all([deptOptions.fetchRequest(), chunkOptions.fetchRequest()]).then(async () => {
                if (['CREATE'].includes(props.command)) {
                    return await setState({ initialize: false })
                }
                try {
                    return await Service.httpBaseSystemRoleResolver({ keyId: props.node.keyId }).then(async ({ data }) => {
                        return await setForm(fetchReste(data)).then(async () => {
                            return await setState({ initialize: false })
                        })
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
                        await Service.httpBaseSystemCreateRole(formState.value)
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseSystemUpdateRole({ ...formState.value, keyId: props.node.keyId })
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
                width={640}
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
                    <form-common-column label="角色名称" path="name">
                        <form-common-column-input
                            maxlength={32}
                            placeholder="请输入角色名称"
                            v-model:value={formState.value.name}
                        ></form-common-column-input>
                    </form-common-column>
                    <form-common-column label="数据权限" path="model">
                        <form-common-column-select
                            placeholder="请选择数据权限"
                            options={chunkOptions.CHUNK_ROLE_MODEL.value}
                            v-model:value={formState.value.model}
                        ></form-common-column-select>
                    </form-common-column>
                    <form-common-column label="排序号" path="sort">
                        <n-input-number class="w-full" placeholder="请输入排序号" v-model:value={formState.value.sort} />
                    </form-common-column>
                    <form-common-column label="角色描述" path="comment">
                        <form-common-column-input
                            type="textarea"
                            placeholder="请输入角色描述"
                            maxlength={128}
                            autosize={{ minRows: 2, maxRows: 5 }}
                            v-model:value={formState.value.comment}
                        ></form-common-column-input>
                    </form-common-column>
                </form-common-container>
            </common-dialog-provider>
        )
    }
})
</script>
