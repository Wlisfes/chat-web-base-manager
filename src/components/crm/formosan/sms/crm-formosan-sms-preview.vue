<script lang="tsx">
import { defineComponent, Fragment, PropType, onMounted, ref, watch, computed } from 'vue'
import { useVModels } from '@vueuse/core'
import { useColumnService } from '@/hooks'
import { fetchNotifyService } from '@/plugins'
import * as Service from '@/api/instance.service'

export default defineComponent({
    name: 'CrmFormosanSmsPreview',
    emits: ['update:formState'],
    props: {
        /**表单基础状态**/
        state: { type: Object as PropType<Omix>, default: () => ({}) },
        /**设置表单基础状态方法**/
        setState: { type: Function, required: true },
        /**表单更新方法**/
        setForm: { type: Function, required: true },
        /**验证表单方法**/
        fetchValidater: { type: Function, required: true },
        /**表单对象**/
        formState: { type: Object as PropType<Omix>, default: () => ({}) },
        /**客户下拉数据**/
        clientOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**应用下拉数据**/
        appOptions: { type: Object as PropType<Omix>, default: () => ({}) },
        /**MCC下拉数据**/
        mccOptions: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { formState } = useVModels(props, emit)
        const { state, chunkState, instOptions, fetchRefresh } = useColumnService({
            request: (base, payload) => Service.httpSmsFormosanDraftColumn(payload),
            formState: { clientId: 1008601, appId: 31774453 },
            columns: [
                { title: '序号', key: 'index', width: 80, render: (e: Omix, index: number) => index + 1 },
                { title: 'MCC', key: 'mcc', width: 100 },
                { title: '国家/地区', key: 'code', minWidth: 200 },
                { title: '下行费率(USD)', key: 'downUsd', minWidth: 160 },
                { title: '上行费率(USD)', key: 'upUsd', minWidth: 160 },
                { title: '下行变更状态', key: 'downStatus', minWidth: 160 },
                { title: '上行变更状态', key: 'upStatus', minWidth: 160 },
                { title: '生效时间', key: 'effectiveTime', minWidth: 160 }
            ]
        })

        async function fetchSubmit() {
            return await props.setState({ loading: true }).then(async () => {
                try {
                    return await Service.httpSmsFormosanPublish(formState.value).then(async () => {
                        return await props.setState({ loading: false })
                    })
                } catch (err) {
                    return await props.setState({ loading: false }).then(async () => {
                        return await fetchNotifyService({ type: 'error', title: err.message })
                    })
                }
            })
        }

        return () => (
            <Fragment>
                <common-element is-white class="flex flex-col m-inline-14 m-bs-14 b-rd-4 overflow-hidden">
                    <div class="flex flex-col gap-y-10 p-14 overflow-hidden">
                        <common-business-header bar title="基本信息"></common-business-header>
                        <common-element-columns-template class="gap-x-10 gap-y-5" type="auto-fill" number={250}>
                            <common-element-columns-wrapper label="客户名称：">青萍科技股份有限公司</common-element-columns-wrapper>
                            <common-element-columns-wrapper label="用户别名：">AXION12330001</common-element-columns-wrapper>
                            <common-element-columns-wrapper label="应用别名：">AXION1233A06OTP</common-element-columns-wrapper>
                        </common-element-columns-template>
                    </div>
                    <div class="flex flex-col p-14 common-skyline--top overflow-hidden">
                        <common-element-columns-template class="gap-10" type="auto-fit" number={100}>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="修改国家/地区">
                                <b>1</b>
                            </common-element-columns-wrapper>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="修改运营商数">
                                1
                            </common-element-columns-wrapper>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="涨价数">
                                1
                            </common-element-columns-wrapper>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="降价数">
                                1
                            </common-element-columns-wrapper>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="新增数">
                                1
                            </common-element-columns-wrapper>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="定时生效数">
                                1
                            </common-element-columns-wrapper>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="删除数">
                                1
                            </common-element-columns-wrapper>
                            <common-element-columns-wrapper class="flex-col-reverse text-center" label="价格告警数">
                                1
                            </common-element-columns-wrapper>
                        </common-element-columns-template>
                    </div>
                </common-element>

                <common-database-table
                    pagination={false}
                    limit={state.limit}
                    total={state.total}
                    columns={state.columns}
                    v-model:page={state.page}
                    v-model:size={state.size}
                    v-model:select={state.select}
                    v-model:data={state.dataSource}
                    v-model:loading={state.loading}
                    v-model:initialize={state.initialize}
                    v-model:customize={state.customize}
                    on-update:customize={instOptions.fetchUpdateCustomize}
                    on-update:page={(page: number) => fetchRefresh({ page })}
                    on-update:size={(size: number) => fetchRefresh({ page: 1, size })}
                ></common-database-table>
                <common-element is-white class="flex p-14 gap-x-14 justify-center items-center overflow-hidden">
                    <n-button class="min-w-168" disabled={props.state.loading} onClick={() => props.setState({ current: 2 })}>
                        上一步：编辑报价
                    </n-button>
                    <n-button
                        class="min-w-168"
                        type="primary"
                        loading={props.state.loading}
                        disabled={props.state.loading}
                        onClick={fetchSubmit}
                    >
                        下一步：发送报价
                    </n-button>
                </common-element>
            </Fragment>
        )
    }
})
</script>
