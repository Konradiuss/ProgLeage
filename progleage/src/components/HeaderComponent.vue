<template>
  <header>
    <nav>
      <ul>
        <li><router-link to="/" class="logo">ProgLeague</router-link></li>
        <li><router-link to="/">Головна</router-link></li>
        
        <li><router-link to="/projects">Проекти</router-link></li>

        <li v-if="!isLoggedIn"><router-link to="/register">Реєстрація</router-link></li>
        <li v-if="!isLoggedIn"><router-link to="/login">Вхід</router-link></li>

        <li v-if="isLoggedIn"><router-link to="/dashboard">Особистий кабінет</router-link></li>
        <li v-if="isLoggedIn" @click="$emit('logout')" class="logout">Вийти</li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  props: ['isLoggedIn'],
  computed: {
    loggedIn() {
      return this.isLoggedIn; // Получаем значение isLoggedIn из $props
    },
  },
  methods: {
    logout() {
      localStorage.removeItem('token');
      this.$emit('logout');
    },
  },
};
</script>

<style scoped>
/* Стили для шапки */
header {
  background-color: #333;
  color: #fff;
  padding: 20px;
}

nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
}

nav ul li {
  margin-right: 20px;
}

nav ul li a {
  color: #fff;
  text-decoration: none;
  font-size: 18px;
  transition: color 0.3s;
}

nav ul li a:hover {
  color: #8b8b8b;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  margin-right: auto;
}

.user-info {
  margin-left: auto;
  font-size: 18px;
}

.logout {
  cursor: pointer;
  font-size: 18px;
  transition: color 0.3s;
}

.logout:hover {
  color: #8b8b8b;
}
</style>