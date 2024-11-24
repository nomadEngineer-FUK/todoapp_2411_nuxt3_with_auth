<script setup lang="ts">

// 検索欄に入力された値の状態管理
const searchTextForUser = useSearchTextForUser();

</script>

<template>
    <div class="search-todo-for-user">
        <label for="search">Search: </label>
        <input 
            type="text"
            id="search"
            name="search"
            v-model="searchTextForUser"
        >
    </div>
</template>

<style>
.search-todo-for-user {
    width: 100%;
    margin: 0.3rem auto 0;
    text-align: end;
}
.search-todo input {
    border-radius: 4px;
    padding: 0.2rem;
    border: 1px solid #333333;
}
</style>
