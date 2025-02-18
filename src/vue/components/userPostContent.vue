<script setup>
  import { ref } from 'vue'

  defineOptions({ name: 'userPostsContent' })

  const userPosts = ref([])
  const snackbar = ref(false)
  const snackbarMessage = ref('')
  const overlayVisible = ref(false)
  const isLoadingPosts = ref(false)
  const deleteDialogMessage = ref('')
  const shouldDisplayPostEdit = ref(false)
  const shouldDisplayPostView = ref(false)
  const isDisplayMorePostButton = ref(true)
  const shouldDisplayPostDelete = ref(false)
  const shouldDisplayPostAction = ref(false)
  const isDisplayDeleteConfirmationDialog = ref(false)
  const translate = ref(rbGlobalSubmissionSettings.translate)

  let paged = 1
  let yesStorage = false
  let postEditingUrl = ''
  let postIdShouldRemove = -1

  yesStorage = isStorageAvailable()
  updatePostManagerSettings()
  getUserPostsStart()

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

  function updatePostManagerSettings() {
    shouldDisplayPostEdit.value =
      rbsmUserPostsData?.postManagerSettings?.user_profile?.allow_edit_post ??
      false
    shouldDisplayPostDelete.value =
      rbsmUserPostsData?.postManagerSettings?.user_profile?.allow_delete_post ??
      false
    shouldDisplayPostAction.value =
      shouldDisplayPostEdit.value || shouldDisplayPostDelete.value
    postEditingUrl =
      rbsmUserPostsData?.postManagerSettings?.edit_post_form?.edit_post_url ??
      ''
  }

  function getUserPostsStart() {
    const userPostsData = rbsmUserPostsData?.userPostsData ?? undefined
    if (userPostsData === undefined) {
      console.log('Invalid user post data.')
      return
    }

    convertFormatUserPostsToDisplay(userPostsData.user_posts)
    visibleMorePostButton(!userPostsData.is_final_page)
    shouldDisplayPostView.value =
      userPostsData?.should_display_post_view ?? false
  }

  function getUserPosts() {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('action', 'rbsm_get_user_posts')
      formData.append('_nonce', rbGlobalSubmissionSettings.nonce)
      formData.append('paged', paged)

      fetch(rbGlobalSubmissionSettings.ajaxUrl, {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            convertFormatUserPostsToDisplay(data.data.user_posts)
            visibleMorePostButton(!data.data.is_final_page)
            shouldDisplayPostView.value =
              data?.data?.should_display_post_view ?? false
            resolve()
          } else {
            convertFormatUserPostsToDisplay([])
            resolve()
          }

          isLoadingPosts.value = false
        })
        .catch((error) => {
          isLoadingPosts.value = false
          console.log(error)
          reject()
        })
    })
  }

  function convertFormatUserPostsToDisplay(userPostsRaw) {
    if (userPostsRaw.length === 0) paged--

    const newUserPost = userPostsRaw.map((post) => {
      let categories = ''
      let tags = ''

      post.categories.forEach((category, index) => {
        if (index < post.categories.length - 1) categories += category + ', '
        else categories += category
      })

      post.tags.forEach((tag, index) => {
        if (index < post.tags.length - 1) tags += tag + ', '
        else tags += tag
      })

      return {
        title: post.title,
        categories,
        tags,
        date: post.date,
        postId: post.post_id,
        view: post.post_view,
        status: post.status,
        link: post.link,
        shortDesc: post.short_desc
      }
    })

    userPosts.value = userPosts.value.concat(newUserPost)
  }

  function visibleMorePostButton(isVisible) {
    isDisplayMorePostButton.value = isVisible
  }

  async function postEditClicked(postId) {
    if (postEditingUrl === '') {
      console.log('The post editing page was not configured.')
    } else {
      let param = `rbsm-id=${postId}`
      const separator = postEditingUrl.includes('?') ? '&' : '?'
      window.location.href = postEditingUrl + separator + param
    }
  }

  function showMorePosts() {
    if (isLoadingPosts.value) return

    isLoadingPosts.value = true
    paged++
    getUserPosts()
  }

  async function postTrashClicked(postId) {
    isDisplayDeleteConfirmationDialog.value = true
    const post = userPosts.value.find((post) => post.postId === postId)

    if (!post) return

    deleteDialogMessage.value = translate.value.confirmDeleteMessage.replace(
      '%s',
      post.title
    )
    postIdShouldRemove = postId
  }

  async function trashPost(postId, title) {
    return new Promise((resolve, reject) => {
      const formData = new FormData()
      formData.append('action', 'rbsm_trash_post')
      formData.append('_nonce', rbGlobalSubmissionSettings.nonce)
      formData.append('postId', postId)
      formData.append('title', title)

      fetch(rbGlobalSubmissionSettings.ajaxUrl, {
        method: 'POST',
        body: formData
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            resolve(data.data)
            updateTrashPostSTatusOnUI(postId)
            displayDeleteFormSnackbar(title)
            overlayVisible.value = false
          } else {
            reject('')
            overlayVisible.value = false
          }
        })
        .catch((error) => {
          console.log(error)
          overlayVisible.value = false
        })
    })
  }

  function displayDeleteFormSnackbar(formDeletedTitle) {
    snackbar.value = true
    snackbarMessage.value = translate.value.postDeleteSuccessfulMessage.replace(
      '%s',
      formDeletedTitle
    )
  }

  function updateTrashPostSTatusOnUI(postId) {
    const condition = (post) => post.postId === postId
    userPosts.value = userPosts.value.filter((post) => !condition(post))
  }

  function confirmDeletePost() {
    isDisplayDeleteConfirmationDialog.value = false
    if (postIdShouldRemove === -1) return

    overlayVisible.value = true
    const post = userPosts.value.find(
      (post) => post.postId === postIdShouldRemove
    )
    const title = post ? post.title : ''

    trashPost(postIdShouldRemove, title)
  }

  function cancelDeletePost() {
    isDisplayDeleteConfirmationDialog.value = false
    postIdShouldRemove = -1
  }
