<script setup lang="ts">
import { onMounted } from 'vue';

/**
 * Todoリストの状態管理
 */
const todos = useTodos();               // DBから取得したTodo一覧
const sortOrder = useSortOrder();       // ソートの種類
const selectedSort = useSelectedSort(); // ソート順の選択肢
const isCompletion = useIsCompletion(); // 完了・未完了

/**
 * ページが読み込まれた際に、ローカルストレージから選択状態を復元する
 * @function onMounted
 * @returns {void}
 */
onMounted(() => {
    // ローカルストレージに保存されているソート状態を取得
    const storedSort = localStorage.getItem('selectedSort');

    // 有効なソート条件（id, title, deadline）であれば選択状態に反映
    if (storedSort
        &&
        (
            storedSort === 'id' ||
            storedSort === 'title' ||
            storedSort === 'deadline'
        )
    ) {

        // ローカルストレージに保存されているソート状態を反映
        selectedSort.value = storedSort as 'id' | 'title' | 'deadline';

    } else {
        // デフォルトは 'id'
        selectedSort.value = 'id';
    }
});

/**
 * 完了/未完了の表示をトグルする関数
 * @function toggleShowCompleted
 * @returns {void}
 */
const toggleShowCompleted = (): void => {
    isCompletion.value = !isCompletion.value;
};
</script>

<template>
    <!-- ソート -->
    <div class="controls-container">
        <div class="switching-view">
            <button class="btn-switch-completion"
                :class="{ 'btn-switch-brown': isCompletion, 'btn-switch-gray': !isCompletion }"
                @click="toggleShowCompleted">
                {{ isCompletion ? 'Show Incomplete Todos' : 'Show Completed Todos' }}
            </button>
        </div>
        <div class="sort" v-if="todos && todos.length > 0">
            <div class="sort-item">
                <label for="sort">Sort: </label>
                <select name="sort" id="sort" v-model="selectedSort">
                    <option value="id">No</option>
                    <option value="deadline">Deadline</option>
                    <option value="title">Todo Title</option>
                </select>
            </div>
            <div class="sort-item">
                <label for="order">Order: </label>
                <select name="order" id="order" v-model="sortOrder">
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                </select>
            </div>
        </div>
    </div>
</template>

<style scoped>
.controls-container {
    display: flex;
    align-items: center;
    width: 80%;
    margin: 0 auto;
    justify-content: space-between;
}
.sort {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
}
.sort-item select {
    padding: 0.2rem;
    border-radius: 4px;
}
.btn-switch-completion {
    margin: 0.1rem;
    padding: 0.5rem 0.8rem;
    border-radius: 4px;
}
.btn-switch-gray {
    background-color: rgba(192, 192, 192, 0.5);
}
.btn-switch-brown {
    background-color: rgba(178, 34, 34, 0.3);
}
.btn-switch-completion:hover {
    opacity: 0.6;
    transition: 0.3s;
}
</style>
