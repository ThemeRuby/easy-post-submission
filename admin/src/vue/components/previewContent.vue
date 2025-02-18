<script setup>
  import { ref, nextTick } from 'vue'
  import Quill from 'quill'
  import 'quill/dist/quill.snow.css'
  import recaptchaContent from './recaptcha.vue'

  defineOptions({ name: 'previewContent' })

  let quill = null
  const tags = ref([])
  const title = ref('')
  const excerpt = ref('')
  const categories = ref([])
  const customFields = ref([])
  const tagsSelected = ref('')
  const userNameInput = ref('')
  const imagePreview = ref(null)
  const userEmailInput = ref('')
  const recaptchaSiteKey = ref('')
  const editorType = ref('raw_html')
  const allowAddNewTags = ref(true)
  const isDisplayDialog = ref(false)
  const categoriesSelected = ref('')
  const allowDisplayTags = ref(true)
  const featuredInputLabel = ref('')
  const isUsingRecaptcha = ref(true)
  const allowDisplayTitle = ref(true)
  const featuredImageFile = ref(null)
  const allowMultipleTags = ref(true)
  const customFieldsContent = ref([])
  const allowDisplayExcerpt = ref(true)
  const allowDisplayUserName = ref(true)
  const allowDisplayUserEmail = ref(true)
  const translate = ref(rbAjax.translate)
  const allowDisplayCategories = ref(true)
  const allowMultipleCategories = ref(true)
  const allowDisplayFeaturedImage = ref(true)
  const submitButtonText = ref('SUBMIT POST')
  let amountUploadMedia = 1
  let content = ''

  function initQuillEditor() {
    quill = new Quill('#editor', {
      theme: 'snow',
      modules: {
        toolbar:
          editorType.value === 'rich_editor'
            ? [
                [{ header: [2, 3, 4, 5, 6, false] }],
                amountUploadMedia > 0
                  ? ['image', 'bold', 'italic', 'underline', 'strike']
                  : ['bold', 'italic', 'underline', 'strike'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'blockquote', 'code-block'],
                [{ align: [] }],
                [{ indent: '-1' }, { indent: '+1' }]
              ]
            : []
      }
    })

    quill.on('text-change', () => {
      content = quill.root.innerHTML
    })
  }

  async function displayFormPreview(formSettingsData) {
    isDisplayDialog.value = true

    const formData = JSON.parse(formSettingsData.data)
    const formFields = formData['form_fields']
    const securityFields = formData['security_fields']

    allowDisplayTitle.value = formFields['post_title'] !== 'disable'
    allowDisplayExcerpt.value = formFields['tagline'] !== 'disable'
    allowDisplayFeaturedImage.value =
      formFields['featured_image']['status'] !== 'disable'
    allowDisplayUserName.value = formFields['user_name'] !== 'disable'
    allowDisplayUserEmail.value = formFields['user_email'] !== 'disable'
    editorType.value = formFields['editor_type'] ?? 'rich_editor'
    customFields.value = formFields['custom_field']
    isUsingRecaptcha.value = securityFields['recaptcha']['status']
    recaptchaSiteKey.value = securityFields['recaptcha']['recaptcha_site_key']

    await nextTick()
    initQuillEditor()
    updateHeightEditor(formFields)
  }

  function updateHeightEditor(formFields) {
    const rbTextAreaEditor = document.querySelector('#rbTextAreaEditor')
    const richEditor = document.querySelector('#editor')
    const height = getFitHeightForEditor(formFields)

    rbTextAreaEditor.style.height = `${height}px`
    richEditor.style.height = `${height}px`
  }

  function getFitHeightForEditor(formFields) {
    let propertiesColHeight = 354
    propertiesColHeight +=
      formFields['featured_image']['status'] !== 'disable' ? 156 : 0
    propertiesColHeight += formFields['user_email'] !== 'disable' ? 156 : 0
    propertiesColHeight += formFields['user_name'] !== 'disable' ? 156 : 0
    propertiesColHeight += formFields['editor_type'] === 'raw_html' ? 79 : 0

    return Math.max(propertiesColHeight - 156, 500)
  }

  defineExpose({ displayFormPreview })
</script>

