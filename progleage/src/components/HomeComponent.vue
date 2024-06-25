<template>
  <div class="home">
    <section class="hero">
      <div class="hero-content">
        <h1>Ласкаво просимо до Гільдії програмістів</h1>
        <p>Знайдіть ідеальну роботу або фрілансера для вашого проекту</p>
        <router-link v-if="!isLoggedIn" to="/register" class="cta-button">Приєднатися зараз</router-link>
        <router-link v-else to="/dashboard" class="cta-button">Особистий кабінет</router-link>
      </div>
    </section>

    <section class="features">
      <div class="feature">
        <i class="fas fa-search"></i>
        <h2>Знайдіть роботу мрії</h2>
        <p>Шукайте серед безлічі проектів і знаходьте ідеальну роботу, що відповідає вашим навичкам і інтересам.</p>
      </div>
      <div class="feature">
        <i class="fas fa-users"></i>
        <h2>Наймайте найкращих фрілансерів</h2>
        <p>Знаходьте талановитих і надійних фрілансерів для своїх проектів з нашою перевіреною базою програмістів.</p>
      </div>
      <div class="feature">
        <i class="fas fa-shield-alt"></i>
        <h2>Безпечні та надійні транзакції</h2>
        <p>Насолоджуйтесь безпечними платежами та захистом ваших коштів завдяки нашій надійній системі транзакцій.</p>
      </div>
    </section>

    <section class="chat">
      <ChatComponent />
    </section>

    <section class="projects">
      <h2>Випадкові проекти</h2>
      <div class="project-list">
        <router-link v-for="project in randomProjects" :key="project._id" :to="'/projects/' + project._id"
          class="project-item">
          <div class="project-image">
            <img :src="getProjectImageUrl(project.image)" alt="Project Image" />
          </div>
          <div class="project-details">
            <h3>{{ project.title }}</h3>
            <p>{{ truncateDescription(project.description) }}</p>
            <div class="project-stats">
              <div class="project-likes">
                <i class="fas fa-heart"></i> {{ project.likes ? project.likes.length : 0 }}
              </div>
              <div class="project-comments">
                <i class="fas fa-comment"></i> {{ project.comments ? project.comments.length : 0 }}
              </div>
            </div>
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
    </section>

    <section class="projects">
      <h2>Останні проекти</h2>
      <div class="project-list">
        <router-link v-for="project in latestProjects" :key="project._id" :to="'/projects/' + project._id"
          class="project-item">
          <div class="project-image">
            <img :src="getProjectImageUrl(project.image)" alt="Project Image" />
          </div>
          <div class="project-details">
            <h3>{{ project.title }}</h3>
            <p>{{ truncateDescription(project.description) }}</p>
            <div class="project-stats">
              <div class="project-likes">
                <i class="fas fa-heart"></i> {{ project.likes ? project.likes.length : 0 }}
              </div>
              <div class="project-comments">
                <i class="fas fa-comment"></i> {{ project.comments ? project.comments.length : 0 }}
              </div>
            </div>
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
    </section>

    <section class="projects">
      <h2>Найпопулярніші проекти</h2>
      <div class="project-list">
        <router-link v-for="project in popularProjects" :key="project._id" :to="'/projects/' + project._id"
          class="project-item">
          <div class="project-image">
            <img :src="getProjectImageUrl(project.image)" alt="Project Image" />
          </div>
          <div class="project-details">
            <h3>{{ project.title }}</h3>
            <p>{{ truncateDescription(project.description) }}</p>
            <div class="project-stats">
              <div class="project-likes">
                <i class="fas fa-heart"></i> {{ project.likes ? project.likes.length : 0 }}
              </div>
              <div class="project-comments">
                <i class="fas fa-comment"></i> {{ project.comments ? project.comments.length : 0 }}
              </div>
            </div>
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
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import ChatComponent from './ChatComponent.vue';

export default {
  name: 'HomeComponent',
  data() {
    return {
      projects: [],
      isLoggedIn: false,
    };
  },
  async created() {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      this.projects = response.data;
      this.checkUserLogin();
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  },
  components: {
    ChatComponent,
  },
  computed: {
    randomProjects() {
      return this.getRandomProjects(6);
    },
    latestProjects() {
      return this.getLatestProjects(6);
    },
    popularProjects() {
      return this.getPopularProjects(6);
    },
  },
  methods: {
    getRandomProjects(count) {
      const shuffled = [...this.projects].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    },
    getLatestProjects(count) {
      const sorted = [...this.projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return sorted.slice(0, count);
    },
    getPopularProjects(count) {
      const sorted = [...this.projects].sort((a, b) => (b.likes ? b.likes.length : 0) - (a.likes ? a.likes.length : 0));
      return sorted.slice(0, count);
    },
    checkUserLogin() {
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;
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
  },
};
</script>

<style scoped>
.home {
  text-align: center;
}

.hero {
  background-color: #f8f8f8;
  padding: 100px 0;
}

.hero-content {
  max-width: 600px;
  margin: 0 auto;
}

.hero h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.hero p {
  font-size: 24px;
  margin-bottom: 40px;
}

.cta-button {
  display: inline-block;
  background-color: #333;
  color: #fff;
  padding: 10px 20px;
  font-size: 20px;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.cta-button:hover {
  background-color: #555;
}

.features {
  display: flex;
  justify-content: space-around;
  padding: 80px 0;
}

.feature {
  max-width: 300px;
}

.feature i {
  font-size: 48px;
  margin-bottom: 20px;
}

.feature h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.cta {
  background-color: #f8f8f8;
  padding: 80px 0;
}

.cta h2 {
  font-size: 36px;
  margin-bottom: 20px;
}

.cta p {
  font-size: 20px;
  margin-bottom: 40px;
}

.projects {
  padding: 80px 0;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.project-item {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
}

.project-item h3 {
  font-size: 24px;
  margin-bottom: 10px;
}

.project-skills,
.project-budget {
  margin-top: 10px;
}

.project-skills span,
.project-budget span {
  font-weight: bold;
}

.project-item {
  display: block;
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s;
}

.project-item:hover {
  transform: translateY(-5px);
}

.project-item {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
}

.project-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.1);
}

.project-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.project-item:hover .project-image img {
  transform: scale(1.05);
}

.project-details {
  padding: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.project-details h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 24px;
  color: #333;
}

.project-details p {
  flex-grow: 1;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  font-size: 14px;
  color: #666;
}

.project-likes,
.project-comments {
  display: flex;
  align-items: center;
}

.project-likes i,
.project-comments i {
  margin-right: 5px;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.project-tag {
  padding: 5px 10px;
  background-color: #f1f1f1;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
}

.project-team {
  margin-top: 20px;
  padding: 10px;
  background-color: #f1f1f1;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  display: flex;
  align-items: center;
}

.project-team i {
  margin-right: 5px;
}
</style>