<script setup>
  import { ref, watch } from 'vue'
  import submissionFormContent from './components/submissionFormContent.vue'
  import userPostsContent from './components/submissionFormContent.vue'

  defineOptions({ name: 'postManager' })

  const tab = ref(0)
  const dialog = ref(false)
  const loginMessage = ref('')
  const loginLinkUrl = ref('')
  const isRenderUI = ref(false)
  const loginLinkLabel = ref('')
  const formSettings = ref(null)
  const loginType = ref('show_login_message')
  const translate = ref(rbGlobalSubmissionSettings.translate)
  const tab2TextLabel = ref(rbGlobalSubmissionSettings.translate.submitPost)
  let yesStorage = false
  let authorAccess = 'only_logged_user'

  watch(tab, (newValue) => {
    setStorage('rbsm_client_tab', newValue)
  })

  yesStorage = isStorageAvailable()

  if (rbSubmissionForm.hasError) {
    console.warn(rbSubmissionForm.errorMessage)
  } else {
    getFormSettings()
    checkUserLogin()

    tab.value = +rbGlobalSubmissionSettings?.tab ?? 0

    if (tab.value === 0) {
      tab.value = getStorage('rbsm_client_tab', 0)
    }
  }

  function isStorageAvailable() {
    let storage
    try {
      storage = window['localStorage']
      storage.setItem('__rbStorageSet', 'x')
      storage.getItem('__rbStorageSet')
      storage.removeItem('__rbStorageSet')
      return true
    } catch (e) {
      return false
    }
  }

  function setStorage(key, data) {
    yesStorage &&
      localStorage.setItem(
        key,
        typeof data === 'string' ? data : JSON.stringify(data)
      )
  }

  function getStorage(key, defaultValue) {
    if (!yesStorage) return null

    const data = localStorage.getItem(key)
    if (data === null) return defaultValue

    try {
      return JSON.parse(data)
    } catch (e) {
      return data
    }
  }

  function getFormSettings() {
    const formSettingsRaw = rbSubmissionForm?.formSettings ?? undefined
    if (formSettingsRaw === undefined) {
      console.log('Cannot find submission form setting.')
      return
    }

    formSettings.value = JSON.parse(formSettingsRaw.data)
    authorAccess =
      formSettings.value?.user_login?.author_access ?? 'only_logged_user'
    loginLinkLabel.value =
      formSettings.value?.user_login?.login_type?.login_link_label ?? ''
    loginLinkUrl.value =
      formSettings.value?.user_login?.login_type?.login_link_url ?? ''
    loginMessage.value =
      formSettings.value?.user_login?.login_type?.login_message ?? ''
    loginType.value = formSettings.value?.user_login?.login_type?.type ?? ''
  }

  function checkUserLogin() {
    const isUserLogged = rbSubmissionForm?.isUserLogged ?? 0

    if (isUserLogged) {
      isRenderUI.value = true
    } else {
      if (authorAccess === 'only_logged_user') {
        if (loginType.value === 'show_login_message') dialog.value = true
        else
          window.location.href =
            rbGlobalSubmissionSettings.loginUrl +
            `?redirect_to=${window.location.href}`
      } else isRenderUI.value = true
    }
  }

  function changeTabNameToEdit() {
    tab2TextLabel.value = translate.value.editPost
  }

  function redirectToLogin() {
    window.location.href = loginLinkUrl.value
  }
</script>

<template>
  <v-container v-if="isRenderUI">
    <v-dialog v-model="dialog" class="rbsm-popup-box" persistent>
      <v-card>
        <v-card-title class="headline">
          <v-icon>mdi-lock-outline</v-icon>
          {{ translate.needLogin }}
        </v-card-title>
        <v-card-text>{{ loginMessage }}</v-card-text>
        <v-card-actions>
          <v-btn @click="redirectToLogin">{{ loginLinkLabel }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-tabs v-model="tab">
      <v-tab :value="0">
        <div class="rbsm-tab-label h4">
          <v-icon>mdi-folder-file-outline</v-icon>
          {{ translate.postListLabel }}
        </div>
      </v-tab>
      <v-tab :value="1">
        <div class="rbsm-tab-label h4">
          <v-icon>mdi-note-edit-outline</v-icon>
          {{ tab2TextLabel }}
        </div>
      </v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab" class="rbsm-tabs-container">
      <v-tabs-window-item :value="0">
        <div class="rbsm-tab-wrapper rbsm-tab-posts-listing">
          <userPostsContent />
        </div>
      </v-tabs-window-item>
      <v-tabs-window-item :value="1">
        <submissionFormContent
          @change-tab-label-to-edit="changeTabNameToEdit"
        />
      </v-tabs-window-item>
    </v-tabs-window>
  </v-container>
</template>
