<script lang="tsx">
import { defineComponent, cloneVNode, PropType, Fragment } from 'vue'
import { ButtonProps } from 'naive-ui'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'CommonDatabaseCommand',

    props: {
        /**按钮内容**/
        content: { type: [String, Number], default: '更多' },
        /**按钮类型**/
        type: { type: String as PropType<ButtonProps['type']>, default: 'primary' },
        /**弹出层容器样式**/
        className: { type: String, default: '' }
    },
    setup(props, { slots }) {
        const { state, setState } = useState({ visible: false })

        return () => {
            return (
                <common-element-popover
                    placement="bottom-end"
                    style={{ padding: '8px' }}
                    v-model:visible={state.visible}
                    on-update:show={(visible: boolean) => setState({ visible })}
                >
                    {{
                        trigger: () => (
                            <common-element-button
                                database
                                text
                                content="更多"
                                icon="nest-settings"
                                icon-size={16}
                                type={props.type}
                                onClick={(event: MouseEvent) => setState({ visible: true })}
                            ></common-element-button>
                        ),
                        default: () => (
                            <n-element
                                class={`min-w-80 flex flex-col overflow-hidden [&>.n-button]:justify-start [&>.n-button]:p-inline-6 ${props.className}`}
                            >
                                {slots.default && <Fragment>{slots.default().map(vnode => cloneVNode(vnode, { setState }))}</Fragment>}
                            </n-element>
                        )
                    }}
                </common-element-popover>
            )
        }
    }
})
</script>
