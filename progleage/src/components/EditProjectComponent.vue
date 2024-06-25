<template>
    <div class="edit-project">
        <h2>Редагувати проект</h2>
        <form @submit.prevent="updateProject">
            <div class="form-group">
                <label for="title">Назва проекту:</label>
                <input type="text" id="title" v-model="project.title" required>
            </div>
            <div class="form-group">
                <label for="description">Опис проекту:</label>
                <textarea id="description" v-model="project.description" required></textarea>
            </div>
            <div class="form-group">
                <label for="image">Зображення проекту:</label>
                <div class="dropzone" @click="selectImage" @dragover.prevent @drop.prevent="handleImageDrop">
                    <div class="image-preview" v-if="project.image">
                        <img :src="getImageUrl(project.image)" alt="Project Image" ref="imagePreview" />
                    </div>
                    <input type="file" ref="imageInput" @change="handleImageUpload" accept="image/*"
                        style="display: none;">
                    <p v-if="!project.image">Перетягніть зображення сюди або натисніть, щоб вибрати файл</p>
                </div>
            </div>

            <div class="form-group">
                <label>Слайдер:</label>
                <div v-for="(item, index) in project.sliderItems" :key="index" class="slider-item">
                    <div class="dropzone" @click="selectSliderItem(index)" @dragover.prevent
                        @drop.prevent="handleSliderItemDrop(index, $event)">
                        <img v-if="item.type === 'image'" :src="getSliderItemUrl(item)" alt="Slider Image">
                        <video v-else-if="item.type === 'video'" :src="getSliderItemUrl(item)" controls></video>
                        <p v-else>Перетягніть файл сюди або натисніть, щоб вибрати</p>
                        <input type="file" :ref="'sliderItemInput' + index"
                            @change="handleSliderItemUpload(index, $event)" accept="image/*, video/*"
                            :name="'sliderItems' + index" style="display: none;">
                    </div>
                </div>
            </div>

            <div class="form-group">
                <label for="price">Ціна проекту:</label>
                <div class="price-input">
                    <input type="number" id="price" v-model.number="project.price" min="0" @input="handlePriceInput"
                        @blur="handlePriceBlur">
                    <span class="price-currency">₴</span>
                </div>
                <div class="price-options" :class="{ 'disabled': project.price > 0 }">
                    <label class="price-option">
                        <input type="radio" value="договірна" v-model="project.priceType" :disabled="project.price > 0">
                        <span class="checkmark"></span>
                        Договірна
                    </label>
                    <label class="price-option">
                        <input type="radio" value="безкоштовно" v-model="project.priceType"
                            :disabled="project.price > 0">
                        <span class="checkmark"></span>
                        Безкоштовно
                    </label>
                </div>
            </div>
            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" v-model="project.isLookingForTeam">
                    <span class="checkmark"></span>
                    Шукаю додатковий персонал програмістів
                </label>
            </div>
            <div class="form-group" :class="{ 'disabled': !project.isLookingForTeam }">
                <label>Необхідні навички:</label>
                <div v-for="(skill, index) in project.requiredSkills" :key="index" class="skill-item">
                    <select v-model="skill.type">
                        <option value="Frontend">Frontend</option>
                        <option value="Backend">Backend</option>
                        <option value="SoftSkill">SoftSkill</option>
                        <option value="Custom">Custom</option>
                    </select>
                    <input type="text" v-model="skill.description" placeholder="Введіть опис навички">
                    <button type="button" @click="removeSkill(index)" class="remove-skill">&times;</button>
                </div>
                <button type="button" @click="addSkill" class="add-skill">Додати навичку</button>
            </div>

            <div class="form-group">
                <label class="checkbox-label">
                    <input type="checkbox" v-model="project.isPrivate">
                    <span class="checkmark"></span>
                    Приватний проект
                </label>
            </div>

            <div class="form-group">
                <label for="githubLink">Посилання на GitHub (необов'язково):</label>
                <input type="url" id="githubLink" v-model="project.githubLink"
                    placeholder="https://github.com/username/project">
            </div>
            <div class="form-group">
                <label for="contactPhone">Контактний телефон:</label>
                <input type="tel" id="contactPhone" v-model="project.contactPhone">
            </div>
            <div class="form-group">
                <label for="contactTelegram">Telegram:</label>
                <input type="text" id="contactTelegram" v-model="project.contactTelegram">
            </div>
            <div class="form-group">
                <label for="contactFacebook">Facebook:</label>
                <input type="text" id="contactFacebook" v-model="project.contactFacebook">
            </div>
            <div class="form-group">
                <label for="programmingLanguage">Мова програмування:</label>
                <div class="tag-input">
                    <select id="programmingLanguage" v-model="project.programmingLanguage">
                        <option value="">Виберіть мову програмування</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Python">Python</option>
                        <option value="Java">Java</option>
                        <!-- Добавьте другие языки программирования -->
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="programType">Тип програми:</label>
                <div class="tag-input">
                    <select id="programType" v-model="project.programType">
                        <option value="">Виберіть тип програми</option>
                        <option value="Веб-сайт">Веб-сайт</option>
                        <option value="Гра">Гра</option>
                        <option value="Прикладна програма">Прикладна програма</option>
                        <!-- Добавьте другие типы программ -->
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="completionStatus">Ступінь завершеності:</label>
                <div class="tag-input">
                    <select id="completionStatus" v-model="project.completionStatus">
                        <option value="">Виберіть ступінь завершеності</option>
                        <option value="Ідея">Ідея</option>
                        <option value="У розробці">У розробці</option>
                        <option value="Завершено">Завершено</option>
                    </select>
                </div>
            </div>
            <button type="submit">Зберегти зміни</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            project: {
                title: '',
                description: '',
                image: '',
                price: 0,
                priceType: '',
                isLookingForTeam: false,
                requiredSkills: [],
                githubLink: '',
                programmingLanguage: '',
                programType: '',
                completionStatus: '',
                contactPhone: '',
                contactTelegram: '',
                contactFacebook: '',
                isPrivate: false,
                sliderItems: [],
            },
        };
    },
    async created() {
        const projectId = this.$route.params.id;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:5000/api/projects/${projectId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            this.project = response.data;

            // Инициализация массива sliderItems с фиксированным количеством элементов
            this.project.sliderItems = this.project.sliderItems || [];
            while (this.project.sliderItems.length < 3) {
                this.project.sliderItems.push({ type: null, url: null, file: null });
            }
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    },
    methods: {
        async updateProject() {
            const projectId = this.$route.params.id;
            try {
                const token = localStorage.getItem('token');
                const formData = new FormData();
                formData.append('title', this.project.title);
                formData.append('description', this.project.description);
                if (this.project.image instanceof File) {
                    formData.append('image', this.project.image);
                }
                formData.append('price', this.project.price);
                formData.append('priceType', this.project.priceType);
                formData.append('isLookingForTeam', this.project.isLookingForTeam);

                // Преобразование массива requiredSkills в JSON-строку перед добавлением в formData
                const requiredSkillsJson = JSON.stringify(this.project.requiredSkills);
                formData.append('requiredSkills', requiredSkillsJson);

                formData.append('githubLink', this.project.githubLink);
                formData.append('programmingLanguage', this.project.programmingLanguage);
                formData.append('programType', this.project.programType);
                formData.append('completionStatus', this.project.completionStatus);
                formData.append('contactPhone', this.project.contactPhone);
                formData.append('contactTelegram', this.project.contactTelegram);
                formData.append('contactFacebook', this.project.contactFacebook);
                formData.append('isPrivate', this.project.isPrivate);

                this.project.sliderItems.forEach((item) => {
                    if (item.file) {
                        formData.append('sliderItems', item.file);
                    } else if (item.url) {
                        formData.append('existingSliderItems', item.url);
                    }
                });

                const response = await axios.put(`http://localhost:5000/api/projects/${projectId}`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Project updated:', response.data);
                this.$router.push(`/projects/${projectId}`);
            } catch (error) {
                console.error('Error updating project:', error);
            }
        },
        getImageUrl(imageName) {
            return `http://localhost:5000/uploads/project-images/${imageName}`;
        },
        selectImage() {
            this.$refs.imageInput.click();
        },
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.project.image = file;
                this.updateImagePreview();
            }
        },
        handleImageDrop(event) {
            const file = event.dataTransfer.files[0];
            if (file) {
                this.project.image = file;
                this.updateImagePreview();
            }
        },
        updateImagePreview() {
            if (this.project.image instanceof File) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.$refs.imagePreview.src = e.target.result;
                };
                reader.readAsDataURL(this.project.image);
            }
        },
        addSkill() {
            this.project.requiredSkills.push({ type: 'Frontend', description: '' });
        },
        removeSkill(index) {
            this.project.requiredSkills.splice(index, 1);
        },
        selectSliderItem(index) {
            this.$refs['sliderItemInput' + index][0].click();
        },
        handleSliderItemUpload(index, event) {
            const file = event.target.files[0];
            if (file) {
                const fileType = file.type.startsWith('image') ? 'image' : 'video';
                this.project.sliderItems[index] = {
                    type: fileType,
                    url: URL.createObjectURL(file),
                    file: file,
                };
            }
        },
        handleSliderItemDrop(index, event) {
            const file = event.dataTransfer.files[0];
            if (file) {
                const fileType = file.type.startsWith('image') ? 'image' : 'video';
                this.project.sliderItems[index] = {
                    type: fileType,
                    url: URL.createObjectURL(file),
                    file: file,
                };
            }
        },
        getSliderItemUrl(item) {
            if (item.file) {
                return URL.createObjectURL(item.file);
            } else if (item.url) {
                return `http://localhost:5000/uploads/project-images/${item.url}`;
            } else {
                return '';
            }
        },
    },
};
</script>

