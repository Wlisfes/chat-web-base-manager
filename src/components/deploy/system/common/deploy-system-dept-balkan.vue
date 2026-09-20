<script lang="tsx">
import { defineComponent, PropType, onMounted } from 'vue'
import { useCurrentElement } from '@vueuse/core'

export default defineComponent({
    name: 'DeploySystemDeptbalkan',
    props: {
        /**节点数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, { emit }) {
        const element = useCurrentElement<HTMLElement>()

        onMounted(() => {
            console.log(element.value, props.node)
        })

        return () => <div class="deploy-system-dept-balkan">balkan</div>
    }
})
</script>
