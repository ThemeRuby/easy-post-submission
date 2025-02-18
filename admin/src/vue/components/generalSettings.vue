<script setup>
  import { onMounted, ref, watch } from 'vue'
  defineOptions({ name: 'generalSettingsContent' })

  const panel = ref([])
  const urlDirection = ref('')
  const allowUniqueTitle = ref(true)
  const translate = ref(rbAjax.translate)
  const formLayoutTypeSelected = ref('2_cols')
  const postStatusSelected = ref('pending_review')
  const formLayoutTypeItems = ref([
    {
      id: '1_col',
      title: '1 Col'
    },
    {
      id: '2_cols',
      title: '2 Cols'
    }
  ])
  const postStatusItems = ref([
    {
      id: 'draft',
      title: 'Draft'
    },
    {
      id: 'pending_review',
      title: 'Pending Review'
    },
    {
      id: 'publish',
      title: 'Publish'
    }
  ])

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
          general_setting: {
            post_status: postStatusSelected.value,
            url_direction: urlDirection.value,
            unique_title: allowUniqueTitle.value,
            form_layout_type: formLayoutTypeSelected.value
          }
        }

        if (validateURLDirection()) {
          data.general_setting.url_direction = urlDirection.value
          props.sendDataToSave(data)
        } else {
          alert(translate.value.urlDirectionError)
          props.sendDataToSave({})
        }
      }
    }
  )

  watch(panel, (newValue) =>
    localStorage.setItem('rbsm_admin_general_setting_panel', newValue)
  )

  onMounted(() => {
    panel.value = localStorage.getItem('rbsm_admin_general_setting_panel') || [
      0
    ]
  })

  function updateUIWithData() {
    postStatusSelected.value = props.data['post_status'] ?? 'draft'
    urlDirection.value = props.data['url_direction'] ?? ''
    allowUniqueTitle.value = props.data['unique_title'] ?? true
    formLayoutTypeSelected.value = props.data['form_layout_type'] ?? '2_cols'
  }

  function validateURLDirection() {
    if (urlDirection.value === '') return true

    const urlRegex =
      /^(https?:\/\/)?([\da-z\.-]+\.[a-z\.]{2,6}|localhost)(:\d+)?([\/\w\.\-\=\&]*)*\/?$/i
    if (!urlRegex.test(urlDirection.value)) return false

    const regex = /^(localhost|127\.0\.0\.1)(:\d{1,5})?$/
    if (regex.test(urlDirection.value)) {
      urlDirection.value = `http://${urlDirection.value}`
    }

    return true
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
          <div>
            <p class="rbsm-settings-title">
              <v-icon class="mr-2">mdi-web</v-icon>
              {{ translate.generalSettings }}
            </p>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="rbsm-settings-list">
            <v-row class="d-flex rbsm-row-settings">
              <v-col class="pa-0 ma-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.postStatus }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.postStatusDesc }}
                </div>
              </v-col>
              <v-col class="d-flex rbsm-settings-input" cols="12" md="6">
                <v-select
                  v-model="postStatusSelected"
                  :items="postStatusItems"
                  item-title="title"
                  item-value="id"
                  class="rbsm-select"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="d-flex rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.urlDirection }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.urlDirectionDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <input
                  v-model="urlDirection"
                  class="rbsm-text-input"
                  type="text"
                />
              </v-col>
            </v-row>
            <v-row class="d-flex rbsm-row-settings">
              <v-col class="pa-0" cols="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.uniqueTitle }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.uniqueTitleDesc }}
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
                    v-model="allowUniqueTitle"
                    checked="checked"
                    type="checkbox"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row class="d-flex rbsm-row-settings">
              <v-col class="pa-0 ma-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.submissionFormLayoutType }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.submissionFormLayoutTypeDesc }}
                </div>
              </v-col>
              <v-col class="d-flex rbsm-settings-input" cols="12" md="6">
                <v-select
                  v-model="formLayoutTypeSelected"
                  :items="formLayoutTypeItems"
                  item-title="title"
                  item-value="id"
                  class="rbsm-select"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
