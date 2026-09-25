<script lang="tsx">
import { defineComponent, PropType, ref } from 'vue'
import { useFormService, useChunkService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'
import type * as Chunk from '@/interface/deploy/deploy-chunk.resolver'

export default defineComponent({
    name: 'DeployChunkFeedbackSystem',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作指令**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**枚举所属模块，系统页固定为 CHUNK_SYSTEM**/
        module: { type: String as PropType<Chunk.ChunkModule>, default: 'CHUNK_SYSTEM' },
        /**枚举类型编码，明细页传入后锁定不可改**/
        type: { type: String, default: '' },
        /**编辑操作详情数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        /**系统枚举静态枚举**/
        const { chunkOptions, fetchChunkService } = useChunkService(e => Service.httpBaseSkylineChunkEnums(), {
            immediate: false
        })
        /**标签颜色选项，取值与 common-base-chunk 的 COMMON_BASE_CHUNK_TYPES 保持一致**/
        const colorOptions = [
            'default',
            'primary',
            'info',
            'success',
            'warning',
            'error',
            'red',
            'orange',
            'lime',
            'green',
            'cyan',
            'blue',
            'geekblue',
            'purple',
            'pink',
            'volcano'
        ].map(value => ({ value, label: value, type: value }))
        /**详情中的扩展配置，提交时与颜色字段合并，避免覆盖已有 json**/
        const originJson = ref<Record<string, unknown>>({})
        /**表单实例**/
        const { formState, formRef, state, setState, setForm, fetchReste, fetchValidater } = useFormService({
            callback: fetchBaseChunkResolver,
            formState: {
                type: props.type || props.node.type, //枚举类型编码
                name: props.node.name, //枚举项名称
                value: props.node.value, //枚举项业务值
                sort: props.node.sort ?? 10, //排序号
                status: props.node.status ?? 'enable', //状态
                pid: props.node.pid, //父枚举项主键
                jsonType: props.node.json?.type, //标签颜色
                allowUpdate: props.node.allowUpdate ?? true, //是否允许更新
                allowDelete: props.node.allowDelete ?? true //是否允许删除
            },
            rules: {
                type: { required: true, message: '请输入枚举类型编码', trigger: 'blur' },
                name: { required: true, message: '请输入枚举项名称', trigger: 'blur' },
                value: { required: true, message: '请输入枚举项业务值', trigger: 'blur' },
                sort: { required: true, type: 'number', message: '请输入排序号', trigger: 'blur' },
                status: { required: true, message: '请选择状态', trigger: 'change' }
            }
        })

        /**枚举详情**/
        async function fetchBaseChunkResolver() {
            return await fetchChunkService().then(async () => {
                if (['CREATE'].includes(props.command)) {
                    originJson.value = {}
                    return await setState({ initialize: false })
                }
                try {
                    return await Service.httpBaseSkylineResolverChunk({ keyId: props.node.keyId }).then(async ({ data }) => {
                        originJson.value = { ...(data.json ?? {}) }
                        return await setForm(
                            fetchReste({
                                ...data,
                                jsonType: typeof data.json?.type === 'string' ? data.json.type : undefined
                            })
                        ).then(async () => {
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

        /**组装提交参数；颜色写入 json.type，并保留原扩展配置。*/
        function fetchSubmitPayload(): Chunk.ChunkCreateRequest {
            const json = { ...originJson.value }
            delete json.legacyKeyId
            if (formState.value.jsonType) json.type = formState.value.jsonType
            else delete json.type
            return {
                module: props.module,
                type: formState.value.type,
                name: formState.value.name,
                value: formState.value.value,
                sort: formState.value.sort,
                status: formState.value.status,
                allowUpdate: formState.value.allowUpdate,
                allowDelete: formState.value.allowDelete,
                json,
                ...(formState.value.pid ? { pid: formState.value.pid } : {})
            }
        }

        /**确定提交表单**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    const payload = fetchSubmitPayload()
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseSkylineCreateChunk(payload)
                    } else if (['UPDATE'].includes(props.command)) {
                        await Service.httpBaseSkylineUpdateChunk({ ...payload, keyId: props.node.keyId })
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
                        <form-base-column label="类型编码" path="type">
                            <form-base-input
                                disabled={Boolean(props.type)}
                                maxlength={128}
                                placeholder="请输入枚举类型编码"
                                v-model:value={formState.value.type}
                            ></form-base-input>
                        </form-base-column>
                        <form-base-column label="显示名称" path="name">
                            <form-base-input
                                maxlength={128}
                                placeholder="请输入枚举项名称"
                                v-model:value={formState.value.name}
                            ></form-base-input>
                        </form-base-column>
                        <form-base-column label="业务值" path="value">
                            <form-base-input
                                maxlength={128}
                                placeholder="请输入枚举项业务值"
                                v-model:value={formState.value.value}
                            ></form-base-input>
                        </form-base-column>
                        <form-base-column label="排序号" path="sort">
                            <n-input-number
                                class="w-full"
                                min={0}
                                step={10}
                                precision={0}
                                placeholder="请输入排序号"
                                v-model:value={formState.value.sort}
                            />
                        </form-base-column>
                        <form-base-column label="状态" path="status">
                            <form-base-select
                                placeholder="请选择状态"
                                options={chunkOptions.value.statusOptions}
                                v-model:value={formState.value.status}
                            ></form-base-select>
                        </form-base-column>
                        <form-base-column label="父级主键" path="pid">
                            <n-input-number
                                class="w-full"
                                min={1}
                                precision={0}
                                placeholder="根节点可不填"
                                v-model:value={formState.value.pid}
                            />
                        </form-base-column>
                        <form-base-column label="标签颜色" path="jsonType">
                            <form-base-select
                                clearable
                                placeholder="请选择标签颜色"
                                options={colorOptions}
                                v-model:value={formState.value.jsonType}
                                renderLabel={(option: Omix) => (
                                    <common-base-chunk bordered value={option.value} items={colorOptions}></common-base-chunk>
                                )}
                            ></form-base-select>
                        </form-base-column>
                        <form-base-column label="允许更新" path="allowUpdate">
                            <n-switch v-model:value={formState.value.allowUpdate}></n-switch>
                        </form-base-column>
                        <form-base-column label="允许删除" path="allowDelete">
                            <n-switch v-model:value={formState.value.allowDelete}></n-switch>
                        </form-base-column>
                    </common-base-columns-template>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
