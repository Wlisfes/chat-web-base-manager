<script lang="tsx">
import { defineComponent, nextTick } from 'vue'
import { useVModels } from '@vueuse/core'
import { enter } from '@/utils'

export default defineComponent({
    name: 'FormBaseNumberInput',
    emits: ['update:value', '-submit', '-change:value'],
    props: {
        /**绑定数据**/
        value: { type: [Number, String] }
    },
    setup(props, { emit, slots }) {
        const { value } = useVModels(props, emit)

        async function fetchUpdate(vague: string) {
            return await nextTick(() => (value.value = vague)).then(() => {
                return emit('-change:value', value.value)
            })
        }

        async function fetchSubmit(event: KeyboardEvent) {
            return enter(event, async () => {
                return emit('-submit', value.value)
            })
        }

        return () => (
            <n-input-number
                class="form-base-number-input w-full"
                v-model:value={value.value}
                onUpdate:value={fetchUpdate}
                onKeydown={fetchSubmit}
            ></n-input-number>
        )
    }
})
</script>
