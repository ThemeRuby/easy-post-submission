<script setup>
  import { onMounted, ref, watch } from 'vue'

  defineOptions({ name: 'formContent' })
  const emit = defineEmits(['update-data-completed', 'open-form-settings'])

  const formsData = ref([])
  const dialogTitle = ref('')
  const snackbar = ref(false)
  const dialogMessage = ref('')
  const snackbarMessage = ref('')
  const isCreatingForm = ref(false)
  const disableButtons = ref(false)
  const defaultAuthorAssign = ref({
    name: '',
    id: ''
  })
  const isDisplayDialog = ref(false)
  const translate = ref(rbAjax.translate)
  const isShowFormTitleInput = ref(false)
  const snackbarClass = ref('rbsm-snackbar')
  const shouldDisplayTitleWarning = ref(false)
  const snackbarIcon = ref('mdi-delete-empty-outline')
  const isDisplayDeleteConfirmationDialog = ref(false)

  let hasFormJustCreate = false
  let formShouldRemoveId = -1
  let formTitleInputValue = ''

  const props = defineProps({
    shouldUpdateData: {
      type: Boolean,
      default: false
    }
  })

  watch(
    () => props.shouldUpdateData,
    () => {
      getAllForms()
      emit('update-data-completed')
    }
  )

  onMounted(async () => {
    getAllForms()
    defaultAuthorAssign.value = await getDefaultAuthorPostAssigned()
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
            formsData.value = data.data
            resolve()
          } else {
            formsData.value = []
            resolve()
          }
        })
        .catch((error) => {
          displayErrorDialog(error)
          console.log(error)
          reject()
        })
    })
  }

  async function createDefaultFormSettings() {
    return {
      general_setting: {
        post_status: 'draft',
        url_direction: '',
        unique_title: true,
        form_layout_type: '2_cols'
      },
      user_login: {
        author_access: 'allow_guest',
        assign_author: defaultAuthorAssign.value.name,
        assign_author_id: defaultAuthorAssign.value.id,
        login_link_url: '',
        login_type: {
          type: 'show_login_message',
          login_message: translate.value.loginMessagePattern,
          login_link_label: translate.value.loginLinkLabelPattern,
          required_login_title: translate.value.requiredLoginTitlePattern,
          required_login_title_desc:
            translate.value.requiredLoginTitleDescPattern,
          register_link: '',
          register_button_label: translate.value.register
        }
      },
      form_fields: {
        user_name: 'require',
        user_email: 'require',
        post_title: 'require',
        tagline: 'require',
        editor_type: 'rich_editor',
        max_images: 3,
        max_image_size: 100,
        featured_image: {
          status: 'require',
          upload_file_size_limit: 0,
          default_featured_image: ''
        },
        categories: {
          multiple_categories: true,
          exclude_categories: [],
          exclude_category_ids: [],
          auto_assign_categories: [],
          auto_assign_category_ids: []
        },
        tags: {
          multiple_tags: true,
          allow_add_new_tag: true,
          exclude_tags: [],
          exclude_tag_ids: [],
          auto_assign_tags: [],
          auto_assign_tag_ids: []
        },
        custom_field: []
      },
      security_fields: {
        challenge: {
          status: false,
          question: '',
          response: ''
        },
        recaptcha: {
          status: false,
          recaptcha_site_key: '',
          recaptcha_secret_key: ''
        }
      },
      email: {
        admin_mail: {
          status: false,
          email: '',
          subject: translate.value.emailAdminSubjectPattern,
          title: translate.value.emailAdminTitlePattern,
          message: translate.value.emailAdminMessagePattern
        },
        post_submit_notification: {
          status: false,
          subject: translate.value.emailPostSubmitSubjectPattern,
          title: translate.value.emailPostSubmitTitlePattern,
          message: translate.value.emailPostSubmitMessagePattern
        },
        post_publish_notification: {
          status: false,
          subject: translate.value.emailPostPublishSubjectPattern,
          title: translate.value.emailPostPublishTitlePattern,
          message: translate.value.emailPostPublishMessagePattern
        },
        post_trash_notification: {
          status: false,
          subject: translate.value.emailPostTrashSubjectPattern,
          title: translate.value.emailPostTrashTitlePattern,
          message: translate.value.emailPostTrashMessagePattern
        }
      }
    }
  }

  function getDefaultAuthorPostAssigned() {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('action', 'rbsm_get_authors')
      formData.append('_nonce', rbAjax.nonce)

      fetch(rbAjax.ajaxUrl, {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          let author = {
            name: '',
            id: -1
          }

          if (data.success) {
            let authors = data.data
            if (authors.length > 0)
              author = {
                name: authors[0].display_name,
                id: authors[0].ID
              }

            resolve(author)
          } else {
            resolve(author)
          }
        })
        .catch((error) => {
          displayErrorDialog(error)
          reject()
        })
    })
  }

  async function addNewForm() {
    if (!isShowFormTitleInput.value) {
      isShowFormTitleInput.value = true
      return
    }

    if (formTitleInputValue === '') return

    if (isCreatingForm.value) return

    isCreatingForm.value = true

    const jsonData = {
      title: formTitleInputValue,
      data: await createDefaultFormSettings()
    }

    const formData = new FormData()
    formData.append('action', 'rbsm_submit_form')
    formData.append('_nonce', rbAjax.nonce)
    formData.append('data', JSON.stringify(jsonData))

    fetch(rbAjax.ajaxUrl, {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          displayNewFormSuccessDialog(jsonData.title)
          getAllForms()
          isCreatingForm.value = false
          hasFormJustCreate = true
        } else {
          console.log(`%c ${data.data}`, 'color: red; font-weight: bold')
          displayErrorDialog(data.data)
          isCreatingForm.value = false
        }
      })
      .catch((error) => {
        console.log(error)
        displayErrorDialog(error)
        isCreatingForm.value = false
      })
  }

  function displayNewFormSuccessDialog(newFormTitle) {
    dialogTitle.value = translate.value.formCreateSuccess
    dialogMessage.value = translate.value.formCreateSuccessMessage.replace(
      '%s',
      newFormTitle
    )
    isDisplayDialog.value = true
  }

  function displayFormRemovedDialog(formRemovedTitle) {
    snackbarClass.value = 'rbsm-snackbar'
    snackbarMessage.value = translate.value.formRemovedMessage.replace(
      '%s',
      formRemovedTitle
    )
    snackbarIcon.value = 'mdi-delete-empty-outline'
    snackbar.value = true
  }

  function displayErrorDialog(errorMessage) {
    snackbarClass.value = 'rbsm-failed-snackbar'
    snackbarIcon.value = 'mdi-alert-outline'
    snackbarMessage.value = errorMessage
    snackbar.value = true
  }

  function cancelSubmitForm() {
    isShowFormTitleInput.value = false
  }

  function removeForm() {
    if (formShouldRemoveId === -1) return

    const jsonData = {
      id: formShouldRemoveId
    }

    const formTitle = formsData.value.find(
      (element) => element.id === formShouldRemoveId
    ).title

    const formData = new FormData()
    formData.append('action', 'rbsm_delete_form')
    formData.append('_nonce', rbAjax.nonce)
    formData.append('data', JSON.stringify(jsonData))

    fetch(rbAjax.ajaxUrl, {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then(async (data) => {
        if (data.success) {
          displayFormRemovedDialog(formTitle)
          await getAllForms()
          disableButtons.value = false
        } else {
          displayErrorDialog(data.data)
          disableButtons.value = false
        }
      })
      .catch((error) => {
        displayErrorDialog(error)
        disableButtons.value = false
        console.log(error)
      })
  }

  function openFormSettings(formItem) {
    localStorage.removeItem('rbsmLastEditForm')
    emit('open-form-settings', formItem)
  }

  function displayDeleteConfirmationDialog(formId) {
    disableButtons.value = true
    formShouldRemoveId = formId
    isDisplayDeleteConfirmationDialog.value = true
  }

  function cancelDeleteDialog() {
    disableButtons.value = false
    formShouldRemoveId = -1
    isDisplayDeleteConfirmationDialog.value = false
  }

  function confirmDeleteDialog() {
    isDisplayDeleteConfirmationDialog.value = false
    removeForm()
  }

  function validateFormTitleInput() {
    shouldDisplayTitleWarning.value = formTitleInputValue === ''
  }

  function onDialogClose() {
    isDisplayDialog.value = false

    if (hasFormJustCreate) {
      hasFormJustCreate = false
      formTitleInputValue = ''
      isShowFormTitleInput.value = false
    }
  }
</script>
<template>
  <div>
    <v-dialog
      v-model="isDisplayDeleteConfirmationDialog"
      class="rbsm-popup-box"
      persistent
    >
      <v-card>
        <v-card-title>
          <v-icon>mdi-delete-empty-outline</v-icon>
          {{ translate.deleteFormTitle }}
        </v-card-title>
        <v-card-text>{{ translate.deleteFormText }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="confirmDeleteDialog">{{ translate.delete }}</v-btn>
          <v-btn @click="cancelDeleteDialog">{{ translate.cancel }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="isDisplayDialog"
      class="rbsm-popup-box"
      @click:outside="onDialogClose"
    >
      <v-card>
        <v-card-title>
          <v-icon class="rbsm-green">mdi-bell-check</v-icon>
          {{ dialogTitle }}
        </v-card-title>
        <v-card-text>{{ dialogMessage }}</v-card-text>
        <template v-slot:actions>
          <v-btn class="ms-auto" text="Ok" @click="onDialogClose"></v-btn>
        </template>
      </v-card>
    </v-dialog>
    <v-row class="ma-0 pa-0">
      <v-col class="ma-0 pa-0" cols="12" md="12" sm="12" xs="12">
        <v-card class="rbsm-card rbsm-card-center" elevation="0">
          <h2 class="rbsm-card-title-center">
            <v-icon>mdi-invoice-plus-outline</v-icon>
            {{ translate.createFormTitle }}
          </h2>
          <p class="rbsm-tagline">{{ translate.createFormDesc }}</p>
          <div class="rbsm-create-form-wrap">
            <div v-show="isShowFormTitleInput" class="rbsm-big-input-wrap">
              <input
                v-model="formTitleInputValue"
                :placeholder="translate.createFormInputPlaceholder"
                class="rbsm-big-input"
                type="text"
                @input="validateFormTitleInput"
              />
              <p
                v-show="shouldDisplayTitleWarning"
                class="pl-1"
                style="color: red"
              >
                {{ translate.createFormInputRequired }}
              </p>
            </div>
            <button
              :disabled="isCreatingForm"
              class="rbsm-creation-btn rbsm-btn rbsm-transition rbsm-access-btn"
              @click="addNewForm"
            >
              <v-icon v-show="isCreatingForm" class="rbsm-loading-icon">
                mdi-loading
              </v-icon>
              <v-icon v-show="!isCreatingForm">
                {{ isShowFormTitleInput ? 'mdi-content-save' : 'mdi-plus' }}
              </v-icon>
              {{
                isShowFormTitleInput
                  ? translate.submitForm
                  : translate.addNewForm
              }}
            </button>
            <button
              v-show="isShowFormTitleInput"
              class="rbsm-btn rbsm-creation-btn is-cancel"
              @click="cancelSubmitForm"
            >
              <v-icon>mdi-cancel</v-icon>
              {{ translate.cancel }}
            </button>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-show="formsData.length > 0" class="ma-0 pa-0">
      <v-col class="ma-0 pa-0" cols="12">
        <v-card class="rbsm-card rbsm-snackbar-container" elevation="0">
          <v-snackbar
            v-model="snackbar"
            :class="[snackbarClass]"
            :timeout="3000"
          >
            <v-icon class="pr-2">{{ snackbarIcon }}</v-icon>
            {{ snackbarMessage }}
          </v-snackbar>
          <div class="rbsm-card-heading">
            <h3 class="rbsm-card-title">
              <v-icon>mdi-format-list-bulleted</v-icon>
              {{ translate.formListTitle }}
            </h3>
          </div>
          <div v-for="(item, index) in formsData">
            <v-row class="ma-0 pa-0">
              <v-col class="ma-0 pa-0" cols="12" md="8" sm="12">
                <h3 class="rbsm-form-name">
                  <v-icon>mdi-list-box-outline</v-icon>
                  {{ item.title }}
                </h3>
                <p class="rbsm-form-code">
                  [easy_post_submission_form id={{ item.id }}]
                </p>
              </v-col>
              <v-col
                class="ma-0 pa-0 rbsm-form-actions"
                cols="12"
                md="4"
                sm="12"
              >
                <button
                  :disabled="disableButtons"
                  class="rbsm-btn rbsm-black-btn rbsm-transition rbsm-access-btn"
                  @click="openFormSettings(item)"
                >
                  <v-icon>mdi-cog-play-outline</v-icon>
                  {{ translate.formSettings }}
                </button>
                <button
                  :disabled="disableButtons"
                  class="rbsm-btn rbsm-white-btn rbsm-transition rbsm-btn-red"
                  @click="displayDeleteConfirmationDialog(item.id)"
                >
                  <v-icon>mdi-delete-outline</v-icon>
                  {{ translate.delete }}
                </button>
              </v-col>
            </v-row>
            <v-divider
              v-show="index < formsData.length - 1"
              class="rbsm-divider mb-5"
            ></v-divider>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
