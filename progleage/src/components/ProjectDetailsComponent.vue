<template>
  <div class="project-details">
    <div v-if="project" class="project-container">
      <div class="project-header">
        <img :src="getProjectImageUrl(project.image)" alt="Project Image" class="project-image" />
        <div class="project-title">
          <h2>{{ project.title }}</h2>
          <div class="project-likes">
            <button @click="likeProject" :disabled="hasLikedProject()" class="btn-like">
              <i class="fas fa-heart"></i> {{ project.likes ? project.likes.length : 0 }}
            </button>
          </div>
          <p class="project-price" v-if="project.price > 0 || project.priceType">
            <span v-if="project.price > 0">{{ project.price }} ₴</span>
            <span v-else-if="project.priceType === 'договірна'">Договірна</span>
            <span v-else-if="project.priceType === 'безкоштовно'">Безкоштовно</span>
          </p>
        </div>
      </div>
      <div class="project-info">
        <div class="project-description" v-if="project.description">
          <h3>Опис проекту</h3>
          <p>{{ project.description || "Опис проекту відсутній" }}</p>
        </div>

        <div class="project-slider" v-if="project.sliderItems && project.sliderItems.length">
          <div class="slider-container" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div class="slider-item" v-for="(item, index) in project.sliderItems" :key="index">
              <div class="slider-media">
                <img v-if="item.type === 'image'" :src="getSliderItemUrl(item.url)" alt="Slider Image" />
                <video v-else-if="item.type === 'video'" :src="getSliderItemUrl(item.url)" controls></video>
              </div>
            </div>
          </div>
          <div class="slider-navigation">
            <button class="prev-btn" @click="prevSlide" :disabled="currentSlide === 0">&lt;</button>
            <button class="next-btn" @click="nextSlide"
              :disabled="currentSlide === project.sliderItems.length - 1">&gt;</button>
          </div>
          <div class="slider-dots">
            <span v-for="(item, index) in project.sliderItems" :key="index" class="dot"
              :class="{ active: index === currentSlide }" @click="goToSlide(index)"></span>
          </div>
        </div>

        <div class="project-skills"
          v-if="project.isLookingForTeam && project.requiredSkills && project.requiredSkills.length > 0">
          <h3>Необхідні навички</h3>
          <ul>
            <li v-for="skill in project.requiredSkills" :key="skill.type">
              <span class="skill-type">{{ skill.type }}:</span> {{ skill.description }}
            </li>
          </ul>
        </div>

        <div class="project-team" v-if="project.isLookingForTeam">
          <h3>Пошук команди</h3>
          <p>Цей проект шукає додаткових учасників команди.</p>
        </div>

        <div class="project-github" v-if="project.githubLink">
          <h3>GitHub</h3>
          <a :href="project.githubLink" target="_blank">{{ project.githubLink }}</a>
        </div>

        <div v-if="project && project.user" class="project-author">
          <h3>Автор проекту</h3>
          <router-link :to="'/user/' + project.user._id" class="author-link">
            {{ project.user.firstName }} {{ project.user.lastName }}
          </router-link>
        </div>

        <div class="project-participants" v-if="project.participants && project.participants.length">
          <h3>Запрошені учасники проекту</h3>
          <ul class="participant-list">
            <li v-for="participant in project.participants" :key="participant._id" class="participant-item">
              <div class="participant-info">
                <router-link :to="'/user/' + participant._id" class="participant-link">
                  <div class="participant-avatar">
                    <img :src="getProfileImageUrl(participant.profileImage)" alt="Profile Image"
                      class="participant-image">
                  </div>
                  <div class="participant-details">
                    <span class="participant-name">{{ participant.firstName }} {{ participant.lastName }}</span>
                  </div>
                </router-link>
              </div>
              <button v-if="isCurrentUserAuthor" @click="removeParticipant(participant._id)"
                class="btn btn-remove">Видалити</button>
            </li>
          </ul>
          <button v-if="isCurrentUserAuthor" @click="openInviteUserModal" class="btn btn-invite">Запросити
            учасника</button>
        </div>

        <!-- Модальное окно для приглашения пользователей -->
        <div v-if="showInviteUserModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="closeInviteUserModal">&times;</span>
            <InviteUserComponent :projectId="project._id" :token="token" :project="project"
              @invite-sent="closeInviteUserModal" />
          </div>
        </div>

        <div class="project-created-at">
          <h3>Дата створення</h3>
          <p>{{ formatDate(project.createdAt) }}</p>
        </div>

        <div class="project-tags">
          <div class="project-contacts"
            v-if="project.contactPhone || project.contactTelegram || project.contactFacebook">
            <h3>Контактна інформація:</h3>
            <div v-if="project.contactPhone">
              <span>Телефон:</span> {{ project.contactPhone }}
            </div>
            <div v-if="project.contactTelegram">
              <span>Telegram:</span> {{ project.contactTelegram }}
            </div>
            <div v-if="project.contactFacebook">
              <span>Facebook:</span> {{ project.contactFacebook }}
            </div>
          </div>
          <div class="tag" v-if="project.programmingLanguage">
            <i class="fas fa-code"></i> {{ project.programmingLanguage }}
          </div>
          <div class="tag" v-if="project.programType">
            <i class="fas fa-laptop-code"></i> {{ project.programType }}
          </div>
          <div class="tag" v-if="project.completionStatus">
            <i class="fas fa-tasks"></i> {{ project.completionStatus }}
          </div>
        </div>

        <div v-if="isAuthorOrParticipant">
          <router-link :to="'/projects/' + project._id + '/chat'" class="btn btn-chat">
            Увійти до чату проекту
          </router-link>
        </div>


      </div>
      <div class="project-comments">
        <h3>Коментарі</h3>
        <div v-if="project && project.comments.length === 0" class="no-comments">
          Поки що немає коментарів. Будьте першим, хто залишить коментар!
        </div>
        <div v-else-if="project && project.comments.length > 0" class="comment-list"
          :class="{ 'scrollable': project.comments.length > 3 }">
          <div v-for="comment in project.comments" :key="comment._id" class="comment">
            <div class="comment-header">
              <div class="comment-author">
                <img :src="getProfileImageUrl(comment.author.profileImage)" alt="Profile Image" class="profile-image" />
                <router-link :to="'/user/' + comment.author._id" class="author-name">
                  {{ comment.author.firstName }} {{ comment.author.lastName }}
                </router-link>
              </div>
            </div>
            <p class="comment-text">{{ comment.text }}</p>
            <div v-if="comment.files && comment.files.length > 0" class="comment-files">
              <div v-for="(file, index) in comment.files" :key="index" class="comment-file">
                <img v-if="isImage(file)" :src="getCommentFileUrl(file)" alt="Comment Image" class="comment-image" />
                <a v-else :href="getCommentFileUrl(file)" target="_blank" class="comment-file-link">{{ file }}</a>
              </div>
            </div>
            <div class="comment-actions">
              <button @click="likeComment(comment._id)" :disabled="hasLikedComment(comment)" class="btn-like">
                <i class="fas fa-thumbs-up"></i> {{ comment.likes ? comment.likes.length : 0 }}
              </button>
              <button @click="dislikeComment(comment._id)" :disabled="hasDislikedComment(comment)" class="btn-dislike">
                <i class="fas fa-thumbs-down"></i> {{ comment.dislikes ? comment.dislikes.length : 0 }}
              </button>
            </div>
          </div>
        </div>

        <div class="add-comment">
          <textarea v-model="newComment" placeholder="Додайте коментар" class="comment-input"></textarea>
          <div class="comment-files">
            <div class="file-upload-container">
              <div class="file-upload-slots">
                <div v-for="(file, index) in commentFiles" :key="index" class="file-upload-slot">
                  <div class="file-info">
                    <i class="fas fa-file"></i>
                    <span class="file-name">{{ file.name }}</span>
                  </div>
                  <button @click="removeCommentFile(index)" class="remove-file-btn" title="Видалити файл">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div v-if="commentFiles.length < 3" class="file-upload-slot empty" @click="openFileUpload">
                  <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                  </div>
                  <span class="upload-text">Додати файл</span>
                </div>
              </div>
              <input type="file" ref="fileUpload" @change="handleFileUpload" accept="image/*, video/*" multiple
                style="display: none;">
            </div>
            <button @click="clearCommentFiles" class="clear-files-btn" v-if="commentFiles.length > 0">
              <i class="fas fa-trash"></i> Очистити файли
            </button>
          </div>
          <button @click="addComment" :disabled="!newComment" class="btn btn-comment">Відправити</button>
        </div>
      </div>




      <div class="project-actions" v-if="isCurrentUserAuthor">
        <div class="actions-row">
          <router-link to="/projects" class="btn btn-secondary">Повернутися до списку проектів</router-link>
          <button @click="editProject" class="btn btn-edit">Редагувати проект</button>
        </div>
        <div class="actions-row">
          <button @click="openInviteUserModal" class="btn btn-invite">Запросити учасника</button>
          <button @click="deleteProject" class="btn btn-delete">Видалити проект</button>
        </div>
      </div>

    </div>
    <div v-else class="loading">
      <p>Завантаження проекту...</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import InviteUserComponent from './InviteUserComponent.vue';



