<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'DeployChunkFeedbackResolver',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作指令**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**枚举相关配置**/
        chunkNode: { type: Object as PropType<Omix>, default: () => ({}) },
        /**系统枚举静态枚举**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseSkylineChunkResolver,
            formState: {
                /**枚举模块**/
                module: props.chunkNode.module,
                /**枚举类型**/
                type: props.chunkNode.type,
                /**枚举名称**/
                name: props.node.name,
                /**枚举值**/
                value: props.node.value,
                /**父枚举项主键**/
                pid: props.node.pid,
                /**排序号**/
                sort: props.node.sort ?? 10,
                /**状态**/
                status: props.node.status ?? 'enable',
                /**是否允许更新**/
                allowUpdate: props.node.allowUpdate ?? true,
                /**是否允许删除**/
                allowDelete: props.node.allowDelete ?? true
            },
            rules: {
                name: { required: true, message: '请输入枚举名称', trigger: 'blur' },
                sort: { required: true, type: 'number', message: '请输入排序号', trigger: 'blur' },
                status: { required: true, message: '请选择状态', trigger: 'blur' },
                allowUpdate: { required: true, type: 'boolean', message: '请选是否允许更新', trigger: 'blur' },
                allowDelete: { required: true, type: 'boolean', message: '请选是否允许删除', trigger: 'blur' }
            }
        })

        /**部门详情**/
        async function fetchBaseSkylineChunkResolver() {
            const taskNames: Array<any> = []
            if (['CREATE'].includes(props.command)) {
                return await Promise.all(taskNames).then(async () => {
                    return await setState({ initialize: false })
                })
            } else {
                taskNames.unshift(Service.httpBaseSkylineChunkResolver({ keyId: props.node.keyId }))
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
                        await Service.httpBaseSkylineCreateChunk({ ...formState.value })
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseSkylineUpdateChunk({ ...formState.value, keyId: props.node.keyId })
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
                width={720}
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
                        <form-base-column label="枚举名称" path="name">
                            <form-base-input
                                maxlength={128}
                                placeholder="请输入枚举名称"
                                v-model:value={formState.value.name}
                            ></form-base-input>
                        </form-base-column>
                        <form-base-column label="枚举值" path="value">
                            <form-base-input
                                maxlength={128}
                                placeholder="请输入枚举值，为空默认使用ID"
                                v-model:value={formState.value.value}
                            ></form-base-input>
                        </form-base-column>
                        {['tree'].includes(props.chunkNode.kind) && <form-base-column label="父级主键" path="pid"></form-base-column>}
                        <form-base-column label="状态" path="status">
                            <form-base-select
                                placeholder="请选择状态"
                                options={props.chunkOptions.statusOptions}
                                v-model:value={formState.value.status}
                            ></form-base-select>
                        </form-base-column>
                        <form-base-column label="排序号" path="sort">
                            <form-base-number-input
                                min={0}
                                step={10}
                                precision={0}
                                placeholder="请输入排序号"
                                v-model:value={formState.value.sort}
                            ></form-base-number-input>
                        </form-base-column>
                        <form-base-column label="是否允许更新" path="allowUpdate">
                            <n-switch
                                v-model:value={formState.value.allowUpdate}
                                //disabled={['UPDATE'].includes(props.command)}
                            ></n-switch>
                        </form-base-column>
                        <form-base-column label="是否允许删除" path="allowDelete">
                            <n-switch
                                v-model:value={formState.value.allowDelete}
                                //disabled={['UPDATE'].includes(props.command)}
                            ></n-switch>
                        </form-base-column>
                    </common-base-columns-template>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
