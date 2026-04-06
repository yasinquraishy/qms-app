<script setup>
import LoginForm from '@/components/auth/LoginForm.vue'
import TimezoneDropdown from '@/components/common/TimezoneDropdown.vue'
import { useCompanyForm } from '@/composables/useCompanyForm.js'
import { currentSession, initSession, logoutCurrentSession } from '@/utils/currentSession.js'

defineOptions({
  name: 'SignupPage',
})

const props = defineProps({
  isAddClient: {
    type: Boolean,
    default: false,
  },
})

// Session state
const sessionLoading = ref(true)

// Use company form composable
const { companyForm, isSubmitting, submitError, signup, getCompanyNameFromEmail, isPersonalEmail } =
  useCompanyForm(props, false)

// Check authentication and initialize session
async function checkSession() {
  try {
    await initSession()

    // If user already has companies, redirect to first company
    const companies = currentSession.value?.companies
    if (companies && Object.keys(companies).length > 0) {
      const firstCompanyCode = Object.values(companies)[0].code
      window.location.href = `/${firstCompanyCode}/`
      return
    }

    // If authenticated with work email, pre-fill company name
    if (currentSession.value?.email && !isPersonalEmail.value) {
      const suggestedName = getCompanyNameFromEmail(currentSession.value.email)
      if (suggestedName && !companyForm.name) {
        companyForm.name = suggestedName
      }
    }
  } finally {
    sessionLoading.value = false
  }
}

// Handle successful authentication from login component
function handleAuthenticated() {
  checkSession()
}

// Initialize timezones and check session
onMounted(async () => {
  await checkSession()
})
</script>

