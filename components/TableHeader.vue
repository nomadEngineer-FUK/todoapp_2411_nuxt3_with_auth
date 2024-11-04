<template>
    <thead>
        <tr class="table-header">
            <th class="sticky_cross" style="width: 5%;">No</th>
            <th class="sticky_cross" style="width: 7%;">Status</th>
            <th class="sticky_col" style="width: 15%;">Deadline</th>
            <th class="sticky_col" style="width: 20%;">Todo Title</th>
            <th class="sticky_col" style="width: 23%;">Detail</th>
            <th class="sticky_col" colspan="2" style="width: 10%;"></th>
        </tr>
    </thead>
</template>

<style scoped>
.table-header th {
    background-color: rgb(145, 200, 255);
    border: 0.1px solid #EEEEEE;
}
.table-header td{
    border-collapse: collapse;
    border: 1px solid rgba(100, 100, 100, 0.2);
}
.table-header th, .table-header td{
    border-collapse: collapse;
}

/* テーブルのヘッダー（ヘッダー固定） */
.sticky_cross {
  position: sticky;
  top: 0;
  left: 0;
  background: none;
  border-top: none;
  border-bottom: none;
  border-left: none;
  border-right: none;
  z-index: 1;
}

.sticky_cross::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
.sticky_col {
  position: sticky;
  top: 0;
  left: 0;
  background: none;
  border-top: none;
  border-bottom: none;
}

.sticky_col::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
