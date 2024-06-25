<template>
  <div class="login">
    <h2>Вхід</h2>
    <form @submit.prevent="login">
      <div class="form-group">
        <label for="emailOrPhone">Email або номер телефону:</label>
        <input type="text" id="emailOrPhone" v-model="emailOrPhone" required>
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Увійти</button>
    </form>
    <p>Немає акаунту? <router-link to="/register">Зареєструватися</router-link></p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      emailOrPhone: '',
      password: '',
    };
  },
  methods: {
    async login() {
      try {
        this.$router.push('/');
        const response = await axios.post('http://localhost:5000/api/auth/login', {
          emailOrPhone: this.emailOrPhone,
          password: this.password,
        })
        this.$router.push('/');

        // Збереження токена в локальному сховищі або в стані застосунку для подальшого використання
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user._id);
        
        // После успешного входа в систему или регистрации
        localStorage.setItem('user', JSON.stringify(response.data.user));

        this.$emit('login');
        // Перехід на захищену сторінку або виконання інших дій після успішного входу
        this.$router.push('/dashboard');
        //this.$parent.$refs.header.checkUserLogin();
      } catch (error) {
        console.error('Login error:', error);
        // Обробка помилок входу
        alert('Помилка під час входу. Будь ласка, перевірте свої облікові дані.');
      }
    },
  },
};
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 0 auto;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #333;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  margin-top: 5px;
}

input[type="text"]:focus,
input[type="password"]:focus {
  outline: none;
  border-color: #555;
}

button[type="submit"] {
  display: block;
  width: 100%;
  padding: 10px;
  font-size: 16px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button[type="submit"]:hover {
  background-color: #555;
}

p {
  text-align: center;
  margin-top: 20px;
}
</style>