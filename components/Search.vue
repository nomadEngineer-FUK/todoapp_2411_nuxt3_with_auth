<script setup lang="ts">
import { useSearchText } from '~/composables';

// 検索欄に入力された文字列の状態管理
const searchText = useSearchText();

</script>

<template>
    <div class="search-todo">
        <label for="search">Search: </label>
        <input 
            type="text"
            id="search"
            name="search"
            v-model="searchText"
        >
    </div>
</template>

<style>
.search-todo {
    width: 80%;
    margin: 0.3rem auto 0;
    text-align: end;
}
.search-todo input {
    border-radius: 4px;
    padding: 0.2rem;
    border: 1px solid #333333;
}

/* レスポンシブデザイン */
@media (max-width: 480px) {
    .search-todo {
        text-align: start;
        margin-top: 0.8rem;
        text-align: center;
    }
    .search-todo label {
        width: 20%;
    }
    .search-todo input {
        width: 70%;
    }
}
</style>
