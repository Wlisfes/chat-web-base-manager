<script lang="tsx">
import { defineComponent, ref } from 'vue'
import { useFormService, useChunkService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackRoutePreview',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true }
    },
    setup(props, { emit }) {
        const { chunkOptions } = useChunkService(() => Service.httpBaseSrmRouteEnums(), { immediate: true })
        const channelEnums = useChunkService(() => Service.httpBaseSrmChannelEnums(), { immediate: true })
        /**客户下拉**/
        const userOptions = useSelectService(() => Service.httpBaseCrmSelectUser({}), { immediate: true })
        /**方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), { immediate: true })
        /**客户下的短信应用**/
        const appOptions = ref<Array<Omix>>([])
        /**选路结果**/
        const result = ref<Omix>()
        const columns = [
            { title: '通道别名', key: 'alias', minWidth: 180 },
            { title: '通道状态', key: 'channelStatus', width: 100 },
            { title: '启用端口', key: 'enablePortCount', width: 90 },
            { title: '优先级', key: 'priority', width: 80 },
            { title: '权重', key: 'weight', width: 80 },
            { title: '分流占比', key: 'ratio', width: 90 },
            { title: '本次选用', key: 'selected', width: 90 }
        ]
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            initialize: false,
            formState: {
                /**客户：仅用于筛选短信应用**/
                userKeyId: undefined as number | undefined,
                /**短信应用**/
                appKeyId: undefined as number | undefined,
                /**方向**/
                countryKeyId: undefined as number | undefined,
                /**短信类型：不选时使用短信应用类型**/
                type: undefined as string | undefined
            },
            rules: {
                appKeyId: { required: true, type: 'number', message: '请选择短信应用', trigger: 'blur' },
                countryKeyId: { required: true, type: 'number', message: '请选择方向', trigger: 'blur' }
            }
        })

        /**切换客户后加载短信应用**/
        async function fetchUserChange(value?: number) {
            formState.value.appKeyId = undefined
            appOptions.value = []
            if (!value) return
            try {
                const { data } = await Service.httpBaseCrmSelectSmsApp({ userKeyId: value })
                appOptions.value = (data ?? []).map((item: Omix) => ({ ...item, label: `${item.appAlias} - ${item.appName}` }))
            } catch (err) {
                await fetchNotifyService({ type: 'error', title: err.message })
            }
        }

        /**执行选路预览：弹窗保持打开，结果显示在表单下方**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) return await setState({ loading: false, disabled: false })
                try {
                    const { data } = await Service.httpBaseSrmRoutePreview({
                        appKeyId: formState.value.appKeyId,
                        countryKeyId: formState.value.countryKeyId,
                        type: formState.value.type || undefined
                    })
                    result.value = data
                } catch (err) {
                    result.value = undefined
                    await fetchNotifyService({ type: 'error', title: err.message })
                }
                return await setState({ loading: false, disabled: false })
            })
        }

        return () => (
            <common-dialog-provider
                title={props.title}
                width={900}
                submit="预览"
                cancel="关闭"
                v-model:visible={state.visible}
                v-model:loading={state.loading}
                v-model:initialize={state.initialize}
                onSubmit={fetchSubmit}
                onCancel={() => setState({ visible: false })}
                onClose={() => emit('close', { done: setState })}
            >
                <div class="flex flex-col gap-12">
                    <form-base-container
                        require-mark-placement="left"
                        size="medium"
                        ref={formRef}
                        model={formState.value}
                        rules={state.rules}
                        disabled={state.loading}
                    >
                        <div class="grid grid-cols-2 gap-x-16">
                            <form-base-column label="客户" path="userKeyId">
                                <form-base-select
                                    clearable
                                    filterable
                                    label-field="showName"
                                    label-value="keyId"
                                    placeholder="选择客户"
                                    loading={userOptions.loading.value}
                                    options={userOptions.dataSource.value}
                                    v-model:value={formState.value.userKeyId}
                                    on-change:value={fetchUserChange}
                                ></form-base-select>
                            </form-base-column>
                            <form-base-column label="短信应用" path="appKeyId">
                                <form-base-select
                                    filterable
                                    label-field="label"
                                    label-value="keyId"
                                    placeholder="先选择客户"
                                    options={appOptions.value}
                                    v-model:value={formState.value.appKeyId}
                                ></form-base-select>
                            </form-base-column>
                            <form-base-column label="方向" path="countryKeyId">
                                <form-base-select
                                    filterable
                                    label-field="showName"
                                    label-value="keyId"
                                    placeholder="请选择方向"
                                    loading={countryOptions.loading.value}
                                    options={countryOptions.dataSource.value}
                                    v-model:value={formState.value.countryKeyId}
                                ></form-base-select>
                            </form-base-column>
                            <form-base-column label="短信类型" path="type">
                                <form-base-select
                                    clearable
                                    placeholder="不选时使用短信应用类型"
                                    options={chunkOptions.value.typeOptions}
                                    v-model:value={formState.value.type}
                                ></form-base-select>
                            </form-base-column>
                        </div>
                    </form-base-container>
                    {result.value && (
                        <div class="flex flex-col gap-12">
                            <n-alert
                                type={result.value.matched ? 'success' : 'warning'}
                                title={result.value.matched ? '已找到可用通道' : '未找到可用通道'}
                            >
                                <div class="flex flex-col gap-4">
                                    <span>{result.value.message}</span>
                                    <n-text depth="3">
                                        类型 {result.value.type}
                                        {result.value.fallback && ' · 已回落到通用路由'}
                                    </n-text>
                                </div>
                            </n-alert>
                            {(result.value.steps ?? []).map((step: Omix) => (
                                <div class="flex flex-col gap-8" key={step.routeOptions.keyId}>
                                    <n-text strong>
                                        {step.routeOptions.name}
                                        <n-text depth="3">
                                            {` · ${step.routeOptions.type === 'targeted' ? '定向路由' : '通用路由'} · ${step.matched ? '命中' : '没有可用通道'}`}
                                        </n-text>
                                    </n-text>
                                    {step.channels.length > 0 ? (
                                        <common-database-table
                                            flex-height={false}
                                            limit={0}
                                            bordered={false}
                                            pagination={false}
                                            columns={columns}
                                            data={step.channels}
                                            loading={false}
                                            initialize={false}
                                        >
                                            {{
                                                col_alias: (data: Omix) => (
                                                    <common-base-content value={data.channelOptions?.alias}></common-base-content>
                                                ),
                                                col_channelStatus: (data: Omix) => (
                                                    <common-base-chunk
                                                        bordered
                                                        value={data.channelOptions?.status}
                                                        items={channelEnums.chunkOptions.value.statusOptions}
                                                    ></common-base-chunk>
                                                ),
                                                col_enablePortCount: (data: Omix) => (
                                                    <n-text type={data.channelOptions?.enablePortCount > 0 ? 'default' : 'warning'}>
                                                        {data.channelOptions?.enablePortCount ?? 0}
                                                    </n-text>
                                                ),
                                                col_ratio: (data: Omix) => (
                                                    <n-text type={data.active ? 'default' : 'warning'}>
                                                        {data.active ? `${data.ratio}%` : '不可用'}
                                                    </n-text>
                                                ),
                                                col_selected: (data: Omix) =>
                                                    data.selected ? (
                                                        <n-tag size="small" type="success" bordered={false}>
                                                            选用
                                                        </n-tag>
                                                    ) : (
                                                        <n-text depth="3">备用</n-text>
                                                    )
                                            }}
                                        </common-database-table>
                                    ) : (
                                        <n-text depth="3">该路由没有这个方向和类型的通道</n-text>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </common-dialog-provider>
        )
    }
})
</script>
