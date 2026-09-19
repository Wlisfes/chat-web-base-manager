<script lang="tsx">
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
    name: 'CommonChartDeptManagerNode',
    emits: ['click'],
    props: {
        data: { type: Object as PropType<Record<string, any>>, required: true }
    },
    setup(props, { emit }) {
        const kind = computed(() => {
            if (props.data.tags?.includes('item')) return 'item'
            if (props.data.tags?.includes('head')) return 'head'
            return 'root'
        })

        return () => (
            <div
                class={['common-chart-dept-manager-node', `is-${kind.value}`]}
                onClick={(event: MouseEvent) => {
                    event.stopPropagation()
                    emit('click', props.data)
                }}
            >
                <span class="common-chart-dept-manager-node__name">{props.data.name}</span>
            </div>
        )
    }
})
</script>
