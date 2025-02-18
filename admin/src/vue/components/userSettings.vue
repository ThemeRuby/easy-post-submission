<script setup>
  import { onMounted, ref, watch } from 'vue'

  defineOptions({ name: 'userSettingsContent' })

  const panel = ref([])
  const authorPanel = ref([])
  const authorItems = ref([])
  const loginMessage = ref('')
  const loginTypePanel = ref([])
  const authorSelected = ref('')
  const requiredLoginTitle = ref('')
  const requiredLoginTitleDesc = ref('')
  const translate = ref(rbAjax.translate)
  const loginRequired = ref('allow_guest')
  const loginTypeSelected = ref('show_login_message')
  const loginItems = ref([
    {
      id: 'allow_guest',
      title: 'Allow Guest'
    },
    {
      id: 'only_logged_user',
      title: 'Only Logged User'
    }
  ])
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

  let authors = []
  let authorSelectedId = -1
  let loginLinkLabel

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({})
    },
    saveData: {
      type: Boolean,
      default: false
    },
    sendDataToSave: {
      type: Function,
      require: true
    }
  })

  watch(
    () => props.data,
    () => {
      updateUIWithData()
    }
  )

  watch(
    () => props.saveData,
    (newValue) => {
      if (newValue) {
        const data = {
          user_login: {
            author_access: loginRequired.value,
            assign_author: authorSelected.value,
            assign_author_id: authorSelectedId,
            login_type: {
              type: loginTypeSelected.value,
              required_login_title: requiredLoginTitle.value,
              required_login_title_desc: requiredLoginTitleDesc.value,
              login_message: loginMessage.value
            }
          }
        }
        props.sendDataToSave(data)
      }
    }
  )

  watch(panel, (newValue) => {
    localStorage.setItem('rbsm_admin_user_setting_panel', newValue)
  })

  onMounted(() => {
    getLocalStorageValue()
    getAllAuthors()
    loginRequiredChange(loginRequired.value)
  })

  function getLocalStorageValue() {
    panel.value = localStorage.getItem('rbsm_admin_user_setting_panel') || []
  }

  function loginRequiredChange(value) {
    if (value === 'allow_guest') {
      authorPanel.value = [0]
    } else {
      authorPanel.value = [1]
      changeLoginType(loginTypeSelected.value)
    }
  }

  function changeLoginType(value) {
    if (value === 'show_login_message') loginTypePanel.value = [0]
    else loginTypePanel.value = []
  }

  function updateUIWithData() {
    loginRequired.value = props.data['author_access'] ?? 'allow_guest'
    authorSelected.value = props.data['assign_author'] ?? ''
    authorSelectedId = props.data['assign_author_id'] ?? -1
    loginTypeSelected.value =
      props.data['login_type']?.['type'] ?? 'show_login_message'
    loginMessage.value = props.data['login_type']?.['login_message'] ?? ''
    loginLinkLabel = props.data['login_type']?.['login_link_label'] ?? ''
    requiredLoginTitle.value =
      props.data['login_type']?.['required_login_title'] ?? ''
    requiredLoginTitleDesc.value =
      props.data['login_type']?.['required_login_title_desc'] ?? ''

    loginRequiredChange(loginRequired.value)
  }

  function getAllAuthors() {
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
          if (data.success) {
            authors = data.data
            authorItems.value = authors.map((author) => author.display_name)

            resolve()
          } else {
            resolve()
          }
        })
        .catch((error) => {
          console.log(error)
        })
    })
  }

  function changeAuthorSelect(value) {
    authorSelectedId = authors.find(
      (author) => author.display_name === value
    )?.ID
  }
</script>

