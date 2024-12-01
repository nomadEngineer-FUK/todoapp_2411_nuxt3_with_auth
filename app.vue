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
  <div class="todo-app">
    <NuxtRouteAnnouncer />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
@media (max-width: 1024px) {
  .todo-app {
    max-width: 100%;
  }
}
</style>
