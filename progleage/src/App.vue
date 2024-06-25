<template>
  <div id="app">
    <HeaderComponent ref="header" :isLoggedIn="isLoggedIn" @logout="logout" />
    <main>
      <router-view @login="onLogin"></router-view>
    </main>
    <footer>
      <p>&copy; 2024 ProgLeague. Усі права захищені.</p>
    </footer>
  </div>
</template>

<script>
import HeaderComponent from './components/HeaderComponent.vue';

export default {
  name: 'App',
  components: {
    HeaderComponent,
  },
  data() {
    return {
      isLoggedIn: false,
    };
  },
  created() {
    this.checkUserLogin();
  },
  watch: {
    $route: 'checkUserLogin',
  },
  methods: {
    checkUserLogin() {
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;
    },
    onLogin() {
      this.isLoggedIn = true; // Обновляем состояние isLoggedIn при возникновении события login
    },
    logout() {
      localStorage.removeItem('token');
      this.isLoggedIn = false;
      this.$router.push('/login');
    },
  },
};
</script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

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

main {
  flex: 1;
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

footer {
  background-color: #333;
  color: #fff;
  padding: 20px;
  text-align: center;
  margin-top: 40px;
}

#app {
  flex: 1;
  display: flex;
  flex-direction: column;
}

</style>