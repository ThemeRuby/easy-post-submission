<script setup>
  import { onMounted, ref, watch } from 'vue'

  import generalSettingsContent from './generalSettings.vue'
  import userSettingsContent from './userSettings.vue'
  import formFieldsContent from './formFields.vue'
  import securityFieldsContent from './securityFields.vue'
  import emailsContent from './emails.vue'
  import previewContent from './previewContent.vue'

  defineOptions({ name: 'formSettingsContent' })
  const emit = defineEmits(['open-form'])

  const titleItems = ref([])
  const snackbar = ref(false)
  const emailData = ref(null)
  const formsData = ref([{}])
  const dialogMessage = ref('')
  const disableButton = ref(true)
  const userLoginData = ref(null)
  const snackbarMessage = ref('')
  const formFieldsData = ref(null)
  const shouldSaveData = ref(false)
  const formTitleSelected = ref('')
  const previewComponent = ref(null)
  const isDisplayDialog = ref(false)
  const securityFieldsData = ref(null)
  const hasSavingSettings = ref(false)
  const generalSettingsData = ref(null)
  const translate = ref(rbAjax.translate)

  let dataToSave = {}
  let currentFormIndex = 0
  let isHandlingAjaxUpdateData = false

  const props = defineProps({
    formItemReceived: {
      type: Object,
      default: () => ({})
    },
    isTabVisible: {
      type: Boolean,
      default: false
    }
  })

  watch(
    () => props.formItemReceived,
    async (newValue) => {
      await getAllForms()
      currentFormIndex = formsData.value.findIndex(
        (form) => form.id === newValue.id
      )

      renderFormSettingWithProp()
    }
  )

  watch(
    () => props.isTabVisible,
    async (newValue) => {
      if (newValue) {
        await getAllForms()

        if (formsData.value.length > 0) renderFormSettings()
      }
    }
  )

  onMounted(async () => {
    await getAllForms()
    disableButton.value = false

    if (props.formItemReceived) {
      currentFormIndex = formsData.value.findIndex(
        (form) => form.id === props.formItemReceived.id
      )

      renderFormSettingWithProp()
    } else {
      if (formsData.value.length > 0) {
        const lastForm = localStorage.getItem('rbsmLastEditForm')

        if (lastForm) {
          currentFormIndex = formsData.value.findIndex(
            (form) => form.title === lastForm
          )
        }

        currentFormIndex = currentFormIndex === -1 ? 0 : currentFormIndex
        renderFormSettings()
      }
    }
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
            titleItems.value = []
            formsData.value.forEach((element) => {
              titleItems.value.push(element.title)
            })

            resolve()
          } else {
            formsData.value = []
            titleItems.value = []
            resolve()
          }
        })
        .catch((error) => {
          console.warn(error)
          reject()
        })
    })
  }

  function updateCurrentFormData() {
    const formDataResult = JSON.parse(formsData.value[currentFormIndex].data)
    generalSettingsData.value = formDataResult['general_setting']
    userLoginData.value = formDataResult['user_login']
    formFieldsData.value = formDataResult['form_fields']
    securityFieldsData.value = formDataResult['security_fields']
    emailData.value = formDataResult['email']
    localStorage.setItem('rbsmLastEditForm', formTitleSelected.value)
  }

  async function changeForm(value) {
    currentFormIndex = titleItems.value.findIndex(
      (element) => value === element
    )
    renderFormSettings()
  }

  function updateFormSettings() {
    if (hasSavingSettings.value) return

    hasSavingSettings.value = true
    shouldSaveData.value = true
  }

  function displayUpdatedDialog(formTitle) {
    dialogMessage.value = `${formTitle} ${translate.value.wasUpdatedSuccessfully}`
    isDisplayDialog.value = true
  }

  function renderFormSettings() {
    if (currentFormIndex >= formsData.value.length) currentFormIndex = 0

    formTitleSelected.value =
      titleItems.value.length > 0 ? formsData.value[currentFormIndex].title : ''
    updateCurrentFormData()
  }

  function renderFormSettingWithProp() {
    formTitleSelected.value = props.formItemReceived.title
    updateCurrentFormData()
  }

  function addNewForm() {
    emit('open-form')
  }

  function handleSavingData(data) {
    if (Object.keys(data).length === 0) {
      shouldSaveData.value = false
      hasSavingSettings.value = false
      return
    }

    const validFields = [
      'general_setting',
      'user_login',
      'form_fields',
      'security_fields',
      'email'
    ]

    dataToSave[`${Object.keys(data)[0]}`] = Object.values(data)[0]
    const dataToSaveFields = Object.keys(dataToSave)

    if (arraysEqualUnordered(validFields, dataToSaveFields)) {
      if (!isHandlingAjaxUpdateData) {
        isHandlingAjaxUpdateData = true
        savingDataToDatabase()
      }
    }
  }

  function arraysEqualUnordered(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false
    }

    let sortedArr1 = arr1.slice().sort()
    let sortedArr2 = arr2.slice().sort()

    for (let i = 0; i < sortedArr1.length; i++) {
      if (sortedArr1[i] !== sortedArr2[i]) {
        return false
      }
    }

    return true
  }

  function savingDataToDatabase() {
    const jsonData = {
      id: formsData.value[currentFormIndex].id,
      data: dataToSave
    }

    const formTitle = formsData.value[currentFormIndex].title
    const formData = new FormData()
    formData.append('action', 'rbsm_update_form')
    formData.append('_nonce', rbAjax.nonce)
    formData.append('data', JSON.stringify(jsonData))

    fetch(rbAjax.ajaxUrl, {
      method: 'POST',
      body: formData
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          displayUpdatedDialog(formTitle)
          getAllForms()
          hasSavingSettings.value = false
        } else {
          showSaveFailureMessage(data.data)
          hasSavingSettings.value = false
        }

        shouldSaveData.value = false
        isHandlingAjaxUpdateData = false
        dataToSave = {}
      })
      .catch((error) => {
        console.log(error)
        showSaveFailureMessage(error)
        hasSavingSettings.value = false
      })
  }

  function showSaveFailureMessage(message) {
    snackbar.value = true
    snackbarMessage.value = message
  }

  function displayFormPreview() {
    if (previewComponent.value) {
      previewComponent.value.displayFormPreview(
        formsData.value[currentFormIndex]
      )
    }
  }
