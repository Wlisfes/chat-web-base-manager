<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { DataTableColumn } from 'naive-ui'
import { useVModels } from '@vueuse/core'
import { useState } from '@/hooks'
import { pick, fetchHandler } from '@/utils'

export default defineComponent({
    name: 'CommonDatabaseSettings',
    emits: ['checkboxs', 'update:columns'],
    props: {
        /**表头配置**/
        columns: { type: Array as PropType<Array<Omix<DataTableColumn>>>, default: () => [] }
    },
    setup(props, { emit }) {
        const { columns } = useVModels(props)
        const { state, setState } = useState({ visible: false, checked: false })

        /**关闭事件**/
        async function fetchClose(visible: boolean) {
            return await fetchHandler(!visible, async () => {
                return await setState({ visible }).then(async () => {
                    return emit(
                        'checkboxs',
                        columns.value.map(item => pick(item, ['key', 'title', 'checked']))
                    )
                })
            })
        }

        return () => (
            <common-element-popover style={{ padding: 0 }} v-model:visible={state.visible} on-update:show={fetchClose}>
                {{
                    trigger: () => (
                        <common-element-button
                            class="h-full p-inline-6"
                            text
                            icon="nest-settings"
                            icon-size={22}
                            onClick={() => setState({ visible: true })}
                        ></common-element-button>
                    ),
                    default: () => (
                        <n-element class="w-220 flex flex-col overflow-hidden">
                            <div class="flex items-center p-inline-10 p-block-10">
                                <n-checkbox focusable={false} v-model:checked={state.checked}>
                                    列设置
                                </n-checkbox>
                            </div>
                            <n-divider style={{ margin: 0 }} />
                            <div class="flex flex-col p-block-10 overflow-hidden">
                                <n-scrollbar class="max-h-50vh" trigger="none">
                                    <common-element-draggable class="flex flex-col overflow-hidden" animation={150} v-model={columns.value}>
                                        {columns.value.map(item => (
                                            <div class="flex items-center p-block-6 overflow-hidden cursor-move" key={item.key}>
                                                <div class="min-w-40 flex p-is-8 p-ie-10 box-border">
                                                    <common-element-icon size={22} name="nest-mobile"></common-element-icon>
                                                </div>
                                                <n-checkbox focusable={false} v-model:checked={item.checked}>
                                                    <n-ellipsis class="max-w-140" tooltip={false}>
                                                        {item.title}
                                                    </n-ellipsis>
                                                </n-checkbox>
                                            </div>
                                        ))}
                                    </common-element-draggable>
                                </n-scrollbar>
                            </div>
                        </n-element>
                    )
                }}
            </common-element-popover>
        )
    }
})
</script>
