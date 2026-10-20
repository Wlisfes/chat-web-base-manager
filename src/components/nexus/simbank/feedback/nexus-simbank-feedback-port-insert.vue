<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { useFormService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'NexusSimbankFeedbackPortInsert',
    emits: ['close', 'submit'],
    props: {
        /**标题**/
        title: { type: String, required: true },
        /**端口信息**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { formState, formRef, state, setState, setForm, fetchValidater } = useFormService({
            callback: fetchInitialization,
            formState: {
                sim: '',
                iccid: '',
                imei: ''
            },
            rules: {
                sim: { required: true, message: '请生成 SIM 卡号码', trigger: 'blur' },
                iccid: { required: true, message: '请生成 ICCID', trigger: 'blur' },
                imei: { required: true, message: '请生成 IMEI', trigger: 'blur' }
            }
        })

        /**按端口激活方向生成插卡模拟数据：服务端按 countryKeyId 查询国际区号**/
        async function fetchInitialization() {
            try {
                return await Service.httpBaseSrmSimbankPortFaker({
                    countryKeyId: props.node.countryKeyId
                }).then(async ({ data }) => {
                    return await setForm(data).then(async () => {
                        return await setState({ initialize: false, loading: false, disabled: false })
                    })
                })
            } catch (err) {
                return await setState({ initialize: false, loading: false, disabled: false }).then(async () => {
                    return await fetchNotifyService({ type: 'error', title: err.message })
                })
            }
        }

        /**提交插卡**/
        async function fetchSubmit() {
            return await fetchValidater().then(async error => {
                if (error) {
                    return await setState({ loading: false, disabled: false })
                }
                try {
                    await Service.httpBaseSrmSimbankPortInsert({
                        keyId: props.node.keyId,
                        sim: formState.value.sim,
                        iccid: formState.value.iccid,
                        imei: formState.value.imei
                    })
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
                <form-base-container require-mark-placement="left" size="medium" ref={formRef} model={formState.value} rules={state.rules}>
                    <form-base-column label="SIM卡号" path="sim">
                        <form-base-input
                            maxlength={32}
                            placeholder="请生成 SIM 卡号码"
                            v-model:value={formState.value.sim}
                        ></form-base-input>
                    </form-base-column>
                    <form-base-column label="ICCID" path="iccid">
                        <form-base-input maxlength={22} placeholder="请生成 ICCID" v-model:value={formState.value.iccid}></form-base-input>
                    </form-base-column>
                    <form-base-column label="IMEI" path="imei">
                        <form-base-input maxlength={15} placeholder="请生成 IMEI" v-model:value={formState.value.imei}></form-base-input>
                    </form-base-column>
                </form-base-container>
            </common-dialog-provider>
        )
    }
})
</script>
