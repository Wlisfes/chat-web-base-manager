<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { Enterprise, Time, UserAdmin, Currency } from '@vicons/carbon'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'CrmConsumerContextWrapper',
    emits: ['update:faseNode'],
    props: {
        /**初始化执行中**/
        initialize: { type: Boolean, default: true },
        /**客户详情信息**/
        faseNode: { type: Object as PropType<Omix>, default: () => ({}) },
        /**客户静态枚举**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const { faseNode } = useVModels(props, emit)

        return () => (
            <common-base-element is-white class="flex flex-col p-inline-16 p-bs-16 p-be-5 overflow-hidden">
                <div class="flex p-be-10 overflow-hidden">
                    <div class="flex flex-col flex-1 gap-y-10 overflow-hidden">
                        <div class="flex gap-10 overflow-hidden">
                            <n-h1 class="m-0 text-20 font-500 line-height-24">{`${faseNode.value.name} (${faseNode.value.keyId})`}</n-h1>
                            <common-base-chunk
                                mode="chunk"
                                value={faseNode.value.classType}
                                items={props.chunkOptions.classTypeOptions}
                            ></common-base-chunk>
                            <common-base-chunk
                                mode="chunk"
                                value={faseNode.value.authStatus}
                                items={props.chunkOptions.authStatusOptions}
                            ></common-base-chunk>
                        </div>
                        <div class="flex gap-x-20 text-12 line-height-16 overflow-hidden">
                            <n-text depth="3" class="flex items-center gap-x-5 overflow-hidden">
                                <n-icon size={14} component={<Time />} />
                                <span>{`创建时间：${faseNode.value.createTime ?? '-'}`}</span>
                            </n-text>
                            <n-text depth="3" class="flex items-center gap-x-5 overflow-hidden">
                                <n-icon size={14} component={<UserAdmin />} />
                                <common-base-user prefix="归属人：" data={faseNode.value.ownerUserUidOptions}></common-base-user>
                            </n-text>
                            {(faseNode.value.ownerUserUidOptions?.organizations ?? []).length > 0 && (
                                <n-text depth="3" class="flex items-center gap-x-5 overflow-hidden">
                                    <n-icon size={14} component={<Enterprise />} />
                                    <span>{`部门：${faseNode.value.ownerUserUidOptions.organizations.map((e: Omix) => e.name).join('、')}`}</span>
                                </n-text>
                            )}
                            <n-text depth="3" class="flex items-center gap-x-5 overflow-hidden">
                                <n-icon size={14} component={<Currency />} />
                                <span>{`币种：${faseNode.value.currency ?? '-'}`}</span>
                            </n-text>
                        </div>
                    </div>
                    <div class="flex m-be-auto">
                        <n-button>刷新</n-button>
                        <n-button>编辑客户</n-button>
                    </div>
                </div>
                <common-business-progressbar
                    initialize={props.initialize}
                    stage={faseNode.value.stage}
                    items={props.chunkOptions.stageOptions}
                ></common-business-progressbar>
            </common-base-element>
        )
    }
})
</script>
