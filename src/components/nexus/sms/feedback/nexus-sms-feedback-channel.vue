<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService, useChunkService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackChannel',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作类型：CREATE 新增、UPDATE 编辑**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑的通道**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { chunkOptions, fetchChunkService } = useChunkService(() => Service.httpBaseSrmChannelEnums(), {
            immediate: false
        })
        /**归属人下拉**/
        const chengOptions = useSelectService(() => Service.httpBaseSkylineSelectUser(), {
            immediate: false
        })
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**通道名称**/
                name: props.node.name,
                /**通道类型：仅新增可选**/
                type: props.node.type,
                /**归属人：不选默认当前登录人**/
                ownerUserUid: props.node.ownerUserUid,
                /**端口发送间隔（毫秒）**/
                sendInterval: props.node.sendInterval ?? 3000,
                /**最大重试次数**/
                maxRetry: props.node.maxRetry ?? 3,
                /**备注**/
                remark: props.node.remark,
                /**通道别名：详情回填，仅展示**/
                alias: props.node.alias
            },
            rules: {
                name: { required: true, message: '请输入通道名称', trigger: 'blur' },
                type: { required: true, message: '请选择通道类型，创建后不可修改', trigger: 'blur' },
                ownerUserUid: { required: true, message: '请选择归属人', trigger: 'blur' },
                sendInterval: { required: true, type: 'number', message: '请输入端口发送间隔', trigger: 'blur' },
                maxRetry: { required: true, type: 'number', message: '请输入最大重试次数', trigger: 'blur' }
            }
        })

        /**详情初始化：编辑时拉取通道详情回填表单。**/
        async function fetchInitialization() {
            const taskNames = [chengOptions.fetchRequest(), fetchChunkService()]
            try {
                if (['CREATE'].includes(props.command)) {
                    return await Promise.all(taskNames).finally(async () => {
                        return await setState({ initialize: false })
                    })
                }
                return await Promise.all([Service.httpBaseSrmChannelResolver({ keyId: props.node.keyId }), ...taskNames]).then(
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

        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseSrmCreateChannel(formState.value)
                    } else {
                        await Service.httpBaseSrmUpdateChannel({ ...formState.value, keyId: props.node.keyId })
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
                    <form-base-column label="通道名称" path="name">
                        <form-base-input maxlength={64} placeholder="请输入通道名称" v-model:value={formState.value.name}></form-base-input>
                    </form-base-column>
                    <form-base-column label="通道别名" required>
                        <form-base-input
                            disabled
                            placeholder="自动生成，如 TSK1233-MRKT-A001"
                            value={formState.value.alias}
                        ></form-base-input>
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
                    <form-base-column label="通道类型" path="type">
                        <form-base-select
                            placeholder="请选择通道类型，创建后不可修改"
                            disabled={['UPDATE'].includes(props.command)}
                            options={chunkOptions.value.typeOptions}
                            v-model:value={formState.value.type}
                        ></form-base-select>
                    </form-base-column>

                    <form-base-column label="发送间隔" path="sendInterval">
                        <form-base-input-number
                            min={0}
                            max={600000}
                            step={500}
                            suffix={<span>毫秒</span>}
                            placeholder="请输入发送间隔时间"
                            v-model:value={formState.value.sendInterval}
                        ></form-base-input-number>
                    </form-base-column>
                    <form-base-column label="最大重试" path="maxRetry">
                        <form-base-input-number
                            min={0}
                            max={20}
                            suffix={<span>次</span>}
                            placeholder="请输入最大重试次数"
                            v-model:value={formState.value.maxRetry}
                        ></form-base-input-number>
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
