<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthUser } from '~/composables';
import { useAllUsers, useCurrentUser } from '~/composables';

const selectedSortForUser = useSelectedSortForUser();
const sortOrderForUser = useSortOrderForUser();       // ソートの種類
const allUsers = useAllUsers(); // 全ユーザー情報を保持する状態管理
const currentUser = useCurrentUser();

onMounted(async () => {
    await fetchAllUsers(); // 全ユーザー情報を取得

    // デバッグ: currentUserの中身を確認
    console.log("currentUser:", currentUser.value);

    const storedSortForUser = localStorage.getItem('selectedSortForUser');
    if (storedSortForUser
        &&
        (
            storedSortForUser === 'username' ||
            storedSortForUser === 'email' ||
            storedSortForUser === 'account_status'
        )
    ) {
        // ローカルストレージに保存されているソート状態を反映
        selectedSortForUser.value = storedSortForUser as 'username' | 'email' | 'account_status';

    } else {
        // デフォルトは 'username'
        selectedSortForUser.value = 'username';
    }
});

// 現在のユーザーか判定する関数
const isCurrentUser = (userId: string | undefined) => {

    const authUser = useAuthUser();
    if (!userId) return false;
    return authUser.value?.id === userId;
}
</script>

<template>
    <div class="wrapper-users">
        <div class="all-users-header">
            <div class="sort" v-if="allUsers && allUsers.length > 0">
                <div class="sort-item">
                    <label for="sort">Sort: </label>
                    <select name="sort" id="sort" v-model="selectedSortForUser">
                        <option value="username">Username</option>
                        <option value="email">Email</option>
                        <option value="role">Role</option>
                        <option value="account_status">Account Status</option>
                    </select>
                </div>
                <div class="sort-item">
                    <label for="order">Order: </label>
                    <select name="order" id="order" v-model="sortOrderForUser">
                        <option value="asc">Asc</option>
                        <option value="desc">Desc</option>
                    </select>
                </div>
            </div>

            <!-- All Usersページ用の検索機能のコンポーネント -->
            <SearchForUsersPage />
        </div>

        <div class="table-container">
            <table class="table-for-all-users">
                <thead>
                    <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Account Status</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-for="user in sortedUsersList" :key="user.id">
                        <td>
                            {{ user.username }}
                            <span v-if="isCurrentUser(user.id)" class="you-label">
                                You
                            </span>
                        </td>
                        <td>{{ user.email }}</td>
                        <td>{{ user.role }}</td>
                        <td>{{ user.account_status }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<style scoped>
.wrapper-users {
    width: 80%;
    margin: 0 auto;
}
.all-users-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding: 0 1rem;
    margin-bottom: 1rem;
}

/* ソート関連 */
.sort {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    margin-top: 2rem;
}
.sort-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.sort-item select,
.search-todo-for-user::v-deep(input) {
    padding: 0.2rem;
    border-radius: 4px;
}

/* テーブル関連 */
.table-for-all-users {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    border-radius: 10px;
    overflow: hidden;
}

.table-for-all-users th,
.table-for-all-users td {
    text-align: center;
    padding: 1rem;
}

.table-for-all-users th {
    background-color: #f2e6d9;
    color: #333;
    font-weight: bold;
    text-transform: uppercase;
}

.table-for-all-users tr:nth-child(even) {
    background-color: #f9f9f9; /* 偶数行の背景色 */
}

.table-for-all-users tr:hover {
    background-color: #f0e4d7;
    transition: 0.3s;
}

.table-for-all-users td {
    border-top: 1px solid #ddd;
    border-bottom: 1px solid #ddd;
}

.you-label {
    margin-left: 8px;
    padding: 3px 6px;
    font-size: smaller;
    color: #696969;
    border-radius: 3px;
    background-color: #f2e6d9;
}

/* レスポンシブデザイン */
@media (max-width: 768px) {
    .table-for-all-users td:first-child {
        background-color: #f2e6d9;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    }
    .table-container {
        overflow-x: auto;
    }
    .you-label {
        background-color: #fefefe;
    }
}

@media (max-width: 480px) {
    .all-users-header {
        display: block;
    }
    .sort {
        flex-direction: row;
        justify-content: space-around;
        margin-bottom: 1.2rem;
    }
    .sort-item {
        flex-direction: column;
        align-items: start;
    }
    .sort-item select {
        padding: 0.3rem;
        border-radius: 4px;
        border: 1px solid #ccc;
    }
    .search-todo-for-user {
        text-align: center;
        margin-top: 1rem;
    }
    .search-todo-for-user::v-deep(input) {
        width: 65%;
        padding: 0.2rem;
    }
}
</style>
