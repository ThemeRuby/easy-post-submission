<script>
  import { ref, onMounted } from 'vue'
  import userPostsContent from './components/userPostContent.vue'

  export default {
    name: 'userPosts',
    components: {
      userPostsContent
    },
    setup() {
      const translate = rbGlobalSubmissionSettings.translate
      const loginURL = rbGlobalSubmissionSettings.loginUrl
      const registerURL = rbGlobalSubmissionSettings.registerURL

      const isRenderUI = ref(false)
      const requiredLoginTitle = ref('')
      const requiredLoginDesc = ref('')
      const loginLinkLabel = ref('')
      const registerLinkLabel = ref('')

      const getText = (key) => {
        return translate[key] || key
      }

      const loginMethod = () => {
        isRenderUI.value = rbsmUserPostsData?.isUserLogged ?? 0

        const userPostLoginAction =
          rbsmUserPostsData?.postManagerSettings?.user_profile
            ?.login_action_choice ?? 'show_login_message'

        if (!rbsmUserPostsData?.isUserLogged) {
          if (userPostLoginAction === 'show_login_message') {
            requiredLoginTitle.value =
              rbsmUserPostsData?.postManagerSettings?.user_profile
                ?.user_posts_required_login_title ??
              getText('userPostsRequiredLoginTitlePattern')
            requiredLoginDesc.value =
              rbsmUserPostsData?.postManagerSettings?.user_profile
                ?.user_posts_required_login_message ??
              getText('userPostsRequiredLoginMessagePattern')
            loginLinkLabel.value =
              rbsmUserPostsData?.postManagerSettings
                ?.custom_login_and_registration?.custom_login_button_label ??
              getText('login')
            registerLinkLabel.value =
              rbsmUserPostsData?.postManagerSettings
                ?.custom_login_and_registration
                ?.custom_registration_button_label ?? getText('register')
          } else {
            window.location.href =
              rbGlobalSubmissionSettings.loginUrl +
              `?redirect_to=${window.location.href}`
          }
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
        isRenderUI,
        translate,
        requiredLoginTitle,
        requiredLoginDesc,
        loginLinkLabel,
        registerLinkLabel,
        registerURL,
        loginURL,
        redirectToLogin,
        redirectToRegister
      }
    }
  }
</script>
<template>
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
  <userPostsContent v-if="isRenderUI" />
</template>
