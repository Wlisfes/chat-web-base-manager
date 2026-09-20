<script lang="tsx">
import { defineComponent, PropType } from 'vue'
import { UserActivity } from '@vicons/carbon'

export default defineComponent({
    name: 'DeploySystemDeptbalkan',
    props: {
        /**节点数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        return () => (
            <div class="deploy-system-dept-balkan flex items-center gap-x-10 p-inline-10 overflow-hidden">
                <n-icon size={32}>
                    <local-nest-stock />
                </n-icon>
                {['company', 'department'].includes(props.node.type) ? (
                    <div class="flex flex-col flex-1 overflow-hidden">
                        <n-h4 class="m-0 line-height-22">{props.node.name}</n-h4>
                        <n-text depth={3} class="m-0 line-height-18">
                            {`${props.node.memberCount}人`}
                        </n-text>
                    </div>
                ) : (
                    <div class="flex flex-col flex-1 overflow-hidden">{props.node.name}</div>
                )}
            </div>
        )
    }
})
</script>

<style lang="scss" scoped>
.deploy-system-dept-balkan {
    width: 100%;
    height: 100%;
    user-select: none;
    box-sizing: border-box;
    border: 1px solid #aeaeae;
    border-radius: var(--border-radius);
    transition: border-color 0.3s var(--cubic-bezier-ease-in-out);
}
</style>
