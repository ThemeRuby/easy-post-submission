<script>
  import { ref, onMounted } from 'vue'
  import submissionFormContent from './components/submissionFormContent.vue'

  export default {
    name: 'App',
    components: { submissionFormContent },
    setup() {
      const translate = rbGlobalSubmissionSettings.translate
      const loginURL = rbGlobalSubmissionSettings.loginUrl
      const registerURL = rbGlobalSubmissionSettings.registerURL
      const dialog = ref(false)
      const loginLinkLabel = ref('')
      const authorAccess = ref('only_logged_user')
      const loginType = ref('show_login_message')
      const formSettings = ref(null)
      const isRenderUI = ref(false)
      const isError = ref(false)
      const requiredLoginTitle = ref('')
      const requiredLoginDesc = ref('')
      const registerLinkLabel = ref('')

      const getText = (key) => {
        return translate[key] || key
      }

      const getFormSettings = () => {
        const formSettingsRaw = rbSubmissionForm.formSettings
        formSettings.value = JSON.parse(formSettingsRaw.data)
        authorAccess.value =
          formSettings.value?.user_login?.author_access ?? 'only_logged_user'
        loginLinkLabel.value =
          rbGlobalSubmissionSettings.postManagerSettings
            ?.custom_login_and_registration?.custom_login_button_label ||
          getText('login')
        requiredLoginTitle.value =
          formSettings.value?.user_login?.login_type?.required_login_title ||
          getText('requiredLoginTitlePattern')
        requiredLoginDesc.value =
          formSettings.value?.user_login?.login_type
            ?.required_login_title_desc || getText('requiredLoginDescPattern')
        registerLinkLabel.value =
          rbGlobalSubmissionSettings.postManagerSettings
            ?.custom_login_and_registration?.custom_registration_button_label ||
          getText('register')
        loginType.value = formSettings.value?.user_login?.login_type.type ?? ''
      }

      const checkUserLogin = () => {
        const isUserLogged = rbSubmissionForm?.isUserLogged ?? 0

        if (!isUserLogged) {
          if (authorAccess.value === 'only_logged_user') {
            if (loginType.value === 'show_login_messages')
              isRenderUI.value = false
            else
              window.location.href =
                loginURL.value + `?redirect_to=${window.location.href}`
          } else isRenderUI.value = true
        } else isRenderUI.value = true
      }

      const redirectToLogin = () =>
        (window.location.href =
          loginURL.value + `?redirect_to=${window.location.href}`)

      const redirectToRegister = () =>
        (window.location.href = registerURL.value)

      onMounted(() => {
        if (
          !rbSubmissionForm ||
          rbSubmissionForm.hasError ||
          !rbSubmissionForm.formSettings
        ) {
          isError.value = true
          return
        }

        getFormSettings()
        checkUserLogin()
      })

      return {
        dialog,
        loginURL,
        registerURL,
        isError,
        loginLinkLabel,
        authorAccess,
        loginType,
        formSettings,
        isRenderUI,
        requiredLoginTitle,
        requiredLoginDesc,
        registerLinkLabel,
        getFormSettings,
        checkUserLogin,
        redirectToLogin,
        getText,
        redirectToRegister
      }
    }
  }
</script>
<template>
  <template v-if="isError">
    <div class="rbsm-login-wrap">
      <span class="rbsm-login-icon"><v-icon>mdi-alert-circle</v-icon></span>
      <h2 class="headline">{{ getText('error') }}</h2>
      <p class="rbsm-login-desc">{{ getText('errorMessage') }}</p>
    </div>
  </template>
  <template v-else>
    <div v-if="!isRenderUI" class="rbsm-login-wrap">
      <span class="rbsm-login-icon"><v-icon>mdi-lock-outline</v-icon></span>
      <h2 class="headline">{{ requiredLoginTitle }}</h2>
      <p class="rbsm-login-desc">{{ requiredLoginDesc }}</p>
      <button class="rbsm-btn-primary is-btn" @click="redirectToLogin">
        {{ loginLinkLabel }}
      </button>
      <button
        v-if="registerURL !== ''"
        class="rbsm-btn-primary is-btn is-outlined"
        @click="redirectToRegister"
      >
        {{ registerLinkLabel }}
      </button>
    </div>
    <submissionFormContent v-if="isRenderUI" />
  </template>
</template>
