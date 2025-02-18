<script setup>
  import { onMounted, ref, watch } from 'vue'

  defineOptions({ name: 'securityFieldsContent' })

  const panel = ref([])
  const reCaptchaPanel = ref([])
  const challengePanel = ref([])
  const allowChallenge = ref(false)
  const allowReCaptcha = ref(false)
  const recaptchaSiteKeyInput = ref('')
  const challengeQuestionInput = ref('')
  const challengeResponseInput = ref('')
  const translate = ref(rbAjax.translate)
  const recaptchaSecretKeyInput = ref('')

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
    () => updateUIWithData()
  )

  watch(
    () => props.saveData,
    (newValue) => {
      if (newValue) {
        const data = {
          security_fields: {
            challenge: {
              status: allowChallenge.value,
              question: challengeQuestionInput.value,
              response: challengeResponseInput.value
            },
            recaptcha: {
              status: allowReCaptcha.value,
              recaptcha_site_key: recaptchaSiteKeyInput.value,
              recaptcha_secret_key: recaptchaSecretKeyInput.value
            }
          }
        }
        props.sendDataToSave(data)
      }
    }
  )

  watch(panel, (newValue) => {
    localStorage.setItem('rbsm_admin_security_panel', newValue)
  })

  onMounted(() => {
    const panelValue = localStorage.getItem('rbsm_admin_security_panel') || []
    panel.value = panelValue
  })

  function allowReCaptchaChange() {
    reCaptchaPanel.value = allowReCaptcha.value ? [0] : []
  }

  function allowChallengeChange() {
    challengePanel.value = allowChallenge.value ? [0] : []
  }

  function updateUIWithData() {
    allowChallenge.value = props.data['challenge']?.['status'] ?? false
    challengeQuestionInput.value = props.data['challenge']?.['question'] ?? ''
    challengeResponseInput.value = props.data['challenge']?.['response'] ?? ''
    allowReCaptcha.value = props.data['recaptcha']?.['status'] ?? false
    recaptchaSiteKeyInput.value =
      props.data['recaptcha']?.['recaptcha_site_key'] ?? ''
    recaptchaSecretKeyInput.value =
      props.data['recaptcha']?.['recaptcha_secret_key'] ?? ''

    allowReCaptchaChange(allowReCaptcha.value)
    allowChallengeChange(allowChallenge.value)
  }
</script>

<template>
  <div class="rbsm-fullwidth">
    <v-expansion-panels
      v-model="panel"
      multiple
      class="rbsm-expansion-panel"
      elevation="0"
    >
      <v-expansion-panel>
        <v-expansion-panel-title>
          <p class="rbsm-settings-title">
            <v-icon class="mr-2">mdi-security</v-icon>
            {{ translate.securityFields }}
          </p>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="rbsm-settings-list">
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col cols="6" class="pa-0">
                <p class="rbsm-setting-properties-title">
                  {{ translate.challenge }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.challengeDesc }}
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
                    v-model="allowChallenge"
                    @change="allowChallengeChange"
                    type="checkbox"
                    checked="checked"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-expansion-panels
                v-model="challengePanel"
                multiple
                class="rbsm-mini-expansion-panel"
                elevation="0"
              >
                <v-expansion-panel>
                  <v-expansion-panel-text>
                    <v-row class="d-flex align-center rbsm-row-settings-2">
                      <v-col cols="12" md="6" class="pa-0">
                        <p class="rbsm-setting-properties-title-2">
                          {{ translate.challengeQuestion }}
                        </p>
                        <div class="rbsm-setting-properties-content-2">
                          {{ translate.challengeQuestionDesc }}
                        </div>
                      </v-col>
                      <v-col cols="12" md="6" class="rbsm-settings-input">
                        <input
                          class="rbsm-text-input"
                          type="text"
                          v-model="challengeQuestionInput"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="d-flex align-center rbsm-row-settings-2">
                      <v-col cols="12" md="6" class="pa-0">
                        <p class="rbsm-setting-properties-title-2">
                          {{ translate.challengeResponse }}
                        </p>
                        <div class="rbsm-setting-properties-content-2">
                          {{ translate.challengeResponseDesc }}
                        </div>
                      </v-col>
                      <v-col cols="12" md="6" class="rbsm-settings-input">
                        <input
                          class="rbsm-text-input"
                          type="text"
                          v-model="challengeResponseInput"
                        />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col cols="6" class="pa-0">
                <p class="rbsm-setting-properties-title">
                  {{ translate.recaptcha }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.recaptchaDesc }}
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
                    v-model="allowReCaptcha"
                    @change="allowReCaptchaChange"
                    type="checkbox"
                    checked="checked"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-expansion-panels
                v-model="reCaptchaPanel"
                multiple
                class="rbsm-mini-expansion-panel"
                elevation="0"
              >
                <v-expansion-panel>
                  <v-expansion-panel-text>
                    <v-row class="d-flex align-center rbsm-row-settings-2">
                      <v-col cols="12" md="6" class="pa-0">
                        <p class="rbsm-setting-properties-title-2">
                          {{ translate.recaptchaSiteKey }}
                        </p>
                        <div class="rbsm-setting-properties-content-2">
                          {{ translate.recaptchaSiteKeyDesc }}
                        </div>
                      </v-col>
                      <v-col cols="12" md="6" class="rbsm-settings-input">
                        <input
                          class="rbsm-text-input"
                          type="text"
                          v-model="recaptchaSiteKeyInput"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="d-flex align-center rbsm-row-settings-2">
                      <v-col cols="12" md="6" class="pa-0">
                        <p class="rbsm-setting-properties-title-2">
                          {{ translate.recaptchaSecretKey }}
                        </p>
                        <div class="rbsm-setting-properties-content-2">
                          {{ translate.recaptchaSecretKeyDesc }}
                        </div>
                      </v-col>
                      <v-col cols="12" md="6" class="rbsm-settings-input">
                        <input
                          class="rbsm-text-input"
                          v-model="recaptchaSecretKeyInput"
                          type="text"
                        />
                      </v-col>
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