<template>
  <div
    v-if="sessionLoading"
    class="tw:w-full tw:h-full tw:flex tw:flex-col tw:items-center tw:justify-center"
  >
    <QSpinner color="primary" size="50px" />
    <div class="tw:text-secondary tw:mt-4">Loading...</div>
  </div>

  <!-- Show Login if not authenticated -->
  <div v-else-if="!currentSession?.email" class="signup-page">
    <div class="signup-container">
      <!-- Left side - Branding -->
      <div class="signup-branding">
        <div class="branding-content">
          <div class="row items-center">
            <WIcon name="verified" size="48px" color="white" />
            <h1 class="branding-title">QMS</h1>
          </div>
          <p class="branding-subtitle">Quality Management System</p>
          <div class="branding-features">
            <div class="tw:flex tw:items-center tw:gap-2 tw:mb-2">
              <WIcon name="check_circle" size="20px" color="white" />
              <span>Sign In to Continue</span>
            </div>
            <div class="tw:flex tw:items-center tw:gap-2 tw:mb-2">
              <WIcon name="check_circle" size="20px" color="white" />
              <span>Create Your Organization</span>
            </div>
            <div class="tw:flex tw:items-center tw:gap-2">
              <WIcon name="check_circle" size="20px" color="white" />
              <span>Start Managing Quality</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Login Form -->
      <div class="signup-form-section tw:flex tw:flex-col tw:items-center tw:justify-center tw:p-8">
        <LoginForm mode="signup" @authenticated="handleAuthenticated" />

        <div class="tw:text-xs tw:text-secondary tw:text-center tw:mt-6">
          © 2026 Quality Management System. All rights reserved.
        </div>
      </div>
    </div>
  </div>

  <!-- Show Signup Form if authenticated -->
  <div v-else class="signup-page">
    <div class="signup-container">
      <!-- Left side - Branding -->
      <div class="signup-branding">
        <div class="branding-content">
          <WIcon name="verified" size="48px" color="white" />
          <h1 class="branding-title">QMS</h1>
          <p class="branding-subtitle">Quality Management System</p>
          <div class="branding-features">
            <div class="tw:flex tw:items-center tw:gap-2 tw:mb-4">
              <WIcon name="check_circle" size="20px" color="white" />
              <span>Create Your Organization</span>
            </div>
            <div class="tw:flex tw:items-center tw:gap-2 tw:mb-4">
              <WIcon name="check_circle" size="20px" color="white" />
              <span>Invite Your Team</span>
            </div>
            <div class="tw:flex tw:items-center tw:gap-2">
              <WIcon name="check_circle" size="20px" color="white" />
              <span>Start Managing Quality</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right side - Signup Form -->
      <div class="signup-form-section column items-center justify-center q-pa-xl">
        <WCard class="signup-card" flat>
          <!-- User Info Header -->
          <QCardSection class="bg-grey-1 q-pb-md">
            <div class="row items-center justify-between">
              <div class="column">
                <div class="text-caption text-grey-6">Signing up as</div>
                <div class="text-body1 text-weight-medium">{{ currentSession?.email }}</div>
              </div>
              <WBtn
                flat
                noCaps
                dense
                color="negative"
                icon="logout"
                label="Sign Out"
                @click="logoutCurrentSession"
              />
            </div>
          </QCardSection>

          <QCardSection class="q-pb-sm">
            <div class="text-h5 text-weight-bold text-grey-9">Create Your Organization</div>
            <div class="text-body2 text-grey-6 q-mt-xs">Set up your company workspace</div>
          </QCardSection>

          <QCardSection class="q-pt-lg">
            <form class="column q-gutter-md" @submit="signup">
              <!-- Company Name -->
              <WInput
                v-model="companyForm.name"
                label="Company Name"
                outlined
                dense
                :disable="isSubmitting"
                :error="companyForm.submitted && !companyForm.name.trim()"
                errorMessage="Company name is required"
              >
                <template #prepend>
                  <WIcon name="business" />
                </template>
              </WInput>

              <!-- Company Code -->
              <WInput
                v-model="companyForm.code"
                label="Company Code"
                outlined
                dense
                :disable="isSubmitting"
                :error="companyForm.submitted && !companyForm.code.trim()"
                :errorMessage="
                  companyForm.isAvailable === false
                    ? 'This code is not available'
                    : 'Company code is required'
                "
                :hint="companyForm.isAvailable === true ? 'This code is available' : ''"
              >
                <template #prepend>
                  <WIcon name="tag" />
                </template>
                <template #append>
                  <WIcon v-if="companyForm.isChecking" name="progress_activity" class="rotating" />
                  <WIcon
                    v-else-if="companyForm.isAvailable === true"
                    name="check_circle"
                    color="positive"
                  />
                  <WIcon
                    v-else-if="companyForm.isAvailable === false"
                    name="cancel"
                    color="negative"
                  />
                </template>
              </WInput>

              <!-- Timezone -->
              <TimezoneDropdown
                v-model="companyForm.defaultTimeZone"
                label="Timezone"
                outlined
                dense
                :disable="isSubmitting"
              >
                <template #prepend>
                  <WIcon name="schedule" />
                </template>
              </TimezoneDropdown>

              <!-- Error Message -->
              <div v-if="submitError" class="text-negative text-caption">
                {{ submitError }}
              </div>

              <!-- Submit Button -->
              <WBtn
                unelevated
                noCaps
                color="primary"
                type="submit"
                class="full-width q-mt-md"
                :loading="isSubmitting"
                :disable="!companyForm.isValid || companyForm.isAvailable === false"
              >
                Create Organization
              </WBtn>
            </form>
          </QCardSection>

          <QCardSection class="q-pt-xl">
            <QSeparator />
            <div class="text-caption text-grey-5 text-center q-mt-md">
              Already have an account?
              <a href="/login" class="text-primary">Sign In</a>
            </div>
          </QCardSection>
        </WCard>

        <div class="text-caption text-grey-5 text-center q-mt-xl">
          © 2026 Quality Management System. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.signup-page {
  min-height: 100vh;
  background-color: $grey-2;
}

.signup-container {
  display: flex;
  min-height: 100vh;
}

.signup-branding {
  flex: 1;
  background: linear-gradient(135deg, $indigo-10 0%, $indigo-8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  color: white;

  @media (max-width: 900px) {
    display: none;
  }
}

.branding-content {
  max-width: 400px;
}

.branding-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 8px 8px;
  letter-spacing: -0.5px;
}

.branding-subtitle {
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 48px;
}

.signup-form-section {
  flex: 1;
  background-color: white;

  @media (max-width: 900px) {
    min-height: 100vh;
  }
}

.signup-card {
  width: 100%;
  max-width: 500px;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

a {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
