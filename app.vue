<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { onMounted } from 'vue';

const { checkUser } = useAuth();

onMounted(async () => {
    // アプリケーションのルートで一度だけ認証チェックを行う
    await checkUser();
});
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
