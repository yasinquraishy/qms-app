<script setup>
import { useUsers } from '@/composables/useUsers.js'
import { provideRoles } from '@/composables/useRoles.js'
import { currentSession } from '@/utils/currentSession'

const open = defineModel({
  type: Boolean,
  default: false,
})

const { users, loading, fetchUsers } = useUsers()
const showCreateUserDialog = ref(false)
const currentUserId = computed(() => currentSession.value?.userId)

provideRoles()

function onUserCreated() {
  fetchUsers()
}

function finish() {
  open.value = false
  // Remove onboarding query param from URL
  const url = new URL(window.location)
  url.searchParams.delete('onboarding')
  window.history.replaceState({}, '', url)
}
</script>

<template>
  <QDialog
    v-model="open"
    persistent
    maximized
    transitionShow="slide-up"
    transitionHide="slide-down"
  >
    <div class="tw:flex tw:items-center tw:justify-center tw:min-h-screen tw:bg-black/50 tw:p-6">
      <WCard flat class="tw:w-full tw:max-w-2xl tw:rounded-2xl">
        <!-- Header -->
        <QCardSection class="tw:pb-0">
          <div class="tw:flex tw:items-center tw:gap-3 tw:mb-2">
            <div
              class="tw:bg-primary tw:flex tw:items-center tw:justify-center tw:rounded-xl tw:size-12 tw:text-white"
            >
              <WIcon name="group_add" size="28px" />
            </div>
            <div>
              <div class="tw:text-2xl tw:font-bold tw:text-on-main">Invite Your Team</div>
              <div class="tw:text-sm tw:text-secondary">
                Add team members to get started. You can always add more later.
              </div>
            </div>
          </div>
        </QCardSection>

        <!-- User List -->
        <QCardSection class="tw:pt-4">
          <div class="tw:flex tw:items-center tw:justify-between tw:mb-3">
            <div class="tw:text-sm tw:font-semibold tw:text-secondary">
              Team Members ({{ users.length }})
            </div>
            <WBtn
              color="primary"
              icon="person_add"
              label="Add User"
              unelevated
              noCaps
              dense
              @click="showCreateUserDialog = true"
            />
          </div>

          <div v-if="loading" class="tw:flex tw:justify-center tw:py-8">
            <QSpinner color="primary" size="32px" />
          </div>

          <div
            v-else-if="users.length === 0"
            class="tw:flex tw:flex-col tw:items-center tw:py-8 tw:text-secondary"
          >
            <WIcon name="group" size="48px" class="tw:mb-2 tw:opacity-40" />
            <div class="tw:text-sm">No team members added yet</div>
            <div class="tw:text-xs tw:mt-1">Click "Add User" to invite your first team member</div>
          </div>

          <QList
            v-else
            separator
            class="tw:rounded-lg tw:border tw:border-divider tw:max-h-80 tw:overflow-auto"
          >
            <QItem v-for="user in users" :key="user.id" class="tw:py-3">
              <QItemSection avatar>
                <UserAvatar
                  :user="{ ...user, fullName: `${user.firstName} ${user.lastName}` }"
                  class="tw:size-10"
                />
              </QItemSection>
              <QItemSection>
                <QItemLabel class="tw:font-medium tw:text-on-main">
                  {{ user.firstName }} {{ user.lastName }}
                </QItemLabel>
                <QItemLabel caption>{{ user.email }}</QItemLabel>
              </QItemSection>
              <QItemSection v-if="user.id !== currentUserId" side>
                <QChip
                  v-if="user.inviteSent"
                  color="positive"
                  textColor="white"
                  size="sm"
                  dense
                  label="Invited"
                />
                <QChip v-else color="grey" textColor="white" size="sm" dense label="Not Invited" />
              </QItemSection>
            </QItem>
          </QList>
        </QCardSection>

        <!-- Actions -->
        <QCardSection class="tw:flex tw:justify-end tw:items-center tw:gap-2 tw:pt-2">
          <WBtn flat noCaps color="primary" label="Skip for now" @click="finish" />
          <WBtn
            v-if="users.length > 0"
            unelevated
            noCaps
            color="primary"
            icon="check"
            label="Done"
            @click="finish"
          />
        </QCardSection>
      </WCard>
    </div>

    <!-- Create User Dialog -->
    <UsersCreateUserDialog v-model="showCreateUserDialog" @created="onUserCreated" />
  </QDialog>
</template>
