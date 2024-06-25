<template>
  <div class="dashboard">
    <div class="user-profile">
      <div class="profile-image">
        <img :src="getProfileImageUrl(user.profileImage)" alt="Profile Image" @click="openImageUpload" />
        <div class="edit-overlay" @click="openImageUpload">
          <i class="fas fa-camera"></i>
        </div>
        <input type="file" ref="imageUpload" @change="handleImageUpload" accept="image/*" style="display: none;" />
      </div>
    </div>
    <div class="user-info">
      <div class="last-login">
        <p>Останній вхід: {{ formatLastLogin(lastLogin) }}</p>
      </div>
      <div class="info-item">
        <label for="firstName">Ім'я:</label>
        <input type="text" id="firstName" v-model="user.firstName" placeholder="Введіть ім'я" />
      </div>
      <div class="info-item">
        <label for="lastName">Прізвище:</label>
        <input type="text" id="lastName" v-model="user.lastName" placeholder="Введіть прізвище" />
      </div>
      <div class="info-item">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="user.email" placeholder="Введіть email" />
      </div>
      <div class="info-item">
        <label for="phone">Телефон:</label>
        <input type="tel" id="phone" v-model="user.phone" placeholder="Введіть номер телефону" />
      </div>
      <div class="info-row">
        <div class="info-item">
          <label for="city">Населений пункт:</label>
          <input type="text" id="city" v-model="user.city" placeholder="Введіть населений пункт" />
        </div>
        <div class="info-item">
          <label for="region">Область:</label>
          <select id="region" v-model="user.region" class="region-select">
            <option value="">Виберіть область</option>
            <option value="Київська">Київська</option>
            <option value="Львівська">Львівська</option>
            <option value="Харківська">Харківська</option>
            <option value="Одеська">Одеська</option>
            <!-- Добавьте остальные области -->
          </select>
        </div>
      </div>
      <div class="info-item">
        <label for="bio">Коротка біографія:</label>
        <textarea id="bio" v-model="user.bio" maxlength="1000" @input="updateBioCharCount"
          placeholder="Розкажіть про себе..."></textarea>
        <div class="char-count">{{ bioCharCount }}/1000</div>
      </div>
      <div class="info-item">
        <label for="portfolio">Сайт-портфоліо:</label>
        <input type="text" id="portfolio" v-model="user.portfolio" placeholder="Введіть URL сайту-портфоліо" />
      </div>
      <div class="info-item">
        <label>Соціальні мережі:</label>
        <input type="text" v-model="user.socialMedia1" placeholder="Введіть URL соціальної мережі"
          class="social-media-input" />
        <input type="text" v-model="user.socialMedia2" placeholder="Введіть URL соціальної мережі"
          class="social-media-input" />
        <input type="text" v-model="user.socialMedia3" placeholder="Введіть URL соціальної мережі"
          class="social-media-input" />
      </div>
    </div>

    <div class="invitations">
      <h3>Запрошення</h3>
      <div class="invitation-list">
        <InvitationNotificationComponent v-for="invitation in invitations" :key="invitation._id"
          :invitation="invitation" @accept="acceptInvitation" @decline="declineInvitation" />
      </div>
    </div>

    <div class="user-projects">
      <h3>Створені проекти: {{ userProjects.length }}</h3>
      <div class="project-list">
        <div v-for="project in userProjects" :key="project._id" class="project-item">
          <router-link :to="'/projects/' + project._id" class="project-link">
            <div class="project-image">
              <img :src="getProjectImageUrl(project.image)" alt="Project Image" />
            </div>
            <div class="project-details">
              <h3>{{ project.title }}</h3>
              <p>{{ truncateDescription(project.description) }}</p>
              <div class="project-tags">
                <div class="project-tag" v-if="project.programmingLanguage">{{ project.programmingLanguage }}</div>
                <div class="project-tag" v-if="project.programType">{{ project.programType }}</div>
                <div class="project-tag" v-if="project.completionStatus">{{ project.completionStatus }}</div>
              </div>
              <div class="project-team" v-if="project.isLookingForTeam">
                <i class="fas fa-users"></i> Шукаємо команду
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>

    <div class="user-projects">
      <h3>Проекти, в яких ви берете участь: {{ participatingProjects.length }}</h3>
      <div class="project-list">
        <div v-for="project in participatingProjects" :key="project._id" class="project-item">
          <router-link :to="'/projects/' + project._id" class="project-link">
            <div class="project-image">
              <img :src="getProjectImageUrl(project.image)" alt="Project Image" />
            </div>
            <div class="project-details">
              <h3>{{ project.title }}</h3>
              <p>{{ truncateDescription(project.description) }}</p>
              <div class="project-tags">
                <div class="project-tag" v-if="project.programmingLanguage">{{ project.programmingLanguage }}</div>
                <div class="project-tag" v-if="project.programType">{{ project.programType }}</div>
                <div class="project-tag" v-if="project.completionStatus">{{ project.completionStatus }}</div>
              </div>
              <div class="project-team" v-if="project.isLookingForTeam">
                <i class="fas fa-users"></i> Шукаємо команду
              </div>
            </div>
          </router-link>
          <button @click="leaveProject(project._id)" class="btn btn-leave">Залишити проект</button>
        </div>
      </div>
    </div>


    <div class="dashboard-actions">
      <button @click="updateUserInfo" class="btn btn-primary">Зберегти зміни</button>
      <router-link to="/create-project" class="btn btn-secondary">Створити новий проект</router-link>
      <button @click="viewPublicProfile" class="btn btn-secondary">Переглянути публічний профіль</button>
      <button @click="logout" class="btn btn-logout">Вийти</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import InvitationNotificationComponent from './InvitationNotificationComponent.vue';