export default {
  components: {
    InviteUserComponent,
  },
  data() {
    return {
      project: null,
      currentSlide: 0,
      newComment: '',
      commentFiles: [],
      currentUserId: null,
      showInviteUserModal: false,
      token: localStorage.getItem('token'),
    };
  },
  async created() {
    const projectId = this.$route.params.id;
    try {
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`);
      this.project = response.data;
      console.log(this.project);
    } catch (error) {
      console.error("Помилка при завантаженні проекту:", error);
    }
  },
  computed: {
    isCurrentUserAuthor() {
      if (!this.project || !this.project.user) return false;
      const currentUserId = localStorage.getItem('userId');
      console.log('Current User ID:', currentUserId);
      return this.project.user._id === currentUserId;
    },
    totalSlides() {
      return this.project.sliderItems ? this.project.sliderItems.length : 0;
    },
    isAuthorOrParticipant() {
      if (!this.project || !this.currentUser) return false;
      return this.project.user._id === this.currentUser._id || this.project.participants.some(participant => participant._id === this.currentUser._id);
    },
    currentUser() {
      return JSON.parse(localStorage.getItem('user'));
    }

  },
  methods: {
    openFileUpload() {
      this.$refs.fileUpload.click();
    },
    getProjectImageUrl(imageName) {
      return `http://localhost:5000/uploads/project-images/${imageName}`;
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("uk-UA", options);
    },
    editProject() {
      this.$router.push(`/projects/${this.project._id}/edit`);
    },
    async deleteProject() {
      const confirmDelete = window.confirm("Ви впевнені, що хочете видалити цей проект?");
      if (confirmDelete) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`http://localhost:5000/api/projects/${this.project._id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.$router.push("/projects");
        } catch (error) {
          console.error("Error deleting project:", error);
        }
      }
    },
    async addComment() {
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('text', this.newComment);
        this.commentFiles.forEach((file) => {
          formData.append('files', file);
        });
        const response = await axios.post(
          `http://localhost:5000/api/projects/${this.project._id}/comments`,
          formData,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
        );
        const newComment = response.data;

        this.project.comments.push(newComment);
        this.newComment = '';
        this.commentFiles = [];
        this.$refs.fileUpload.value = '';
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    },
    async fetchProject() {
      const projectId = this.$route.params.id;
      try {
        const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`);
        this.project = response.data;
      } catch (error) {
        console.error('Помилка при завантаженні проекту:', error);
      }
    },
    getSliderItemUrl(filename) {
      return `http://localhost:5000/uploads/project-images/${filename}`;
    },
    prevSlide() {
      if (this.currentSlide > 0) {
        this.currentSlide--;
      }
    },
    nextSlide() {
      if (this.currentSlide < this.project.sliderItems.length - 1) {
        this.currentSlide++;
      }
    },
    goToSlide(index) {
      this.currentSlide = index;
    },
    async likeComment(commentId) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5000/api/projects/${this.project._id}/comments/${commentId}/like`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.fetchProject();
      } catch (error) {
        console.error('Error liking comment:', error);
      }
    },
    async dislikeComment(commentId) {
      try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:5000/api/projects/${this.project._id}/comments/${commentId}/dislike`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.fetchProject();
      } catch (error) {
        console.error('Error disliking comment:', error);
      }
    },
    hasLikedComment(comment) {
      return comment.likes && comment.likes.includes(this.currentUserId);
    },
    hasDislikedComment(comment) {
      return comment.dislikes && comment.dislikes.includes(this.currentUserId);
    },
    getCommentFileUrl(filename) {
      return `http://localhost:5000/uploads/comments-images/${filename}`;
    },
    handleFileUpload(event) {
      const files = event.target.files;
      if (this.commentFiles.length + files.length > 3) {
        alert('Можна прикріпити максимум 3 файли.');
        return;
      }
      this.commentFiles = [...this.commentFiles, ...Array.from(files)];
    },
    removeCommentFile(index) {
      this.commentFiles.splice(index, 1);
    },
    clearCommentFiles() {
      this.commentFiles = [];
    },
    isImage(filename) {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
      const extension = filename.slice(filename.lastIndexOf('.')).toLowerCase();
      return imageExtensions.includes(extension);
    },
    created() {
      this.fetchProject();
      const token = localStorage.getItem('token');
      if (token) {
        this.currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
      }
      // Сохраните данные пользователя в отдельную переменную
      if (this.project && this.project.user) {
        this.projectAuthor = {
          _id: this.project.user._id,
          firstName: this.project.user.firstName,
          lastName: this.project.user.lastName,
        };
      }
    },
    async fetchUsers() {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);

        if (!token) {
          throw new Error('Access token is missing');
        }

        const response = await axios.get('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.users = response.data;
      } catch (error) {
        console.error('Error fetching users:', error.message);
        // Дополнительная обработка ошибки, если требуется
      }
    },
    async likeProject() {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`http://localhost:5000/api/projects/${this.project._id}/like`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });



        // Сохраните копию комментариев с данными авторов
        const commentsWithAuthors = this.project.comments.map(comment => {
          return {
            ...comment,
            author: comment.author ? { ...comment.author } : null
          };
        });

        // Сохраните копию приглашенных пользователей
        const participantsWithData = this.project.participants.map(participant => {
          return { ...participant };
        });

        // Обновите this.project, сохраняя данные о пользователе и комментариях
        this.project = {
          ...response.data,
          user: this.project.user,
          comments: commentsWithAuthors,
          participants: participantsWithData
        };
      } catch (error) {
        console.error('Error liking project:', error);
      }
    },
    hasLikedProject() {
      return this.project.likes && this.project.likes.includes(this.currentUserId);
    },
    openInviteUserModal() {
      this.showInviteUserModal = true;
    },
    closeInviteUserModal() {
      this.showInviteUserModal = false;
    },
    async removeParticipant(participantId) {
      try {
        const projectId = this.$route.params.id;
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/projects/${projectId}/participants/${participantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.fetchProject();
      } catch (error) {
        console.error('Error removing participant:', error);
      }
    },
    getProfileImageUrl(imageName) {
      if (imageName) {
        return `http://localhost:5000/uploads/profile-images/${imageName}`;
      } else {
        return 'http://localhost:5000/uploads/profile-images/default-profile.jpg';
      }
    },
  },
};
</script>

