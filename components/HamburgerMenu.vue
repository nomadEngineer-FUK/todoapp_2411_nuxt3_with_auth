<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from '~/composables/useAuth';

const { isAuthenticated, logout } = useAuth();
const menuOpen = ref<boolean>(false);



/**
 * メニューの開閉状態を切り替える関数
 * @function toggleMenu
 * @returns {void}
 */
const toggleMenu = (): void => {
    menuOpen.value = !menuOpen.value;
}

/**
 * メニューを閉じる関数
 * @function closeMenu
 * @returns {void}
 */
const closeMenu = (): void => {
    menuOpen.value = false;
}

/**
 * ユーザーをログアウトする非同期関数
 * @async
 * @function logoutUser
 * @returns {Promise<void>}
 */
const logoutUser = async (): Promise<void> => {
    await logout();
} 
</script>

<template>
    <div class="hamburger-menu">
        <div class="hamburger" @click="toggleMenu">☰</div>
        <nav v-if="menuOpen" class="menu">
            <ul>
                <li>
                    <NuxtLink to="/" @click="closeMenu">Home</NuxtLink>
                </li>
                <li v-if="isAuthenticated" @click="logoutUser" class="logout">
                    Logout
                </li>
            </ul>
        </nav>
    </div>
</template>

<style scoped>
.hamburger-menu {
    position: relative;
}
.hamburger {
    z-index: 20;
    font-size: 30px;
    cursor: pointer;
}
.menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 10;
    width: 150px;
    border: 1px solid rgba(100,100,100,0.2);
    background-color: #fff;
    margin-top: 0.5rem; /* TodoHeaderのMarginを考慮 */
}
.menu ul {
    list-style-type: none;
    padding: 0;
}
.menu li {
    padding: 0.5rem 3rem;

}
.menu li:hover {
    background-color: rgba(0, 100, 200, 0.2);
    transition: 0.3s;
}
.menu li a{
    text-decoration: none;
}
</style>
