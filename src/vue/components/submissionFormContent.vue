<script setup>
  import { ref, onMounted } from 'vue'
  import Quill from 'quill'
  import 'quill/dist/quill.snow.css'
  import htmlEditButton from 'quill-html-edit-button'
  import recaptchaContent from './recaptcha.vue'

  defineOptions({ name: 'submissionFormContent' })

  const emit = defineEmits(['change-tab-label-to-edit'])

  const tags = ref([])
  const title = ref('')
  const content = ref('')
  const excerpt = ref('')
  const categories = ref([])
  const editorType = ref('')
  const prependIcon = ref('')
  const snackbar = ref(false)
  const dialogTitle = ref('')
  const tagsSelected = ref([])
  const formSettings = ref([])
  const customFields = ref([])
  const userNameInput = ref('')
  const dialogMessage = ref('')
  const maxImageSize = ref(100)
  const imagePreview = ref(null)
  const challengeInput = ref('')
  const userEmailInput = ref('')
  const snackbarMessage = ref('')
  const formLayoutClass = ref('')
  const amountUploadMedia = ref(0)
  const challengeResponse = ref('')
  const challengeQuestion = ref('')
  const categoriesSelected = ref([])
  const isDisplayDialog = ref(false)
  const allowAddNewTags = ref(false)
  const allowDisplayTags = ref(false)
  const featuredImageFile = ref(null)
  const isUsingRecaptcha = ref(false)
  const customFieldsContent = ref([])
  const isUsingChallenge = ref(false)
  const allowMultipleTags = ref(false)
  const allowDisplayTitle = ref(false)
  const formLayoutDisplayMap = ref([])
  const formLayoutDisplayType = ref('')
  const allowDisplayExcerpt = ref(false)
  const userPostLocalStorageKey = ref('')
  const allowDisplayUserName = ref(false)
  const allowDisplayUserEmail = ref(false)
  const isRemoveFeaturedImage = ref(false)
  const isDisableSubmitButton = ref(false)
  const allowDisplayCategories = ref(false)
  const allowMultipleCategories = ref(false)
  const isInvalidAnswerChallenge = ref(true)
  const isDisplayChallengeDialog = ref(false)
  const isDisplayProgressCircular = ref(false)
  const allowDisplayFeaturedImage = ref(false)
  const userPostFromLocalStorage = ref(undefined)
  const snackbarClass = ref('rbsm-failed-snackbar')
  const isDisplayInvalidAnswerChallengeText = ref(false)
  const translate = ref(rbGlobalSubmissionSettings.translate)
  const featuredInputLabel = ref(
    rbGlobalSubmissionSettings.translate.chooseFeaturedImage
  )
  const submitButtonText = ref(
    rbGlobalSubmissionSettings.translate.submitPostLabel
  )

  const form = ref(null)
  const titleTextRef = ref(null)
  const dialogClassName = ref('')
  const excerptTextRef = ref(null)
  const userNameTextRef = ref(null)
  const userEmailTextRef = ref(null)
  const recaptchaComponent = ref(null)
  const isDisplayReloadDialog = ref(false)

  let quill = null
  let postId = null
  let yesStorage = false
  let recaptchaSiteKey = ''
  let recaptchaResponse = ''
  let isEditPostMode = false
  let featuredImageButtonLabel
  let isVerifiedRecaptcha = true
  let doDirectLinkAfterDissmisDialog = false
  let isRTL = rbGlobalSubmissionSettings.isRTL
  let rules = {
    title: ref(true),
    excerpt: ref(true),
    userName: ref(true),
    userEmail: ref(true),
    challenge: (value) =>
      !!value || rbGlobalSubmissionSettings.translate.challengeRequiredInput
  }

  onMounted(() => {
    initFormLayoutDisplayMap()
    getFormSettings()

    if (allowDisplayCategories.value) getCategories()
    if (allowDisplayTags.value) getTags()

    initQuillEditor()
    tryRenderUserPostContent()

    updateRulesForTextFields()
    syncDataWithInterval()
  })

  startInitialize()

  function startInitialize() {
    yesStorage = isStorageAvailable()
    window.addEventListener('beforeunload', onBeforeUnload)
  }

  function getText(key) {
    return translate.value[key] || key
  }

  function initFormLayoutDisplayMap() {
    formLayoutDisplayMap.value['1_col'] = 'rbsm-form-col1'
    formLayoutDisplayMap.value['2_cols'] = 'rbsm-form-col2'
    formLayoutDisplayMap.value[''] = ''
  }

  function isStorageAvailable() {
    let storage
    try {
      storage = window['localStorage']
      storage.setItem('__rbStorageSet', 'x')
      storage.getItem('__rbStorageSet')
      storage.removeItem('__rbStorageSet')
      return true
    } catch (e) {
      return false
    }
  }

  function setStorage(key, data) {
    yesStorage &&
      localStorage.setItem(
        key,
        typeof data === 'string' ? data : JSON.stringify(data)
      )
  }

  function getStorage(key, defaultValue) {
    if (!yesStorage) return null

    const data = localStorage.getItem(key)
    if (data === null) return defaultValue

    try {
      return JSON.parse(data)
    } catch (e) {
      return data
    }
  }

  function deleteStorage(key) {
    yesStorage && localStorage.removeItem(key)
  }

  function getFormSettings() {
    const formSettingsRaw = rbSubmissionForm?.formSettings ?? undefined
    if (formSettingsRaw === undefined) {
      console.log('Error: Cannot find submission form setting.')
      return
    }

    formSettings.value = JSON.parse(formSettingsRaw.data)
    amountUploadMedia.value = formSettings.value?.form_fields?.max_images ?? 3
    maxImageSize.value = formSettings.value?.form_fields?.max_image_size ?? 100

    editorType.value =
      formSettings.value?.form_fields?.editor_type ?? 'rich_editor'
    editorType.value = editorType.value.toLowerCase().replace(' ', '_')

    allowDisplayTitle.value =
      formSettings.value?.form_fields?.post_title !== 'disable'
    allowDisplayFeaturedImage.value =
      formSettings.value?.form_fields?.featured_image?.status !== 'disable'
    allowDisplayExcerpt.value =
      formSettings.value?.form_fields?.tagline !== 'disable'
    allowDisplayUserName.value =
      formSettings.value?.form_fields?.user_name !== 'disable'
    allowDisplayUserEmail.value =
      formSettings.value?.form_fields?.user_email !== 'disable'
    allowDisplayCategories.value = formSettings.value?.allow_categories ?? true
    allowDisplayTags.value = formSettings.value?.allow_tags ?? true
    allowAddNewTags.value =
      formSettings.value?.form_fields?.tags?.allow_add_new_tag ?? false
    allowMultipleCategories.value =
      formSettings.value?.form_fields?.categories?.multiple_categories ?? false
    allowMultipleTags.value =
      formSettings.value?.form_fields?.tags?.multiple_tags ?? false
    customFields.value = formSettings.value?.form_fields?.custom_field ?? []
    isUsingRecaptcha.value =
      formSettings.value?.security_fields?.recaptcha?.status ?? false
    recaptchaSiteKey =
      formSettings.value?.security_fields?.recaptcha?.recaptcha_site_key ?? ''
    isUsingChallenge.value =
      formSettings.value?.security_fields?.challenge?.status ?? false
    challengeQuestion.value =
      formSettings.value?.security_fields?.challenge?.question ?? ''
    challengeResponse.value =
      formSettings.value?.security_fields?.challenge?.response ?? ''
    formLayoutDisplayType.value =
      formSettings.value?.general_setting?.form_layout_type ?? '2_cols'
    formLayoutClass.value =
      formLayoutDisplayMap.value[formLayoutDisplayType.value] ?? ''

    isVerifiedRecaptcha = !isUsingRecaptcha.value
    isInvalidAnswerChallenge.value = isUsingChallenge.value

    const isUserLogged = rbSubmissionForm?.isUserLogged ?? false
    if (isUserLogged) {
      allowDisplayUserName.value = false
      allowDisplayUserEmail.value = false
    }
  }

  function syncDataWithInterval() {
    const intervalId = setInterval(() => {
      try {
        syncDataToLocalStorage()
      } catch (err) {
        clearInterval(intervalId)
      }
    }, 5000)
  }

  function initQuillEditor() {
    const direction = isRTL ? 'rtl' : 'ltr'
    Quill.register('modules/htmlEditButton', htmlEditButton)
    quill = new Quill('#editor', {
      theme: 'snow',
      placeholder: translate.value.textAreaFormPlaceholder,
      modules: {
        htmlEditButton: {
          debug: false,
          msg: 'Edit the content in HTML format',
          okText: 'Ok',
          cancelText: 'Cancel',
          buttonHTML: `<svg viewBox="0 0 24 24" xmlns="https://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
          buttonTitle: 'Show HTML source',
          syntax: false,
          prependSelector: 'div#myelement',
          editorModules: {}
        },
        toolbar: {
          container:
            editorType.value === 'rich_editor'
              ? [
                  [{ header: [2, 3, 4, 5, 6, false] }],
                  amountUploadMedia.value > 0
                    ? ['image', 'bold', 'italic', 'underline', 'strike']
                    : ['bold', 'italic', 'underline', 'strike'],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['link', 'blockquote', 'code-block'],
                  [{ align: [] }],
                  [{ indent: '-1' }, { indent: '+1' }],
                  [{ direction: direction }]
                ]
              : [],
          handlers: {
            image: insertImage
          }
        }
      }
    })

    quill.on('text-change', () => {
      content.value = quill.root.innerHTML
    })
  }

  function insertImage() {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.style.display = 'none'

    input.addEventListener('change', (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const imageUrl = e.target.result
          quill.root.focus
          const range = quill.getSelection()

          if (range) {
            const index = range.index
            if (index >= 0 && index <= quill.getLength()) {
              const imageValidate = validateImageSize(imageUrl)
              if (!imageValidate) {
                displayDialog({
                  title: translate.value.imageSizeLimitTitle,
                  message: translate.value.imageSizeLimitMessage.replace(
                    '%s',
                    maxImageSize.value
                  ),
                  icon: 'mdi-alert'
                })
              } else {
                if (!validateAmountImages()) {
                  displayDialog({
                    title: translate.value.maxAmountImages,
                    message: translate.value.maxAmountImagesMessage.replace(
                      '%s',
                      amountUploadMedia.value
                    ),
                    icon: 'mdi-alert'
                  })
                } else {
                  quill.insertEmbed(index, 'image', imageUrl)
                }
              }
            } else {
              console.warn(translate.value.invalidIndexToInsertImage)
            }
          } else {
            console.warn(translate.value.noSelection)
          }
        }
        reader.readAsDataURL(file)
      }
    })

    document.body.appendChild(input)
    input.click()
    document.body.removeChild(input)
  }

  function validateAmountImages() {
    const currentContents = quill.getContents()
    const imageCount = countImages(currentContents)

    return imageCount < amountUploadMedia.value
  }

  function validateImageSize(imageData) {
    const maxImageByteAllowed = maxImageSize.value * 1024

    return maxImageByteAllowed >= getBase64ImageSize(imageData)
  }

  function validateImageSizeBeforeSubmitPost() {
    const currentContents = quill.getContents()
    const imagesData = currentContents.ops.filter((op) => op?.insert?.image)
    for (let index = 0; index < imagesData.length; index++) {
      const imageValidate = validateImageSize(imagesData[index]?.insert?.image)
      if (!imageValidate) {
        return false
      }
    }

    return true
  }

  function getBase64ImageSize(base64String) {
    const base64Size = base64String.length - base64String.indexOf(',') - 1
    return (base64Size * 3) / 4
  }

  function countImages(delta) {
    return delta.ops.reduce((count, op) => {
      if (op.insert && op.insert.image) {
        return count + 1
      }
      return count
    }, 0)
  }

  function updateRulesForTextFields() {
    rules.title =
      formSettings.value?.form_fields?.post_title === 'require'
        ? (value) => !!value || translate.value.titleRequiredRule
        : true
    rules.excerpt =
      formSettings.value?.form_fields?.tagline === 'require'
        ? (value) => !!value || translate.value.excerptRequiredRule
        : true
    rules.userName =
      formSettings.value?.form_fields?.user_name === 'require'
        ? (value) => !!value || translate.value.userNameRequiredRule
        : true
    rules.userEmail =
      formSettings.value?.form_fields?.user_email === 'require'
        ? (value) => !!value || translate.value.userEmailRequiredRule
        : true
  }

  function tryRenderUserPostContent() {
    if (
      Array.isArray(rbGlobalSubmissionSettings?.userPost) &&
      rbGlobalSubmissionSettings.userPost.length > 0
    ) {
      isDisplayReloadDialog.value = true
      const userPosts = rbGlobalSubmissionSettings.userPost
      postId = userPosts[0]?.post_id ?? null
      title.value = allowDisplayTitle.value ? userPosts[0]?.title : ''
      excerpt.value = allowDisplayExcerpt.value ? userPosts[0]?.excerpt : ''
      content.value = userPosts[0]?.content
      content.value = formattedContent(content.value ?? '')
      categoriesSelected.value =
        userPosts[0]?.categories?.map((category) => category) ?? []
      tagsSelected.value = userPosts[0]?.tags?.map((tag) => tag) ?? []
      postId = userPosts[0]?.post_id || null
      userNameInput.value = allowDisplayUserName.value
        ? userPosts[0]?.user_name
        : ''
      userEmailInput.value = allowDisplayUserEmail.value
        ? userPosts[0]?.user_email
        : ''
      handleRenderFeaturedImage(
        userPosts[0]?.featured_image ?? '',
        userPosts[0]?.featured_image_size ?? 0
      )
      updateCustomFieldContents(userPosts[0]?.custom_fields ?? [])

      quill.root.innerHTML = content.value
      submitButtonText.value = translate.value.updatePostLabel
      isEditPostMode = true
      changeTabName()
    } else {
      initHandlingLocalStorage()
      tryLoadDataFromLocalStorage()
    }
    updateFeaturedInputLabel()
  }

  function initHandlingLocalStorage() {
    userPostLocalStorageKey.value = 'rbsm_client_user_post'
    userPostFromLocalStorage.value = getStorage(
      userPostLocalStorageKey.value,
      undefined
    )
  }

  function handleRenderFeaturedImage(featuredImageData, featuredImageSize) {
    imagePreview.value = getImageSrc(featuredImageData)[0] ?? ''
    if (imagePreview.value !== '') {
      featuredImageFile.value = {}
      const regex = /\/([^\/]+\.[a-zA-Z]{2,})$/
      const match = imagePreview.value.match(regex)
      if (match) {
        featuredImageFile.value.name = match[1]
        featuredImageFile.value.size = featuredImageSize
      }
    }
  }

  function changeTabName() {
    emit('change-tab-label-to-edit')
  }

  function getImageSrc(imageStrData) {
    const srcRegex = /<img[^>]+src="([^">]+)"/g
    const matches = [...imageStrData.matchAll(srcRegex)]
    return matches.map((match) => match[1])
  }

  function getCategories() {
    const categoriesRaw = rbSubmissionForm?.categories ?? []
    categoriesRaw.forEach((category) => {
      categories.value.push({
        title: category.name,
        value: category.term_id
      })
    })
  }

  function getTags() {
    const tagsRaw = rbSubmissionForm?.tags ?? []
    tagsRaw.forEach((tag) => {
      tags.value.push(tag.name)
    })
  }

  function getAmountImagesUploaded() {
    const images = quill.root.querySelectorAll('img')

    return images.length
  }

  function verifyAmountImageUploaded() {
    return getAmountImagesUploaded() <= amountUploadMedia.value
  }

  async function submitPost() {
    const validateInputsResult = await validateInputs()
    if (!validateInputsResult.status) {
      displayFailedValidationSnackbar(validateInputsResult.message)
      return
    }

    if (isUsingRecaptcha.value && !isVerifiedRecaptcha) {
      displayFailedDialog(translate.value.verifyFailedRecaptchaMessage)
      return
    }

    tryDisplayChallengeDialog()

    if (isInvalidAnswerChallenge.value) return

    if (!isVerifiedRecaptcha) {
      displayFailedDialog(translate.value.verifyFailedRecaptchaMessage)
      return
    }

    if (!verifyAmountImageUploaded()) {
      displayDialog({
        title: translate.value.maxAmountImages,
        message: translate.value.maxAmountImagesMessage.replace(
          '%s',
          amountUploadMedia.value
        ),
        icon: 'mdi-alert'
      })

      return
    }

    if (!validateImageSizeBeforeSubmitPost()) {
      dialogClassName.value = 'is-error'
      displayDialog({
        title: translate.value.imageSizeLimitTitle,
        message: translate.value.imageSizeLimitMessage.replace(
          '%s',
          maxImageSize.value
        ),
        icon: 'mdi-alert'
      })

      return
    }

    displaySubmitPostAnimation()
    const customFieldsData = getDataCustomFields()

    const jsonData = {
      title: title.value,
      excerpt: excerpt.value,
      categories:
        typeof categoriesSelected.value === 'string' ||
        Number.isInteger(categoriesSelected.value)
          ? [categoriesSelected.value]
          : categoriesSelected.value,
      tags: tagsSelected.value,
      content: content.value,
      formId: rbSubmissionForm.formId,
      customFieldsData,
      postId: postId,
      isRemoveFeaturedImage: isRemoveFeaturedImage.value,
      userName: userNameInput.value,
      userEmail: userEmailInput.value,
      recaptchaResponse: recaptchaResponse
    }

    const ajaxAction = postId === null ? 'rbsm_submit_post' : 'rbsm_update_post'

    const formData = new FormData()
    formData.append('image', featuredImageFile.value)
    formData.append('action', ajaxAction)
    formData.append('excerpt', jsonData.excerpt)
    formData.append('content', jsonData.content)
    formData.append('formId', jsonData.formId)
    formData.append(
      'customFieldsData',
      JSON.stringify(jsonData.customFieldsData)
    )

    jsonData.tags.forEach(function (tag) {
      formData.append('tags[]', tag)
    })

    jsonData.categories.forEach(function (category) {
      formData.append('categories[]', category)
    })

    formData.append('postId', jsonData.postId)
    formData.append('isRemoveFeaturedImage', jsonData.isRemoveFeaturedImage)
    formData.append('userName', jsonData.userName)
    formData.append('userEmail', jsonData.userEmail)
    formData.append('recaptchaResponse', jsonData.recaptchaResponse)
    formData.append('title', jsonData.title)
    formData.append('_nonce', rbGlobalSubmissionSettings.nonce)

    try {
      const response = await fetch(rbGlobalSubmissionSettings.ajaxUrl, {
        headers: {
          'X-WP-Nonce': rbGlobalSubmissionSettings.nonce
        },
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        hideSubmitPostAnimation()
        displaySuccessDialog()
        tryDirectLink()

        if (!isEditPostMode) deleteStorage(userPostLocalStorageKey.value)

        yesStorage = false
        isDisplayReloadDialog.value = false
      } else {
        hideSubmitPostAnimation()
        displayFailedDialog(data.data)
        resetRecaptcha()
        if (isUsingRecaptcha.value) isVerifiedRecaptcha = false
      }
    } catch (err) {
      hideSubmitPostAnimation()
      displayFailedDialog(err)
      resetRecaptcha()
      if (isUsingRecaptcha.value) isVerifiedRecaptcha = false
    }
  }

  async function validateInputs() {
    let invalidFieldNames = []

    if (titleTextRef.value !== null) {
      const titleValidate = await titleTextRef.value.validate()
      if (rules.title !== true && titleValidate.length !== 0) {
        invalidFieldNames.push(translate.value.title)
      }
    }

    if (excerptTextRef.value !== null) {
      const excerptValidate = await excerptTextRef.value.validate()
      if (rules.excerpt !== true && excerptValidate.length !== 0) {
        invalidFieldNames.push(translate.value.excerpt)
      }
    }

    if (userNameTextRef.value !== null) {
      const userNameValidate = await userNameTextRef.value.validate()
      if (rules.userName !== true && userNameValidate.length !== 0) {
        invalidFieldNames.push(translate.value.userName)
      }
    }

    if (userEmailTextRef.value !== null) {
      const userEmaiValidate = await userEmailTextRef.value.validate()
      if (rules.userEmail !== true && userEmaiValidate.length !== 0) {
        invalidFieldNames.push(translate.value.userEmail)
      }
    }

    if (invalidFieldNames.length > 0) {
      let message = ''
      if (invalidFieldNames.length === 1) {
        message = invalidFieldNames[0] + ' ' + translate.value.isMissing
      } else {
        message =
          invalidFieldNames.join(', ') + ' ' + translate.value.aresMissing
      }
      return {
        status: false,
        message
      }
    }

    return {
      status: true
    }
  }

  function displayFailedValidationSnackbar(message) {
    snackbarClass.value = 'rbsm-failed-snackbar'
    snackbarMessage.value = message
    snackbar.value = true
  }

  function displaySubmitPostAnimation() {
    isDisplayProgressCircular.value = true
    isDisableSubmitButton.value = true
    submitButtonText.value = isEditPostMode
      ? translate.value.updating
      : translate.value.submitting
  }

  function hideSubmitPostAnimation() {
    isDisplayProgressCircular.value = false
    isDisableSubmitButton.value = false
    submitButtonText.value = isEditPostMode
      ? translate.value.updatePostLabel
      : translate.value.submitPostLabel
  }

  function handleFileChange() {
    const file = featuredImageFile.value ? featuredImageFile.value : null
    if (file) {
      const reader = new FileReader()

      reader.onload = (e) => {
        imagePreview.value = e.target.result
        updateFeaturedInputLabel()
      }

      reader.onerror = (e) => {
        console.log(e)
      }

      reader.readAsDataURL(file)
    } else {
      imagePreview.value = null
    }

    updateFeaturedInputLabel()
  }

  function updateFeaturedInputLabel() {
    featuredInputLabel.value =
      imagePreview.value === '' || imagePreview.value === null
        ? featuredImageButtonLabel
          ? featuredImageButtonLabel
          : translate.value.chooseFeaturedImage
        : translate.value.editFeaturedImage
  }

  function updateCustomFieldContents(customFieldsData) {
    customFields.value.forEach((customField, index) => {
      customField['field_type'] = customField['field_type'].toLowerCase()
      const matchIndex = customFieldsData.findIndex(
        (customFieldData) => customFieldData.type === customField['field_type']
      )

      if (matchIndex !== -1) {
        customFieldsContent.value[index + '_' + customField['field_type']] =
          customFieldsData[matchIndex].content
        customFieldsData.splice(matchIndex, 1)
      }
    })
  }

  function getDataCustomFields() {
    const customFieldsData = []
    customFields.value.forEach((customField, index) => {
      customField['field_type'] = customField['field_type'].toLowerCase()

      customFieldsData.push({
        content:
          customFieldsContent.value[index + '_' + customField['field_type']],
        label: customField['custom_field_label'],
        name: customField['custom_field_name'],
        type: customField['field_type']
      })
    })

    return customFieldsData
  }

  function displaySuccessDialog() {
    let message = isEditPostMode
      ? translate.value.updatePostSuccessMessage.replace('%s', title.value)
      : translate.value.submitPostSuccessMessage.replace('%s', title.value)

    const dialogData = {
      title: isEditPostMode
        ? translate.value.updatePostSuccessTitle
        : translate.value.submitPostSuccessTitle,
      message,
      icon: 'mdi-content-save-check-outline'
    }
    dialogClassName.value = 'is-success'
    displayDialog(dialogData)
  }

  function displayFailedDialog(message) {
    const dialogData = {
      title: isEditPostMode
        ? translate.value.updatePostFailedTitle
        : translate.value.submitPostFailedTitle,
      message,
      icon: 'mdi-alert-circle-outline',
      className: 'is-error'
    }

    dialogClassName.value = 'is-error'
    displayDialog(dialogData)
  }

  function displayDialog({ title, message, icon }) {
    dialogTitle.value = title
    dialogMessage.value = message
    isDisplayDialog.value = true
    prependIcon.value = icon
  }
  function tryDirectLink() {
    if (formSettings.value['general_setting']['url_direction'] === '') return

    doDirectLinkAfterDissmisDialog = true
  }
  function onDialogClicked() {
    isDisplayDialog.value = false
    if (doDirectLinkAfterDissmisDialog) {
      doDirectLinkAfterDissmisDialog = false
      window.location.href =
        formSettings.value['general_setting']['url_direction']
    }
  }

  function handleClearFeaturedImage() {
    imagePreview.value = null
    updateFeaturedInputLabel()
    isRemoveFeaturedImage.value = true
  }

  function handleVerification(response) {
    isVerifiedRecaptcha = true
    recaptchaResponse = response
  }

  function onExpired() {
    isVerifiedRecaptcha = false
  }

  function tryDisplayChallengeDialog() {
    if (isUsingChallenge.value && isInvalidAnswerChallenge.value) {
      isDisplayChallengeDialog.value = true
    }
  }

  function onChallengeSubmit() {
    if (challengeInput.value === challengeResponse.value) {
      isDisplayChallengeDialog.value = false
      isInvalidAnswerChallenge.value = false
      isDisplayInvalidAnswerChallengeText.value = false
      submitPost()
    } else {
      isInvalidAnswerChallenge.value = true
      isDisplayInvalidAnswerChallengeText.value = true
    }
  }

  function resetRecaptcha() {
    if (recaptchaComponent.value !== null)
      recaptchaComponent.value.resetRecaptcha()
  }

  function onChallengeClose() {
    isDisplayInvalidAnswerChallengeText.value = false
    challengeInput.value = ''
  }

  function tryLoadDataFromLocalStorage() {
    let userPostData
    try {
      userPostData = getStorage(userPostLocalStorageKey.value, undefined)
      if (userPostData === null || userPostData === undefined) return
    } catch (err) {
      deleteStorage(userPostLocalStorageKey.value)
      return
    }
    if (!Array.isArray(userPostData?.categories ?? '')) {
      userPostData.categories = [userPostData.categories]
    }

    title.value = userPostData?.title ?? ''
    excerpt.value = userPostData?.excerpt ?? ''
    content.value = userPostData?.content ?? ''
    categoriesSelected.value =
      userPostData?.categories?.map((category) => category) ?? []
    tagsSelected.value = userPostData?.tags?.map((tag) => tag) ?? []
    userNameInput.value = userPostData?.userName ?? ''
    userEmailInput.value = userPostData?.userEmail ?? ''
    updateCustomFieldContents(userPostData.custom_fields)
    quill.root.innerHTML = content.value

    if (postId !== null) {
      submitButtonText.value = translate.value.updatePostLabel
      isEditPostMode = true
    }
  }

  function syncDataToLocalStorage() {
    const userPostData = {
      title: title.value,
      excerpt: excerpt.value,
      content: content.value,
      categories:
        typeof categoriesSelected.value === 'string'
          ? [categoriesSelected.value]
          : categoriesSelected.value,
      tags: tagsSelected.value,
      userName: userNameInput.value,
      userEmail: userEmailInput.value,
      custom_fields: getDataCustomFields()
    }

    setStorage(userPostLocalStorageKey.value, JSON.stringify(userPostData))
  }

  function formattedContent(content) {
    let cleanedContent = content.replace(/<p>\s*(<br\s*\/?>\s*)*<\/p>/g, '')
    cleanedContent = cleanedContent.replace(
      /<figure[^>]*>(.*?)<\/figure>/g,
      '$1'
    )

    return cleanedContent.trim()
  }

  function onCategoriesClear() {
    categoriesSelected.value = []
  }

  function onBeforeUnload(event) {
    if (isDisplayReloadDialog.value) {
      event.preventDefault()
      event.returnValue = ''
      return ''
    }
  }
</script>

<template>
  <v-container class="rbsm-snackbar-container">
    <v-snackbar v-model="snackbar" :class="[snackbarClass]" :timeout="3000">
      <v-icon class="pr-2">mdi-alert-outline</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>
    <v-dialog
      v-model="isDisplayDialog"
      class="rbsm-popup-box"
      :class="dialogClassName"
      persistent
    >
      <v-card>
        <v-card-title>
          <v-icon>
            {{ prependIcon ? prependIcon : mdiAlertCircleCheckOutline }}
          </v-icon>
          {{ dialogTitle }}
        </v-card-title>
        <v-card-text>{{ dialogMessage }}</v-card-text>
        <v-card-actions>
          <v-btn :text="getText('ok')" @click="onDialogClicked"></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="isDisplayChallengeDialog"
      class="rbsm-popup-box"
      @update:model-value="onChallengeClose"
    >
      <v-card>
        <v-card-title>
          <v-icon>mdi-progress-question</v-icon>
          {{ getText('challengeTitle') }}
        </v-card-title>
        <v-card-text>
          {{ getText('challengeLabel') }} {{ challengeQuestion }}
        </v-card-text>
        <v-text-field
          v-model="challengeInput"
          :rules="[rules.challenge]"
          label="Answer"
          variant="outlined"
        ></v-text-field>
        <span v-if="isDisplayInvalidAnswerChallengeText" class="text-error">
          {{ getText('invalidAnswer') }}
        </span>
        <v-card-actions>
          <v-btn class="is-btn" @click="onChallengeSubmit">
            {{ getText('submit') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <div :class="['rbsm-form-wrap', formLayoutClass]">
      <div class="rbsm-form-main rbsm-form-list">
        <div v-if="allowDisplayUserName" class="rbsm-input-wrap">
          <h2 class="rbsm-input-title">{{ getText('yourName') }}</h2>
          <p class="rbsm-input-hind">{{ getText('hindYourName') }}</p>
          <v-text-field
            ref="userNameTextRef"
            v-model="userNameInput"
            :label="getText('yourName')"
            :rules="[rules.userName]"
            variant="outlined"
          ></v-text-field>
        </div>
        <div v-if="allowDisplayUserEmail" class="rbsm-input-wrap">
          <h2 class="rbsm-input-title">{{ getText('yourEmail') }}</h2>
          <p class="rbsm-input-hind">{{ getText('hindYourEmail') }}</p>
          <v-text-field
            ref="userEmailTextRef"
            v-model="userEmailInput"
            :label="getText('yourEmail')"
            :rules="[rules.userEmail]"
            variant="outlined"
          ></v-text-field>
        </div>
        <div v-if="allowDisplayTitle" class="rbsm-input-wrap">
          <h2 class="rbsm-input-title">{{ getText('addPostTitle') }}</h2>
          <p class="rbsm-input-hind">{{ getText('hindPostTitle') }}</p>
          <v-text-field
            ref="titleTextRef"
            v-model="title"
            :label="getText('addPostTitle')"
            :rules="[rules.title]"
            :validate-on-blur="true"
            variant="outlined"
          ></v-text-field>
        </div>
        <div v-if="allowDisplayExcerpt" class="rbsm-input-wrap">
          <h2 class="rbsm-input-title">{{ getText('addPostExcerpt') }}</h2>
          <p class="rbsm-input-hind">{{ getText('hindPostExcerpt') }}</p>
          <v-text-field
            ref="excerptTextRef"
            v-model="excerpt"
            :label="getText('addPostExcerpt')"
            :rules="[rules.excerpt]"
            variant="outlined"
          ></v-text-field>
        </div>
        <div class="rbsm-input-wrap">
          <h2 class="rbsm-input-title">
            <v-icon>mdi-pencil-ruler-outline</v-icon>
            {{ getText('addPostContent') }}
          </h2>
          <p class="rbsm-input-hind">{{ getText('hindPostContent') }}</p>
          <div id="editorContainer">
            <div v-show="editorType === 'rich_editor'" id="richEditorContainer">
              <div id="editor"></div>
            </div>
            <v-textarea
              v-if="editorType === 'raw_html'"
              id="rbTextAreaEditor"
              v-model="content"
              :label="getText('textAreaFormPlaceholder')"
              rows="25"
              variant="outlined"
            ></v-textarea>
          </div>
        </div>
      </div>
      <div class="rbsm-form-sidebar">
        <div class="rbsm-form-list rbsm-form-border-wrap">
          <div v-if="allowDisplayCategories" class="rbsm-input-wrap">
            <h2 class="rbsm-input-title">
              {{ getText('titlePostCategories') }}
            </h2>
            <p class="rbsm-input-hind">{{ getText('hindPostCategories') }}</p>
            <v-autocomplete
              v-model="categoriesSelected"
              :items="categories"
              :label="getText('choosePostCategories')"
              :multiple="allowMultipleCategories"
              :title="title"
              chips
              clearable
              variant="outlined"
              @click:clear="onCategoriesClear"
            ></v-autocomplete>
          </div>
          <div v-if="allowDisplayTags" class="rbsm-input-wrap">
            <h2 class="rbsm-input-title">{{ getText('titlePostTags') }}</h2>
            <p class="rbsm-input-hind">{{ getText('hindPostTags') }}</p>
            <v-combobox
              v-if="allowAddNewTags"
              v-model="tagsSelected"
              :items="tags"
              :label="getText('addPostTags')"
              :multiple="allowMultipleTags"
              chips
              clearable
              variant="outlined"
            ></v-combobox>
            <v-autocomplete
              v-if="!allowAddNewTags"
              v-model="tagsSelected"
              :items="tags"
              :label="getText('choosePostTags')"
              :multiple="allowMultipleTags"
              chips
              clearable
              variant="outlined"
            ></v-autocomplete>
          </div>
          <div v-if="allowDisplayFeaturedImage" class="rbsm-input-wrap">
            <h2 class="rbsm-input-title">
              <v-icon>mdi-image-outline</v-icon>
              {{ getText('titlePostFeatured') }}
            </h2>
            <p class="rbsm-input-hind">{{ getText('hindPostFeatured') }}</p>
            <v-form ref="form">
              <!-- Image preview -->
              <v-img v-if="imagePreview" :src="imagePreview"></v-img>
              <v-file-input
                v-model="featuredImageFile"
                :label="featuredInputLabel"
                :show-size="1000"
                accept="image/*"
                density="compact"
                prepend-icon="mdi-image-plus-outline"
                variant="outlined"
                @change="handleFileChange"
                @click:clear="handleClearFeaturedImage"
              ></v-file-input>
            </v-form>
          </div>
          <div v-for="(field, index) in customFields" class="rbsm-input-wrap">
            <h2 class="rbsm-input-title">
              <v-icon>mdi-tag-edit-outline</v-icon>
              {{ field.custom_field_label }}
            </h2>
            <v-text-field
              v-if="field.field_type === 'text'"
              v-model="customFieldsContent[index + '_text']"
              density="compact"
              label="Type anything"
              variant="outlined"
            ></v-text-field>
            <v-textarea
              v-if="field.field_type === 'textarea'"
              v-model="customFieldsContent[index + '_textarea']"
              label="Message"
              variant="outlined"
            ></v-textarea>
            <v-file-input
              v-if="field.field_type === 'upload'"
              v-model="customFieldsContent[index + '_upload']"
              density="compact"
              label="Upload file"
              outlined
              variant="outlined"
            ></v-file-input>
          </div>
        </div>
      </div>
      <div class="rbsm-form-footer rbsm-form-list">
        <recaptchaContent
          v-if="isUsingRecaptcha"
          ref="recaptchaComponent"
          :shouldLoadRecaptcha="isUsingRecaptcha"
          :siteKey="recaptchaSiteKey"
          @verified="handleVerification"
          @data-expired-callback="onExpired"
        />
        <div class="rbsm-from-submit">
          <button
            :disabled="isDisableSubmitButton"
            class="rbsm-submit-btn rbsm-btn-primary is-btn"
            @click="submitPost"
          >
            {{ submitButtonText }}
            <v-icon>mdi-arrow-right-thin</v-icon>
          </button>
          <v-progress-circular
            v-show="isDisplayProgressCircular"
            indeterminate
            size="26"
          ></v-progress-circular>
        </div>
      </div>
    </div>
  </v-container>
</template>
