<script setup>
  import { onMounted, ref, watch } from 'vue'

  defineOptions({ name: 'postManagerContent' })

  const snackbar = ref(false)
  const snackbarMessage = ref('')
  const editPostFormUrl = ref('')
  const userPostsPanel = ref([0])
  const customLoginLink = ref('')
  const disableButton = ref(false)
  const allowEditPost = ref(false)
  const userProfilePanel = ref([])
  const editPostFormPanel = ref([])
  const allowDeletePost = ref(false)
  const isDisplayDialog = ref(false)
  const editPostLoginTitle = ref('')
  const customRegisterLink = ref('')
  const userPostsLoginTitle = ref('')
  const editPostLoginMessage = ref('')
  const hasSavingSettings = ref(false)
  const userPostsLoginMessage = ref('')
  const customLoginButtonText = ref('')
  const formSubmissionDefaultId = ref(1)
  const translate = ref(rbAjax.translate)
  const loginEditPostChoicePanel = ref([])
  const customRegisterButtonText = ref('')
  const loginUserPostsChoicePanel = ref([])
  const snackbarClass = ref('rbsm-failed-snackbar')
  const loginEditPostChoice = ref('show_login_message')
  const loginUserPostsChoice = ref('show_login_message')
  const loginTypeItems = ref([
    {
      id: 'show_login_message',
      title: 'Show Login Message'
    },
    {
      id: 'redirect_to_login_page',
      title: 'Redirect to Login Page'
    }
  ])

  let yesStorage = false

  const props = defineProps({
    isTabVisible: {
      type: Boolean,
      default: false
    }
  })

  watch(
    () => props.isTabVisible,
    (newValue) => {
      if (newValue) {
        getPostManagerSettings()
      }
    }
  )

  watch(userPostsPanel, (newValue) => {
    const value = {
      user_post: newValue,
      edit_post_form: editPostFormPanel.value,
      user_profile: userProfilePanel.value
    }

    setStorage('rbsm_post_manager', value)
  })

  watch(editPostFormPanel, (newValue) => {
    const value = {
      user_post: userPostsPanel.value,
      edit_post_form: newValue,
      user_profile: userProfilePanel.value
    }

    setStorage('rbsm_post_manager', value)
  })

  watch(userProfilePanel, (newValue) => {
    const value = {
      user_post: userPostsPanel.value,
      edit_post_form: editPostFormPanel.value,
      user_profile: newValue
    }

    setStorage('rbsm_post_manager', value)
  })

  onMounted(() => {
    getPostManagerSettings()
  })

  startInitialize()

  function startInitialize() {
    yesStorage = isStorageAvailable()
    userPostsPanel.value = getStorage('rbsm_post_manager', '').user_post ?? [0]
    editPostFormPanel.value =
      getStorage('rbsm_post_manager', '').edit_post_form ?? []
    userProfilePanel.value =
      getStorage('rbsm_post_manager', '').user_profile ?? []
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

  function deleteStorage(key) {
    yesStorage && localStorage.removeItem(key)
  }

  function validateURL(url) {
    if (url === '') return { status: true, url }

    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6}|localhost)(:\d+)?([\/\w\.\-\=\&]*)*\/?$/i
    if (!urlRegex.test(url)) return { status: false, url }

    const regex = /^(localhost|127\.0\.0\.1)(:\d{1,5})?$/
    if (regex.test(url)) {
      url = `http://${url}`
    }

    return { status: true, url }
  }

  function updatePostManagerSettings() {
    if (hasSavingSettings.value) return

    hasSavingSettings.value = true

    const validateEditURL = validateURL(editPostFormUrl.value)
    if (!validateEditURL.status) {
      displayErrorDialog(translate.value.invalidPostEditURL)
      hasSavingSettings.value = false
      return
    }

    editPostFormUrl.value = validateEditURL.url

    const validateLoginURL = validateURL(customLoginLink.value)
    if (!validateLoginURL.status) {
      displayErrorDialog(translate.value.invalidCustomLoginLink)
      hasSavingSettings.value = false
      return
    }

    customLoginLink.value = validateLoginURL.url

    const validateRegistrationURL = validateURL(customRegisterLink.value)
    if (!validateRegistrationURL.status) {
      displayErrorDialog(translate.value.invalidCustomRegisterLink)
      hasSavingSettings.value = false
      return
    }

    customRegisterLink.value = validateRegistrationURL.url

    const jsonData = {
      user_profile: {
        allow_edit_post: allowEditPost.value,
        allow_delete_post: allowDeletePost.value,
        form_submission_default_id: formSubmissionDefaultId.value,
        login_action_choice: loginUserPostsChoice.value,
        user_posts_required_login_title: userPostsLoginTitle.value,
        user_posts_required_login_message: userPostsLoginMessage.value
      },
      edit_post_form: {
        edit_post_url: editPostFormUrl.value,
        login_action_choice: loginEditPostChoice.value,
        edit_post_required_login_title: editPostLoginTitle.value,
        edit_post_required_login_message: editPostLoginMessage.value
      },
      custom_login_and_registration: {
        custom_login_button_label: customLoginButtonText.value,
        custom_login_link: customLoginLink.value,
        custom_registration_button_label: customRegisterButtonText.value,
        custom_registration_link: customRegisterLink.value
      }
    }

    const formData = new FormData()
    formData.append('action', 'rbsm_update_post_manager')
    formData.append('_nonce', rbAjax.nonce)
    formData.append('data', JSON.stringify(jsonData))

    fetch(rbAjax.ajaxUrl, {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          hasSavingSettings.value = false
          isDisplayDialog.value = true
        } else {
          displayErrorDialog(data.data)
          console.log(data.data)
          hasSavingSettings.value = false
        }
      })
      .catch((error) => {
        displayErrorDialog(error)
        console.log(error)
        hasSavingSettings.value = false
      })
  }

  function getPostManagerSettings() {
    const formData = new FormData()
    formData.append('action', 'rbsm_get_post_manager')
    formData.append('_nonce', rbAjax.nonce)

    fetch(rbAjax.ajaxUrl, {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          renderPostManagerSettings(data.data)
        } else {
          displayErrorDialog(data.data)
          console.log(data.data)
        }
      })
      .catch((error) => {
        displayErrorDialog(error)
        console.log(error)
      })
  }

  function renderPostManagerSettings(postManagerSettingData) {
    allowEditPost.value =
      postManagerSettingData?.user_profile?.allow_edit_post ?? false
    allowDeletePost.value =
      postManagerSettingData?.user_profile?.allow_delete_post ?? false
    formSubmissionDefaultId.value =
      postManagerSettingData?.user_profile?.form_submission_default_id ?? 1
    loginUserPostsChoice.value =
      postManagerSettingData?.user_profile?.login_action_choice ??
      'show_login_message'

    userPostsLoginTitle.value =
      postManagerSettingData?.user_profile?.user_posts_required_login_title ??
      ''
    userPostsLoginTitle.value =
      userPostsLoginTitle.value === ''
        ? translate.value.userPostsRequiredLoginTitlePattern
        : userPostsLoginTitle.value

    userPostsLoginMessage.value =
      postManagerSettingData?.user_profile?.user_posts_required_login_message ??
      ''
    userPostsLoginMessage.value =
      userPostsLoginMessage.value === ''
        ? translate.value.userPostsRequiredLoginMessagePattern
        : userPostsLoginMessage.value

    editPostFormUrl.value =
      postManagerSettingData?.edit_post_form?.edit_post_url ?? ''
    loginEditPostChoice.value =
      postManagerSettingData?.edit_post_form?.login_action_choice ??
      'show_login_message'

    editPostLoginTitle.value =
      postManagerSettingData?.edit_post_form?.edit_post_required_login_title ??
      ''
    editPostLoginTitle.value =
      editPostLoginTitle.value === ''
        ? translate.value.editPostRequiredLoginTitlePattern
        : editPostLoginTitle.value

    editPostLoginMessage.value =
      postManagerSettingData?.edit_post_form
        ?.edit_post_required_login_message ?? ''
    editPostLoginMessage.value =
      editPostLoginMessage.value === ''
        ? translate.value.editPostRequiredLoginMessagePattern
        : editPostLoginMessage.value

    customLoginButtonText.value =
      postManagerSettingData?.custom_login_and_registration
        ?.custom_login_button_label ?? ''
    customLoginButtonText.value =
      customLoginButtonText.value === ''
        ? translate.value.loginLinkLabelPattern
        : customLoginButtonText.value

    customLoginLink.value =
      postManagerSettingData?.custom_login_and_registration
        ?.custom_login_link ?? ''

    customRegisterButtonText.value =
      postManagerSettingData?.custom_login_and_registration
        ?.custom_registration_button_label ?? ''
    customRegisterButtonText.value =
      customRegisterButtonText.value === ''
        ? translate.value.register
        : customRegisterButtonText.value

    customRegisterLink.value =
      postManagerSettingData?.custom_login_and_registration
        ?.custom_registration_link ?? ''

    changeUserPostsChoice(loginUserPostsChoice.value)
    changeEditPostChoice(loginEditPostChoice.value)
  }

  function changeUserPostsChoice(value) {
    loginUserPostsChoicePanel.value = value === 'show_login_message' ? [0] : []
  }

  function changeEditPostChoice(value) {
    loginEditPostChoicePanel.value = value === 'show_login_message' ? [0] : []
  }

  function displayErrorDialog(errorMessage) {
    snackbarClass.value = 'rbsm-failed-snackbar'
    snackbarMessage.value = errorMessage
    snackbar.value = true
  }
