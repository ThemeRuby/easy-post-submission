<script setup>
  import { onMounted, ref, watch } from 'vue'

  defineOptions({ name: 'restoreAndBackupContent' })
  const emit = defineEmits(['open-form'])

  const ids = ref([])
  const formsData = ref([])
  const snackbar = ref(false)
  const dialogTitle = ref('')
  const backupContent = ref('')
  const dialogMessage = ref('')
  const restoreContent = ref('')
  const snackbarMessage = ref('')
  const postManagerData = ref([])
  const isCopiedData = ref(false)
  const backupRawContent = ref({})
  const isDisplayDialog = ref(false)
  const translate = ref(rbAjax.translate)
  const shouldDirectoFormsTab = ref(false)
  const snackbarClass = ref('rbsm-failed-snackbar')
  const copyBtnContent = ref(rbAjax.translate.copy)

  const props = defineProps({
    isTabVisible: {
      type: Boolean,
      default: false
    }
  })

  watch(
    () => props.isTabVisible,
    async (newValue) => {
      if (newValue) {
        await getAllForms()
        await getPostManagerData()
        backupContent.value = JSON.stringify(backupRawContent.value)
      }
    }
  )

  onMounted(async () => {
    await getAllForms()
    await getPostManagerData()
    backupContent.value = JSON.stringify(backupRawContent.value)
  })

  function getAllForms() {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('action', 'rbsm_get_forms')
      formData.append('_nonce', rbAjax.nonce)

      fetch(rbAjax.ajaxUrl, {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            formsData.value = cleanJsonData(data.data)
            backupRawContent.value['formData'] = formsData.value
            resolve()
          } else {
            formsData.value = []
            backupRawContent.value['formData'] = formData
            resolve()
          }
        })
        .catch((error) => {
          displayErrorDialog(error)
          console.log(error)
          reject(err)
        })
    })
  }

  function getPostManagerData() {
    return new Promise((resolve, reject) => {
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
            postManagerData.value = data.data
            backupRawContent.value['postManagerData'] = postManagerData.value
            resolve(data.data)
          } else {
            postManagerData.value = []
            backupRawContent.value['postManagerData'] = postManagerData.value
            resolve(data.data)
          }
        })
        .catch((error) => {
          displayErrorDialog(error)
          console.log(error)
          reject(error)
        })
    })
  }

  function onRestoreData() {
    ids.value = []
    if (restoreContent.value === '') return

    try {
      const restoreDataParsed = JSON.parse(restoreContent.value)
      const formsDataParsed = restoreDataParsed?.formData ?? ''
      const postManagerDataParsed = restoreDataParsed?.postManagerData ?? ''

      if (formsDataParsed === '' || postManagerDataParsed === '') {
        displayFailedRestoreDialog(translate.value.parseRestoreDataFailed)
        return
      }

      const cleanRestoreData = getCleanRestoreFormsData(formsDataParsed)
      if (!cleanRestoreData.status) {
        displayFailedRestoreDialog(cleanRestoreData.message)
        return
      }

      const cleanRestorePostManagerData = getCleanRestorePostManagerData(
        postManagerDataParsed
      )
      if (!cleanRestorePostManagerData.status) {
        displayFailedRestoreDialog(cleanRestorePostManagerData.message)
        return
      }

      restoreData(cleanRestoreData.result)
      restorePostManagerData(cleanRestorePostManagerData.result)

      console.log('clean Restore Data: ', cleanRestoreData.result)
      console.log('===================================')
      console.log(
        'clean restore post manager data',
        cleanRestorePostManagerData.result
      )
    } catch (err) {
      displayFailedRestoreDialog(err)
    }
  }

  function getCleanRestorePostManagerData(postManagerData) {
    const editPostForm = postManagerData?.edit_post_form ?? ''
    if (editPostForm === '') {
      return {
        status: false,
        message: translate.value.validateFailedPostManager
      }
    }

    const editPostUrl = editPostForm?.edit_post_url ?? undefined
    const edit_login_action_choice =
      editPostForm?.login_action_choice ?? undefined
    const edit_post_required_login_title =
      editPostForm?.edit_post_required_login_title ?? undefined
    const edit_post_required_login_message =
      editPostForm?.edit_post_required_login_message ?? undefined

    if (
      editPostUrl === undefined ||
      edit_login_action_choice === undefined ||
      edit_post_required_login_title === undefined ||
      edit_post_required_login_message === undefined
    ) {
      return {
        status: false,
        message: translate.value.validateFailedPostManager
      }
    }

    const userProfile = postManagerData?.user_profile ?? ''
    if (userProfile === '') {
      return {
        status: false,
        message: translate.value.validateFailedPostManager
      }
    }

    const allowDeletePost = userProfile?.allow_delete_post ?? undefined
    const allowEditPost = userProfile?.allow_edit_post ?? undefined
    const formSubmissionDefaultId =
      userProfile?.form_submission_default_id ?? undefined
    const login_action_choice = userProfile?.login_action_choice ?? undefined
    const user_posts_required_login_title =
      userProfile?.user_posts_required_login_title ?? undefined
    const user_posts_required_login_message =
      userProfile?.user_posts_required_login_message ?? undefined

    if (
      allowDeletePost === undefined ||
      allowEditPost === undefined ||
      formSubmissionDefaultId === undefined ||
      login_action_choice === undefined ||
      user_posts_required_login_title === undefined ||
      user_posts_required_login_message === undefined
    ) {
      return {
        status: false,
        message: translate.value.validateFailedPostManager
      }
    }

    const custom_login_and_registration =
      postManagerData?.custom_login_and_registration ?? ''
    if (custom_login_and_registration === '') {
      return {
        status: false,
        message: translate.value.validateFailedPostManager
      }
    }

    const custom_login_button_label =
      custom_login_and_registration?.custom_login_button_label ?? undefined
    const custom_login_link =
      custom_login_and_registration?.custom_login_link ?? undefined
    const custom_registration_button_label =
      custom_login_and_registration?.custom_registration_button_label ??
      undefined
    const custom_registration_link =
      custom_login_and_registration?.custom_registration_link ?? undefined
    if (
      custom_login_button_label === undefined ||
      custom_login_link === undefined ||
      custom_registration_button_label === undefined ||
      custom_registration_link === undefined
    ) {
      return {
        status: false,
        message: translate.value.validateFailedPostManager
      }
    }

    const result = {
      edit_post_form: editPostForm,
      user_profile: userProfile,
      custom_login_and_registration: custom_login_and_registration
    }

    return {
      status: true,
      message: translate.value.validateSuccessPostManager,
      result
    }
  }

  function restorePostManagerData(postManagerData) {
    const jsonData = postManagerData

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
          isDisplayDialog.value = true
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

  function restoreData(data) {
    const formData = new FormData()
    formData.append('action', 'rbsm_restore_data')
    formData.append('_nonce', rbAjax.nonce)
    formData.append('data', JSON.stringify(data))

    fetch(rbAjax.ajaxUrl, {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          displaySuccessRestoreDialog()
        } else {
          displayFailedRestoreDialog(data.data)
        }
      })
      .catch((error) => {
        displayFailedRestoreDialog(error)
      })
  }

  function getCleanRestoreFormsData(restoreDataParsed) {
    ids.value = []
    const result = []
    let status = true

    for (const formData of restoreDataParsed) {
      const cleanFormData = {}
      const validateIdResult = validateId(formData)

      if (!validateIdResult.status) {
        return {
          status: false,
          message: validateIdResult.message
        }
      } else {
        cleanFormData.id = validateIdResult.id
      }

      const validateTitleResult = validateTitle(formData)
      if (!validateTitleResult.status) {
        return {
          status: false,
          message: validateTitleResult.message
        }
      } else {
        cleanFormData.title = validateTitleResult.title
      }

      const validateDataResult = validateData(formData)
      if (!validateDataResult.status) {
        return {
          status: false,
          message: validateDataResult.message
        }
      } else {
        cleanFormData.data = validateDataResult.data
      }

      result.push(cleanFormData)
    }

    return { status, result }
  }

  function validateId(formData) {
    let status = true
    let message = translate.value.validId
    const id = Number(formData['id'])

    if (isNaN(id) || id === null || id <= 0) {
      return {
        status: false,
        message: translate.value.invalidId,
        id
      }
    }

    if (ids.value.includes(id)) {
      return {
        status: false,
        message: `${translate.value.restoreDataDuplicateKeyErrorMessage} ${id}`,
        id
      }
    }

    ids.value.push(id)

    return {
      status,
      message,
      id
    }
  }

  function validateTitle(formData) {
    let status = true
    let message = translate.value.validTitle
    const title = formData['title']

    if (title === undefined || title === null || typeof title !== 'string') {
      return {
        status: false,
        message: translate.value.invalidTitle
      }
    }

    return {
      status,
      message,
      title
    }
  }

  function validateData(formData) {
    let status = true
    let message = translate.value.validData
    const data = formData['data']

    if (data === undefined || data === null) {
      status = false
      message = translate.value.invalidData
    }

    return {
      status,
      message,
      data
    }
  }

  function cleanJsonData(formsData) {
    try {
      for (const formData of formsData) {
        const jsonData = JSON.parse(formData['data'])
        formData['data'] = jsonData
      }
    } catch (err) {
      throw err
    }

    return formsData
  }

  async function onCopyData() {
    copyBtnContent.value = translate.value.copied
    isCopiedData.value = true
    await navigator.clipboard.writeText(backupContent.value)
  }

  async function onPasteData() {
    restoreContent.value = await navigator.clipboard.readText()
  }

  function displaySuccessRestoreDialog() {
    shouldDirectoFormsTab.value = true
    isDisplayDialog.value = true
    dialogMessage.value = translate.value.restoreDataSuccessMessage
    dialogTitle.value = translate.value.restoreDataSuccessTitle
  }

  function displayFailedRestoreDialog(errorMessage) {
    shouldDirectoFormsTab.value = false
    isDisplayDialog.value = true
    dialogMessage.value = errorMessage
    dialogTitle.value = translate.value.restoreDataFailedTitle
  }

  function onDialogBtnClick() {
    isDisplayDialog.value = false

    if (shouldDirectoFormsTab.value) emit('open-form')
  }

  function displayErrorDialog(errorMessage) {
    snackbarClass.value = 'rbsm-failed-snackbar'
    snackbarMessage.value = errorMessage
    snackbar.value = true
  }
