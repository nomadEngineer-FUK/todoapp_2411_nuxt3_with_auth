<template>
    <!-- Todosの表示テーブル -->
    <table class="table-for-output">

        <!-- テーブルのHeader -->
        <!-- default.vue で表示-Authは後で考慮が必要 -->
        <TableHeader />

        <!-- テーブルのBody -->
        <TableData />
    </table>
</template>

<style scoped>
.table-for-output {
    margin: 0.5rem auto 0;
    width: 80%;
    text-align: center;
    border-collapse: collapse;
}
</style>
