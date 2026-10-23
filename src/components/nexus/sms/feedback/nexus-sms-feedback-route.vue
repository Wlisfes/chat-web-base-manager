<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useChunkService, useSelectService } from '@/hooks'
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
        const { chunkOptions, fetchChunkService } = useChunkService(() => Service.httpBaseSrmRouteEnums(), {
            immediate: false
        })
        const chengOptions = useSelectService(() => Service.httpBaseSkylineSelectUser(), {
            immediate: false
        })
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**路由名称**/
                name: props.node.name,
                /**路由类型：创建后不可修改**/
                type: props.node.type,
                /**优先级：同类型路由按优先级依次尝试，越小越优先**/
                priority: props.node.priority ?? 10,
                /**路由状态**/
                status: props.node.status ?? 'enable',
                /**归属人：不选时新增默认当前登录人**/
                ownerUserUid: props.node.ownerUserUid,
                /**备注**/
                remark: props.node.remark
            },
            rules: {
                name: { required: true, message: '请输入路由名称', trigger: 'blur' },
                type: { required: true, message: '请选择路由类型，创建后不可修改', trigger: 'blur' },
                status: { required: true, message: '请选择路由状态', trigger: 'blur' },
                ownerUserUid: { required: ['CREATE'].includes(props.command), message: '请选择归属人', trigger: 'blur' }
            }
        })

        /**详情初始化**/
        async function fetchInitialization() {
            const taskNames = [chengOptions.fetchRequest(), fetchChunkService()]
            try {
                if (['CREATE'].includes(props.command)) {
                    return await Promise.all(taskNames).finally(async () => {
                        return await setState({ initialize: false })
                    })
                }
                return await Promise.all([Service.httpBaseSrmRouteResolver({ keyId: props.node.keyId }), ...taskNames]).then(
                    async ([{ data }]) => {
                        return await setForm(fetchReste(data)).then(async () => {
                            return await setState({ initialize: false })
                        })
                    }
                )
            } catch (err) {
                return await setState({ initialize: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
        }

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
                        await Service.httpBaseSrmUpdateRoute({ ...formState.value, keyId: props.node.keyId })
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
                    size="medium"
                    ref={formRef}
                    rules={state.rules}
                    model={formState.value}
                    disabled={state.loading}
                    require-mark-placement="left"
                    base-columns-template
                    base-columns-template-props={{ class: 'gap-x-20', type: 'auto-fit', number: 320 }}
                >
                    <form-base-column label="路由名称" path="name">
                        <form-base-input maxlength={64} placeholder="请输入路由名称" v-model:value={formState.value.name}></form-base-input>
                    </form-base-column>
                    <form-base-column label="路由别名">
                        <form-base-input disabled placeholder="自动生成，如 LSK1233-MRKT-A001" value={props.node.alias}></form-base-input>
                    </form-base-column>
                    <form-base-column label="归属人" path="ownerUserUid">
                        <form-base-select
                            filterable
                            label-value="uid"
                            label-field="showName"
                            placeholder="请选择归属人"
                            disabled={['UPDATE'].includes(props.command)}
                            loading={chengOptions.loading.value}
                            options={chengOptions.dataSource.value}
                            v-model:value={formState.value.ownerUserUid}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="路由类型" path="type">
                        <form-base-select
                            label-field="label"
                            label-value="value"
                            placeholder="请选择路由类型，创建后不可修改"
                            disabled={['UPDATE'].includes(props.command)}
                            options={chunkOptions.value.routeTypeOptions}
                            v-model:value={formState.value.type}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="优先级" path="priority" tooltip="同类型路由按优先级从小到大依次尝试，1 最优先，最大 100">
                        <form-base-input-number
                            min={1}
                            max={100}
                            precision={0}
                            placeholder="请输入优先级"
                            v-model:value={formState.value.priority}
                        ></form-base-input-number>
                    </form-base-column>
                    <form-base-column label="路由状态" path="status">
                        <form-base-select
                            label-field="label"
                            label-value="value"
                            options={chunkOptions.value.statusOptions}
                            v-model:value={formState.value.status}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column full label="备注" path="remark">
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