<style scoped>
.project-details {
  max-width: 800px;
  margin: 0 auto;
  padding: 40px;
}

.project-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.project-header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}

.project-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-title {
  flex: 1;
}

.project-title h2 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #333;
}

.project-price {
  font-size: 24px;
  color: #888;
}

.project-info {
  margin-bottom: 40px;
}

.project-info h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.project-info p {
  font-size: 18px;
  color: #555;
  line-height: 1.5;
}

.project-skills ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.project-skills li {
  margin-bottom: 10px;
  font-size: 16px;
  color: #555;
}

.skill-type {
  font-weight: bold;
  color: #333;
}

.project-team {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.project-github a {
  color: #007bff;
  text-decoration: none;
}

.project-github a:hover {
  text-decoration: underline;
}

.project-author {
  margin-bottom: 20px;
}

.author-link {
  color: #007bff;
  text-decoration: none;
}

.author-link:hover {
  text-decoration: underline;
}

.project-created-at {
  margin-bottom: 20px;
}

.project-actions {
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-edit {
  background-color: #007bff;
  color: #fff;
  border: none;
  margin-right: 10px;
}

.btn-edit:hover {
  background-color: #0056b3;
}

.btn-delete {
  background-color: #dc3545;
  color: #fff;
  border: none;
}

.btn-delete:hover {
  background-color: #c82333;
}

.project-comments {
  margin-top: 40px;
}

.no-comments {
  font-size: 16px;
  color: #888;
  margin-bottom: 20px;
}

.comment {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.comment-author {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.comment-text {
  font-size: 16px;
  color: #555;
  margin-bottom: 10px;
}

.comment-date {
  font-size: 14px;
  color: #888;
}

.add-comment {
  margin-top: 20px;
}

.comment-input {
  width: 100%;
  height: 100px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  margin-bottom: 10px;
}

.btn-comment {
  background-color: #000000;
  color: #fff;
  border: none;
}

.btn-comment:hover {
  background-color: #707070;
}

.btn-comment:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #007bff;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #888;
  margin-top: 40px;
}

.project-contacts {
  margin-bottom: 20px;
}

.project-contacts h3 {
  margin-bottom: 10px;
}

.project-contacts div {
  margin-bottom: 5px;
}

.project-contacts span {
  font-weight: bold;
}

.prev-btn,
.next-btn {
  background-color: #333;
  color: #fff;
  border: none;
  padding: 5px 10px;
  margin: 0 5px;
  cursor: pointer;
}

.project-slider {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 400px;
}

.slider-container {
  display: flex;
  transition: transform 0.5s ease;
}

.slider-item {
  flex: 0 0 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slider-navigation {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
  display: flex;
  justify-content: space-between;
  z-index: 1;
}

.prev-btn,
.next-btn {
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  border: none;
  padding: 10px;
  font-size: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.prev-btn:hover,
.next-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.prev-btn:disabled,
.next-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.slider-dots {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
}

.slider-media {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slider-media img,
.slider-media video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  margin: 0 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dot.active {
  background-color: #fff;
}

.comment-files {
  margin-bottom: 10px;
}

.file-label {
  display: block;
  margin-bottom: 5px;
}

.file-input {
  display: block;
}

.comment {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-author {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.comment-date {
  font-size: 14px;
  color: #888;
}

.comment-text {
  font-size: 16px;
  color: #555;
  margin-bottom: 10px;
}

.comment-files {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.comment-file {
  margin-right: 10px;
  margin-bottom: 10px;
}

.comment-image {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-file-link {
  color: #007bff;
  text-decoration: none;
}

.comment-file-link:hover {
  text-decoration: underline;
}

.comment-actions {
  display: flex;
  align-items: center;
}

.btn-like,
.btn-dislike {
  background-color: transparent;
  border: none;
  cursor: pointer;
  margin-right: 10px;
  font-size: 16px;
  color: #555;
  transition: color 0.3s ease;
}

.btn-like:hover,
.btn-dislike:hover {
  color: #007bff;
}

.btn-like:disabled,
.btn-dislike:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.btn-like i,
.btn-dislike i {
  margin-right: 5px;
}

.comment-files {
  margin-bottom: 10px;
}

.file-upload-container {
  display: flex;
  flex-direction: column;
}

.file-upload-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.file-upload-slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f1f1f1;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.file-upload-slot.empty {
  background-color: #e0e0e0;
  cursor: pointer;
}

.file-upload-slot.empty i {
  font-size: 18px;
}

.file-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file-btn {
  background-color: transparent;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  margin-left: 5px;
}

.clear-files-btn {
  background-color: #e0e0e0;
  color: #333;
  border: none;
  padding: 5px 10px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
}

.file-upload-slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.file-upload-slot:hover {
  background-color: #e0e0e0;
}

.file-upload-slot.empty {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #ccc;
  cursor: pointer;
  transition: border-color 0.3s ease;
  padding: 20px;
}

.file-upload-slot.empty:hover {
  border-color: #888;
}

.upload-icon {
  font-size: 24px;
  margin-bottom: 5px;
  color: #888;
}

.upload-text {
  font-size: 14px;
  color: #888;
  text-align: center;
}

.file-info {
  display: flex;
  align-items: center;
}

.file-info i {
  margin-right: 5px;
  color: #888;
}

.file-name {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-file-btn {
  background-color: transparent;
  border: none;
  color: #888;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.remove-file-btn:hover {
  color: #ff5252;
}

.clear-files-btn {
  display: flex;
  align-items: center;
  background-color: #e0e0e0;
  color: #333;
  border: none;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  align-self: flex-end;
}

.clear-files-btn:hover {
  background-color: #ccc;
}

.clear-files-btn i {
  margin-right: 5px;
}

.project-likes {
  margin-left: 20px;
}

.btn-like {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 24px;
  color: #ff5252;
  transition: color 0.3s ease;
}

.btn-like:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.modal {
  display: block;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  margin: 15% auto;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}

.project-details {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px;
}

.project-container {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.project-header {
  display: flex;
  align-items: center;
  margin-bottom: 40px;
}

.project-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-right: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.project-title {
  flex: 1;
}

.project-title h2 {
  font-size: 32px;
  margin-bottom: 10px;
  color: #333;
}

.project-likes {
  margin-bottom: 10px;
}

.btn-like {
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: #333;
  transition: color 0.3s;
}

.btn-like:hover {
  color: #ff5252;
}

.btn-like:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.project-price {
  font-size: 24px;
  color: #333;
}

.project-info {
  margin-bottom: 40px;
}

.project-info h3 {
  font-size: 24px;
  margin-bottom: 10px;
  color: #333;
}

.project-info p {
  font-size: 18px;
  color: #666;
  line-height: 1.5;
}

.project-skills ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.project-skills li {
  margin-bottom: 10px;
  font-size: 16px;
  color: #666;
}

.skill-type {
  font-weight: bold;
  color: #333;
}

.project-team {
  background-color: #f8f8f8;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.project-github a {
  color: #333;
  text-decoration: none;
}

.project-github a:hover {
  text-decoration: underline;
}

.project-author {
  margin-bottom: 20px;
}

.author-link {
  color: #333;
  text-decoration: none;
}

.author-link:hover {
  text-decoration: underline;
}

.project-created-at {
  margin-bottom: 20px;
}

.project-actions {
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-edit {
  background-color: #333;
  color: #fff;
  border: none;
  margin-right: 10px;
}

.btn-edit:hover {
  background-color: #555;
}

.btn-delete {
  background-color: #fff;
  color: #333;
  border: 1px solid #333;
}

.btn-delete:hover {
  background-color: #f8f8f8;
}

.project-comments {
  margin-top: 40px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #333;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.loading {
  text-align: center;
  font-size: 18px;
  color: #888;
  margin-top: 40px;
}

.btn-secondary {
  background-color: #fff;
  color: #333;
  border: 1px solid #333;
  transition: background-color 0.3s ease;
}

.btn-secondary:hover {
  background-color: #f8f8f8;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f8f8f8;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  margin-right: 10px;
  margin-bottom: 10px;
}

.tag i {
  margin-right: 5px;
}

.btn-primary {
  background-color: #333;
  color: #fff;
  border: none;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #555;
}

.project-participants {
  margin-top: 40px;
}

.project-participants h3 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

.participant-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.participant-item {
  margin-bottom: 20px;
}

.participant-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.participant-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.participant-name {
  font-size: 18px;
}

.participant-link:hover .participant-name {
  text-decoration: underline;
}

.btn-invite {
  background-color: #333;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

.btn-invite:hover {
  background-color: #555;
}

.btn-remove {
  background-color: #dc3545;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-left: 10px;
  transition: background-color 0.3s;
}

.btn-remove:hover {
  background-color: #c82333;
}

.project-description p {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.participant-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.participant-info {
  display: flex;
  align-items: center;
}

.participant-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
}

.participant-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.participant-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.participant-details {
  flex-grow: 1;
}

.participant-name {
  font-size: 18px;
  font-weight: bold;
}

.btn-remove {
  background-color: #dc3545;
  color: #fff;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.btn-remove:hover {
  background-color: #c82333;
}

.project-actions {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.actions-row {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  margin: 0 10px;
  transition: background-color 0.3s ease;
}

.comment-list {
  max-height: 600px;
  overflow-y: auto;
}

.comment-list.scrollable {
  padding-right: 10px;
}

.chat-button-container {
  margin-top: 20px;
  padding: 0 20px;
  text-align: center;
}

.btn-chat {
  display: block;
  max-width: 100%;
  padding: 10px;
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-chat:hover {
  background-color: #585858;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.comment-author {
  display: flex;
  align-items: center;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.author-name {
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.author-name:hover {
  text-decoration: underline;
}
</style>
