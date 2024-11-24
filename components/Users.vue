<script setup lang="ts">
import { onMounted } from 'vue';
import { useAllUsers } from '~/composables';

const selectedSortForUser = useSelectedSortForUser();
const sortOrderForUser = useSortOrderForUser();       // ソートの種類
const allUsers = useAllUsers(); // 全ユーザー情報を保持する状態管理
onMounted(async () => {
    await fetchAllUsers(); // 全ユーザー情報を取得

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

</script>

<template>
    <div class="wrapper-users">
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
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.role }}</td>
                    <td>{{ user.account_status }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.wrapper-users {
    width: 80%;
    margin: 0 auto;
}

/* ソート関連 */
.sort {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
    margin: 4rem 0 1.5rem;
}

.sort-item select {
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


</style>