<template>
  <v-container>
    <v-row>
      <div class="pa-4 text-center">
        <v-dialog
          v-model="isDisplayDialog"
          max-width="1280"
          transition="dialog-bottom-transition"
        >
          <v-card block>
            <v-row class="ml-5 mt-5">
              <v-col cols="8">
                <v-text-field
                  v-show="allowDisplayTitle"
                  v-model="title"
                  label="Title"
                  variant="outlined"
                ></v-text-field>
                <v-text-field
                  v-show="allowDisplayExcerpt"
                  v-model="excerpt"
                  label="Excerpt"
                  variant="outlined"
                ></v-text-field>
                <div id="editorContainer">
                  <div id="richEditor" v-show="editorType === 'rich_editor'">
                    <div id="editor"></div>
                  </div>
                  <v-textarea
                    id="rbTextAreaEditor"
                    variant="outlined"
                    v-show="editorType === 'raw_html'"
                  ></v-textarea>
                </div>
              </v-col>
              <v-col cols="4">
                <v-card
                  v-if="allowDisplayCategories"
                  :title="translate.categories"
                  variant="outlined"
                  class="mb-5"
                >
                  <v-col cols="11">
                    <v-autocomplete
                      density="compact"
                      clearable
                      chips
                      v-model="categoriesSelected"
                      variant="outlined"
                      :label="translate.chooseCategories"
                      :items="categories"
                      :multiple="allowMultipleCategories"
                    ></v-autocomplete>
                  </v-col>
                </v-card>
                <v-card
                  v-if="allowDisplayTags"
                  :title="translate.tags"
                  variant="outlined"
                  class="mb-5"
                >
                  <v-col cols="11">
                    <v-combobox
                      v-show="allowAddNewTags"
                      clearable
                      chips
                      :multiple="allowMultipleTags"
                      v-model="tagsSelected"
                      variant="outlined"
                      :label="translate.chooseTags"
                      :items="tags"
                    ></v-combobox>
                    <v-autocomplete
                      density="compact"
                      v-show="!allowAddNewTags"
                      clearable
                      chips
                      v-model="tagsSelected"
                      variant="outlined"
                      :label="translate.chooseTags"
                      :items="tags"
                      :multiple="allowMultipleTags"
                    ></v-autocomplete>
                  </v-col>
                </v-card>
                <v-card
                  v-if="allowDisplayFeaturedImage"
                  :title="translate.featuredImage"
                  variant="outlined"
                  class="mb-5"
                >
                  <v-col cols="11">
                    <v-form ref="form">
                      <v-img
                        v-if="imagePreview"
                        :src="imagePreview"
                        max-width="400"
                      ></v-img>

                      <v-file-input
                        class="mt-5"
                        v-model="featuredImageFile"
                        :label="featuredInputLabel"
                        accept="image/*"
                        variant="outlined"
                        prepend-icon="mdi-image"
                        :show-size="1000"
                      ></v-file-input>
                    </v-form>
                  </v-col>
                </v-card>
                <v-card
                  v-show="allowDisplayUserName"
                  :title="translate.userName"
                  variant="outlined"
                  class="mb-5"
                >
                  <v-col cols="11">
                    <v-text-field
                      v-model="userNameInput"
                      variant="outlined"
                      :label="translate.typeUserName"
                    ></v-text-field>
                  </v-col>
                </v-card>
                <v-card
                  v-show="allowDisplayUserEmail"
                  :title="translate.userEmail"
                  variant="outlined"
                  class="mb-5"
                >
                  <v-col cols="11">
                    <v-text-field
                      v-model="userEmailInput"
                      variant="outlined"
                      :label="translate.typeUserEmail"
                    ></v-text-field>
                  </v-col>
                </v-card>
              </v-col>
            </v-row>
            <v-row class="ml-5">
              <v-col cols="8">
                <div v-for="(field, index) in customFields">
                  <v-card
                    :title="field['custom_field_label']"
                    variant="outlined"
                    class="mb-5"
                  >
                    <v-col cols="11">
                      <v-text-field
                        v-show="field['field_type'] === 'text'"
                        v-model="customFieldsContent[index + '_Text']"
                        :label="translate.typeAnythings"
                        variant="outlined"
                      ></v-text-field>
                      <v-textarea
                        v-show="field['field_type'] === 'textarea'"
                        v-model="customFieldsContent[index + '_Textarea']"
                        :label="translate.message"
                        variant="outlined"
                      ></v-textarea>

                      <v-file-input
                        v-show="field['field_type'] === 'upload'"
                        v-model="customFieldsContent[index + '_Upload']"
                        :label="translate.uploadFile"
                        outlined
                        variant="outlined"
                      ></v-file-input>
                    </v-col>
                  </v-card>
                </div>
              </v-col>
            </v-row>
            <v-row class="ml-5">
              <v-col v-show="isUsingRecaptcha">
                <recaptchaContent
                  :shouldLoadRecaptcha="isUsingRecaptcha"
                  :siteKey="recaptchaSiteKey"
                  ref="recaptchaComponent"
                />
              </v-col>
            </v-row>
            <v-row class="ml-5 mb-5">
              <v-col cols="2">
                <v-btn color="blue">{{ submitButtonText }}</v-btn>
              </v-col>
            </v-row>
          </v-card>
        </v-dialog>
      </div>
    </v-row>
  </v-container>
</template>
