<script lang="tsx">
import { computed, defineComponent, PropType } from 'vue'
import { useVModels } from '@vueuse/core'

export default defineComponent({
    name: 'NexusSmsRouteChannelColumn',
    emits: ['update:node', 'update:list'],
    props: {
        /**绑定端口item下标**/
        index: { type: Number, required: true },
        /**新增对象格式函数**/
        fetchAdapter: { type: Function, required: true },
        /**simbank端口列表**/
        simbankPortOptions: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**绑定端口列表**/
        list: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**绑定端口item对象数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) },
        /**枚举对象**/
        chunkOptions: { type: Object as PropType<Omix>, default: () => ({}) }
    }
})
</script>
