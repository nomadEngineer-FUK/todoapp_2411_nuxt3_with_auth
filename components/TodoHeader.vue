<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
const { isAuthenticated } = useAuth();
</script>

<template>
    <div class="todo-header"  v-if="isAuthenticated">
        <h1 class="header-title">Todo List</h1>

        <HamburgerMenu />
    </div>
</template>

<style scoped>
.todo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 85%;
    margin: 0 auto;
    border-bottom: 1px solid rgba(100,100,100,0.2);
}
.header-title {
    margin: 0.4rem;
    flex-grow: 1;
    text-align: center;
}


</style>
