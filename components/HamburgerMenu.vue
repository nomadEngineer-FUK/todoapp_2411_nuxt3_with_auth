<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '~/composables/useAuth';

// cspell:ignore Nuxt

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
                    <NuxtLink to="/" @click="closeMenu" class="menu-link">
                        Home
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/profile" @click="closeMenu" class="menu-link">
                        Your Profile
                    </NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/users" @click="closeMenu" class="menu-link">
                        All Users
                    </NuxtLink>
                </li>
                <li v-if="isAuthenticated" @click="logoutUser" class="menu-link logout">
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
    background-color: #fcf6f6f7;
    border: 1px solid rgba(100,100,100,0.2);
    margin-top: 0.5rem;
    border-radius: 10px;
}
.menu ul {
    list-style-type: none;
    padding: 0;
}
.menu li {
    height: 2rem;
}
.menu-link {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 2rem;
    text-align: center;
    text-decoration: none;
    color: #333;
    margin: 0.25rem 0;
    padding: 0.5rem 0;
    border-radius: 5px;  
}
.menu-link:hover {
    background-color: rgba(0, 100, 200, 0.2);
    transition: 0.3s;
}
.logout {
    cursor: pointer;
}
</style>