</script>

<template>
  <div class="rbsm-snackbar-container">
    <v-snackbar v-model="snackbar" :timeout="3000" class="rbsm-failed-snackbar">
      <v-icon class="pr-2">mdi-alert-outline</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>
    <v-dialog v-model="isDisplayDialog" class="rbsm-popup-box">
      <v-card>
        <v-card-title>
          <v-icon class="rbsm-green">mdi-content-save-check-outline</v-icon>
          {{ translate.updateSuccessful }}
        </v-card-title>
        <v-card-text>{{ translate.updateSuccessfulMessage }}</v-card-text>
        <template v-slot:actions>
          <v-btn
            :text="translate.ok"
            class="ms-auto"
            @click="isDisplayDialog = false"
          ></v-btn>
        </template>
      </v-card>
    </v-dialog>
    <v-row v-show="formsData.length === 0" class="ma-0 pa-0">
      <v-col class="ma-0 pa-0" cols="12">
        <v-card class="rbsm-card rbsm-card-center" elevation="0">
          <h2 class="rbsm-card-title-center">
            <v-icon>mdi-information-outline</v-icon>
            {{ translate.formNotFoundTitle }}
          </h2>
          <p class="rbsm-tagline">{{ translate.formNotFoundDescription }}</p>
          <v-col class="d-flex align-center justify-center" cols="12" sm="4">
            <button
              class="rbsm-black-btn rbsm-transition rbsm-access-btn rbsm-add-new-form-btn"
              @click="addNewForm"
            >
              <v-icon>mdi-plus</v-icon>
              {{ translate.goToAddNew }}
            </button>
          </v-col>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-show="formsData.length > 0" class="ma-0 pa-0">
      <v-col class="ma-0 pa-0" cols="12">
        <v-card class="rbsm-current-form rbsm-card" elevation="0">
          <div class="rb-current-form-label">
            <span>
              <v-icon>mdi-checkbox-blank-badge</v-icon>
              {{ translate.currentSettingsFor }}
            </span>
            <h3>{{ formTitleSelected }}</h3>
          </div>
          <div class="rbsm-current-form-selection">
            <v-select
              v-model="formTitleSelected"
              :items="titleItems"
              :label="translate.changeFormLabel"
              class="rbsm-select"
              density="compact"
              hide-details
              variant="outlined"
              @update:modelValue="changeForm"
            ></v-select>
          </div>
        </v-card>
      </v-col>
      <generalSettingsContent
        :data="generalSettingsData"
        :saveData="shouldSaveData"
        :sendDataToSave="handleSavingData"
      />
      <userSettingsContent
        :data="userLoginData"
        :saveData="shouldSaveData"
        :sendDataToSave="handleSavingData"
      />
      <formFieldsContent
        :data="formFieldsData"
        :saveData="shouldSaveData"
        :sendDataToSave="handleSavingData"
      />
      <securityFieldsContent
        :data="securityFieldsData"
        :saveData="shouldSaveData"
        :sendDataToSave="handleSavingData"
      />
      <emailsContent
        :data="emailData"
        :saveData="shouldSaveData"
        :sendDataToSave="handleSavingData"
      />
      <previewContent ref="previewComponent" />
      <div class="rbsm-footer">
        <div id="rbsm-footer-btn">
          <button
            :disabled="disableButton"
            class="rbsm-white-btn rbsm-transition rbsm-normal-btn rbsm-footer-btn"
            @click="displayFormPreview"
          >
            <v-icon>mdi-eye</v-icon>
            {{ translate.preview }}
          </button>
          <button
            :disabled="disableButton"
            class="rbsm-black-btn rbsm-transition rbsm-access-btn rbsm-footer-btn"
            @click="updateFormSettings"
          >
            <v-icon v-show="hasSavingSettings" class="rbsm-loading-icon">
              mdi-loading
            </v-icon>
            <v-icon v-show="!hasSavingSettings">mdi-content-save</v-icon>
            {{ translate.saveSettings }}
          </button>
        </div>
      </div>
    </v-row>
  </div>
</template>