<template>
  <div class="rbsm-fullwidth">
    <v-expansion-panels
      v-model="panel"
      class="rbsm-expansion-panel"
      elevation="0"
      multiple
    >
      <v-expansion-panel>
        <v-expansion-panel-title>
          <p class="rbsm-settings-title">
            <v-icon class="mr-2">mdi-login-variant</v-icon>
            {{ translate.userLogin }}
          </p>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="rbsm-settings-list">
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.authorAccess }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.authorAccessDesc }}
                </div>
              </v-col>
              <v-col
                class="d-flex flex-column justify-end rbsm-settings-input"
                cols="12"
                md="6"
              >
                <v-select
                  v-model="loginRequired"
                  :items="loginItems"
                  item-value="id"
                  item-title="title"
                  class="rbsm-select"
                  density="compact"
                  hide-details
                  variant="outlined"
                  @update:modelValue="loginRequiredChange"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-expansion-panels
                v-model="authorPanel"
                class="rbsm-mini-expansion-panel"
                elevation="0"
                multiple
              >
                <v-expansion-panel>
                  <v-expansion-panel-text>
                    <v-row class="d-flex align-center rbsm-row-settings-2">
                      <v-col class="pa-0" cols="12" md="6">
                        <p class="rbsm-setting-properties-title-2">
                          {{ translate.assignAuthor }}
                        </p>
                        <div class="rbsm-setting-properties-content">
                          {{ translate.assignAuthorDesc }}
                        </div>
                      </v-col>
                      <v-col class="rbsm-settings-input" cols="12" md="6">
                        <v-select
                          v-model="authorSelected"
                          :items="authorItems"
                          class="rbsm-select"
                          density="compact"
                          hide-details
                          variant="outlined"
                          @update:modelValue="changeAuthorSelect"
                        ></v-select>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
                <v-expansion-panel>
                  <v-expansion-panel-text>
                    <v-row class="d-flex align-center rbsm-row-settings-2">
                      <v-col class="pa-0" cols="12" md="6">
                        <p class="rbsm-setting-properties-title-2">
                          {{ translate.loginType }}
                        </p>
                        <div class="rbsm-setting-properties-content-2">
                          {{ translate.loginTypeDesc }}
                        </div>
                      </v-col>
                      <v-col class="rbsm-settings-input" cols="12" md="6">
                        <v-select
                          v-model="loginTypeSelected"
                          :items="loginTypeItems"
                          item-value="id"
                          item-title="title"
                          class="rbsm-select"
                          density="compact"
                          hide-details
                          variant="outlined"
                          @update:modelValue="changeLoginType"
                        ></v-select>
                      </v-col>
                    </v-row>
                    <v-row class="d-flex align-center rbsm-row-settings-2">
                      <v-expansion-panels
                        v-model="loginTypePanel"
                        class="rbsm-mini-expansion-panel"
                        elevation="0"
                        multiple
                      >
                        <v-expansion-panel>
                          <v-expansion-panel-text>
                            <v-row
                              class="d-flex align-center rbsm-row-settings-2"
                            >
                              <v-col class="pa-0" cols="12" md="6">
                                <p class="rbsm-setting-properties-title-3">
                                  {{ translate.customRequiredLoginTitle }}
                                </p>
                                <div class="rbsm-setting-properties-content-3">
                                  {{ translate.customRequiredLoginTitleDesc }}
                                </div>
                              </v-col>
                              <v-col
                                class="rbsm-settings-input"
                                cols="12"
                                md="6"
                              >
                                <input
                                  v-model="requiredLoginTitle"
                                  class="rbsm-text-input"
                                  type="text"
                                />
                              </v-col>
                            </v-row>
                            <v-row
                              class="d-flex align-center rbsm-row-settings-2"
                            >
                              <v-col class="pa-0" cols="12" md="6">
                                <p class="rbsm-setting-properties-title-3">
                                  {{ translate.customRequiredLoginDescLabel }}
                                </p>
                                <div class="rbsm-setting-properties-content-3">
                                  {{
                                    translate.customRequiredLoginDescLabelDesc
                                  }}
                                </div>
                              </v-col>
                              <v-col
                                class="rbsm-settings-input"
                                cols="12"
                                md="6"
                              >
                                <input
                                  v-model="requiredLoginTitleDesc"
                                  class="rbsm-text-input"
                                  type="text"
                                />
                              </v-col>
                            </v-row>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-row>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
