<script setup lang="ts">
import type { Todo } from '../types/type';
import { onMounted, ref } from 'vue';

/**
 * Todo一覧の状態管理
 */
const todos = useTodos();     // DBから取得したTodo一覧
const isLoading = ref(true);  // ローディングフラグ
const { authUser, isAdmin } = useAuth(); // 認証済みユーザー情報と管理者権限情報

/**
 * コンポーネントがマウントされた際に実行される処理
 * Todo一覧をデータベースから取得し、ローディングを解除
 * @function onMounted
 * @async
 * @returns {Promise<void>}
 */
onMounted(async (): Promise<void> => {
    if (!todos.value.length) {
        await fetchTodos();
    };
    isLoading.value = false;
});

/**
 * 編集ボタン押下時に編集モードを設定する関数
 * @function editTodo
 * @param {Todo} todo - 編集対象のTodoオブジェクト
 * @returns {void}
 */
const editTodo = (todo: Todo): void => {
    setEditMode(todo); // 対象のタスク情報を引数として編集モード
};

/**
 * 編集および削除ボタンの表示制御を行う関数
 * @function canEditAndDelete
 * @param {Todo} todo - 対象のTodoオブジェクト
 * @returns {boolean} 管理者または作成者であればtrue、その他はfalse
 */
const canEditAndDelete = (todo: Todo): boolean => {
    // 管理者か、自分が作成したTodoであれば許可
    return isAdmin.value || todo.user_id === authUser.value?.id;
};
</script>

<template>
    <!-- ローディング状態の表示 -->
    <tbody v-if="isLoading">
        <tr>
            <td colspan="7">Loading your todos ...</td>
        </tr>
    </tbody>

    <!-- Todosが空の場合 -->
    <tbody v-else-if="todos.length === 0">
        <tr>
            <td colspan="7">
                No todos available.<br>
                Start by adding your first Todo to get organized!
            </td>
        </tr>
    </tbody>

    <!-- 検索結果のtodosが空の場合 -->
    <tbody v-else-if="sortedTodosList.length === 0">
        <tr>
            <td colspan="7">
                No todos containing the searched text were found.
            </td>
        </tr>
    </tbody>

    <!-- Todosの表示テーブル -->
    <tbody v-else>
        <tr v-for="todo in sortedTodosList" :key="todo.id">
            <td class="display-none-for-mobile">{{ todo.id }}</td>
            <td>
                <input type="checkbox" name="status" id="status" v-model="todo.status" @change="updateTodo(todo)">
            </td>
            <td class="display-none-for-mobile">{{ todo.deadline }}</td>
            <td>{{ todo.title }}</td>
            <td class="display-none-for-mobile">{{ todo.detail }}</td>
            <td v-if="!todo.status">
                <button v-if="canEditAndDelete(todo)" class="btn-table btn-edit" @click="editTodo(todo)">
                    Edit
                </button>
            </td>
            <td>
                <button v-if="canEditAndDelete(todo)" class="btn-table btn-delete" @click="deleteTodo(todo)">
                    Del
                </button>
            </td>
        </tr>
    </tbody>
</template>

<style scoped>
.tbody th, tbody td {
    border: 1px solid rgba(100,100,100,0.2);
}
td input[type="checkbox"] {
    transform: scale(1.5);
}

/* ボタン */
.btn-table, .placeholder {
    margin: 0.1rem;
    padding: 0.3rem 0.5rem;
    border-radius: 4px;
}
.btn-table:hover {
    opacity: 0.6;
    transition: 0.3s;
}
.btn-edit {
    background-color: bisque;  
}
.btn-delete {
    background-color: gray;
    color: aliceblue;
}

/* レスポンシブデザイン */
@media (max-width: 1024px) {
    .display-none-for-mobile {
        display: none;
    }
}
</style>
