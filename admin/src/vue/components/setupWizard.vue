<script>
  import { ref } from 'vue'

  export default {
    name: 'SetupWizard',
    components: {},
    props: {
      getText: {
        type: Function,
        required: true
      }
    },

    setup() {
      const createForm = ref(true)
      const createSubmitPage = ref(true)
      const createProfilePage = ref(true)
      const createEditPage = ref(true)
      const isProgressing = ref(false)

      const fetchURL = rbAjax.ajaxURL || ajaxurl

      const submitChoices = async () => {
        const formData = new FormData()
        formData.append('createForm', createForm.value)
        formData.append('createSubmitPage', createSubmitPage.value)
        formData.append('createProfilePage', createProfilePage.value)
        formData.append('createEditPage', createEditPage.value)
        formData.append('_nonce', rbAjax.nonce || '')
        formData.append('action', 'rbsm_setup')
        isProgressing.value = true

        try {
          const response = await fetch(fetchURL, {
            method: 'POST',
            headers: { 'X-WP-Nonce': rbAjax.nonce },
            body: formData
          })

          if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
          }

          const data = await response.json()

          if (data.success) {
            window.location.reload()
          } else {
            console.error('Server Response Error:', data)
          }
        } catch (error) {
          console.error('Error submitting data:', error)
        }
      }

      return {
        createForm,
        createSubmitPage,
        createProfilePage,
        createEditPage,
        submitChoices,
        isProgressing
      }
    }
  }
</script>
<template>
  <div class="rbsm-fullwidth rbsm-setup">
    <v-card class="rbsm-card" elevation="0">
      <h2 class="rbsm-card-title-center">
        <v-icon>mdi-chart-bubble</v-icon>
        {{ getText('quickSetupWizard') }}
      </h2>
      <p class="rbsm-tagline">
        {{ getText('setupWizardDescription') }}
      </p>
      <div class="rbsm-settings-list">
        <v-row class="d-flex rbsm-row-settings">
          <v-col class="pa-0" cols="6">
            <p class="rbsm-setting-properties-title">
              {{ getText('createForm') }}
            </p>
            <div class="rbsm-setting-properties-content">
              {{ getText('createFormDescription') }}
            </div>
          </v-col>
          <label class="rbsm-import-checkbox rbsm-checkbox">
            <input
              v-model="createForm"
              type="checkbox"
              :disabled="isProgressing"
            />
            <span class="rbsm-checkbox-style"><i></i></span>
          </label>
        </v-row>
        <v-row class="d-flex rbsm-row-settings">
          <v-col class="pa-0" cols="6">
            <p class="rbsm-setting-properties-title">
              {{ getText('createSubmitPage') }}
            </p>
            <div class="rbsm-setting-properties-content">
              {{ getText('createSubmitPageDescription') }}
            </div>
          </v-col>
          <label class="rbsm-import-checkbox rbsm-checkbox">
            <input
              v-model="createSubmitPage"
              type="checkbox"
              :disabled="isProgressing"
            />
            <span class="rbsm-checkbox-style"><i></i></span>
          </label>
        </v-row>
        <v-row class="d-flex rbsm-row-settings">
          <v-col class="pa-0" cols="6">
            <p class="rbsm-setting-properties-title">
              {{ getText('createProfilePage') }}
            </p>
            <div class="rbsm-setting-properties-content">
              {{ getText('createProfilePageDescription') }}
            </div>
          </v-col>
          <label class="rbsm-import-checkbox rbsm-checkbox">
            <input
              v-model="createProfilePage"
              type="checkbox"
              :disabled="isProgressing"
            />
            <span class="rbsm-checkbox-style"><i></i></span>
          </label>
        </v-row>
        <v-row class="d-flex rbsm-row-settings">
          <v-col class="pa-0" cols="6">
            <p class="rbsm-setting-properties-title">
              {{ getText('createEditPage') }}
            </p>
            <div class="rbsm-setting-properties-content">
              {{ getText('createEditPageDescription') }}
            </div>
          </v-col>
          <label class="rbsm-import-checkbox rbsm-checkbox">
            <input
              v-model="createEditPage"
              type="checkbox"
              :disabled="isProgressing"
            />
            <span class="rbsm-checkbox-style"><i></i></span>
          </label>
        </v-row>
      </div>
      <div class="rbsm-create-form-wrap">
        <button
          :disabled="isProgressing"
          class="rbsm-creation-btn rbsm-btn rbsm-transition rbsm-access-btn"
          @click="submitChoices"
        >
          <span>
            {{ isProgressing ? getText('loading') : getText('complete') }}
            <v-icon :class="{ 'rbsm-loading-icon': isProgressing }">
              {{ isProgressing ? 'mdi-loading' : 'mdi-arrow-right-thin' }}
            </v-icon>
          </span>
        </button>
      </div>
    </v-card>
  </div>
</template>
