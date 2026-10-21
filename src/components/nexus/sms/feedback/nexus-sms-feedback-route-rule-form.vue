<script lang="tsx">
import { defineComponent, PropType, computed } from 'vue'
import { useFormService, useChunkService, useSelectService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSmsFeedbackRouteRuleForm',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**操作类型：CREATE 新增、UPDATE 编辑**/
        command: { type: String as PropType<'CREATE' | 'UPDATE'>, default: 'CREATE' },
        /**编辑的规则；新增时只包含 routeKeyId**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { chunkOptions } = useChunkService(() => Service.httpBaseSrmRouteEnums(), { immediate: true })
        /**方向下拉**/
        const countryOptions = useSelectService(() => Service.httpBaseSkylineSelectCountry(), { immediate: true })
        /**匹配条件创建后不可修改**/
        const locked = computed(() => ['UPDATE'].includes(props.command))
        const { formState, formRef, state, setState, fetchValidater } = useFormService({
            initialize: false,
            formState: {
                /**方向**/
                countryKeyId: props.node.countryKeyId,
                /**短信类型**/
                type: props.node.type,
                /**运营商 MNC：为空表示全部运营商**/
                mnc: props.node.mnc || undefined,
                /**号码段：含国际区号，为空表示不限**/
                prefix: props.node.prefix || undefined,
                /**规则状态**/
                status: props.node.status ?? 'enable',
                /**备注**/
                remark: props.node.remark
            },
            rules: {
                countryKeyId: { required: true, type: 'number', message: '请选择方向', trigger: 'blur' },
                type: { required: true, message: '请选择短信类型', trigger: 'blur' },
                mnc: { pattern: /^\d{2,3}$/, message: '运营商MNC必须是2-3位数字', trigger: 'blur' },
                prefix: { pattern: /^\d{1,15}$/, message: '号码段只能是最多15位数字', trigger: 'blur' },
                status: { required: true, message: '请选择规则状态', trigger: 'blur' }
            }
        })
        /**当前方向的国际区号，用于提示号码段格式**/
        const countryCode = computed(() => {
            return countryOptions.dataSource.value.find((item: Omix) => item.keyId === formState.value.countryKeyId)?.code
        })

        /**提交：匹配条件仅新增时提交**/
        async function fetchSubmit() {
            return await fetchValidater(locked.value ? ['status'] : []).then(async error => {
                if (error) return await setState({ loading: false, disabled: false })
                try {
                    if (locked.value) {
                        await Service.httpBaseSrmUpdateRouteRule({
                            keyId: props.node.keyId,
                            status: formState.value.status,
                            remark: formState.value.remark
                        })
                    } else {
                        await Service.httpBaseSrmCreateRouteRule({
                            routeKeyId: props.node.routeKeyId,
                            countryKeyId: formState.value.countryKeyId,
                            type: formState.value.type,
                            mnc: formState.value.mnc?.trim() || undefined,
                            prefix: formState.value.prefix?.trim() || undefined,
                            status: formState.value.status,
                            remark: formState.value.remark
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
                width={520}
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
                    <form-base-column label="方向" path="countryKeyId">
                        <form-base-select
                            filterable
                            label-field="showName"
                            label-value="keyId"
                            placeholder="请选择方向，创建后不可修改"
                            disabled={locked.value}
                            loading={countryOptions.loading.value}
                            options={countryOptions.dataSource.value}
                            v-model:value={formState.value.countryKeyId}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="短信类型" path="type">
                        <form-base-select
                            placeholder="请选择短信类型，创建后不可修改"
                            disabled={locked.value}
                            options={chunkOptions.value.typeOptions}
                            v-model:value={formState.value.type}
                        ></form-base-select>
                    </form-base-column>
                    <form-base-column label="运营商MNC" path="mnc">
                        <form-base-input
                            maxlength={3}
                            placeholder="可为空，为空表示该方向全部运营商"
                            disabled={locked.value}
                            v-model:value={formState.value.mnc}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="号码段" path="prefix">
                        <form-base-input
                            maxlength={15}
                            placeholder={countryCode.value ? `可为空，需以国际区号 ${countryCode.value} 开头` : '可为空，需以国际区号开头'}
                            disabled={locked.value}
                            v-model:value={formState.value.prefix}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="规则状态" path="status">
                        <form-base-select
                            options={chunkOptions.value.ruleStatusOptions}
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
