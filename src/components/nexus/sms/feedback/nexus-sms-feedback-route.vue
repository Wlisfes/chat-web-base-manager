<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackRoute',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作类型：CREATE 新增、UPDATE 编辑**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑的路由**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { chunkOptions, chunkState } = useChunkService(() => Service.httpBaseSrmRouteEnums(), {
            immediate: true
        })
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            initialize: false,
            formState: {
                /**路由名称**/
                name: props.node.name,
                /**路由别名**/
                alias: props.node.alias,
                /**路由类型：创建后不可修改**/
                type: props.node.type ?? 'general',
                /**排序：通用路由按排序依次尝试**/
                sort: props.node.sort ?? 0,
                /**路由状态**/
                status: props.node.status ?? 'enable',
                /**备注**/
                remark: props.node.remark
            },
            rules: {
                name: { required: true, message: '请输入路由名称', trigger: 'blur' },
                type: { required: true, message: '请选择路由类型', trigger: 'blur' },
                status: { required: true, message: '请选择路由状态', trigger: 'blur' }
            }
        })

        /**提交：路由类型只在新增时提交**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseSrmCreateRoute(formState.value)
                    } else {
                        await Service.httpBaseSrmUpdateRoute({ keyId: props.node.keyId, ...formState.value, type: undefined })
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
                width={520}
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={chunkState.initialize}
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
                    <form-base-column label="路由名称" path="name">
                        <form-base-input maxlength={64} placeholder="请输入路由名称" v-model:value={formState.value.name}></form-base-input>
                    </form-base-column>
                    <form-base-column label="路由别名" path="alias">
                        <form-base-input
                            maxlength={64}
                            placeholder="选填，全表唯一"
                            v-model:value={formState.value.alias}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="路由类型" path="type">
                        <form-base-select
                            label-field="label"
                            label-value="value"
                            disabled={['UPDATE'].includes(props.command)}
                            options={chunkOptions.value.routeTypeOptions}
                            v-model:value={formState.value.type}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="排序" path="sort">
                        <n-input-number class="w-full" min={0} max={9999} precision={0} v-model:value={formState.value.sort}>
                            {{ suffix: () => '通用路由越小越优先' }}
                        </n-input-number>
                    </form-base-column>
                    <form-base-column label="路由状态" path="status">
                        <form-base-select
                            label-field="label"
                            label-value="value"
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="备注" path="remark">
                        <form-base-input
                            type="textarea"
                            maxlength={512}
                            placeholder="请输入备注"
                            v-model:value={formState.value.remark}
                        ></form-base-input>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
