<template>
  <div>
    <div class="permissions-container">
      <div class="permissions-header">
        <h2 class="permissions-title">Permission Roles</h2>
        <p>
          Create permission roles to easily grant people data access to teams
          and resources. To review team and member permissions for a specific
          team, you can visit that team’s Permission page. To learn more about
          {Product_name} permissions,&nbsp;<a
            class="underlinedText"
            @click="addRole"
            >click here.</a
          >
        </p>
        <div class="permission-actions">
          <div class="permission-filters">
            <span class="flex-item">1 role</span>
            <div class="search-container flex-item w-100">
              <el-input
                type="text"
                placeholder="Role / Team name"
                v-model="localSearchTerm"
                @input="emitChange('searchTerm', localSearchTerm)"
              />
            </div>
            <el-select
              v-model="selectedTime"
              class="time-dropdown custom-select flex-item w-100"
              popper-class="time-dropdown-popper"
              :fit-input-width="false"
            >
              <el-option
                v-for="option in timeOptions"
                :key="option"
                :value="option"
                :label="option"
                class="custom-option"
              />
            </el-select>
          </div>
          <AddPermissionRoleModal :permissions="permissions" />
        </div>
      </div>
      <el-table :data="permissions" border style="width: 100%">
        <el-table-column label="Permission" width="200">
          <template #default="{ row }">
            <div v-if="row.items">
              <strong class="table-label">{{ row.category }}</strong>
              <div
                v-for="item in row.items"
                :key="item.label"
                class="table-sub-label"
              >
                {{ item.label }}
              </div>
            </div>
            <div v-else>
              <strong>{{ row.category }}</strong>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="Project Manager">
          <template #default="{ row }">
            <div v-if="row.items">
              <div v-for="item in row.items" :key="item.label">
                <el-checkbox
                  v-model="item.checked"
                  :disabled="item.disabled"
                ></el-checkbox>
              </div>
            </div>
            <div
              v-else-if="row.category === 'Role Users'"
              class="role-users-column"
            >
              <div
                v-for="user in roleUsers"
                :key="user.name"
                class="item-alignment table-sub-label"
              >
                <el-avatar :src="user.avatar" size="small" />
                <span>{{ user.name }}</span>
              </div>
            </div>
            <div
              v-else-if="row.category === 'Role Access'"
              class="role-access-details table-sub-label"
            >
              <img
                src="https://img.icons8.com/?size=100&id=85575&format=png&color=000000"
                height="20px"
                width="20px"
              />
              <el-link
                href="#"
                type="primary"
                class="table-label all-resources-details"
                >All resources</el-link
              >
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script setup>
import { ElInput, ElSelect, ElTable } from "element-plus";
import AddPermissionRoleModal from "/components/AddPermissionRoleModal.vue";
const permissions = ref([
  {
    category: "Worklogs",
    items: [
      { label: "View worklogs", checked: true },
      { label: "Manage worklogs", checked: false },
      { label: "Approve timesheet", checked: true },
    ],
  },
  {
    category: "Team",
    items: [
      { label: "Manage team", checked: true },
      { label: "View team", checked: true },
    ],
  },
  {
    category: "Role Users",
  },
  {
    category: "Role Access",
  },
]);
const open = ref(false);
const roleUsers = [
  { name: "Abhishek Shah", avatar: "https://via.placeholder.com/150" },
  { name: "Dhaval Kukadia", avatar: "https://via.placeholder.com/150" },
];
const addRole = () => {
  console.log("Add permission role clicked");
  open.value = true;
};
</script>

<style scoped>
.permissions-header {
  padding: 20px;
  color: #172b4d;
}
.permissions-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0px !important;
  padding: 0px !important;
}
.permissions-header p {
  margin: 8px 0px 8px 0px;
  padding: 0px;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  text-align: left;
}
.w-100 {
  width: 200px;
}
.underlinedText {
  cursor: pointer;
  font-size: 14px !important;
  line-height: 21px;
  color: #4c9aff !important;
}
.all-resources-details,
.all-resources-details:hover {
  text-decoration: none !important;
  font-weight: 500 !important;
}
.permission-actions {
  display: flex;
  justify-content: space-between;
}
.permission-filters {
  display: flex;
  gap: 8px;
  align-items: center;
  flex: 1 1 2;
  font-size: 14px;
  font-weight: 400;
}
.permissions-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  color: #172b4d;
}
.permissions-table th,
.permissions-table td {
  padding: 8px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
.el-table th.el-table__cell {
  background-color: red;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  text-align: left;
  color: red;
}
.table-label {
  font-size: 14px;
  font-weight: 600;
  color: #172b4d;
}
.table-sub-label {
  font-size: 14px;
  font-weight: 400;
  margin-top: 12px;
  color: #172b4d;
}
.permission-table-col {
  align-items: center;
}
.el-table__cell {
  padding: 0px !important;
}
.el-table__header-wrapper .el-table__header {
  color: red;
}
.role-access-details {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.role-users-column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item-alignment {
  display: flex;
  align-items: center !important;
  gap: 8px;
}
</style>
