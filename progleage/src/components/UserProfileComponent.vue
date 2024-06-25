<template>
    <div class="user-profile">
        <h2>Профіль користувача</h2>
        <div class="profile-info">
            <div class="profile-image">
                <img :src="getProfileImageUrl(user.profileImage)" alt="Фото профілю" />
            </div>
            <div class="profile-details">
                <div v-if="user.lastLogin" class="profile-field">
                    <strong>Останній вхід:</strong> {{ formatDate(user.lastLogin) }}
                </div>
                <h3>{{ user.firstName }} {{ user.lastName }}</h3>
                <p v-if="user.bio">{{ user.bio }}</p>
                <div v-if="user.email" class="profile-field">
                    <strong>Email:</strong> {{ user.email }}
                </div>
                <div v-if="user.phone" class="profile-field">
                    <strong>Телефон:</strong> {{ user.phone }}
                </div>
                <div v-if="user.city" class="profile-field">
                    <strong>Місто:</strong> {{ user.city }}
                </div>
                <div v-if="user.region" class="profile-field">
                    <strong>Область:</strong> {{ user.region }}
                </div>
                <div v-if="user.portfolio" class="profile-field portfolio">
                    <strong>Портфоліо:</strong>
                    <a :href="user.portfolio" target="_blank" class="portfolio-link">
                        <i class="fas fa-link"></i>
                        <span class="portfolio-text">{{ user.portfolio }}</span>
                    </a>
                </div>
                <div v-if="user.socialMedia1 || user.socialMedia2 || user.socialMedia3"
                    class="profile-field social-media">
                    <strong>Соціальні мережі:</strong>
                    <ul class="social-media-list">
                        <li v-if="user.socialMedia1" class="social-media-item">
                            <a :href="user.socialMedia1" target="_blank" class="social-media-link">
                                <i class="fas fa-link"></i>
                                <span class="social-media-text">{{ user.socialMedia1 }}</span>
                            </a>
                        </li>
                        <li v-if="user.socialMedia2" class="social-media-item">
                            <a :href="user.socialMedia2" target="_blank" class="social-media-link">
                                <i class="fas fa-link"></i>
                                <span class="social-media-text">{{ user.socialMedia2 }}</span>
                            </a>
                        </li>
                        <li v-if="user.socialMedia3" class="social-media-item">
                            <a :href="user.socialMedia3" target="_blank" class="social-media-link">
                                <i class="fas fa-link"></i>
                                <span class="social-media-text">{{ user.socialMedia3 }}</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="user-projects">
            <div class="project-section">
                <h3>Автор проектів</h3>
                <div v-if="userProjects.length === 0" class="no-projects">
                    Користувач не є автором жодного проекту.
                </div>
                <div v-else class="project-list">
                    <router-link v-for="project in userProjects" :key="project._id" :to="'/projects/' + project._id"
                        class="project-button">
                        {{ project.title }}
                    </router-link>
                </div>
            </div>

            <div class="project-section">
                <h3>Учасник проектів</h3>
                <div v-if="participatingProjects.length === 0" class="no-projects">
                    Користувач не бере участі в жодному проекті.
                </div>
                <div v-else class="project-list">
                    <router-link v-for="project in participatingProjects" :key="project._id"
                        :to="'/projects/' + project._id" class="project-button">
                        {{ project.title }}
                    </router-link>
                </div>
            </div>
        </div>

        <div class="profile-comments">
            <h3>Коментарі</h3>
            <div v-if="user.comments && user.comments.length === 0" class="no-comments">
                Поки що немає коментарів. Будьте першим, хто залишить коментар!
            </div>
            <div v-else-if="user.comments && user.comments.length > 0" class="comment-list">
                <div v-for="comment in user.comments" :key="comment._id" class="comment">
                    <div class="comment-header">
                        <div class="comment-author">
                            <img :src="getProfileImageUrl(comment.author.profileImage, true)" alt="Profile Image"
                                class="profile-image-small" />
                            <router-link :to="'/user/' + comment.author._id" class="author-name">
                                {{ comment.author.firstName }} {{ comment.author.lastName }}
                            </router-link>
                        </div>
                    </div>
                    <p class="comment-text">{{ comment.text }}</p>
                    <div v-if="comment.files && comment.files.length > 0" class="comment-files">
                        <div v-for="(file, index) in comment.files" :key="index" class="comment-file">
                            <img v-if="isImage(file)" :src="getCommentFileUrl(file)" alt="Comment Image"
                                class="comment-image" />
                            <a v-else :href="getCommentFileUrl(file)" target="_blank" class="comment-file-link">{{ file
                                }}</a>
                        </div>
                    </div>
                    <div class="comment-actions">
                        <button @click="likeComment(comment._id)" :disabled="hasLikedComment(comment)" class="btn-like">
                            <i class="fas fa-thumbs-up"></i> {{ comment.likes ? comment.likes.length : 0 }}
                        </button>
                        <button @click="dislikeComment(comment._id)" :disabled="hasDislikedComment(comment)"
                            class="btn-dislike">
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
                        <input type="file" ref="fileUpload" @change="handleFileUpload" accept="image/*, video/*"
                            multiple style="display: none;">
                    </div>
                    <button @click="clearCommentFiles" class="clear-files-btn" v-if="commentFiles.length > 0">
                        <i class="fas fa-trash"></i> Очистити файли
                    </button>
                </div>
                <button @click="addComment" :disabled="!newComment" class="btn btn-comment">Відправити</button>
            </div>
        </div>
    </div>

