<script lang="tsx">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    name: 'DeploySystemDeptbalkan',
    props: {
        /**节点数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        return () => <div class="deploy-system-dept-balkan flex overflow-hidden">卡片内容</div>
    }
})
</script>

<style lang="scss" scoped>
.deploy-system-dept-balkan {
    width: 100%;
    height: 100%;
    user-select: none;
    box-sizing: border-box;
    border-radius: var(--border-radius);
    border: 1px solid #aeaeae;
    transition: border-color 0.3s var(--cubic-bezier-ease-in-out);
}
</style>
