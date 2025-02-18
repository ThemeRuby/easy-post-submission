<script>
  import { onMounted } from 'vue'
  import submissionFormContent from './components/submissionFormContent.vue'

  export default {
    name: 'editSubmissionForm',
    components: {
      submissionFormContent
    },
    setup() {
      onMounted(() => {})

      return {}
    }
  }
</script>

<template>
  <submissionFormContent />
</template>
