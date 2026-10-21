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
        /**方向下拉**/
        const regionOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), {
            immediate: false
        })
        /**客户下拉**/
        const userOptions = useSelectService(() => Service.httpBaseCrmSelectUser({}), {
            immediate: false
        })
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                /**路由名称：仅新增填写**/
                name: props.node.name,
                /**路由别名：可为空，非空时全表唯一，仅新增填写**/
                alias: props.node.alias,
                /**方向：仅新增可选**/
                countryKeyId: props.node.countryKeyId,
                /**短信类型：仅新增可选**/
                type: props.node.type,
                /**客户：不选为默认路由，仅新增可选**/
                userKeyId: props.node.userKeyId,
                /**路由状态**/
                status: props.node.status ?? 'enable',
                /**备注**/
                remark: props.node.remark
            },
            rules: {
                name: { required: true, message: '请输入路由名称', trigger: 'blur' },
                countryKeyId: { required: true, type: 'number', message: '请选择方向', trigger: 'blur' },
                type: { required: true, message: '请选择短信类型', trigger: 'blur' },
                status: { required: true, message: '请选择路由状态', trigger: 'blur' }
            }
        })

        /**详情初始化**/
        async function fetchInitialization() {
            return await Promise.all([fetchChunkService(), regionOptions.fetchRequest(), userOptions.fetchRequest()]).finally(() => {
                return setState({ initialize: false })
            })
        }

        /**提交：名称、别名、方向、类型、客户仅新增时提交**/
        async function fetchSubmit() {
            return await fetchValidater(['CREATE'].includes(props.command) ? [] : ['status']).then(async error => {
                if (error) return await setState({ loading: false, disabled: false })
                try {
                    const body = { status: formState.value.status, remark: formState.value.remark }
                    if (['CREATE'].includes(props.command)) {
                        await Service.httpBaseSrmCreateRoute({
                            ...body,
                            name: formState.value.name?.trim(),
                            alias: formState.value.alias?.trim() || undefined,
                            countryKeyId: formState.value.countryKeyId,
                            type: formState.value.type,
                            userKeyId: formState.value.userKeyId ?? 0
                        })
                    } else {
                        await Service.httpBaseSrmUpdateRoute({ ...body, keyId: props.node.keyId })
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
                    model={formState.value}
                    rules={state.rules}
                    disabled={state.loading}
                    require-mark-placement="left"
                    base-columns-template
                    base-columns-template-props={{ class: 'gap-x-20', type: 'auto-fit', number: 260 }}
                >
                    <form-base-column label="路由名称" path="name">
                        <form-base-input
                            maxlength={64}
                            placeholder="请输入路由名称"
                            disabled={['UPDATE'].includes(props.command)}
                            v-model:value={formState.value.name}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="路由别名" path="alias">
                        <form-base-input
                            maxlength={64}
                            placeholder="请输入路由别名，可为空"
                            disabled={['UPDATE'].includes(props.command)}
                            v-model:value={formState.value.alias}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="方向" path="countryKeyId">
                        <form-base-select
                            filterable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择方向，创建后不可修改"
                            disabled={['UPDATE'].includes(props.command)}
                            loading={regionOptions.loading.value}
                            options={regionOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="短信类型" path="type">
                        <form-base-select
                            placeholder="请选择短信类型，创建后不可修改"
                            disabled={['UPDATE'].includes(props.command)}
                            options={chunkOptions.value.typeOptions}
                            v-model:value={formState.value.type}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="适用客户" path="userKeyId">
                        <form-base-select
                            filterable
                            clearable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="不选为默认路由，选择客户为专属路由"
                            disabled={['UPDATE'].includes(props.command)}
                            loading={userOptions.loading.value}
                            options={userOptions.dataSource.value}
                            v-model:value={formState.value.userKeyId}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="路由状态" path="status">
                        <form-base-select
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
