<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { onMounted, watchEffect } from 'vue';
import Login from '~/components/auth/Login.vue';
import { useRouter } from 'nuxt/app';

const { isAuthenticated, checkUser, isAdmin } = useAuth();
const router = useRouter();
const isCheckComplete = ref(false);



onMounted(async () => {
  console.log("onMounted: Checking user");

  if (process.client) {
    await checkUser();
    console.log("isAuthenticated after checkUser in mounted:", isAuthenticated.value);
    isCheckComplete.value = true;
  }
});

// isAuthenticated を監視して、ログイン済みであればリダイレクト
watchEffect(() => {
  if (isCheckComplete.value && isAuthenticated.value) {
    console.log("Redirecting to /todos");
    router.push('/todos');
  }
});
watch(isAuthenticated, (newValue, oldValue) => {
  console.log(`isAuthenticated changed: ${oldValue} -> ${newValue}`);
});

</script>

<template>

  <!-- 未ログインの場合は、ログイン画面を表示 -->
  <div v-if="!isAuthenticated">
    <Login />
  </div>
</template>

<style>
* {
  color: #333333;
}
/* ボタンの装飾をリセット */
button{
  background-color: transparent;
  border: none;
  cursor: pointer;
  outline: none;
  padding: 0;
  appearance: none;
  font-size: small;
}
</style>
