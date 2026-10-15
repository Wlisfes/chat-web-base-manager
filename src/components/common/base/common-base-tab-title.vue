<script lang="tsx">
import { defineComponent, VNode, PropType } from 'vue'
import { isNotEmpty } from '@/utils'

export default defineComponent({
    name: 'CommonBaseTabTitle',
    props: {
        /**标题**/
        title: { type: String, default: '' },
        /**图标组件配置**/
        iconProps: { type: Object as PropType<Omix>, default: () => ({}) },
        /**图标组件**/
        icon: { type: [Object, String] as PropType<VNode | String> }
    },
    setup(props) {
        return () => (
            <div class="flex items-center gap-x-5 overflow-hidden">
                {isNotEmpty(props.icon) && <common-base-icon {...props.iconProps} component={props.icon}></common-base-icon>}
                {isNotEmpty(props.title) && <span>{props.title}</span>}
            </div>
        )
    }
})
</script>
