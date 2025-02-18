<script setup>
  import { onMounted, ref, nextTick } from 'vue'
  defineOptions({ name: 'recaptchaContent' })

  const translate = ref(rbAjax.translate)
  const recaptchaContainer = ref(null)
  let recaptchaInstance = null

  const props = defineProps({
    siteKey: {
      type: String,
      required: true
    },
    shouldLoadRecaptcha: {
      type: Boolean,
      required: false
    }
  })

  onMounted(async () => {
    await nextTick()
    if (props.shouldLoadRecaptcha) {
      loadRecaptcha()
    }
  })

  function loadRecaptcha() {
    if (!document.getElementById('recaptcha-script')) {
      const script = document.createElement('script')
      script.id = 'recaptcha-script'
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit'
      script.onload = (_) => waitForGrecaptcha().then((_) => renderRecaptcha())
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    } else {
      waitForGrecaptcha().then((_) => renderRecaptcha())
    }
  }

  function waitForGrecaptcha() {
    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (typeof grecaptcha.render !== 'undefined') {
          clearInterval(interval)
          resolve()
        }
      }, 50)

      setTimeout(() => {
        clearInterval(interval)
        reject(translate.value.grecapchaLoadError)
      }, 5000)
    })
  }

  function renderRecaptcha() {
    if (props.siteKey !== '') {
      recaptchaInstance = grecaptcha.render(
        recaptchaContainer.value.querySelector('.g-recaptcha'),
        {
          sitekey: props.siteKey
        }
      )
    }
  }
</script>

<template>
  <v-container>
    <v-row>
      <div ref="recaptchaContainer">
        <div class="g-recaptcha" :data-sitekey="siteKey"></div>
      </div>
    </v-row>
  </v-container>
</template>