<style scoped>
.create-project {
    max-width: 500px;
    margin: 0 auto;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 5px;
}

input,
textarea {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border-radius: 4px;
    border: 1px solid #ccc;
}

button {
    padding: 10px 20px;
    font-size: 16px;
    background-color: #333;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.dropzone {
    border: 2px dashed #ccc;
    border-radius: 4px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
}

.dropzone input[type="file"] {
    display: none;
}

.preview-image {
    max-width: 200px;
    max-height: 200px;
    margin-top: 10px;
}

.price-options {
    margin-top: 10px;
}

.price-options label {
    margin-right: 10px;
}

.price-input {
    position: relative;
}

.price-currency {
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-50%);
    font-size: 18px;
    color: #888;
}

.price-options {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
}

.price-option {
    display: flex;
    align-items: center;
    margin-right: 20px;
    cursor: pointer;
}

.price-option input[type="radio"] {
    display: none;
}

.checkmark {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2px solid #ccc;
    margin-right: 5px;
    position: relative;
    transition: border-color 0.3s;
}

.price-option input[type="radio"]:checked+.checkmark {
    border-color: #333;
}

.price-option input[type="radio"]:checked+.checkmark:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #333;
}

.price-options.disabled .price-option {
    opacity: 0.5;
    cursor: not-allowed;
}

