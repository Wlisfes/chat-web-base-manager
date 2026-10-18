<script lang="tsx">
import { defineComponent } from 'vue'
import { Observer } from '@/utils'
import { useState } from '@/hooks'

export default defineComponent({
    name: 'SrmSupplier',
    setup(props, ctx) {
        const { state } = useState({ observer: Observer<Record<string, Omix>>() })

        return () => (
            <layout-common-container class-name="p-14">
                <common-base-element is-white class="flex flex-col flex-1 p-14 b-rd-4 overflow-hidden">
                    <srm-supplier-list observer={state.observer}></srm-supplier-list>
                </common-base-element>
            </layout-common-container>
        )
    }
})
</script>
