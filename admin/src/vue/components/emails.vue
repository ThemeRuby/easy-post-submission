<script setup>
  import { onMounted, ref, watch } from 'vue'

  defineOptions({ name: 'emailsContent' })

  const panel = ref([])
  const adminMailPanel = ref([])
  const postTrashPanel = ref([])
  const adminMailInput = ref('')
  const postSubmitPanel = ref([])
  const postPublishPanel = ref([])
  const allowAdminMail = ref(false)
  const adminMailTitleInput = ref('')
  const mailTrashTitleInput = ref('')
  const mailSubmitTitleInput = ref('')
  const adminMailSubjectInput = ref('')
  const adminMailMessageInput = ref('')
  const mailTrashSubjectInput = ref('')
  const mailPublishTitleInput = ref('')
  const mailTrashMessageInput = ref('')
  const mailSubmitSubjectInput = ref('')
  const mailSubmitMessageInput = ref('')
  const mailPublishSubjectInput = ref('')
  const mailPublishMessageInput = ref('')
  const translate = ref(rbAjax.translate)
  const allowPostTrashNotification = ref(false)
  const allowPostSubmitNotification = ref(false)
  const allowPostPublishNotification = ref(false)

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
          email: {
            admin_mail: {
              status: allowAdminMail.value,
              email: adminMailInput.value,
              subject: adminMailSubjectInput.value,
              title: adminMailTitleInput.value,
              message: adminMailMessageInput.value
            },
            post_submit_notification: {
              status: allowPostSubmitNotification.value,
              subject: mailSubmitSubjectInput.value,
              title: mailSubmitTitleInput.value,
              message: mailSubmitMessageInput.value
            },
            post_publish_notification: {
              status: allowPostPublishNotification.value,
              subject: mailPublishSubjectInput.value,
              title: mailPublishTitleInput.value,
              message: mailPublishMessageInput.value
            },
            post_trash_notification: {
              status: allowPostTrashNotification.value,
              subject: mailTrashSubjectInput.value,
              title: mailTrashTitleInput.value,
              message: mailTrashMessageInput.value
            }
          }
        }

        if (validateAdminEmail()) {
          props.sendDataToSave(data)
        } else {
          props.sendDataToSave({})
          alert(translate.value.invalidAdminEmail)
        }
      }
    }
  )

  watch(panel, (newValue) => {
    localStorage.setItem('rbsm_admin_email_panel', newValue)
  })

  onMounted(() => {
    getLocalStorageValue()
  })

  function validateAdminEmail() {
    if (adminMailInput.value === '') return true

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    return emailRegex.test(adminMailInput.value)
  }

  function getLocalStorageValue() {
    const panelValue = localStorage.getItem('rbsm_admin_email_panel') || []
    panel.value = panelValue
  }

  function allowAdminMailChange() {
    adminMailPanel.value = allowAdminMail.value ? [0] : []
  }

  function allowPostSubmitNotificationChange() {
    postSubmitPanel.value = allowPostSubmitNotification.value ? [0] : []
  }

  function allowPostPublishNotificationChange() {
    postPublishPanel.value = allowPostPublishNotification.value ? [0] : []
  }

  function allowPostTrashNotificationChange() {
    postTrashPanel.value = allowPostTrashNotification.value ? [0] : []
  }

  function updateUIWithData() {
    allowAdminMail.value = props.data['admin_mail']?.['status'] ?? false
    adminMailInput.value = props.data['admin_mail']?.['email'] ?? ''
    adminMailSubjectInput.value = props.data['admin_mail']?.['subject'] ?? ''
    adminMailTitleInput.value = props.data['admin_mail']?.['title'] ?? ''
    adminMailMessageInput.value = props.data['admin_mail']?.['message'] ?? ''
    allowPostSubmitNotification.value =
      props.data['post_submit_notification']?.['status'] ?? false
    mailSubmitSubjectInput.value =
      props.data['post_submit_notification']?.['subject'] ?? ''
    mailSubmitTitleInput.value =
      props.data['post_submit_notification']?.['title'] ?? ''
    mailSubmitMessageInput.value =
      props.data['post_submit_notification']?.['message'] ?? ''
    allowPostPublishNotification.value =
      props.data['post_publish_notification']?.['status'] ?? false
    mailPublishSubjectInput.value =
      props.data['post_publish_notification']?.['subject'] ?? ''
    mailPublishTitleInput.value =
      props.data['post_publish_notification']?.['title'] ?? ''
    mailPublishMessageInput.value =
      props.data['post_publish_notification']?.['message'] ?? ''
    allowPostTrashNotification.value =
      props.data['post_trash_notification']?.['status'] ?? false
    mailTrashSubjectInput.value =
      props.data['post_trash_notification']?.['subject'] ?? ''
    mailTrashTitleInput.value =
      props.data['post_trash_notification']?.['title'] ?? ''
    mailTrashMessageInput.value =
      props.data['post_trash_notification']?.['message'] ?? ''

    allowAdminMailChange(allowAdminMail.value)
    allowPostSubmitNotificationChange(allowPostSubmitNotification.value)
    allowPostPublishNotificationChange(allowPostPublishNotification.value)
    allowPostTrashNotificationChange(allowPostTrashNotification.value)
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
            <v-icon class="mr-2">mdi-email-outline</v-icon>
            {{ translate.emails }}
          </p>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="rbsm-settings-list">
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="6">
                <p class="rbsm-setting-properties-title">
                  <v-icon class="rbsm-setting-icon">
                    mdi-shield-crown-outline
                  </v-icon>
                  {{ translate.adminEmail }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.adminEmailDesc }}
                </div>
              </v-col>
              <v-col
                class="pa-0 rbsm-checkbox-layout"
                cols="2"
                offset="4"
                offset-md="0"
              >
                <label class="rbsm-import-checkbox rbsm-checkbox">
                  <input
                    v-model="allowAdminMail"
                    checked="checked"
                    type="checkbox"
                    @change="allowAdminMailChange"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-expansion-panels
                v-model="adminMailPanel"
                class="rbsm-mini-expansion-panel"
                elevation="0"
              >
                <v-expansion-panel>
                  <v-expansion-panel-text>
                    <div class="rbsm-mini-card">
                      <v-row class="d-flex align-center rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            <v-icon class="rbsm-setting-icon">
                              mdi-email-fast-outline
                            </v-icon>
                            {{ translate.adminEmailAddress }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.adminEmailDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <input
                            v-model="adminMailInput"
                            class="rbsm-text-input"
                            placeholder="email@domain.com"
                            type="text"
                          />
                        </v-col>
                      </v-row>
                      <v-row class="d-flex align-center rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            {{ translate.subject }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailSubjectDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <input
                            v-model="adminMailSubjectInput"
                            class="rbsm-text-input"
                            type="text"
                          />
                        </v-col>
                      </v-row>
                      <v-row class="d-flex align-center rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            {{ translate.emailTitle }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailTitleDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <input
                            v-model="adminMailTitleInput"
                            class="rbsm-text-input"
                            type="text"
                          />
                        </v-col>
                      </v-row>
                      <v-row class="d-flex rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            {{ translate.message }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailMessageDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <textarea
                            v-model="adminMailMessageInput"
                            class="rbsm-text-area"
                          ></textarea>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="6">
                <p class="rbsm-setting-properties-title">
                  <v-icon class="rbsm-setting-icon">mdi-pencil-outline</v-icon>
                  {{ translate.postSubmitNotification }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.postSubmitNotificationDesc }}
                </div>
              </v-col>
              <v-col
                class="pa-0 rbsm-checkbox-layout"
                cols="2"
                offset="4"
                offset-md="0"
              >
                <label class="rbsm-import-checkbox rbsm-checkbox">
                  <input
                    v-model="allowPostSubmitNotification"
                    checked="checked"
                    type="checkbox"
                    @change="allowPostSubmitNotificationChange"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-expansion-panels
                v-model="postSubmitPanel"
                class="rbsm-mini-expansion-panel"
                elevation="0"
                multiple
              >
                <v-expansion-panel>
                  <v-expansion-panel-text>
                    <div class="rbsm-mini-card">
                      <v-row class="d-flex align-center rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            <v-icon class="rbsm-setting-icon">
                              mdi-send-outline
                            </v-icon>
                            {{ translate.subject }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailSubjectDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <input
                            v-model="mailSubmitSubjectInput"
                            class="rbsm-text-input"
                            type="text"
                          />
                        </v-col>
                      </v-row>
                      <v-row class="d-flex align-center rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            {{ translate.emailTitle }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailTitleDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <input
                            v-model="mailSubmitTitleInput"
                            class="rbsm-text-input"
                            type="text"
                          />
                        </v-col>
                      </v-row>
                      <v-row class="d-flex rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            {{ translate.message }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailMessageDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <textarea
                            v-model="mailSubmitMessageInput"
                            class="rbsm-text-area"
                          ></textarea>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="6">
                <p class="rbsm-setting-properties-title">
                  <v-icon class="rbsm-setting-icon">mdi-publish</v-icon>
                  {{ translate.postPublishNotification }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.postPublishNotificationDesc }}
                </div>
              </v-col>
              <v-col
                class="pa-0 rbsm-checkbox-layout"
                cols="2"
                offset="4"
                offset-md="0"
              >
                <label class="rbsm-import-checkbox rbsm-checkbox">
                  <input
                    v-model="allowPostPublishNotification"
                    checked="checked"
                    type="checkbox"
                    @change="allowPostPublishNotificationChange"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-expansion-panels
                v-model="postPublishPanel"
                class="rbsm-mini-expansion-panel"
                elevation="0"
                multiple
              >
                <v-expansion-panel>
                  <v-expansion-panel-text>
                    <div class="rbsm-mini-card">
                      <v-row class="d-flex rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            <v-icon class="rbsm-setting-icon">
                              mdi-send-outline
                            </v-icon>
                            {{ translate.subject }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailSubjectDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <input
                            v-model="mailPublishSubjectInput"
                            class="rbsm-text-input"
                            type="text"
                          />
                        </v-col>
                      </v-row>
                      <v-row class="d-flex rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            {{ translate.emailTitle }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailTitleDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <input
                            v-model="mailPublishTitleInput"
                            class="rbsm-text-input"
                            type="text"
                          />
                        </v-col>
                      </v-row>
                      <v-row class="d-flex rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            {{ translate.message }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailMessageDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <textarea
                            v-model="mailPublishMessageInput"
                            class="rbsm-text-area"
                          ></textarea>
                        </v-col>
                      </v-row>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="6">
                <p class="rbsm-setting-properties-title">
                  <v-icon class="rbsm-setting-icon">mdi-delete-variant</v-icon>
                  {{ translate.postTrashNotification }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.postTrashNotificationDesc }}
                </div>
              </v-col>
              <v-col
                class="pa-0 rbsm-checkbox-layout"
                cols="2"
                offset="4"
                offset-md="0"
              >
                <label class="rbsm-import-checkbox rbsm-checkbox">
                  <input
                    v-model="allowPostTrashNotification"
                    checked="checked"
                    type="checkbox"
                    @change="allowPostTrashNotificationChange"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-expansion-panels
                v-model="postTrashPanel"
                class="rbsm-mini-expansion-panel"
                elevation="0"
                multiple
              >
                <v-expansion-panel>
                  <v-expansion-panel-text>
                    <div class="rbsm-mini-card">
                      <v-row class="d-flex rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            <v-icon class="rbsm-setting-icon">
                              mdi-send-outline
                            </v-icon>
                            {{ translate.subject }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailSubjectDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <input
                            v-model="mailTrashSubjectInput"
                            class="rbsm-text-input"
                            type="text"
                          />
                        </v-col>
                      </v-row>
                      <v-row class="d-flex rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            {{ translate.emailTitle }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailTitleDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <input
                            v-model="mailTrashTitleInput"
                            class="rbsm-text-input"
                            type="text"
                          />
                        </v-col>
                      </v-row>
                      <v-row class="d-flex rbsm-row-settings-2">
                        <v-col class="pa-0" cols="12" md="6">
                          <p class="rbsm-setting-properties-title-2">
                            {{ translate.message }}
                          </p>
                          <div class="rbsm-setting-properties-content-2">
                            {{ translate.emailMessageDesc }}
                          </div>
                        </v-col>
                        <v-col class="rbsm-settings-input" cols="12" md="6">
                          <textarea
                            v-model="mailTrashMessageInput"
                            class="rbsm-text-area"
                          ></textarea>
                        </v-col>
                      </v-row>
                    </div>
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