.checkbox-label {
    display: flex;
    align-items: center;
    cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
    display: none;
}

.checkbox-label .checkmark {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 2px solid #ccc;
    margin-right: 10px;
    position: relative;
    transition: border-color 0.3s, background-color 0.3s;
}

.checkbox-label input[type="checkbox"]:checked+.checkmark {
    border-color: #333;
    background-color: #333;
}

.checkbox-label input[type="checkbox"]:checked+.checkmark:before {
    content: "\2713";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
    font-size: 14px;
}

.form-group.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.skill-item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
}

.skill-item select {
    margin-right: 10px;
}

.skill-item input[type="text"] {
    flex: 1;
    margin-right: 10px;
}

.remove-skill {
    background-color: transparent;
    border: none;
    color: red;
    font-size: 18px;
    cursor: pointer;
}

.add-skill {
    background-color: #333;
    color: #fff;
    border: none;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
}

.price-options.disabled .price-option {
    opacity: 0.5;
    cursor: not-allowed;
}

.price-options.disabled .price-option input[type="radio"]:checked+.checkmark {
    border-color: #ccc;
}

.price-options.disabled .price-option input[type="radio"]:checked+.checkmark:before {
    background-color: #ccc;
}

.dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #ccc;
    border-radius: 4px;
    padding: 10px;
    cursor: pointer;
}

.image-preview img {
    max-width: 300px;
    max-height: 300px;
    object-fit: cover;
    border-radius: 4px;
}

.slider-items {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 20px;
}

.slider-item {
    position: relative;
}

.slider-item .dropzone {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 200px;
    border: 2px dashed #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.3s;
}

.slider-item .dropzone:hover {
    border-color: #888;
}

.slider-item img,
.slider-item video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.remove-btn {
    display: block;
    margin-top: 10px;
    padding: 5px 10px;
    background-color: #ff5252;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.remove-btn:hover {
    background-color: #ff1744;
}

.add-slider-item {
    background-color: #333;
    color: #fff;
    border: none;
    padding: 8px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.add-slider-item:hover {
    background-color: #555;
}

.tag-input {
    margin-top: 5px;
}

.tag-input select {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border-radius: 4px;
    border: 1px solid #ccc;
    box-sizing: border-box;
}

.slider-items {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    margin-bottom: 20px;
}

.slider-item {
    position: relative;
    margin-bottom: 20px;
}

.slider-item .dropzone {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 200px;
    border: 2px dashed #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.3s;
}

.slider-item .dropzone:hover {
    border-color: #888;
}

.slider-item img,
.slider-item video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}
</style>