</script>

<template>
  <div>
    <v-dialog v-model="overlayVisible" persistent></v-dialog>
    <v-snackbar v-model="snackbar" class="rbsm-snackbar" :timeout="3000">
      <v-icon class="pr-2">mdi-delete-empty-outline</v-icon>
      {{ snackbarMessage }}
    </v-snackbar>
    <v-dialog
      class="rbsm-popup-box"
      v-model="isDisplayDeleteConfirmationDialog"
      persistent
    >
      <v-card>
        <v-card-title class="headline">
          <v-icon>mdi-information-outline</v-icon>
          {{ translate.confirmDelete }}
        </v-card-title>
        <v-card-text>{{ deleteDialogMessage }}</v-card-text>
        <template v-slot:actions>
          <v-btn @click="confirmDeletePost">
            <v-icon>mdi-delete</v-icon>
            {{ translate.delete }}
          </v-btn>
          <v-btn @click="cancelDeletePost">
            <v-icon>mdi-cancel</v-icon>
            {{ translate.cancel }}
          </v-btn>
        </template>
      </v-card>
    </v-dialog>
    <div v-if="userPosts.length === 0" class="rbsm-table-empty">
      <v-icon rbsm-table-empy-icon>mdi-file-document-alert-outline</v-icon>
      <h3 class="rbsm-table-empty-title">{{ translate.noPostShowTitle }}</h3>
      <p class="rbsm-table-empty-desc">{{ translate.noPostShowDesc }}</p>
    </div>
    <div class="rbsm-table-wrap" v-if="userPosts.length !== 0">
      <div
        class="rbsm-table"
        :class="{
          'yes-view': shouldDisplayPostView,
          'yes-actions': shouldDisplayPostAction
        }"
      >
        <div class="rbsm-table-row rbsm-table-row-header h5">
          <div class="rbsm-table-col is-grow">
            <div class="rbsm-table-title">
              <v-icon>mdi-file-certificate-outline</v-icon>
              {{ translate.post }}
            </div>
          </div>
          <div class="rbsm-table-col">{{ translate.categories }}</div>
          <div class="rbsm-table-col">{{ translate.createdDate }}</div>
          <div
            v-if="shouldDisplayPostView"
            class="rbsm-table-col rbsm-table-centered"
          >
            {{ translate.views }}
          </div>
          <div class="rbsm-table-col rbsm-table-centered">
            {{ translate.status }}
          </div>
          <div
            v-if="shouldDisplayPostAction"
            class="rbsm-table-col rbsm-table-centered"
          >
            {{ translate.actions }}
          </div>
        </div>
        <div class="rbsm-table-row" v-for="(post, index) in userPosts">
          <div class="rbsm-table-col is-grow rbsm-post-title-col">
            <h6>
              <a
                v-if="post.status === 'publish'"
                target="_blank"
                :href="post.link"
                :class="[
                  'rbsm-post-title',
                  'h-link',
                  'rbsm-title-is-' + post.status
                ]"
              >
                {{ post.title }}
                <v-icon>mdi-open-in-new</v-icon>
              </a>
              <span
                v-else
                :class="['rbsm-post-title', 'rbsm-title-is-' + post.status]"
              >
                {{ post.title }}
              </span>
            </h6>
            <p class="rbsm-table-excerpt">{{ post.shortDesc }}</p>
          </div>
          <div class="rbsm-table-col">
            <span class="rbsm-table-label rbsm-category-label">
              {{ post.categories }}
            </span>
          </div>
          <div class="rbsm-table-col">
            <span class="rbsm-table-label rbsm-date-label">
              {{ post.date }}
            </span>
          </div>
          <div
            class="rbsm-table-col rbsm-table-centered"
            v-if="shouldDisplayPostView"
          >
            <span class="rbsm-table-label rbsm-view-label">
              {{ post.view }}
            </span>
          </div>
          <div class="rbsm-table-col rbsm-table-centered">
            <span :class="'rbsm-status rbsm-status-' + post.status">
              {{ post.status }}
            </span>
          </div>
          <div
            v-if="shouldDisplayPostAction"
            class="rbsm-table-col rbsm-post-actions-col"
          >
            <v-btn
              v-if="shouldDisplayPostEdit"
              @click="postEditClicked(post.postId)"
            >
              <v-icon>mdi-file-edit-outline</v-icon>
            </v-btn>
            <v-btn
              v-if="shouldDisplayPostDelete"
              :disabled="post.status === 'trash'"
              class="rbsm-btn-red"
              @click="postTrashClicked(post.postId)"
            >
              <v-icon>mdi-file-document-remove-outline</v-icon>
            </v-btn>
          </div>
        </div>
      </div>
      <div class="rbsm-post-pagination" v-if="isDisplayMorePostButton">
        <a class="rbsm-pagination-link is-btn" @click="showMorePosts">
          {{ translate.morePosts }}
          <v-icon v-show="!isLoadingPosts">mdi-arrow-right-thin</v-icon>
          <v-icon v-show="isLoadingPosts" class="rbsm-loading-icon">
            mdi-loading
          </v-icon>
        </a>
      </div>
    </div>
  </div>
</template>
