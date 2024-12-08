<script setup lang="ts">
const newTodo = useNewTodo();    // 新規Todo登録時の空のオブジェクト
const isEditing = useIsEditing() // 編集モードの状態管理

/**
 * 編集モードから通常の新規登録モードに戻す関数
 * @function backToRegMode
 * @returns {void}
 */
const backToRegMode = (): void => {
    toggleEditMode(false);
    resetNewTodo();
}
</script>

<template>
    <div>
        <table class="table-for-input" :class="{ 'table-for-update' : isEditing }">
            <tbody>
                <tr>
                    <th colspan="2">
                        <h4 :class="{'editing-title' : isEditing}" v-if="isEditing">
                            [Editing Todo No. {{ newTodo.id }}]
                        </h4>
                    </th>
                </tr>
                <tr>
                    <th>
                        <label for="title">Todo</label>
                    </th>
                    <td>
                        <input
                            id="title"
                            name="title"
                            v-model="newTodo.title"
                            placeholder="Type in Todo Title">
                    </td>
                </tr>
                <tr>
                    <th>
                        <label for="detail">Detail</label>
                    </th>
                    <td>
                        <textarea
                            name="detail"
                            id="detail"
                            v-model="newTodo.detail"
                            placeholder="Type in Detail">
                        </textarea>
                    </td>
                </tr>
                <tr>
                    <th>
                        <label for="deadline">Deadline</label>
                    </th>
                    <td>
                        <input
                            type="date"
                            id="deadline"
                            name="deadline"
                            v-model="newTodo.deadline"
                            placeholder="Type in Deadline">
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="buttons">
            <button
                class="btn-input-table btn-add-update"
                :class="{ 'btn-update' : isEditing }"
                @click="saveTodo">
                {{ isEditing ? 'Upadate' : 'Add Todo' }}
            </button>
            <button
                v-if="isEditing"
                class="btn-input-table btn-back-to-reg-mode"
                @click="backToRegMode">
                    Back to Register Mode
            </button>
        </div>
    </div>
</template>

<style scoped>
.table-for-input {
    margin: 2rem auto 1rem;
    width: 50%;
}
.table-for-input th {
    width: 20%;
    text-align: right;
}
.table-for-input label {
    margin-right: 1rem;
}
.table-for-input td,
.table-for-input td input,
.table-for-input td textarea {
    width: 90%;
    border-radius: 4px;
    margin: 0.2rem 0;
}
.table-for-input td,
.table-for-input td input {
    min-height: 1.5rem;
}
.table-for-input td textarea {
    resize: vertical;
    min-height: 3rem;
    max-height: 240px;
}
.editing-title {
    text-align: center;
    border-bottom: 1px solid rgba(100,100,100,0.2);
    padding-bottom: 0.4rem;
    margin: 0.4rem;
}
.table-for-update {
    background-color: #fff7e1;
    border-radius: 8px;
    padding: 0.4rem;
}
#deadline{
    width: 35%;
}

/* レスポンシブデザイン - ヘッダー部分 */
@media (max-width: 1024px) {
    .table-for-input {
        width: 90%;
    }

    .table-for-input th {
        /* width: 20%; */
        text-align: right;
    }

    .table-for-input label {
        font-size: 0.7rem;
        margin-right: 0.4rem;
    }
    #deadline {
        width: 50%;
    }
}
@media (max-width: 480px) {
    #deadline {
        width: 70%;
    }
}

.buttons{
    margin-top: 1rem;
    margin: 0 auto;
    text-align: center;
}
.btn-input-table {
    font-weight: bold;
    border-radius: 4px;
    padding: 0.5rem 2rem;
    margin: 0.5rem;
    display: inline-block;
}
.btn-add-update {
    border: 2px solid rgba(0, 100, 200, 0.822);
}
.btn-add-update:hover {
    background-color: rgba(0, 100, 200, 0.822);
    color: aliceblue;
    transition: 0.3s;
}
.btn-update {
    background-color: bisque;
    border: 2px solid bisque;
}
.btn-update:hover {
    background-color: #fff;
    color: #333333;
}
.btn-back-to-reg-mode {
    border: 2px solid rgba(100, 100, 100, 0.822);
}
.btn-back-to-reg-mode:hover {
    background-color: rgba(100, 100, 100, 0.822);
    color: aliceblue;
    transition: 0.3s;
}

/* レスポンシブデザイン - ボタン部分 */
@media (max-width: 1024px) {
    .buttons {
        padding-bottom: 0.8rem;
        margin-bottom: 1rem;;
        border-bottom: 1px solid #3333332f;
    }
}
@media (max-width: 480px) {
    .btn-add-update {
        width: 50%;
    }
}
</style>
