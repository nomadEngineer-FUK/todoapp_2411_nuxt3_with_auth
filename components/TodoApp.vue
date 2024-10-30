<template>
    <div>
      <h1>To-Do App</h1>
      <input v-model="newTask" placeholder="New Task" />
      <button @click="addTask">Add</button>
      <ul>
        <li v-for="task in tasks" :key="task.id">
          {{ task.title }}
          <button @click="deleteTask(task.id)">Delete</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  
  const tasks = ref<{ id: number; title: string }[]>([])
  const newTask = ref('')
  
  const addTask = () => {
    if (!newTask.value) return
    const newId = tasks.value.length + 1
    tasks.value.push({ id: newId, title: newTask.value })
    newTask.value = ''
  }
  
  const deleteTask = (id: number) => {
    tasks.value = tasks.value.filter(task => task.id !== id)
  }
  </script>
  
  <style scoped>
  /* 必要に応じてスタイルを追加 */
  </style>
  