</template>

<script>
import axios from 'axios';


export default {
    data() {
        return {
            user: {},
            newComment: '',
            commentFiles: [],
            userProjects: [],
            participatingProjects: [],
        };
    },
    async created() {
        await this.fetchUserProfile();
    },
    watch: {
        '$route.params.id': {
            immediate: true,
            handler() {
                this.fetchUserProfile();
            },
        },
    },
    methods: {
        async fetchUserProfile() {
            const userId = this.$route.params.id;
            try {
                const response = await axios.get(`http://localhost:5000/api/users/${userId}`);
                this.user = response.data;

                // Загрузка проектов пользователя
                const projectsResponse = await axios.get(`http://localhost:5000/api/users/${userId}/projects`);
                this.userProjects = projectsResponse.data;

                // Загрузка проектов, в которых пользователь является участником
                const participatingResponse = await axios.get(`http://localhost:5000/api/users/${userId}/participating-projects`);
                this.participatingProjects = participatingResponse.data;

                const token = localStorage.getItem('token');
                if (token) {
                    this.currentUserId = JSON.parse(atob(token.split('.')[1])).userId;
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        },
        getProfileImageUrl(profileImage, small = false) {
            if (profileImage) {
                return `http://localhost:5000/uploads/profile-images/${profileImage}`;
            } else {
                return small ? 'http://localhost:5000/uploads/profile-images/default-profile-small.jpg' : 'http://localhost:5000/uploads/profile-images/default-profile.jpg';
            }
        },
        formatDate(dateString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
            return new Date(dateString).toLocaleString('uk-UA', options);
        },
        openFileUpload() {
            this.$refs.fileUpload.click();
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
        getCommentFileUrl(filename) {
            return `http://localhost:5000/uploads/comments-images/${filename}`;
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
                    `http://localhost:5000/api/users/${this.user._id}/comments`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
                );
                const newComment = response.data;

                // Получение информации о профиле автора комментария
                const authorResponse = await axios.get(`http://localhost:5000/api/users/${newComment.author}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const author = authorResponse.data;

                newComment.author = {
                    _id: author._id,
                    firstName: author.firstName,
                    lastName: author.lastName,
                    profileImage: author.profileImage, // Добавление поля profileImage
                };

                this.user.comments.push(newComment);
                this.newComment = '';
                this.commentFiles = [];
                this.$refs.fileUpload.value = '';
            } catch (error) {
                console.error('Error adding comment:', error);
            }
        },
        async likeComment(commentId) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`http://localhost:5000/api/users/${this.user._id}/comments/${commentId}/like`, null, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                this.fetchUserProfile();
            } catch (error) {
                console.error('Error liking comment:', error);
            }
        },
        async dislikeComment(commentId) {
            try {
                const token = localStorage.getItem('token');
                await axios.post(`http://localhost:5000/api/users/${this.user._id}/comments/${commentId}/dislike`, null, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                this.fetchUserProfile();
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

    },
};
</script>

<style scoped>
.user-profile {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.profile-info {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
}

.profile-image {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 20px;
}

.profile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.profile-details {
    flex-grow: 1;
}

.profile-field {
    margin-bottom: 10px;
}

.profile-field ul {
    list-style-type: none;
    padding: 0;
}

.profile-comments {
    margin-top: 40px;
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

.add-comment {
    margin-top: 20px;
}

.comment-input {
    width: 100%;
    height: 100px;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
    margin-bottom: 10px;
}

.btn-comment {
    background-color: #000000;
    color: #fff;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.btn-comment:hover {
    background-color: #707070;
}

.btn-comment:disabled {
    background-color: #ccc;
    cursor: not-allowed;
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

.user-projects {
    margin-top: 40px;
}

.project-section {
    margin-bottom: 20px;
}

.project-section h3 {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
}

.project-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.project-button {
    padding: 8px 16px;
    background-color: #bbbbbb;
    color: #333;
    text-decoration: none;
    border-radius: 4px;
    transition: background-color 0.3s;
}

.project-button:hover {
    background-color: #e0e0e0;
}

.no-projects {
    color: #888;
    font-style: italic;
    margin-top: 5px;
}

.comment-list {
    max-height: 600px;
    overflow-y: auto;
}

.comment-list.scrollable {
    padding-right: 10px;
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

.profile-image {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 20px;
}

.profile-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.profile-image-small {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
}

.social-media {
    margin-top: 20px;
}

.social-media-list {
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.social-media-item {
    margin-bottom: 10px;
}

.social-media-link {
    display: flex;
    align-items: center;
    color: #333;
    text-decoration: none;
    font-size: 16px;
    padding: 10px;
    border-radius: 4px;
    background-color: #f5f5f5;
    transition: background-color 0.3s;
}

.social-media-link:hover {
    background-color: #e0e0e0;
}

.social-media-link i {
    font-size: 20px;
    margin-right: 10px;
    color: #333;
}

.social-media-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.portfolio {
    margin-top: 20px;
}

.portfolio-link {
    display: flex;
    align-items: center;
    color: #333;
    text-decoration: none;
    font-size: 16px;
    padding: 10px;
    border-radius: 4px;
    background-color: #f5f5f5;
    transition: background-color 0.3s;
}

.portfolio-link:hover {
    background-color: #e0e0e0;
}

.portfolio-link i {
    font-size: 20px;
    margin-right: 10px;
    color: #333;
}

.portfolio-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
</style>