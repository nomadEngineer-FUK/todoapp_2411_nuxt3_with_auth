<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ExtendedUser } from '~/types/type';
import { useAllUsers } from '~/composables/useUsers';

const allUsers = ref<Partial<ExtendedUser>[]>([]);

onMounted(async () => {
    allUsers.value = await useAllUsers();
});

</script>

<template>
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
            <tr v-for="user in allUsers" :key="user.id">
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>{{ user.account_status }}</td>
            </tr>
        </tbody>
    </table>
</template>

<style scoped>
.table-for-all-users {
    margin: 4rem auto 0;
    width: 80%;
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
