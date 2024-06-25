<template>
  <div class="invitation-notification" v-if="invitation">
    <div class="invitation-header">
      <h4>Запрошення на проект</h4>
      <router-link :to="'/user/' + invitation.sender._id" class="sender-link">
        Від: {{ invitation.sender.firstName }} {{ invitation.sender.lastName }}
      </router-link>
    </div>
    <div class="invitation-content">
      <p>
        Вас запросили до проекту <strong>{{ invitation.project.title }}</strong>.
      </p>
      <div class="invitation-actions">
        <button @click="acceptInvitation" class="btn btn-accept">Прийняти</button>
        <button @click="declineInvitation" class="btn btn-decline">Відхилити</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['invitation'],
  methods: {
    acceptInvitation() {
      this.$emit('accept', this.invitation._id);
    },
    declineInvitation() {
      this.$emit('decline', this.invitation._id);
    },
  },
};
</script>

<style scoped>
.invitation-notification {
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 20px;
  margin-bottom: 20px;
}

.invitation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.invitation-header h4 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.sender-link {
  color: #007bff;
  text-decoration: none;
  font-size: 14px;
}

.sender-link:hover {
  text-decoration: underline;
}

.invitation-content p {
  margin-bottom: 10px;
}

.invitation-actions {
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
}

.btn-accept {
  background-color: #28a745;
  color: #fff;
  border: none;
}

.btn-accept:hover {
  background-color: #218838;
}

.btn-decline {
  background-color: #dc3545;
  color: #fff;
  border: none;
}

.btn-decline:hover {
  background-color: #c82333;
}
</style>