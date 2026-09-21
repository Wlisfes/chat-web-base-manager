<script lang="tsx">
import { defineComponent, PropType, Fragment } from 'vue'

export default defineComponent({
    name: 'DeploySystemDeptBalkan',
    props: {
        /**节点数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props) {
        return () => (
            <div
                class="deploy-system-dept-balkan flex items-center gap-x-10 overflow-hidden"
                style={{ padding: `0px ${['company', 'department'].includes(props.node.type) ? '10px' : '5px'}` }}
            >
                {['company', 'department'].includes(props.node.type) ? (
                    <Fragment>
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
                    </Fragment>
                ) : (
                    <Fragment>
                        <common-base-image
                            class="w-30 h-30 b-rd-3"
                            src="https://chat-oss.lisfes.cn/chat/image/2164042228379484160.jpg"
                        ></common-base-image>
                        <n-text depth={1} class="line-height-22">
                            {props.node.name}
                        </n-text>
                    </Fragment>
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
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
    border: 1px solid #aeaeae;
    border-radius: var(--border-radius);
    background-color: var(--card-color);
    transition:
        border-color 0.3s var(--cubic-bezier-ease-in-out),
        background-color 0.3s var(--cubic-bezier-ease-in-out);
    &:hover {
        border-color: var(--primary-color-hover);
    }
}
</style>
