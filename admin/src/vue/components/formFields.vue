<script setup>
  import { onMounted, ref, watch } from 'vue'

  defineOptions({ name: 'formFieldsContent' })

  const tags = ref([])
  const panel = ref([])
  const maxImages = ref(3)
  const categories = ref([])
  const snackbar = ref(false)
  const customFields = ref([])
  const maxImageSize = ref(100)
  const imagePreview = ref(null)
  const snackbarMessage = ref('')
  const maxImageSizePanel = ref([])
  const allowMultiTags = ref(false)
  const featuredImagePanel = ref([])
  const allowAddNewTags = ref(false)
  const excludeTagsSelected = ref([])
  const defaultFeaturedImageID = ref(0)
  const taglineSelected = ref('require')
  const autoAssignTagsSelected = ref([])
  const userNameSelected = ref('require')
  const excludeCategorySelected = ref([])
  const uploadFileSizeLimitInput = ref(0)
  const allowMultiCategories = ref(false)
  const translate = ref(rbAjax.translate)
  const userEmailSelected = ref('require')
  const postTitleSelected = ref('require')
  const isFeaturedImageLoading = ref(false)
  const autoAssignCategotySelected = ref([])
  const featuredImageSelected = ref('disable')
  const editorTypeSelected = ref('rich_editor')
  const snackbarClass = ref('rbsm-failed-snackbar')
  const customFieldItems = ref([
    { id: 'text', title: 'Text' },
    { id: 'textarea', title: 'Textarea' }
  ])

  const editorTypeItems = ref([
    {
      id: 'rich_editor',
      title: 'Rich Editor'
    },
    {
      id: 'raw_html',
      title: 'RawHTML'
    }
  ])

  const selectOptionsTemplate = [
    {
      id: 'require',
      title: 'Require'
    },
    {
      id: 'optional',
      title: 'Optional'
    },
    {
      id: 'disable',
      title: 'Disable'
    }
  ]

  const taglineItems = ref(selectOptionsTemplate)
  const userNameItems = ref(selectOptionsTemplate)
  const postTitleItems = ref(selectOptionsTemplate)
  const userEmailItems = ref(selectOptionsTemplate)
  const featuredImageItems = ref(selectOptionsTemplate)

  let tagIds = []
  let categoryIds = []
  let maxCustomFields = 2
  let excludeTagSelectedIds = []
  let autoAssignTagSelectedIds = []
  let excludeCategorySelectedIds = []
  let autoAssignCategorySelectedIds = []

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
    (_) => {
      updateUIWithData()
    }
  )

  watch(
    () => props.saveData,
    (newValue) => {
      if (newValue) {
        const data = {
          form_fields: {
            user_name: userNameSelected.value,
            user_email: userEmailSelected.value,
            post_title: postTitleSelected.value,
            tagline: taglineSelected.value,
            editor_type: editorTypeSelected.value,
            max_images:
              maxImages.value === '' || maxImages.value < 0
                ? 0
                : maxImages.value,
            max_image_size:
              maxImageSize.value === '' || maxImageSize.value < 0
                ? 0
                : maxImageSize.value,
            featured_image: {
              status: featuredImageSelected.value,
              upload_file_size_limit: uploadFileSizeLimitInput.value,
              default_featured_image: defaultFeaturedImageID.value
            },
            categories: {
              multiple_categories: allowMultiCategories.value,
              exclude_categories: excludeCategorySelected.value,
              exclude_category_ids: excludeCategorySelectedIds,
              auto_assign_categories: autoAssignCategotySelected.value,
              auto_assign_category_ids: autoAssignCategorySelectedIds
            },
            tags: {
              multiple_tags: allowMultiTags.value,
              allow_add_new_tag: allowAddNewTags.value,
              exclude_tags: excludeTagsSelected.value,
              exclude_tag_ids: excludeTagSelectedIds,
              auto_assign_tags: autoAssignTagsSelected.value,
              auto_assign_tag_ids: autoAssignTagSelectedIds
            },
            custom_field: customFields.value
          }
        }

        if (!isValidCustomFieldsName()) {
          alert(translate.value.warningSameCustomFieldName)
          props.sendDataToSave({})
        } else {
          props.sendDataToSave(data)
        }
      }
    }
  )

  watch(panel, (newValue) => {
    localStorage.setItem('rbsm_admin_form_fields_panel', newValue)
  })

  onMounted(() => {
    getLocalStorageValue()
    getCategories()
    getTags()
  })

  function getLocalStorageValue() {
    const panelValue =
      localStorage.getItem('rbsm_admin_form_fields_panel') || []
    panel.value = panelValue
  }

  function getCategories() {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('action', 'rbsm_admin_get_categories')
      formData.append('_nonce', rbAjax.nonce)

      fetch(rbAjax.ajaxUrl, {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            categories.value = data.data.map((category) => category.name)
            categoryIds = data.data.map((category) => category.term_id)
            resolve()
          } else {
            resolve()
          }
        })
        .catch((error) => {
          displayErrorDialog(error)
          console.log(error)
        })
    })
  }

  function getTags() {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('action', 'rbsm_admin_get_tags')
      formData.append('_nonce', rbAjax.nonce)

      fetch(rbAjax.ajaxUrl, {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            tags.value = data.data.map((tag) => tag.name)
            tagIds = data.data.map((tag) => tag.term_id)
            resolve()
          } else {
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

  function addNewField() {
    if (customFields.value.length >= maxCustomFields) {
      alert(translate.value.maxCustomField)
      return
    }

    customFields.value.push({
      custom_field_label: ref(''),
      custom_field_name: ref(''),
      field_type: ref('text')
    })
  }

  function deleteCustomField(customFieldIndex) {
    customFields.value.splice(customFieldIndex, 1)
  }

  function featuredImageChange(value) {
    if (value === 'disable') featuredImagePanel.value = []
    else featuredImagePanel.value = [0]

    displayDefaultFeaturedImage()
  }

  function displayDefaultFeaturedImage() {
    if (typeof wp === 'undefined' || typeof wp.media === 'undefined') {
      alert(translate.value.wordpressMediaError)
      return
    }

    const attachment = wp.media.attachment(defaultFeaturedImageID.value)

    attachment.fetch().then(() => {
      imagePreview.value = attachment.attributes.url
    })
  }

  function updateUIWithData() {
    userNameSelected.value = props.data['user_name'] ?? 'require'
    userEmailSelected.value = props.data['user_email'] ?? 'require'
    postTitleSelected.value = props.data['post_title'] ?? 'require'
    taglineSelected.value = props.data['tagline'] ?? 'require'
    editorTypeSelected.value = props.data['editor_type'] ?? 'rich_editor'
    featuredImageSelected.value =
      props.data['featured_image']?.['status'] ?? 'disable'
    uploadFileSizeLimitInput.value =
      props.data['featured_image']?.['upload_file_size_limit'] ?? 0
    defaultFeaturedImageID.value =
      props.data['featured_image']?.['default_featured_image'] ?? ''
    allowMultiCategories.value =
      props.data['categories']?.['multiple_categories'] ?? false
    excludeCategorySelected.value =
      props.data['categories']?.['exclude_categories'] ?? []
    excludeCategorySelectedIds =
      props.data['categories']?.['exclude_category_ids'] ?? []
    autoAssignCategotySelected.value =
      props.data['categories']?.['auto_assign_categories'] ?? []
    autoAssignCategorySelectedIds =
      props.data['categories']?.['auto_assign_category_ids'] ?? []
    allowMultiTags.value = props.data['tags']?.['multiple_tags'] ?? false
    allowAddNewTags.value = props.data['tags']?.['allow_add_new_tag'] ?? false
    excludeTagsSelected.value = props.data['tags']?.['exclude_tags'] ?? []
    excludeTagSelectedIds = props.data['tags']?.['exclude_tag_ids'] ?? []
    autoAssignTagsSelected.value =
      props.data['tags']?.['auto_assign_tags'] ?? []
    autoAssignTagSelectedIds = props.data['tags']?.['auto_assign_tag_ids'] ?? []
    customFields.value = props.data['custom_field'] ?? []
    maxImages.value = props.data?.['max_images'] ?? 3
    maxImages.value = maxImages.value === '' ? 3 : maxImages.value
    maxImageSize.value = props.data?.['max_image_size'] ?? 100
    maxImageSize.value = maxImageSize.value === '' ? 100 : maxImageSize.value

    updateSizeOfEachImagePanel()
    featuredImageChange(featuredImageSelected.value)
  }

  function changeAllowMultiCategories(value) {
    allowMultiCategories.value = value
  }

  function changeAllowMultiTags(value) {
    allowMultiTags.value = value
  }

  function changeAllowAddNewTags(value) {
    allowAddNewTags.value = value
  }

  function excludeCategoryChange(values) {
    excludeCategorySelectedIds = []
    values.forEach((value) => {
      const index = categories.value.findIndex((category) => category === value)
      excludeCategorySelectedIds.push(categoryIds[index])
    })
  }

  function autoAssignCategoryChange(values) {
    autoAssignCategorySelectedIds = []
    values.forEach((value) => {
      const index = categories.value.findIndex((category) => category === value)
      autoAssignCategorySelectedIds.push(categoryIds[index])
    })
  }

  function excludeTagChange(values) {
    excludeTagSelectedIds = []
    values.forEach((value) => {
      const index = tags.value.findIndex((tag) => tag === value)
      excludeTagSelectedIds.push(tagIds[index])
    })
  }

  function autoAssignTagChange(values) {
    autoAssignTagSelectedIds = []
    values.forEach((value) => {
      const index = tags.value.findIndex((tag) => tag === value)
      autoAssignTagSelectedIds.push(tagIds[index])
    })
  }

  function isValidCustomFieldsName() {
    if (customFields.value <= 1) return true

    const arraySet = customFields.value.map(
      (customField) => customField['custom_field_name']
    )

    return new Set(arraySet).size === customFields.value.length
  }

  function openMediaUploader() {
    const self = this

    if (typeof wp === 'undefined' || typeof wp.media === 'undefined') {
      console.log(translate.value.wordpressMediaError)
      return
    }

    const mediaUploader = wp.media({
      title: translate.value.selectMedia,
      button: {
        text: translate.value.useThisMedia
      },
      multiple: false
    })

    mediaUploader.on('select', function () {
      const attachment = mediaUploader.state().get('selection').first().toJSON()

      if (imagePreview.value !== attachment.url)
        isFeaturedImageLoading.value = true

      imagePreview.value = attachment.url
      defaultFeaturedImageID.value = attachment.id
    })

    mediaUploader.open()
  }

  function removeDefaultFeaturedImage() {
    imagePreview.value = null
    defaultFeaturedImageID.value = 0
  }

  function onFeaturedImageLoaded() {
    isFeaturedImageLoading.value = false
  }

  function displayErrorDialog(errorMessage) {
    snackbarClass.value = 'rbsm-failed-snackbar'
    snackbarMessage.value = errorMessage
    snackbar.value = true
  }

  function maxImagesChanges() {
    updateSizeOfEachImagePanel()
  }

  function updateSizeOfEachImagePanel() {
    maxImageSizePanel.value =
      maxImages.value > 0 && maxImages.value !== '' ? [0] : []
  }

  function handleChange() {
    console.log('this. item ne: ', editorTypeSelected.value)
  }
</script>

<template>
  <div class="rbsm-fullwidth rbsm-snackbar-container">
    <v-snackbar v-model="snackbar" :class="[snackbarClass]" :timeout="3000">
      <v-icon class="pr-2">mdi-alert-outline</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>
    <v-expansion-panels
      v-model="panel"
      class="rbsm-expansion-panel"
      elevation="0"
      multiple
    >
      <v-expansion-panel>
        <v-expansion-panel-title>
          <p class="rbsm-settings-title">
            <v-icon class="mr-2">mdi-checkbox-marked-outline</v-icon>
            {{ translate.formFields }}
          </p>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="rbsm-settings-list">
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.userName }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.userNameDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <v-select
                  v-model="userNameSelected"
                  :items="userNameItems"
                  item-value="id"
                  item-title="title"
                  class="rbsm-select"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.userEmail }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.userEmailDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <v-select
                  v-model="userEmailSelected"
                  :items="userEmailItems"
                  item-value="id"
                  item-title="title"
                  class="rbsm-select"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.postTitle }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.postTitleDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <v-select
                  v-model="postTitleSelected"
                  :items="postTitleItems"
                  item-value="id"
                  item-title="title"
                  class="rbsm-select"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.tagline }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.taglineDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <v-select
                  v-model="taglineSelected"
                  :items="taglineItems"
                  item-value="id"
                  item-title="title"
                  class="rbsm-select"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.editorType }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.editorTypeDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <v-select
                  v-model="editorTypeSelected"
                  @update:modelValue="handleChange"
                  :items="editorTypeItems"
                  item-title="title"
                  item-value="id"
                  class="rbsm-select"
                  density="compact"
                  hide-details
                  variant="outlined"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  {{ translate.maxImagesTitle }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.maxImagesDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <input
                  v-model="maxImages"
                  class="rbsm-text-input"
                  type="number"
                  @input="maxImagesChanges"
                />
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-expansion-panels
                v-model="maxImageSizePanel"
                class="rbsm-mini-expansion-panel"
                elevation="0"
                multiple
              >
                <v-expansion-panel>
                  <v-expansion-panel-text>
                    <v-row class="d-flex align-center rbsm-row-settings-2">
                      <v-col class="pa-0" cols="12" md="3">
                        <p class="rbsm-setting-properties-title-2">
                          {{ translate.maxImageSizeTitle }}
                        </p>
                        <div class="rbsm-setting-properties-content-2">
                          {{ translate.maxImageSizeDesc }}
                        </div>
                      </v-col>
                      <v-col
                        class="rbsm-settings-input"
                        cols="12"
                        md="6"
                        offset-md="3"
                      >
                        <input
                          v-model="maxImageSize"
                          class="rbsm-text-input"
                          type="number"
                        />
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-row>
            <v-row
              class="d-flex align-center rbsm-row-settings rbsm-top-border"
            >
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title">
                  <v-icon class="rbsm-setting-icon">mdi-image-outline</v-icon>
                  {{ translate.featuredImage }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.featuredImageDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <v-select
                  v-model="featuredImageSelected"
                  :items="featuredImageItems"
                  item-value="id"
                  item-title="title"
                  class="rbsm-select"
                  density="compact"
                  hide-details
                  variant="outlined"
                  @update:modelValue="featuredImageChange"
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-expansion-panels
                v-model="featuredImagePanel"
                class="rbsm-mini-expansion-panel"
                elevation="0"
                multiple
              >
                <v-expansion-panel>
                  <v-expansion-panel-text>
                    <v-row class="d-flex align-center rbsm-row-settings-2">
                      <v-col class="pa-0" cols="12" md="3">
                        <p class="rbsm-setting-properties-title-2">
                          {{ translate.uploadFileSizeLimit }}
                        </p>
                        <div class="rbsm-setting-properties-content-2">
                          {{ translate.uploadFileSizeLimitDesc }}
                        </div>
                      </v-col>
                      <v-col
                        class="rbsm-settings-input"
                        cols="12"
                        md="6"
                        offset-md="3"
                      >
                        <input
                          v-model="uploadFileSizeLimitInput"
                          class="rbsm-text-input"
                          type="number"
                        />
                      </v-col>
                    </v-row>
                    <v-row class="rbsm-row-settings-2">
                      <v-col class="pa-0" cols="12" md="3">
                        <p class="rbsm-setting-properties-title-2">
                          {{ translate.defaultFeaturedImage }}
                        </p>
                        <div class="rbsm-setting-properties-content-2">
                          {{ translate.defaultFeaturedImageDesc }}
                        </div>
                      </v-col>
                      <v-col
                        class="rbsm-settings-input"
                        cols="12"
                        md="6"
                        offset-md="3"
                      >
                        <button
                          class="rbsm-black-btn mb-4 rbsm-transition rbsm-access-btn"
                          @click="openMediaUploader"
                        >
                          Choose Image
                        </button>
                        <v-row>
                          <v-col cols="8">
                            <v-img
                              v-if="imagePreview"
                              :src="imagePreview"
                              max-width="400"
                              @error="onFeaturedImageLoaded"
                              @load="onFeaturedImageLoaded"
                            ></v-img>
                            <v-progress-circular
                              v-show="isFeaturedImageLoading"
                              indeterminate
                              size="26"
                            ></v-progress-circular>
                          </v-col>
                          <v-col class="d-flex align-end justify-end" cols="4">
                            <button
                              v-show="imagePreview !== null"
                              class="rbsm-remove-field-btn rbsm-white-btn rbsm-btn-red rbsm-delete-customfield rbsm-transition"
                              @click="removeDefaultFeaturedImage"
                            >
                              <v-icon>mdi-delete-outline</v-icon>
                              Remove Image
                            </button>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-row>
            <v-row
              class="d-flex align-center rbsm-row-settings-2 rbsm-top-border"
            >
              <v-col class="pa-0" cols="6">
                <p class="rbsm-setting-properties-title-2">
                  <v-icon class="rbsm-setting-icon">
                    mdi-folder-file-outline
                  </v-icon>
                  {{ translate.multipleCategories }}
                </p>
                <div class="rbsm-setting-properties-content-2">
                  {{ translate.multipleCategoriesDesc }}
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
                    v-model="allowMultiCategories"
                    checked="checked"
                    type="checkbox"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings-2">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title-2">
                  {{ translate.autoAssignCategories }}
                </p>
                <div class="rbsm-setting-properties-content-2">
                  {{ translate.autoAssignCategoriesDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <v-autocomplete
                  v-model="autoAssignCategotySelected"
                  :items="categories"
                  :label="translate.autoAssignCategories"
                  chips
                  class="rbsm-autocomplete"
                  clearable
                  density="compact"
                  multiple
                  variant="outlined"
                  @update:modelValue="autoAssignCategoryChange"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings-2">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title-2">
                  {{ translate.excludeCategories }}
                </p>
                <div class="rbsm-setting-properties-content-2">
                  {{ translate.excludeCategoriesDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <v-autocomplete
                  v-model="excludeCategorySelected"
                  :items="categories"
                  :label="translate.excludeCategories"
                  chips
                  class="rbsm-autocomplete"
                  clearable
                  density="compact"
                  elevation="0"
                  multiple
                  variant="outlined"
                  @update:modelValue="excludeCategoryChange"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row
              class="d-flex align-center rbsm-row-settings-2 rbsm-top-border"
            >
              <v-col class="pa-0" cols="6">
                <p class="rbsm-setting-properties-title-2">
                  <v-icon class="rbsm-setting-icon">
                    mdi-tag-multiple-outline
                  </v-icon>
                  {{ translate.multipleTags }}
                </p>
                <div class="rbsm-setting-properties-content-2">
                  {{ translate.multipleTagsDesc }}
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
                    v-model="allowMultiTags"
                    checked="checked"
                    type="checkbox"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings-2">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title-2">
                  {{ translate.autoAssignTags }}
                </p>
                <div class="rbsm-setting-properties-content-2">
                  {{ translate.autoAssignTagsDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <v-autocomplete
                  v-model="autoAssignTagsSelected"
                  :items="tags"
                  :label="translate.autoAssignTags"
                  chips
                  class="rbsm-autocomplete"
                  clearable
                  density="compact"
                  multiple
                  variant="outlined"
                  @update:modelValue="autoAssignTagChange"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings-2">
              <v-col class="pa-0" cols="12" md="6">
                <p class="rbsm-setting-properties-title-2">
                  {{ translate.excludeTags }}
                </p>
                <div class="rbsm-setting-properties-content-2">
                  {{ translate.excludeTagsDesc }}
                </div>
              </v-col>
              <v-col class="rbsm-settings-input" cols="12" md="6">
                <v-autocomplete
                  v-model="excludeTagsSelected"
                  :items="tags"
                  :label="translate.excludeTags"
                  chips
                  class="rbsm-autocomplete"
                  clearable
                  density="compact"
                  multiple
                  variant="outlined"
                  @update:modelValue="excludeTagChange"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings-2">
              <v-col class="pa-0" cols="6">
                <p class="rbsm-setting-properties-title-2">
                  {{ translate.allowAddNewTags }}
                </p>
                <div class="rbsm-setting-properties-content-2">
                  {{ translate.allowAddNewTagsDesc }}
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
                    v-model="allowAddNewTags"
                    checked="checked"
                    type="checkbox"
                  />
                  <span class="rbsm-checkbox-style"><i></i></span>
                </label>
              </v-col>
            </v-row>
            <v-row
              class="d-flex align-center rbsm-row-settings rbsm-top-border"
            >
              <v-col class="pa-0" cols="12" sm="6">
                <p class="rbsm-setting-properties-title">
                  <v-icon class="rbsm-setting-icon">
                    mdi-tag-edit-outline
                  </v-icon>
                  {{ translate.customFields }}
                </p>
                <div class="rbsm-setting-properties-content">
                  {{ translate.customFieldsDesc }}
                </div>
              </v-col>
              <v-col class="d-flex justify-end pa-0" cols="12" sm="6">
                <button
                  class="rbsm-black-btn rbsm-access-btn rbsm-transition"
                  @click="addNewField"
                >
                  <v-icon>mdi-plus</v-icon>
                  {{ translate.addNewField }}
                </button>
              </v-col>
            </v-row>
            <v-row class="d-flex align-center rbsm-row-settings">
              <v-col
                v-for="(field, index) in customFields"
                class="pa-0"
                cols="12"
              >
                <v-card class="rbsm-mini-card" elevation="0">
                  <v-row class="d-flex align-center rbsm-row-settings-2">
                    <v-col class="pa-0" cols="12" md="6">
                      <p class="rbsm-setting-properties-title-2">
                        <v-icon class="rbsm-setting-icon">
                          mdi-key-outline
                        </v-icon>
                        {{ translate.customFieldName }}
                      </p>
                      <div class="rbsm-setting-properties-content-2">
                        {{ translate.customFieldNameDesc }}
                      </div>
                    </v-col>
                    <v-col class="rbsm-settings-input" cols="12" md="6">
                      <input
                        v-model="field['custom_field_name']"
                        class="rbsm-text-input"
                        type="text"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="d-flex align-center rbsm-row-settings-2">
                    <v-col class="pa-0" cols="12" md="6">
                      <p class="rbsm-setting-properties-title-2">
                        {{ translate.customFieldLabel }}
                      </p>
                      <div class="rbsm-setting-properties-content-2">
                        {{ translate.customFieldLabelDesc }}
                      </div>
                    </v-col>
                    <v-col class="rbsm-settings-input" cols="12" md="6">
                      <input
                        v-model="field['custom_field_label']"
                        class="rbsm-text-input"
                        type="text"
                      />
                    </v-col>
                  </v-row>
                  <v-row class="d-flex align-center rbsm-row-settings-2">
                    <v-col class="pa-0" cols="12" md="6">
                      <p class="rbsm-setting-properties-title-2">
                        {{ translate.fieldType }}
                      </p>
                      <div class="rbsm-setting-properties-content-2">
                        {{ translate.fieldTypeDesc }}
                      </div>
                    </v-col>
                    <v-col class="rbsm-settings-input" cols="12" md="6">
                      <v-select
                        v-model="field['field_type']"
                        :items="customFieldItems"
                        item-title="title"
                        item-value="id"
                        class="rbsm-select"
                        density="compact"
                        hide-details
                        variant="outlined"
                      ></v-select>
                    </v-col>
                    <v-col
                      class="d-flex justify-end pa-0"
                      cols="12"
                      md="2"
                      offset-md="10"
                    >
                      <button
                        class="rbsm-remove-field-btn rbsm-white-btn rbsm-btn-red rbsm-delete-customfield rbsm-transition"
                        @click="deleteCustomField(index)"
                      >
                        <v-icon>mdi-delete-outline</v-icon>
                        {{ translate.removeField }}
                      </button>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>
