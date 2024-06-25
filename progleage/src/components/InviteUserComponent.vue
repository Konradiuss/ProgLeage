<template>
  <div class="invite-user">
    <h3>Запросити користувача</h3>
    <input v-model="searchQuery" type="text" placeholder="Пошук користувачів" />
    <ul class="user-list">
      <li v-for="user in filteredUsers" :key="user._id" class="user-item">
        <img :src="user.profileImage ? getProfileImageUrl(user.profileImage) : getDefaultProfileImageUrl()"
          alt="Profile Image" class="user-image" />
        <span class="user-name">{{ user.firstName }} {{ user.lastName }}</span>
        <button @click="inviteUser(user._id)" class="invite-button">Запросити</button>
      </li>
    </ul>
    <div class="pagination">
      <button @click="previousPage" :disabled="currentPage === 1">Попередня</button>
      <span>{{ currentPage }}</span>
      <button @click="nextPage" :disabled="currentPage * itemsPerPage >= users.length">Наступна</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  props: ['projectId', 'token', 'project'],
  data() {
    return {
      users: [],
      searchQuery: '',
      currentPage: 1,
      itemsPerPage: 15,
    };
  },
  computed: {
    filteredUsers() {
      const filtered = this.users.filter(user =>
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      return filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
    },
    computed: {
      filteredUsers() {
        const currentUserId = JSON.parse(localStorage.getItem('user'))._id;
        return this.users.filter(user => user._id !== currentUserId && !this.project.participants.includes(user._id));
      },
    },
  },
  async created() {
    try {
      await this.fetchUsers();
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  },
  methods: {
    async fetchUsers() {
      try {
        const response = await axios.get('http://localhost:5000/api/users/all', {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        console.log('Response data:', response.data);
        if (Array.isArray(response.data)) {
          this.users = response.data;
          console.log('Users:', this.users);
        } else {
          console.error('Error: API response is not an array of users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
    getProfileImageUrl(imageName) {
      return `http://localhost:5000/uploads/profile-images/${imageName}`;
    },
    getDefaultProfileImageUrl() {
      return 'http://localhost:5000/uploads/profile-images/default-profile.jpg';
    },
    async inviteUser(userId) {
      try {
        const projectId = this.$route.params.id;
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5000/api/projects/${projectId}/invite`, { recipientId: userId }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Обработка успешной отправки приглашения
      } catch (error) {
        console.error('Error inviting user:', error);
      }
    },
    previousPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage * this.itemsPerPage < this.users.length) {
        this.currentPage++;
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.user-list {
  list-style-type: none;
  padding: 0;
  max-height: 400px;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-name {
  flex-grow: 1;
}

.invite-button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination button {
  background-color: #007bff;
  color: #fff;
  border: none;
  padding: 5px 10px;
  margin: 0 5px;
  cursor: pointer;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>