<template>
  <div class="register">
    <h2>Реєстрація</h2>
    <form @submit.prevent="register">
      <div class="form-group">
        <label for="firstName">Ім'я:</label>
        <input type="text" id="firstName" v-model="firstName" required>
      </div>
      <div class="form-group">
        <label for="lastName">Прізвище:</label>
        <input type="text" id="lastName" v-model="lastName" required>
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div class="form-group">
        <label for="phone">Номер телефону:</label>
        <input type="tel" id="phone" v-model="phone" @input="formatPhone" @focus="onFocus" @blur="onBlur" maxlength="17"
          required>
      </div>
      <div class="form-group">
        <label for="password">Пароль:</label>
        <input type="password" id="password" v-model="password" @input="checkPasswordStrength" required>
        <div class="password-strength">
          <div class="strength-bar" :style="{ width: passwordStrength + '%' }" :class="passwordStrengthLabel.color">
          </div>
        </div>
        <div class="password-info">
          <div class="strength-label">{{ passwordStrengthLabel.label }}</div>
          <div class="password-valid" v-if="isPasswordValid">Пароль відповідає вимогам складності</div>
        </div>
      </div>
      <div class="form-group">
        <label for="confirmPassword">Підтвердження пароля:</label>
        <input type="password" id="confirmPassword" v-model="confirmPassword" required>
      </div>


      <button type="submit" :disabled="!isPasswordValid || password !== confirmPassword">Зареєструватися</button>
    </form>
    <p>Вже маєте акаунт? <router-link to="/login">Увійти</router-link></p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '+38(',
      confirmPassword: '',
      passwordStrength: 0,
      passwordStrengthLabel: '',
    };
  },
  computed: {
    isPasswordValid() {
      return this.passwordStrength >= 25;
    },
  },
  methods: {
    checkPasswordStrength() {
      const strength = this.calculatePasswordStrength(this.password);
      this.passwordStrength = strength;
      this.passwordStrengthLabel = this.getPasswordStrengthLabel(strength);
    },
    calculatePasswordStrength(password) {
      let strength = 0;
      if (password.length >= 8) strength += 25;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
      if (/\d/.test(password)) strength += 25;
      if (/[!@#$%^&*]/.test(password)) strength += 25;
      return strength;
    },
    getPasswordStrengthLabel(strength) {
      if (strength === 0) return { label: 'Дуже слабкий', color: 'very-weak' };
      if (strength === 25) return { label: 'Слабкий', color: 'weak' };
      if (strength === 50) return { label: 'Середній', color: 'medium' };
      if (strength === 75) return { label: 'Сильний', color: 'strong' };
      if (strength === 100) return { label: 'Дуже сильний', color: 'very-strong' };
    },
    async register() {
      if (this.password !== this.confirmPassword) {
        alert('Паролі не співпадають');
        return;
      }

      if (!this.isPasswordValid) {
        alert('Пароль не відповідає вимогам складності');
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
          phone: this.phone,

        });

        localStorage.setItem('token', response.data.token);
        // Збереження токена в локальному сховищі або в стані застосунку для подальшого використання
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user._id);

        // После успешного входа в систему или регистрацииs
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.$router.push('/dashboard');
      } catch (error) {
        console.error('Registration error:', error);
        alert('Помилка під час реєстрації. Будь ласка, спробуйте ще раз.');
      }
    },
    formatPhone() {
      // Удаление всех символов, кроме цифр
      let formatted = this.phone.slice(4).replace(/\D/g, '');

      // Ограничение длины номера телефона до 10 цифр
      formatted = formatted.slice(0, 10);

      // Применение форматирования
      if (formatted.length > 5) {
        formatted = formatted.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1)$2-$3-$4');
      } else if (formatted.length > 2) {
        formatted = formatted.replace(/(\d{3})(\d+)/, '$1)$2');
      }

      // Обновление значения поля ввода
      this.phone = '+38(' + formatted;
    },
    onFocus() {
      if (this.phone === '+38(') {
        this.phone = '+38(';
      }
    },
    onBlur() {
      if (this.phone === '+38(') {
        this.phone = '';
      }
    },

  },
};
</script>

<style scoped>
.register {
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
input[type="email"],
input[type="password"],
input[type="tel"],
select {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  margin-top: 5px;
}

input[type="text"]:focus,
input[type="email"]:focus,
input[type="password"]:focus,
input[type="tel"]:focus,
select:focus {
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

.password-strength {
  margin-top: 10px;
  width: 100%;
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s;
}

.strength-label {
  margin-top: 5px;
  font-size: 14px;
  color: #888;
}

.password-strength {
  margin-top: 10px;
  width: 100%;
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  overflow: hidden;
}

.strength-bar {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.strength-label {
  margin-top: 5px;
  font-size: 14px;
  color: #888;
}

.very-weak {
  background-color: #ff0000;
}

.weak {
  background-color: #ff4500;
}

.medium {
  background-color: #ffa500;
}

.strong {
  background-color: #9acd32;
}

.very-strong {
  background-color: #008000;
}

.password-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.strength-label {
  font-size: 14px;
  color: #888;
}

.password-valid {
  font-size: 14px;
  color: #008000;
}
</style>