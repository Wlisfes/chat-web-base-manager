<script lang="tsx">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    name: 'DeploySystemDeptCompanyTemplate',
    props: {
        /**节点数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props) {
        return () => (
            <div class="deploy-system-dept-orgchart-template flex items-center p-inline-10 gap-x-10 overflow-hidden">
                <n-button text type="primary">
                    <common-base-icon size={['company'].includes(props.node.type) ? 42 : 32} name="nest-stock"></common-base-icon>
                </n-button>
                <div class="flex flex-col flex-1 overflow-hidden">
                    <n-text depth={1} class="text-16 line-height-22">
                        {props.node.name}
                    </n-text>
                    <n-text depth={3} class="line-height-18">
                        {`${props.node.memberCount}人`}
                    </n-text>
                </div>
            </div>
        )
    }
})
</script>
