import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import App from "./App.vue";
import Register from "./components/RegisterComponent.vue";
import Login from "./components/LoginComponent.vue";
import DashboardComponent from "./components/DashboardComponent.vue";
import HomeComponent from "./components/HomeComponent.vue";
import CreateProjectComponent from "./components/CreateProjectComponent.vue";
import ProjectListComponent from "./components/ProjectListComponent.vue";
import ProjectDetailsComponent from "./components/ProjectDetailsComponent.vue";
import EditProjectComponent from "./components/EditProjectComponent.vue";
import UserProfileComponent from "./components/UserProfileComponent.vue";
import ProjectChatComponent from "./components/ProjectChatComponent.vue";

const app = createApp(App);

const routes = [
  { path: "/", component: HomeComponent },
  { path: "/register", component: Register },
  { path: "/login", component: Login },
  { path: "/dashboard", component: DashboardComponent },
  { path: "/create-project", component: CreateProjectComponent },
  { path: "/projects", component: ProjectListComponent },
  { path: "/projects/:id", component: ProjectDetailsComponent },
  { path: "/projects/:id/edit", component: EditProjectComponent },
  { path: "/user/:id", component: UserProfileComponent },
  { path: "/projects/:id/chat", component: ProjectChatComponent, meta: { requiresAuth: true }, },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

app.use(router);

app.mount("#app");