export default {
  components: {
    InvitationNotificationComponent,
  },
  data() {
    return {
      user: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        region: '',
        bio: '',
        profileImage: '',
        portfolio: '',
        socialMedia1: '',
        socialMedia2: '',
        socialMedia3: '',
      },
      bioCharCount: 0,
      userProjects: [],
      lastLogin: '',
      invitations: [],
      participatingProjects: [],
    };
  },
  created() {
    this.fetchUserData();
    this.fetchUserProjects();
    this.fetchLastLogin();
    this.fetchInvitations();
    this.fetchParticipatingProjects();
  },

  methods: {
    async fetchUserData() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/user', {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.user = response.data;
        } catch (error) {
          console.error('Ошибка при загрузке информации о пользователе:', error);
        }
      }
    },

    getProjectImageUrl(imagePath) {
      return `http://localhost:5000/uploads/project-images/${imagePath}`;
    },
    truncateDescription(description) {
      const maxLength = 100;
      if (description.length > maxLength) {
        return description.slice(0, maxLength) + "...";
      }
      return description;
    },
    async fetchParticipatingProjects() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/user/participating-projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.participatingProjects = response.data;
      } catch (error) {
        console.error('Error fetching participating projects:', error);
      }
    },
    async leaveProject(projectId) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/projects/${projectId}/participants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Обновление списка проектов, в которых пользователь является участником
        await this.fetchParticipatingProjects();
      } catch (error) {
        console.error('Error leaving project:', error);
      }
    },
    async fetchUserProjects() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/user/projects', {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.userProjects = response.data;
        } catch (error) {
          console.error('Ошибка при загрузке проектов пользователя:', error);
        }
      }
    },
    async fetchLastLogin() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/user/last-login', {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.lastLogin = response.data.lastLogin;
        } catch (error) {
          console.error('Ошибка при загрузке последнего входа:', error);
        }
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    },
    openImageUpload() {
      this.$refs.imageUpload.click();
    },
    async handleImageUpload(event) {
      const file = event.target.files[0];
      if (file) {
        try {
          const formData = new FormData();
          formData.append('profileImage', file);
          const token = localStorage.getItem('token');
          await axios.put('http://localhost:5000/api/user/profile-image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`,
            },
          });
          this.fetchUserData();
        } catch (error) {
          console.error('Ошибка при загрузке картинки профиля:', error);
        }
      }
    },
    getProfileImageUrl(imageName) {
      return `http://localhost:5000/uploads/profile-images/${imageName}`;
    },
    updateBioCharCount() {
      this.bioCharCount = this.user.bio ? this.user.bio.length : 0;
    },
    async updateUserInfo() {
      try {
        const token = localStorage.getItem('token');
        await axios.put('http://localhost:5000/api/user', this.user, {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Обновление успешно, можно отобразить сообщение пользователю
      } catch (error) {
        console.error('Ошибка при обновлении информации пользователя:', error);
      }
    },
    formatLastLogin(dateString) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString('uk-UA', options);
    },
    async fetchInvitations() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/invitations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.invitations = response.data;
      } catch (error) {
        console.error('Error fetching invitations:', error);
      }
    },
    async acceptInvitation(invitationId) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:5000/api/invitations/${invitationId}/accept`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });

        this.invitations = this.invitations.filter(invitation => invitation._id !== invitationId);

        // Обновление списка проектов, в которых пользователь является участником
        await this.fetchParticipatingProjects();
      } catch (error) {
        console.error('Error accepting invitation:', error);
      }
    },
    async declineInvitation(invitationId) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/invitations/${invitationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.fetchInvitations();
      } catch (error) {
        console.error('Error declining invitation:', error);
      }
    },
    viewPublicProfile() {
      this.$router.push(`/user/${this.user._id}`);
    },
    
  },
  watch: {
    user: {
      immediate: true,
      handler() {
        this.updateBioCharCount();
      },
    },
  },
};
</script>

<style scoped>
.dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
}


.profile-image {
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 20px;
}

.profile-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.profile-image:hover .edit-overlay {
  opacity: 1;
}

.user-name {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 10px;
}

.user-email {
  font-size: 18px;
  color: #888;
  margin-bottom: 20px;
}

.user-info {
  margin-bottom: 40px;
}

.info-item {
  margin-bottom: 20px;
}

.info-item label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.info-item input,
.info-item select,
.info-item textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}

.char-count {
  margin-top: 5px;
  font-size: 12px;
  color: #888;
}

.dashboard-actions {
  display: flex;
  justify-content: center;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  font-size: 18px;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
  margin: 0 10px;
  cursor: pointer;
}

.btn-primary {
  background-color: #000;
  color: #fff;
  border: none;
}

.btn-primary:hover {
  background-color: #333;
}

.btn-secondary {
  background-color: #fff;
  color: #000;
  border: 1px solid #000;
  text-align: center;
}

.btn-secondary:hover {
  background-color: #f5f5f5;
}

.btn-logout {
  background-color: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
}

.btn-logout:hover {
  background-color: #f8d7da;
}

.info-item textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

.info-item textarea::placeholder {
  color: #888;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.info-row .info-item {
  flex: 1;
}

.info-item input::placeholder,
.info-item textarea::placeholder {
  color: #888;
}


.user-projects {
  margin-bottom: 40px;
}

.user-projects h3 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.user-projects ul {
  list-style-type: none;
  padding: 0;
}

.user-projects li {
  margin-bottom: 5px;
}

.last-login {
  margin-bottom: 40px;
}

.last-login p {
  font-size: 16px;
  color: #888;
}

.info-item.social-media {
  display: flex;
  flex-direction: column;
}

.social-media-input {
  margin-bottom: 10px;
}

.social-media-input:last-child {
  margin-bottom: 0;
}

.user-projects {
  margin-bottom: 40px;
}

.user-projects h3 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.project-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.project-item {
  margin-bottom: 10px;
}

.last-login {
  margin-bottom: 40px;
}

.last-login p {
  font-size: 16px;
  color: #888;
}

.invitations {
  margin-bottom: 40px;
}

.invitations h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.invitation-list {
  display: grid;
  gap: 20px;
}

.user-projects {
  margin-bottom: 40px;
}

.user-projects h3 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.project-item {
  background-color: #f8f8f8;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.project-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.project-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.project-image {
  width: 100%;
  height: 150px;
  overflow: hidden;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-details {
  padding: 15px;
}

.project-details h4 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.project-details p {
  font-size: 14px;
  color: #777;
}

.user-projects {
  margin-bottom: 40px;
}

.user-projects h3 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.project-item {
  background-color: #f8f8f8;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.project-item:hover {
  transform: translateY(-5px);
}

.project-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.project-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-details {
  padding: 20px;
}

.project-details h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.project-details p {
  margin-bottom: 10px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.project-tag {
  background-color: #e0e0e0;
  color: #333;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.project-team {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #777;
}

.project-team i {
  margin-right: 5px;
}

.project-details p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-leave {
  background-color: #a3a3a3;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 10px;
}

.btn-leave:hover {
  background-color: #808080;
}

.project-item {
  position: relative;
}

.project-item .btn-leave {
  position: absolute;
  bottom: 10px;
  right: 10px;
}
</style>