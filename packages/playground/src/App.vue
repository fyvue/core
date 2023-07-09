<script setup lang="ts">
import { i18nextPromise } from "@fy-/core";
import { Backend } from "@karpeleslab/i18next-klb-backend";
await i18nextPromise(Backend);
</script>
<template>
  <RouterView v-slot="{ Component }">
    <Suspense timeout="0">
      <component :is="Component" />
      <template #fallback>
        <div>Fallback...</div>
      </template>
    </Suspense>
  </RouterView>
</template>