</script>

<template>
  <div class="rbsm-fullwidth rbsm-snackbar-container">
    <v-snackbar v-model="snackbar" :class="[snackbarClass]" :timeout="3000">
      <v-icon class="pr-2">mdi-alert-outline</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>
    <v-dialog class="rbsm-popup-box" v-model="isDisplayDialog">
      <v-card>
        <v-card-title>
          <v-icon class="rbsm-green">mdi-content-save-check-outline</v-icon>
          {{ translate.updateSuccessful }}
        </v-card-title>
        <v-card-text>
          {{ translate.updatePostManagerSuccessfulMessage }}
        </v-card-text>
        <template v-slot:actions>
          <v-btn
            class="ms-auto"
            :text="translate.ok"
            @click="isDisplayDialog = false"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>
    <v-expansion-panels
      v-model="userPostsPanel"
      multiple
      class="rbsm-expansion-panel"
      elevation="0"
    >
      <v-expansion-panel>
        <v-expansion-panel-title>
          <div>
            <p class="rbsm-settings-title">
              <v-icon class="mr-2">mdi-clipboard-list-outline</v-icon>
              {{ translate.userProfile }}
            </p>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="rbsm-settings-list rbsm-shortcode-helper">
            <v-icon>mdi-code-block-tags</v-icon>
            <p>{{ translate.rubySubmissionManager }}</p>
            <div>
              <span class="rbsm-form-code">[easy_post_submission_manager]</span>
            </div>
          </div>
          <div class="rbsm-settings-list">
            <v-row class="d-flex rbsm-row-settings align-center">
              <v-col class="pa-0" cols="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.allowEditPost }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.allowEditPostDesc }}
                </div>
              </v-col>
              <v-col
                offset="4"
                offset-md="0"
                cols="2"
                class="pa-0 rbsm-checkbox-layout"
              >
                <label class="rbsm-import-checkbox rbsm-checkbox">
                  <input
                    v-model="allowEditPost"
                    type="checkbox"
                    checked="checked"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row v-if="allowEditPost" class="d-flex rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.editPostUrl }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.editPostUrlDesc }}
                </div>
              </v-col>
              <v-col
                class="rbsm-settings-input d-flex align-center"
                cols="12"
                md="6"
              >
                <input
                  class="rbsm-text-input"
                  v-model="editPostFormUrl"
                  type="text"
                />
              </v-col>
            </v-row>
            <v-row class="d-flex rbsm-row-settings align-center">
              <v-col class="pa-0" cols="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.allowDeletePost }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.allowDeletePostDesc }}
                </div>
              </v-col>
              <v-col
                offset="4"
                offset-md="0"
                cols="2"
                class="pa-0 rbsm-checkbox-layout"
              >
                <label class="rbsm-import-checkbox rbsm-checkbox">
                  <input
                    v-model="allowDeletePost"
                    type="checkbox"
                    checked="checked"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row class="d-flex rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.formSubmissionDefault }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.formSubmissionDefaultDesc }}
                </div>
              </v-col>
              <v-col
                class="rbsm-settings-input d-flex align-center"
                cols="12"
                md="6"
              >
                <input
                  class="rbsm-text-input"
                  v-model="formSubmissionDefaultId"
                  type="number"
                />
              </v-col>
            </v-row>
            <v-row class="d-flex rbsm-row-settings rbsm-row-select">
              <v-col cols="12" md="6" class="pa-0">
                <p class="rbsm-setting-properties-title-2">
                  {{ translate.loginActionChoice }}
                </p>
                <div class="rbsm-setting-properties-content-2">
                  {{ translate.loginActionChoiceDesc }}
                </div>
              </v-col>
              <v-col cols="12" md="6" class="rbsm-settings-input">
                <v-select
                  class="rbsm-select"
                  density="compact"
                  v-model="loginUserPostsChoice"
                  :items="loginTypeItems"
                  item-value="id"
                  item-title="title"
                  variant="outlined"
                  @update:modelValue="changeUserPostsChoice"
                  hide-details
                ></v-select>
              </v-col>
            </v-row>
            <v-expansion-panels
              v-model="loginUserPostsChoicePanel"
              multiple
              class="rbsm-mini-expansion-panel"
              elevation="0"
            >
              <v-expansion-panel>
                <v-expansion-panel-text>
                  <v-row class="d-flex rbsm-row-settings">
                    <v-col class="pa-0" cols="12" md="6">
                      <p class="rbsm-setting-properties-title">
                        {{ translate.userPostsRequiredLoginTitle }}
                      </p>
                      <div class="rbsm-setting-properties-content">
                        {{ translate.userPostsRequiredLoginTitleDesc }}
                      </div>
                    </v-col>
                    <v-col
                      class="rbsm-settings-input d-flex align-center"
                      cols="12"
                      md="6"
                    >
                      <input
                        class="rbsm-text-input"
                        v-model="userPostsLoginTitle"
                        type="text"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="d-flex rbsm-row-settings">
                    <v-col class="pa-0" cols="12" md="6">
                      <p class="rbsm-setting-properties-title">
                        {{ translate.userPostsRequiredLoginMessage }}
                      </p>
                      <div class="rbsm-setting-properties-content">
                        {{ translate.userPostsRequiredLoginMessageDesc }}
                      </div>
                    </v-col>
                    <v-col
                      class="rbsm-settings-input d-flex align-center"
                      cols="12"
                      md="6"
                    >
                      <input
                        class="rbsm-text-input"
                        v-model="userPostsLoginMessage"
                        type="text"
                      />
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-expansion-panels
      v-model="editPostFormPanel"
      multiple
      class="rbsm-expansion-panel"
      elevation="0"
    >
      <v-expansion-panel>
        <v-expansion-panel-title>
          <div>
            <p class="rbsm-settings-title">
              <v-icon class="mr-2">mdi-text-box-edit-outline</v-icon>
              {{ translate.editPostForm }}
            </p>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="rbsm-settings-list rbsm-shortcode-helper">
            <v-icon>mdi-code-block-tags</v-icon>
            <p>{{ translate.rubySubmissionEdit }}</p>
            <div>
              <span class="rbsm-form-code">[easy_post_submission_edit]</span>
            </div>
          </div>
          <div class="rbsm-settings-list">
            <v-row class="d-flex rbsm-row-settings rbsm-row-select">
              <v-col cols="12" md="6" class="pa-0">
                <p class="rbsm-setting-properties-title-2">
                  {{ translate.loginActionChoice }}
                </p>
                <div class="rbsm-setting-properties-content-2">
                  {{ translate.loginActionChoiceDesc }}
                </div>
              </v-col>
              <v-col cols="12" md="6" class="rbsm-settings-input">
                <v-select
                  class="rbsm-select"
                  density="compact"
                  v-model="loginEditPostChoice"
                  :items="loginTypeItems"
                  item-value="id"
                  item-title="title"
                  variant="outlined"
                  @update:modelValue="changeEditPostChoice"
                  hide-details
                ></v-select>
              </v-col>
            </v-row>
            <v-expansion-panels
              v-model="loginEditPostChoicePanel"
              multiple
              class="rbsm-mini-expansion-panel"
              elevation="0"
            >
              <v-expansion-panel>
                <v-expansion-panel-text>
                  <v-row class="d-flex rbsm-row-settings">
                    <v-col class="pa-0" cols="12" md="6">
                      <p class="rbsm-setting-properties-title">
                        {{ translate.editPostRequiredLoginTitle }}
                      </p>
                      <div class="rbsm-setting-properties-content">
                        {{ translate.editPostRequiredLoginTitleDesc }}
                      </div>
                    </v-col>
                    <v-col
                      class="rbsm-settings-input d-flex align-center"
                      cols="12"
                      md="6"
                    >
                      <input
                        class="rbsm-text-input"
                        v-model="editPostLoginTitle"
                        type="text"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="d-flex rbsm-row-settings">
                    <v-col class="pa-0" cols="12" md="6">
                      <p class="rbsm-setting-properties-title">
                        {{ translate.editPostRequiredLoginMessage }}
                      </p>
                      <div class="rbsm-setting-properties-content">
                        {{ translate.editPostRequiredLoginMessageDesc }}
                      </div>
                    </v-col>
                    <v-col
                      class="rbsm-settings-input d-flex align-center"
                      cols="12"
                      md="6"
                    >
                      <input
                        class="rbsm-text-input"
                        v-model="editPostLoginMessage"
                        type="text"
                      />
                    </v-col>
                  </v-row>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <v-expansion-panels
      v-model="userProfilePanel"
      multiple
      class="rbsm-expansion-panel rbsm-final-setting-row"
      elevation="0"
    >
      <v-expansion-panel>
        <v-expansion-panel-title>
          <div>
            <p class="rbsm-settings-title">
              <v-icon class="mr-2">mdi-account-cog-outline</v-icon>
              {{ translate.customLoginAndRegister }}
            </p>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="rbsm-settings-list">
            <v-row class="d-flex rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.customLoginButtonLabel }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.customLoginButtonLabelDesc }}
                </div>
              </v-col>
              <v-col
                class="rbsm-settings-input d-flex align-center"
                cols="12"
                md="6"
              >
                <input
                  class="rbsm-text-input"
                  v-model="customLoginButtonText"
                  type="text"
                />
              </v-col>
            </v-row>
            <v-row class="d-flex rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.customLoginLink }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.customLoginLinkDesc }}
                </div>
              </v-col>
              <v-col
                class="rbsm-settings-input d-flex align-center"
                cols="12"
                md="6"
              >
                <input
                  class="rbsm-text-input"
                  v-model="customLoginLink"
                  type="text"
                  placeholder="https://youwebsite.com/login/"
                />
              </v-col>
            </v-row>
            <v-row class="d-flex rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.customRegisterButtonLabel }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.customRegisterButtonLabelDesc }}
                </div>
              </v-col>
              <v-col
                class="rbsm-settings-input d-flex align-center"
                cols="12"
                md="6"
              >
                <input
                  class="rbsm-text-input"
                  v-model="customRegisterButtonText"
                  type="text"
                />
              </v-col>
            </v-row>
            <v-row class="d-flex rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.customRegisterLink }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.customRegisterLinkDesc }}
                </div>
              </v-col>
              <v-col
                class="rbsm-settings-input d-flex align-center"
                cols="12"
                md="6"
              >
                <input
                  class="rbsm-text-input"
                  v-model="customRegisterLink"
                  type="text"
                  placeholder="https://youwebsite.com/register/"
                />
              </v-col>
            </v-row>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
    <div class="rbsm-footer">
      <div id="rbsm-footer-btn">
        <button
          :disabled="disableButton"
          class="rbsm-black-btn rbsm-transition rbsm-access-btn rbsm-footer-btn"
          @click="updatePostManagerSettings"
        >
          <v-icon v-show="hasSavingSettings" class="rbsm-loading-icon">
            mdi-loading
          </v-icon>
          <v-icon v-show="!hasSavingSettings">mdi-content-save</v-icon>
          {{ translate.saveSettings }}
        </button>
      </div>
    </div>
  </div>
</template>