</script>

<template>
  <div class="rbsm-snackbar-container">
    <v-snackbar v-model="snackbar" :class="[snackbarClass]" :timeout="3000">
      <v-icon class="pr-2">mdi-alert-outline</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>
    <v-dialog class="rbsm-popup-box" v-model="isDisplayDialog">
      <v-card>
        <v-card-title>
          <v-icon class="rbsm-green">mdi-database-check-outline</v-icon>
          {{ dialogTitle }}
        </v-card-title>
        <v-card-text>{{ dialogMessage }}</v-card-text>
        <template v-slot:actions>
          <v-btn
            class="ms-auto"
            :text="translate.ok"
            @click="onDialogBtnClick"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>
    <v-row>
      <v-col>
        <v-card class="rbsm-card" elevation="0">
          <div class="rbsm-card-heading">
            <div class="rbsm-card-title no-border">
              <v-icon>mdi-restore</v-icon>
              {{ translate.importSettings }}
            </div>
          </div>
          <v-row>
            <v-col cols="12" class="pt-0">
              <textarea
                v-model="restoreContent"
                class="rbsm-text-area rbsm-text-area-sync-data"
              ></textarea>
            </v-col>
            <v-col id="rbsm-sync-data-btn-group" col="12" sm="6" md="6">
              <button
                @click="onRestoreData"
                class="rbsm-black-btn rbsm-transition rbsm-access-btn rbsm-remove-field-btn"
              >
                <v-icon>mdi-import</v-icon>
                {{ translate.import }}
              </button>
              <button
                @click="onPasteData"
                class="rbsm-white-btn rbsm-transition rbsm-normal-btn rbsm-remove-field-btn"
              >
                <v-icon>mdi-content-paste</v-icon>
                {{ translate.paste }}
              </button>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="rbsm-card" elevation="0">
          <div class="rbsm-card-heading">
            <div class="rbsm-card-title no-border">
              <v-icon>mdi-export</v-icon>
              {{ translate.backupData }}
            </div>
          </div>
          <v-row>
            <v-col cols="12" class="pt-0">
              <textarea
                readonly
                v-model="backupContent"
                class="rbsm-text-area rbsm-text-area-sync-data"
              ></textarea>
            </v-col>
            <v-col col="12" sm="2">
              <button
                @click="onCopyData"
                class="rbsm-black-btn rbsm-transition rbsm-access-btn rbsm-remove-field-btn"
              >
                <v-icon>mdi-content-copy</v-icon>
                {{ copyBtnContent }}
              </button>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
