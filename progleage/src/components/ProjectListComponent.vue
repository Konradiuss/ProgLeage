<template>
  <div class="project-list">
    <h2>Список проектів</h2>
    <div class="search-filters">
      <input type="text" v-model="searchQuery" placeholder="Пошук за назвою" />
      <select v-model="selectedLanguage">
        <option value="">Всі мови програмування</option>
        <option value="JavaScript">JavaScript</option>
        <option value="Python">Python</option>
        <option value="Java">Java</option>
        <!-- Добавьте другие языки программирования -->
      </select>
      <select v-model="selectedProgramType">
        <option value="">Всі типи програм</option>
        <option value="Веб-сайт">Веб-сайт</option>
        <option value="Гра">Гра</option>
        <option value="Прикладна програма">Прикладна програма</option>
        <!-- Добавьте другие типы программ -->
      </select>
      <select v-model="selectedCompletionStatus">
        <option value="">Всі ступені завершеності</option>
        <option value="Ідея">Ідея</option>
        <option value="У розробці">У розробці</option>
        <option value="Завершено">Завершено</option>
      </select>
    </div>
    <div v-if="isLoading" class="loading">
      <div class="spinner"></div>
      <p>Завантаження проектів...</p>
    </div>
    <div v-else class="project-cards">
      <transition-group name="project-list" tag="div" class="project-cards">
      <router-link :to="'/projects/' + project._id" class="project-card" v-for="project in filteredProjects" :key="project._id">
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
    </transition-group>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      projects: [],
      searchQuery: '',
      selectedLanguage: '',
      selectedProgramType: '',
      selectedCompletionStatus: '',
      isLoading: true,
    };
  },
  computed: {
    filteredProjects() {
      return this.projects.filter(project => {
        const titleMatch = project.title.toLowerCase().includes(this.searchQuery.toLowerCase());
        const languageMatch = this.selectedLanguage ? project.programmingLanguage === this.selectedLanguage : true;
        const programTypeMatch = this.selectedProgramType ? project.programType === this.selectedProgramType : true;
        const completionStatusMatch = this.selectedCompletionStatus ? project.completionStatus === this.selectedCompletionStatus : true;
        return titleMatch && languageMatch && programTypeMatch && completionStatusMatch;
      });
    },
  },
  async created() {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      this.projects = response.data.filter(project => !project.isPrivate);
      this.isLoading = false;
    } catch (error) {
      console.error('Помилка при завантаженні проектів:', error);
      this.isLoading = false;
    }
  },
  methods: {
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
.project-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.search-filters {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.search-filters input,
.search-filters select {
  padding: 10px;
  margin-right: 10px;
  border: none;
  border-radius: 4px;
  background-color: #f1f1f1;
  color: #333;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.search-filters input:focus,
.search-filters select:focus {
  outline: none;
  background-color: #e0e0e0;
}

.project-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
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

.project-card:hover {
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

.project-card:hover .project-image img {
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

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #333;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.project-list-enter-active,
.project-list-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}

.project-list-enter,
.project-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.project-details p {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>