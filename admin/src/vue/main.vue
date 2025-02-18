<script>
  import { ref, watch, onMounted } from 'vue'

  import setupWizard from './components/setupWizard.vue'
  import formContent from './components/formContent.vue'
  import formSettingsContent from './components/formSettingsContent.vue'
  import restoreAndBackupContent from './components/restoreAndBackup.vue'
  import postManagerContent from './components/postManagerContent.vue'
  import helpContent from './components/helpContent.vue'

  export default {
    name: 'App',
    components: {
      setupWizard,
      formContent,
      formSettingsContent,
      restoreAndBackupContent,
      postManagerContent,
      helpContent
    },

    setup() {
      const tab = ref('formTab')
      const formItemFromFormTab = ref(null)
      const shouldUpdateData = ref(false)
      const translate = rbAjax.translate
      const directionClass = rbAjax.isRTL
        ? 'v-locale--is-rtl'
        : 'v-locale--is-ltr'
      const yesSetup = !!rbAjax.yesSetup

      const getText = (key) => {
        return translate[key] || key
      }

      watch(tab, (newValue) => {
        localStorage.setItem('rbsm_admin_setting_tab', newValue)
      })

      onMounted(() => {
        tab.value = localStorage.getItem('rbsm_admin_setting_tab') ?? 'formTab'
      })

      const openFormSettings = (formItem) => {
        tab.value = 'formSettingTab'
        formItemFromFormTab.value = formItem
      }

      const openForm = () => {
        tab.value = 'formTab'
        shouldUpdateData.value = true
      }

      const updateDataCompleted = () => {
        shouldUpdateData.value = false
      }

      const docsButtonClick = () => {
        window.open(
          'https://docs.themeruby.com/easy-post-submission/',
          '_blank'
        )
      }

      return {
        tab,
        formItemFromFormTab,
        shouldUpdateData,
        getText,
        directionClass,
        yesSetup,
        openFormSettings,
        openForm,
        updateDataCompleted,
        docsButtonClick
      }
    }
  }
</script>
<template>
  <v-app class="rbsm-app">
    <v-container class="rbsm-container">
      <div :class="directionClass">
        <v-row class="ma-0 pa-0">
          <v-col class="ma-0 pa-0" cols="12">
            <v-card
              id="rbsm-introduce-card-settings"
              class="rbsm-card d-flex justify-space-between"
              elevation="0"
            >
              <div class="rbsm-introduce-left">
                <div class="d-flex">
                  <h1 class="rbsm-admin-title">
                    <svg
                      viewBox="0 0 512 512"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M421.073 221.719c-0.578 11.719-9.469 26.188-23.797 40.094v183.25c-0.016 4.719-1.875 8.719-5.016 11.844-3.156 3.063-7.25 4.875-12.063 4.906H81.558c-4.781-0.031-8.891-1.844-12.047-4.906-3.141-3.125-4.984-7.125-5-11.844V152.219c0.016-4.703 1.859-8.719 5-11.844 3.156-3.063 7.266-4.875 12.047-4.906h158.609c12.828-16.844 27.781-34.094 44.719-49.906H81.558c-18.75-0.016-35.984 7.531-48.25 19.594-12.328 12.063-20.016 28.938-20 47.344v292.844c-0.016 18.406 7.672 35.313 20 47.344C45.573 504.469 62.808 512 81.558 512h298.641c18.781 0 36.016-7.531 48.281-19.594 12.297-12.031 20-28.938 19.984-47.344V203.469c0 0-0.125-0.156-0.328-0.313C440.37 209.813 431.323 216.156 421.073 221.719z"
                      />
                      <path
                        d="M498.058 0c0 0-15.688 23.438-118.156 58.109C275.417 93.469 211.104 237.313 211.104 237.313c-15.484 29.469-76.688 151.906-76.688 151.906-16.859 31.625 14.031 50.313 32.156 17.656 34.734-62.688 57.156-119.969 109.969-121.594 77.047-2.375 129.734-69.656 113.156-66.531-21.813 9.5-69.906 0.719-41.578-3.656 68-5.453 109.906-56.563 96.25-60.031-24.109 9.281-46.594 0.469-51-2.188C513.386 138.281 498.058 0 498.058 0z"
                      />
                    </svg>
                    {{ getText('title') }}
                  </h1>
                  <button
                    class="rbsm-black-btn rbsm-transition rbsm-access-btn rbsm-docs-btn"
                    @click="docsButtonClick"
                  >
                    <v-icon>mdi-file-document</v-icon>
                    {{ getText('documents') }}
                  </button>
                </div>
                <p class="rbsm-tagline">{{ getText('description') }}</p>
              </div>
              <div class="rbsm-introduce-right">
                <img
                  :src="'https://api.themeruby.com/images/easy-post-submission.gif?v=1.0'"
                  alt="introduce"
                />
              </div>
            </v-card>
          </v-col>
        </v-row>
        <setupWizard v-if="!yesSetup" :getText="getText" />
        <v-tabs v-if="yesSetup" v-model="tab" class="rbsm-v-tabs">
          <!-- Tabs Section -->
          <v-card id="rbsm-tab-title">
            <v-tab class="rbsm-vtab-title" value="formTab">
              <v-icon>mdi-form-dropdown</v-icon>
              {{ getText('formTab') }}
            </v-tab>
            <v-tab class="rbsm-vtab-title" value="formSettingTab">
              <v-icon>mdi-cog</v-icon>
              {{ getText('formSettingTab') }}
            </v-tab>
            <v-tab class="rbsm-vtab-title" value="postManager">
              <v-icon>mdi-file-document-outline</v-icon>
              {{ getText('postManager') }}
            </v-tab>
            <v-tab class="rbsm-vtab-title" value="syncDataTab">
              <v-icon>mdi-restore</v-icon>
              {{ getText('syncDataTab') }}
            </v-tab>
            <v-tab class="rbsm-vtab-title" value="helpTab">
              <v-icon>mdi mdi-lifebuoy</v-icon>
              {{ getText('helpTab') }}
            </v-tab>
          </v-card>
        </v-tabs>
        <v-tabs-window v-if="yesSetup" v-model="tab" class="mt-3 no-overflow">
          <!-- Tabs Content Section -->
          <v-tabs-window-item value="formTab">
            <formContent
              :shouldUpdateData="shouldUpdateData"
              @open-form-settings="openFormSettings"
              @update-data-completed="updateDataCompleted"
            />
          </v-tabs-window-item>
          <v-tabs-window-item value="formSettingTab">
            <formSettingsContent
              :formItemReceived="formItemFromFormTab"
              :isTabVisible="tab === 'formSettingTab'"
              @open-form="openForm"
            />
          </v-tabs-window-item>
          <v-tabs-window-item value="postManager">
            <postManagerContent :isTabVisible="tab === 'postManager'" />
          </v-tabs-window-item>
          <v-tabs-window-item value="syncDataTab">
            <restoreAndBackupContent
              :isTabVisible="tab === 'syncDataTab'"
              @open-form="openForm"
            />
          </v-tabs-window-item>
          <v-tabs-window-item value="helpTab">
            <helpContent :getText="getText" />
          </v-tabs-window-item>
        </v-tabs-window>
      </div>
    </v-container>
  </v-app>
</template>
