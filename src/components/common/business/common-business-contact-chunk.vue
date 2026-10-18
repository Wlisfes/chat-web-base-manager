<script lang="tsx">
import { defineComponent, PropType } from 'vue'

export default defineComponent({
    name: 'CommonBusinessContactChunk',
    props: {
        /**联系方式枚举列表**/
        options: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**联系方式列表**/
        items: { type: Array as PropType<Array<Omix>>, default: () => [] },
        /**联系方式节点数据**/
        node: { type: Object as PropType<Omix>, default: () => ({}) }
    },
    setup(props, ctx) {
        return () => {
            if (props.items.length === 0) {
                return <span>-</span>
            }
            return (
                <div class="common-business-contact-chunk flex flex-col overflow-hidden">
                    {props.items.map(item => (
                        <div class="flex items-center gap-x-5 overflow-hidden">
                            <common-base-chunk mode="chunk" value={item.type} items={props.options}></common-base-chunk>
                            <div class="flex-1 overflow-hidden">
                                <common-base-content ellipsis value={item.value}></common-base-content>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }
    }
})
</script>
