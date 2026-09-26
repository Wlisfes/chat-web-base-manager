<script lang="tsx">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    name: 'DeploySystemDeptUserTemplate',
    props: {
        /**节点数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props) {
        return () => (
            <div class="deploy-system-dept-orgchart-template flex items-center p-inline-5 gap-x-10 overflow-hidden">
                <common-base-image class="w-30 h-30 b-rd-3" src={props.node.avatar}></common-base-image>
                <n-text depth={1} class="line-height-22">
                    {props.node.name}
                </n-text>
            </div>
        )
    }
})
</script>
