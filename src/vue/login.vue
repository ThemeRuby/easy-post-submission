<script>
  import { ref, onMounted } from 'vue'

  export default {
    name: 'login',
    setup() {
      const translate = rbGlobalSubmissionSettings.translate
      const requiredLoginTitle = ref('')
      const requiredLoginDesc = ref('')
      const loginLinkLabel = ref('')
      const loginURL = rbGlobalSubmissionSettings.loginUrl
      const registerURL = rbGlobalSubmissionSettings.registerURL

      const getText = (key) => {
        return translate[key] || key
      }

      const loginMethod = () => {
        const userPostLoginAction =
          rbGlobalSubmissionSettings?.postManagerSettings?.edit_post_form
            ?.login_action_choice ?? 'show_login_message'
        if (userPostLoginAction === 'show_login_message') {
          requiredLoginTitle.value =
            rbGlobalSubmissionSettings?.postManagerSettings?.edit_post_form
              ?.edit_post_required_login_title ||
            getText('editPostRequiredLoginTitlePattern')
          requiredLoginDesc.value =
            rbGlobalSubmissionSettings?.postManagerSettings?.edit_post_form
              ?.edit_post_required_login_message ||
            getText('editPostRequiredLoginMessagePattern')
          loginLinkLabel.value =
            rbGlobalSubmissionSettings?.postManagerSettings
              ?.custom_login_and_registration?.custom_login_button_label ||
            getText('login')
        } else {
          window.location.href =
            loginURL.value + `?redirect_to=${window.location.href}`
        }
      }

      const redirectToLogin = () => {
        window.location.href =
          loginURL.value + `?redirect_to=${window.location.href}`
      }

      const redirectToRegister = () => {
        window.location.href = registerURL.value
      }

      onMounted(() => {
        loginMethod()
      })

      return {
        requiredLoginTitle,
        requiredLoginDesc,
        loginLinkLabel,
        registerURL,
        loginURL,
        redirectToLogin,
        redirectToRegister
      }
    }
  }
</script>
<template>
  <div class="rbsm-login-wrap">
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
      {{ translate.register }}
    </button>
  </div>
</template>
