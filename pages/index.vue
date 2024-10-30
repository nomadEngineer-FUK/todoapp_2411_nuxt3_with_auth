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
  import { ref, onMounted } from 'vue'
  import { useSupabase } from '~/composables/useSupabase'
  
  const { supabase } = useSupabase()
  const tasks = ref([])
  const newTask = ref('')
  
  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*')
    tasks.value = data || []
  }
  
  const addTask = async () => {
    if (!newTask.value) return
    const { data } = await supabase.from('tasks').insert([{ title: newTask.value }])
    tasks.value.push(data[0])
    newTask.value = ''
  }
  
  const deleteTask = async (id: number) => {
    await supabase.from('tasks').delete().match({ id })
    tasks.value = tasks.value.filter(task => task.id !== id)
  }
  
  onMounted(fetchTasks)
  </script>
  
  <style scoped>
  /* 必要に応じてスタイルを追加 */
  </style>
  