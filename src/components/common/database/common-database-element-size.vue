<script lang="tsx">
import { defineComponent } from 'vue'
import { PopoverInst } from 'naive-ui'
import { useConfiger } from '@/store'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'CommonDatabaseElementSize',
    setup(props) {
        const configer = useConfiger()
        const { state, setState } = useState({
            visible: false,
            options: [
                { value: 'large', label: '宽松' },
                { value: 'medium', label: '默认' },
                { value: 'small', label: '紧凑' }
            ]
        })

        async function fetchTrigger() {
            return await setState({ visible: true })
        }

        async function fetchSelecter(vm: PopoverInst, item: Omix) {
            return await setState({ visible: false }).then(() => {
                return configer.setState({ elementSize: item.value })
            })
        }

        return () => (
            <common-element-popover
                style={{ padding: '5px' }}
                v-model:visible={state.visible}
                on-update:show={(visible: boolean) => setState({ visible })}
            >
                {{
                    trigger: () => (
                        <common-element-button
                            text
                            class="h-full p-inline-6"
                            icon="nest-density"
                            icon-size={22}
                            onClick={fetchTrigger}
                        ></common-element-button>
                    ),
                    default: (vm: PopoverInst) => (
                        <n-element class="flex flex-col overflow-hidden">
                            {state.options.map(item => (
                                <n-button quaternary focusable={false} style={{ padding: 0 }} onClick={() => fetchSelecter(vm, item)}>
                                    <div class="w-60 flex justify-between p-is-8 p-ie-5">
                                        <n-text type={configer.elementSize === item.value ? 'success' : undefined}>{item.label}</n-text>
                                        {configer.elementSize === item.value && (
                                            <n-text type="success">
                                                <common-element-icon name="nest-check"></common-element-icon>
                                            </n-text>
                                        )}
                                    </div>
                                </n-button>
                            ))}
                        </n-element>
                    )
                }}
            </common-element-popover>
        )
    }
})
</script>
